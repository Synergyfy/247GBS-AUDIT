import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

/**
 * TODO(dev): TEMPORARY DEV-ONLY bypass. While NODE_ENV === 'development',
 * requests whose path starts with /api/v1/admin (the admin area) are admitted
 * WITHOUT authentication so the admin dashboard can be tested on localhost
 * without signing in.
 *
 * This is scoped strictly to admin endpoints and to development:
 *  - customer/business API endpoints are NOT affected,
 *  - non-development deployments always enforce auth,
 *  - JWT issuance, validation and refresh-token logic are untouched.
 *
 * MUST BE REMOVED/RE-ENABLED BEFORE ANY PRODUCTION DEPLOYMENT by deleting this
 * helper and its use in JwtAuthGuard and AccessTokenGuard below.
 */
export function isAdminDevBypass(context: ExecutionContext): boolean {
  if (process.env.NODE_ENV !== 'development') return false;
  const req = context.switchToHttp().getRequest<Request>();
  const url = req.originalUrl || req.url || '';
  return url === '/api/v1/admin' || url.startsWith('/api/v1/admin/');
}

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    if (isAdminDevBypass(context)) return true;
    return super.canActivate(context);
  }
}