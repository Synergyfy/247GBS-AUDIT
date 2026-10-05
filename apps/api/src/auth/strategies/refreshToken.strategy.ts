import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET must be set');
    }
    if (secret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.['refresh_token'] || null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => request?.body?.refreshToken || null,
      ]),
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken =
      req?.cookies?.['refresh_token'] ||
      req?.headers?.authorization?.replace('Bearer ', '').trim() ||
      req?.body?.refreshToken;
    if (!refreshToken) throw new Error('Refresh token not found');
    return { ...payload, refreshToken };
  }
}
