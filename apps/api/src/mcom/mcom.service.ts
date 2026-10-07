import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';

interface McomUserInfo {
  id: string;
  email: string;
  // Upstream POST /sso/token returns firstName/lastName (no `name`);
  // GET /sso/userinfo returns firstName/lastName + derived `name`.
  // Accept all variants so the real Central Hub name is never dropped.
  name?: string;
  sub?: string;
  displayName?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  given_name?: string;
  family_name?: string;
  businessProfile?: { businessName?: string } | null;
  role: string;
  membershipLevel?: string;
  membershipStatus?: string;
  permissions?: Record<string, boolean>;
}

export function emailPrefix(email: string): string {
  return (email || '')
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Resolve the real Central Hub display name.
 *  Priority: name ?? displayName ?? fullName ?? "firstName lastName"
 *  (incl. given_name/family_name) ?? businessProfile.businessName.
 *  Returns null when nothing real exists — caller falls back to email-prefix
 *  (last-resort safety; every Central Hub user is expected to have a name). */
export function resolveDisplayName(
  input: Partial<McomUserInfo> | null | undefined,
): string | null {
  if (!input) return null;
  const pick = (...vals: Array<string | undefined | null>): string | null => {
    for (const v of vals) {
      const t = (v || '').trim();
      if (t) return t;
    }
    return null;
  };
  const pair = pick(
    input.firstName && input.lastName
      ? `${input.firstName.trim()} ${input.lastName.trim()}`
      : undefined,
    input.given_name && input.family_name
      ? `${input.given_name.trim()} ${input.family_name.trim()}`
      : undefined,
  );
  return (
    pick(
      input.name,
      input.displayName,
      input.fullName,
      pair,
      input.firstName,
      input.lastName,
      input.given_name,
      input.family_name,
      input.businessProfile?.businessName,
    ) || null
  );
}

/** Split a display name into firstName/lastName (first token + remainder). */
export function splitDisplayName(displayName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const parts = (displayName || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
}

interface McomTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: McomUserInfo;
}

@Injectable()
export class McomService {
  private readonly logger = new Logger(McomService.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private usersService: UsersService,
  ) {}

  private get mcomSolutionsUrl(): string {
    return (
      this.configService.get<string>('MCOM_SOLUTIONS_URL') ||
      'https://api.centralhubsolution.com'
    );
  }

  private get mcomClientId(): string {
    return this.configService.get<string>('MCOM_CLIENT_ID') || '';
  }

  private get mcomClientSecret(): string {
    return this.configService.get<string>('MCOM_CLIENT_SECRET') || '';
  }

  private get mcomRedirectUri(): string {
    return (
      this.configService.get<string>('MCOM_REDIRECT_URI') ||
      'http://localhost:9009/auth/callback'
    );
  }

  private get mcomScopes(): string {
    return (
      this.configService.get<string>('MCOM_SCOPES') ||
      'profile email business'
    );
  }

  private get mcomHmacSecret(): string {
    return this.configService.get<string>('MCOM_HMAC_SECRET') || '';
  }

  private get platformSlug(): string {
    return (
      this.configService.get<string>('MCOM_PLATFORM_SLUG') || '247gbs-audit'
    );
  }

  private get jwtAccessSecret(): string {
    return this.configService.get<string>('JWT_ACCESS_SECRET') || '';
  }

  private get jwtAccessExpiration(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '24h';
  }

  private get encryptionKey(): Buffer {
    const secret = this.configService.get<string>('JWT_SECRET') || '';
    return crypto.scryptSync(secret, 'mcom-salt', 32);
  }

  buildAuthorizeUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.mcomClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: this.mcomScopes,
    });
    return `${this.mcomSolutionsUrl}/api/v1/auth/sso/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<McomTokenResponse> {
    const authString = Buffer.from(
      `${this.mcomClientId}:${this.mcomClientSecret}`,
    ).toString('base64');

    const response: AxiosResponse<McomTokenResponse> = await firstValueFrom(
      this.httpService.post<McomTokenResponse>(
        `${this.mcomSolutionsUrl}/api/v1/auth/sso/token`,
        {
          client_id: this.mcomClientId,
          code,
          redirect_uri: this.mcomRedirectUri,
        },
        {
          headers: {
            Authorization: `Basic ${authString}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      ),
    );

    return response.data;
  }

  async refreshTokens(refreshToken: string): Promise<McomTokenResponse> {
    const authString = Buffer.from(
      `${this.mcomClientId}:${this.mcomClientSecret}`,
    ).toString('base64');

    const response: AxiosResponse<McomTokenResponse> = await firstValueFrom(
      this.httpService.post<McomTokenResponse>(
        `${this.mcomSolutionsUrl}/api/v1/auth/sso/token/refresh`,
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        },
        {
          headers: {
            Authorization: `Basic ${authString}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data;
  }

  async fetchUserInfo(accessToken: string): Promise<McomUserInfo> {
    const response: AxiosResponse<McomUserInfo> = await firstValueFrom(
      this.httpService.get<McomUserInfo>(
        `${this.mcomSolutionsUrl}/api/v1/auth/sso/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );

    return response.data;
  }

  async fetchPermissions(
    accessToken: string,
  ): Promise<Record<string, boolean>> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = 'GET';
    const path = '/api/v1/data/permissions';
    const body = '';
    const signString = `${method}${path}${timestamp}${body}`;

    const hmac = crypto.createHmac('sha256', this.mcomHmacSecret);
    hmac.update(signString);
    const signature = hmac.digest('hex');

    const response: AxiosResponse<{ permissions: Record<string, boolean> }> =
      await firstValueFrom(
        this.httpService.get<{ permissions: Record<string, boolean> }>(
          `${this.mcomSolutionsUrl}/api/v1/data/permissions`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'X-Timestamp': timestamp,
              'X-Signature': signature,
            },
          },
        ),
      );

    return response.data?.permissions || {};
  }

  async jitProvision(mcomUser: McomUserInfo): Promise<any> {
    let user = await this.usersService.findByMcomUserId(mcomUser.id);

    if (!user) {
      user = await this.usersService.findByEmail(mcomUser.email);
    }

    const permissions = mcomUser.permissions || {};
    const permissionKey = `canAccess_${this.platformSlug.replace(/-/g, '_')}`;

    // Real Central Hub name (never the 'MCOM'/'User' placeholder).
    // Last-resort fallback is the email prefix — every upstream user is
    // expected to carry a name, so this path should rarely trigger.
    const resolved = resolveDisplayName(mcomUser) || emailPrefix(mcomUser.email);
    const { firstName: resolvedFirst, lastName: resolvedLast } =
      splitDisplayName(resolved);
    const isPlaceholderName =
      (user?.firstName === 'MCOM' && user?.lastName === 'User') ||
      (!user?.firstName && !user?.lastName);

    if (user) {
      const hasRealUpstreamName = Boolean(resolveDisplayName(mcomUser));
      await this.usersService.update(user.id, {
        mcomUserId: mcomUser.id,
        mcomMembershipLevel: mcomUser.membershipLevel || undefined,
        mcomMembershipTier: (mcomUser as any).membershipTier || undefined,
        mcomMembershipStatus: mcomUser.membershipStatus || undefined,
        mcomCanAccessVcard: permissions[permissionKey] || false,
        // Overwrite when upstream carries a real name, or repair rows
        // poisoned with the old 'MCOM'/'User' placeholder.
        firstName:
          hasRealUpstreamName || isPlaceholderName
            ? resolvedFirst || user.firstName
            : user.firstName,
        lastName:
          hasRealUpstreamName || isPlaceholderName
            ? resolvedLast || user.lastName
            : user.lastName,
      });
      return this.usersService.findById(user.id);
    }

    const newUser = await this.usersService.create({
      email: mcomUser.email,
      password: crypto.randomBytes(32).toString('hex'),
      firstName: resolvedFirst || emailPrefix(mcomUser.email),
      lastName: resolvedLast,
      businessName: 'MCOM SSO User',
      role: mcomUser.role === 'admin' ? 'Administrator' : 'User',
      mcomUserId: mcomUser.id,
      mcomMembershipLevel: mcomUser.membershipLevel || undefined,
      mcomMembershipTier: (mcomUser as any).membershipTier || undefined,
      mcomMembershipStatus: mcomUser.membershipStatus || undefined,
      mcomCanAccessVcard: permissions[permissionKey] || false,
    });

    return newUser;
  }

  encryptToken(token: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decryptToken(encryptedToken: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      iv,
    );
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async storeTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): Promise<void> {
    const encryptedAccess = this.encryptToken(accessToken);
    const encryptedRefresh = this.encryptToken(refreshToken);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await this.usersService.update(userId, {
      mcomAccessToken: encryptedAccess,
      mcomRefreshToken: encryptedRefresh,
      mcomTokenExpiresAt: expiresAt,
      mcomTokensUpdatedAt: new Date(),
    });
  }

  issueLocalJwt(user: any): string {
    return this.jwtService.sign(
      {
        email: user.email,
        sub: user.id,
        role: user.role,
        isOnboarded: user.isOnboarded || false,
      },
      {
        secret: this.jwtAccessSecret,
        expiresIn: this.jwtAccessExpiration as any,
      },
    );
  }

  generateStateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const webhookSecret =
      this.configService.get<string>('MCOM_WEBHOOK_SECRET') || '';
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(body);
    const computedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(signature),
    );
  }

  hashBody(body: string): string {
    return crypto.createHash('sha256').update(body).digest('hex');
  }

  /**
   * Fetches public sectors from Central Hub Solution
   */
  async getSectors(): Promise<any[]> {
    const urls = [
      this.mcomSolutionsUrl.replace(/\/+$/, ''),
      'https://api.centralhubsolution.com',
      'http://localhost:3010',
    ];
    const uniqueUrls = Array.from(new Set(urls));

    for (const base of uniqueUrls) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${base}/api/v1/sectors`, { timeout: 6000 }),
        );
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
      } catch (err: any) {
        this.logger.debug(`Could not reach ${base}/api/v1/sectors: ${err?.message}`);
      }
    }
    return [];
  }

  /**
   * Fetches public categories from Central Hub Solution (optionally filtered by sectorId)
   */
  async getCategories(sectorId?: string): Promise<any[]> {
    const query = sectorId ? `?sectorId=${encodeURIComponent(sectorId)}` : '';
    const urls = [
      this.mcomSolutionsUrl.replace(/\/+$/, ''),
      'https://api.centralhubsolution.com',
      'http://localhost:3010',
    ];
    const uniqueUrls = Array.from(new Set(urls));

    for (const base of uniqueUrls) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${base}/api/v1/categories${query}`, { timeout: 6000 }),
        );
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
      } catch (err: any) {
        this.logger.debug(`Could not reach ${base}/api/v1/categories: ${err?.message}`);
      }
    }
    return [];
  }

  /**
   * Fetches public subcategories from Central Hub Solution (optionally filtered by categoryId)
   */
  async getSubcategories(categoryId?: string): Promise<any[]> {
    const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    const urls = [
      this.mcomSolutionsUrl.replace(/\/+$/, ''),
      'https://api.centralhubsolution.com',
      'http://localhost:3010',
    ];
    const uniqueUrls = Array.from(new Set(urls));

    for (const base of uniqueUrls) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${base}/api/v1/subcategories${query}`, { timeout: 6000 }),
        );
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
      } catch (err: any) {
        this.logger.debug(`Could not reach ${base}/api/v1/subcategories: ${err?.message}`);
      }
    }
    return [];
  }
}

