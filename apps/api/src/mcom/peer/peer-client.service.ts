import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEFAULT_SOLUTIONS_URL = 'https://api.centralhubsolution.com';
const TOKEN_SAFETY_MARGIN_MS = 60_000;
const DEFAULT_TOKEN_TTL_SECONDS = 300;
const DEFAULT_TIMEOUT_MS = 5000;

interface ServiceTokenResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
}

export interface PeerCallOptions {
  /** Scope to request on the minted service token. Defaults to `service:read`. */
  scope?: string;
  /** HTTP method. Defaults to GET. */
  method?: string;
  /** JSON body (serialized automatically). */
  data?: unknown;
  /** Extra request headers. */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds. Defaults to 5000. */
  timeoutMs?: number;
}

/**
 * Outbound M2M client for the MCOM service mesh.
 *
 * Mints short-lived RS256 service tokens at MCOM Central (cached in memory so a
 * token is only requested once per ~5 minutes) and performs **direct** HTTPS
 * calls to a peer backend. Central is never in the data path.
 *
 * Deliberately dependency-free (global `fetch`, Node 18+): this keeps the
 * security-sensitive M2M path easy to audit and avoids pulling an ESM-only HTTP
 * wrapper into the CommonJS build.
 *
 * This app only needs it for optional outbound pushes (e.g. notifying
 * fundordonate of a completed audit); inbound reads are handled by
 * `PeerAuthGuard`.
 */
@Injectable()
export class PeerClientService {
  private readonly logger = new Logger(PeerClientService.name);
  private readonly tokenCache = new Map<
    string,
    { token: string; expiresAt: number }
  >();

  constructor(private readonly config: ConfigService) {}

  private get solutionsUrl(): string {
    return (
      this.config
        .get<string>('MCOM_SOLUTIONS_URL')
        ?.trim()
        .replace(/\/+$/, '') || DEFAULT_SOLUTIONS_URL
    );
  }

  private get clientId(): string {
    return this.config.get<string>('MCOM_CLIENT_ID')?.trim() || '';
  }

  private get clientSecret(): string {
    return this.config.get<string>('MCOM_CLIENT_SECRET')?.trim() || '';
  }

  private basicAuth(): string {
    return Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );
  }

  /**
   * Mint (or return a cached) client-credentials service token for `audience`.
   */
  async getServiceToken(
    audience: string,
    scope = 'service:read',
  ): Promise<string> {
    const cacheKey = `${audience}:${scope}`;
    const cached = this.tokenCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + TOKEN_SAFETY_MARGIN_MS) {
      return cached.token;
    }

    const data = await this.postJson<ServiceTokenResponse>(
      `${this.solutionsUrl}/api/v1/auth/service-token`,
      { grant_type: 'client_credentials', audience, scope },
    );

    const expiresAt =
      Date.now() + (data.expires_in ?? DEFAULT_TOKEN_TTL_SECONDS) * 1000;
    this.tokenCache.set(cacheKey, { token: data.access_token, expiresAt });
    return data.access_token;
  }

  /**
   * Exchange a user's SSO access token for a target-scoped delegated token
   * (RFC 8693). Used when acting on a signed-in user's behalf.
   */
  async getDelegatedServiceToken(
    userSsoAccessToken: string,
    audience: string,
    scope = 'service:read',
  ): Promise<string> {
    const data = await this.postJson<ServiceTokenResponse>(
      `${this.solutionsUrl}/api/v1/auth/service-token/exchange`,
      { subject_token: userSsoAccessToken, audience, scope },
    );
    return data.access_token;
  }

  /**
   * Perform a direct HTTP request to a peer backend with a minted service token.
   */
  async callPeerApi<T = unknown>(
    peerBaseUrl: string,
    audience: string,
    endpoint: string,
    options: PeerCallOptions = {},
  ): Promise<T> {
    const {
      scope = 'service:read',
      method = 'GET',
      data,
      headers = {},
      timeoutMs = DEFAULT_TIMEOUT_MS,
    } = options;

    const token = await this.getServiceToken(audience, scope);

    const base = peerBaseUrl.replace(/\/+$/, '');
    const path = endpoint.replace(/^\/+/, '');

    const response = await fetch(`${base}/${path}`, {
      method,
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
        'X-Caller-Id': this.clientId,
        ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      throw new Error(
        `Peer call ${method} ${base}/${path} failed with ${response.status}`,
      );
    }

    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  private async postJson<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.basicAuth()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Central request ${url} failed with ${response.status}`);
    }

    return (await response.json()) as T;
  }
}
