import {
  Controller,
  Get,
  Query,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { McomService } from './mcom.service';
import { Public } from '../auth/decorators/public.decorator';

interface HandshakePayload {
  sub?: string;
  userId?: string;
  id?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  membershipLevel?: string;
  membershipStatus?: string;
  permissions?: Record<string, boolean>;
}

@ApiTags('MCOM SSO')
@Controller('auth')
export class HandshakeController {
  constructor(
    private mcomService: McomService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Get('sso-login')
  @ApiOperation({ summary: 'MCOM handshake SSO login' })
  @ApiQuery({ name: 'token', required: true })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with local JWT',
  })
  async ssoLogin(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    try {
      if (!token) {
        throw new HttpException('Missing token', HttpStatus.BAD_REQUEST);
      }

      const ssoSecret = this.configService.get<string>('SSO_SECRET') || '';
      const payload = this.jwtService.verify<HandshakePayload>(token, {
        secret: ssoSecret,
        issuer: 'mcom-central',
      });

      const mcomUser = {
        id: payload.sub || payload.userId || payload.id || '',
        email: payload.email,
        name:
          payload.name ||
          `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
        role: payload.role || 'user',
        membershipLevel: payload.membershipLevel,
        membershipStatus: payload.membershipStatus,
        permissions: payload.permissions || {},
      };

      const localUser = await this.mcomService.jitProvision(mcomUser);

      const localJwt = this.mcomService.issueLocalJwt(localUser);

      res.redirect(
        `${frontendUrl}/auth/callback?token=${localJwt}&role=${localUser.role}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof HttpException
          ? error.message
          : 'Handshake authentication failed';
      res.redirect(
        `${frontendUrl}/auth/signin?error=handshake_failed&message=${encodeURIComponent(errorMessage)}`,
      );
    }
  }
}
