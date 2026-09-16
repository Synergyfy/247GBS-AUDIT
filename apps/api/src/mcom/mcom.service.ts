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
  name: string;
  role: string;
  membershipLevel?: string;
  membershipStatus?: string;
  permissions?: Record<string, boolean>;
}

interface McomTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
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
      'http://localhost:3000/auth/callback'
    );
  }

  private get mcomScopes(): string {
    return (
      this.configService.get<string>('MCOM_SCOPES') ||
      'profile email business membership packages'
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
      state,
      scope: this.mcomScopes,
      response_type: 'code',
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
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.mcomRedirectUri,
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

    if (user) {
      await this.usersService.update(user.id, {
        mcomUserId: mcomUser.id,
        mcomMembershipLevel: mcomUser.membershipLevel || undefined,
        mcomMembershipTier: (mcomUser as any).membershipTier || undefined,
        mcomMembershipStatus: mcomUser.membershipStatus || undefined,
        mcomCanAccessVcard: permissions[permissionKey] || false,
        firstName: mcomUser.name?.split(' ')[0] || user.firstName,
        lastName: mcomUser.name?.split(' ').slice(1).join(' ') || user.lastName,
      });
      return this.usersService.findById(user.id);
    }

    const newUser = await this.usersService.create({
      email: mcomUser.email,
      password: crypto.randomBytes(32).toString('hex'),
      firstName: mcomUser.name?.split(' ')[0] || 'MCOM',
      lastName: mcomUser.name?.split(' ').slice(1).join(' ') || 'User',
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
}
