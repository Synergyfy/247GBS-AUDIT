import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

/**
 * Non-blocking auth for public endpoints that behave differently when the
 * caller happens to be logged in (e.g. POST /pre-audit/submit).
 *
 * - No token / invalid token -> treated as guest (`req.user = null`), never 401s.
 * - Valid access token (Authorization Bearer or `access_token` cookie) ->
 *   `req.user` is populated with the JWT payload (`{ sub, email, role }`).
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: any = context.switchToHttp().getRequest();
    const token = this.extractToken(req);
    if (!token) {
      req.user = null;
      return true;
    }
    try {
      const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
      if (!secret) {
        req.user = null;
        return true;
      }
      const payload = await this.jwtService.verifyAsync(token, { secret });
      req.user = payload ?? null;
    } catch {
      req.user = null;
    }
    return true;
  }

  private extractToken(req: any): string | null {
    const header: string | undefined =
      req?.headers?.authorization ?? req?.headers?.Authorization;
    if (typeof header === 'string') {
      const [scheme, token] = header.split(' ');
      if (/^Bearer$/i.test(scheme) && token) return token.trim();
    }
    const cookieToken = req?.cookies?.['access_token'];
    if (typeof cookieToken === 'string' && cookieToken.trim()) {
      return cookieToken.trim();
    }
    return null;
  }
}
