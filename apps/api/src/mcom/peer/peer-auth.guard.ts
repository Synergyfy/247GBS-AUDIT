import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import {
  DELEGATED_TOKEN_TYPE,
  MCOM_ISSUER,
  PeerCaller,
  PeerScope,
} from './peer.types';
import { PEER_SCOPES_KEY } from './peer-scope.decorator';

const DEFAULT_SOLUTIONS_URL = 'https://api.centralhubsolution.com';
const DEFAULT_JWKS_PATH = '/.well-known/jwks.json';
const CALLER_CACHE_TTL_MS = 60_000;

/** Minimal shape of the inbound Express request used by this guard. */
interface PeerHttpRequest {
  headers?: Record<string, string | string[] | undefined>;
  peerCaller?: PeerCaller;
}

/**
 * Inbound M2M authentication guard for peer (backend-to-backend) requests.
 *
 * Verifies the RS256 delegated service token **offline** against MCOM Central's
 * public JWKS, enforces the deny-by-default ingress allow-list and the
 * endpoint's required scope, then attaches `req.peerCaller`.
 *
 * Usage: mark the controller/route `@Public()` (so the global local-JWT guard
 * stands down) and add `@UseGuards(PeerAuthGuard)`.
 */
@Injectable()
export class PeerAuthGuard implements CanActivate {
  private readonly logger = new Logger(PeerAuthGuard.name);
  private jwks?: ReturnType<typeof createRemoteJWKSet>;
  private callersCache?: { list: string[]; expiresAt: number };

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

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

  private get issuer(): string {
    return (
      this.config.get<string>('MCOM_SERVICE_ISSUER')?.trim() || MCOM_ISSUER
    );
  }

  /** Lazily build the remote JWKS resolver; `jose` caches keys and rotation. */
  private getJwks(): ReturnType<typeof createRemoteJWKSet> {
    if (!this.jwks) {
      const url =
        this.config.get<string>('MCOM_JWKS_URL')?.trim() ||
        `${this.solutionsUrl}${DEFAULT_JWKS_PATH}`;
      this.jwks = createRemoteJWKSet(new URL(url));
    }
    return this.jwks;
  }

  /**
   * Deny-by-default ingress allow-list. An explicit `MCOM_ALLOWED_CALLERS`
   * override wins; otherwise the list is refreshed from the Central service
   * registry (cached for 60s). On failure we fall back to the last good list
   * (empty means "deny everyone").
   */
  private async getAllowedCallers(): Promise<string[]> {
    const configured = this.config.get<string>('MCOM_ALLOWED_CALLERS');
    if (configured && configured.trim()) {
      return configured
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (this.callersCache && this.callersCache.expiresAt > Date.now()) {
      return this.callersCache.list;
    }

    try {
      const response = await fetch(
        `${this.solutionsUrl}/api/v1/ecosystem/services`,
        { signal: AbortSignal.timeout(3000) },
      );
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = (await response.json()) as Array<{
        clientId?: string;
        allowedCallers?: string[];
      }>;
      const me = Array.isArray(data)
        ? data.find((s) => s.clientId === this.clientId)
        : undefined;
      const list = me?.allowedCallers ?? [];
      this.callersCache = { list, expiresAt: Date.now() + CALLER_CACHE_TTL_MS };
      return list;
    } catch (error: unknown) {
      this.logger.warn(
        `Could not refresh allowed callers from Central: ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.callersCache?.list ?? [];
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<PeerHttpRequest>();

    const token = this.extractBearer(request);
    if (!token) {
      throw new UnauthorizedException({
        error: 'Missing service token in Authorization header',
        code: 'PEER_TOKEN_MISSING',
      });
    }

    if (!this.clientId) {
      this.logger.error(
        'MCOM_CLIENT_ID is not configured; refusing inbound peer request.',
      );
      throw new UnauthorizedException({
        error: 'Peer authentication is not configured',
        code: 'PEER_NOT_CONFIGURED',
      });
    }

    let payload: JWTPayload;
    try {
      const verified = await jwtVerify(token, this.getJwks(), {
        issuer: this.issuer,
        audience: this.clientId,
      });
      payload = verified.payload;
    } catch (error: unknown) {
      this.logger.warn(
        `Peer token rejected: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new UnauthorizedException({
        error: 'Unauthorized: Invalid or expired service token',
        code: 'PEER_TOKEN_INVALID',
      });
    }

    const act = payload.act as { sub?: string } | undefined;
    const callerId = typeof act?.sub === 'string' ? act.sub.trim() : '';
    const userId = typeof payload.sub === 'string' ? payload.sub.trim() : '';
    const tokenType = typeof payload.typ === 'string' ? payload.typ : '';

    // Delegated-only: a plain client-credentials service token carries no
    // user subject and must never be accepted here.
    if (!callerId || (tokenType && tokenType !== DELEGATED_TOKEN_TYPE)) {
      throw new ForbiddenException({
        error: 'Forbidden: a user-delegated token is required',
        code: 'PEER_DELEGATION_REQUIRED',
      });
    }
    if (!userId) {
      throw new UnauthorizedException({
        error: 'Unauthorized: token is missing a subject',
        code: 'PEER_SUBJECT_MISSING',
      });
    }

    const allowed = await this.getAllowedCallers();
    if (!allowed.includes('*') && !allowed.includes(callerId)) {
      this.logger.warn(
        `Ingress denied: caller "${callerId}" not allowed for ${this.clientId}`,
      );
      throw new ForbiddenException({
        error: `Forbidden: Caller "${callerId}" not permitted`,
        code: 'PEER_CALLER_DENIED',
      });
    }

    const scopes =
      typeof payload.scope === 'string'
        ? payload.scope.split(/\s+/).filter(Boolean)
        : [];

    const requiredScopes =
      this.reflector.getAllAndOverride<PeerScope[]>(PEER_SCOPES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    const missing = requiredScopes.filter((scope) => !scopes.includes(scope));
    if (missing.length > 0) {
      throw new ForbiddenException({
        error: `Forbidden: missing required scope(s): ${missing.join(', ')}`,
        code: 'PEER_SCOPE_MISSING',
      });
    }

    const peerCaller: PeerCaller = {
      callerId,
      isDelegated: true,
      userId,
      scopes,
    };
    request.peerCaller = peerCaller;

    return true;
  }

  private extractBearer(request: PeerHttpRequest): string | null {
    const header = request.headers?.authorization;
    if (typeof header !== 'string') return null;
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());
    return match ? match[1].trim() : null;
  }
}
