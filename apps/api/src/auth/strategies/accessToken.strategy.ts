import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import type { Request } from 'express';

type JwtPayload = {
  sub: string;
  email: string;
  role?: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET must be set');
    }
    if (secret.length < 32) {
      throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.cookies?.['access_token'] || null,
      ]),
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
