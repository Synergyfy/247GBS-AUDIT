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
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.cookies?.['access_token'] || null,
      ]),
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ||
        'default-jwt-access-secret-key-32chars',
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
