import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { McomService, resolveDisplayName } from './mcom.service';
import { Public } from '../auth/decorators/public.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@ApiTags('MCOM SSO')
@Controller('auth/sso')
export class SsoController {
  constructor(
    private mcomService: McomService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  private setRefreshTokenCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      domain: isProd ? '.centralhubsolution.com' : undefined,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private setAccessTokenCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      domain: isProd ? '.centralhubsolution.com' : undefined,
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
  }

  private getLocalTokens(userId: string, email: string, role?: string) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET')!;
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')!;
    const accessExpiration = this.configService.get<string>(
      'JWT_ACCESS_EXPIRATION',
    )! as any;
    const refreshExpiration = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
    )! as any;

    const payload: Record<string, any> = { sub: userId, email };
    if (role) payload.role = role;
    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: accessExpiration,
    });
    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      { secret: refreshSecret, expiresIn: refreshExpiration },
    );

    return { accessToken, refreshToken };
  }

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Get MCOM SSO configuration' })
  @ApiResponse({ status: 200, description: 'SSO configuration returned' })
  getConfig() {
    const membershipUrl =
      this.configService.get<string>('MCOM_MEMBERSHIP_URL') || '';
    const walletEnabled =
      this.configService.get<string>('MCOM_WALLET_ENABLED') === 'true';
    const configured = !!this.configService.get<string>('MCOM_CLIENT_ID');

    return {
      membershipUrl,
      walletEnabled,
      configured,
    };
  }

  @Public()
  @Get('login')
  @ApiOperation({ summary: 'Initiate MCOM SSO login' })
  @ApiResponse({ status: 302, description: 'Redirects to MCOM Central Hub' })
  login(@Res() res: Response) {
    const state = this.mcomService.generateStateToken();

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('mcom_oauth_state', state, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      domain: isProd ? '.centralhubsolution.com' : undefined,
      path: '/',
      maxAge: 600000,
    });

    const authorizeUrl = this.mcomService.buildAuthorizeUrl(
      this.configService.get<string>('MCOM_REDIRECT_URI') ||
        'http://localhost:9009/auth/callback',
      state,
    );

    res.redirect(authorizeUrl);
  }

  @Public()
  @Get('callback')
  @ApiOperation({ summary: 'MCOM SSO OAuth callback' })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'state', required: true })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with token' })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:9009';
    const isProd = process.env.NODE_ENV === 'production';

    try {
      if (!code) {
        throw new HttpException(
          'Missing authorization code',
          HttpStatus.BAD_REQUEST,
        );
      }

      const cookieState = (req as any).cookies?.mcom_oauth_state;
      if (cookieState && cookieState !== state) {
        throw new HttpException(
          'Invalid state parameter',
          HttpStatus.FORBIDDEN,
        );
      }

      const tokenResponse = await this.mcomService.exchangeCode(code);
      const mcomAccessToken = tokenResponse.accessToken;
      const mcomRefreshToken = tokenResponse.refreshToken;
      const expiresIn = tokenResponse.expiresIn;
      let mcomUser = tokenResponse.user;

      // POST /sso/token returns {firstName,lastName} without `name`;
      // GET /sso/userinfo returns the full shape incl. derived `name`.
      // Enrich when the token response carries no usable name so JIT
      // provisioning stores the real Central Hub name (never MCOM/User).
      try {
        if (!resolveDisplayName(mcomUser)) {
          const info = await this.mcomService.fetchUserInfo(mcomAccessToken);
          mcomUser = {
            ...mcomUser,
            ...info,
            id: (info as { sub?: string }).sub || mcomUser.id,
          };
        }
      } catch {
        // Non-fatal: jitProvision falls back to email-prefix.
      }

      const localUser = await this.mcomService.jitProvision({
        ...mcomUser,
        permissions: {},
      });

      await this.mcomService.storeTokens(
        localUser.id,
        mcomAccessToken,
        mcomRefreshToken,
        expiresIn,
      );

      const { accessToken, refreshToken } = this.getLocalTokens(
        localUser.id,
        localUser.email,
        localUser.role,
      );

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.usersService.update(localUser.id, {
        currentHashedRefreshToken: hashedRefreshToken,
        lastLoginAt: new Date(),
      });

      res.clearCookie('mcom_oauth_state', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        domain: isProd ? '.centralhubsolution.com' : undefined,
        path: '/',
      });
      this.setAccessTokenCookie(res, accessToken);
      this.setRefreshTokenCookie(res, refreshToken);
      res.redirect(
        `${frontendUrl}/auth/callback?token=${encodeURIComponent(accessToken)}&role=${encodeURIComponent(localUser.role || 'User')}`,
      );
    } catch (error) {
      console.error('SSO callback error:', error);
      const errorMessage =
        error instanceof HttpException
          ? error.message
          : 'SSO authentication failed';
      res.redirect(
        `${frontendUrl}/auth/signin?error=oauth_failed&message=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Post('refresh')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Refresh MCOM tokens for a user' })
  async refreshTokens(@Body('userId') userId: string, @Req() req: Request) {
    const requesterId = (req as any).user?.sub;
    if (!requesterId || requesterId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
    const user = await this.usersService.findById(userId);
    if (!user || !user.mcomRefreshToken) {
      throw new HttpException(
        'No MCOM tokens found for user',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const refreshToken = this.mcomService.decryptToken(user.mcomRefreshToken);
      const tokenResponse = await this.mcomService.refreshTokens(refreshToken);

      await this.mcomService.storeTokens(
        userId,
        tokenResponse.accessToken,
        tokenResponse.refreshToken,
        tokenResponse.expiresIn,
      );

      return { success: true, message: 'Tokens refreshed successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to refresh MCOM tokens',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('status/:userId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get SSO connection status for a user' })
  async getStatus(
    @Param('userId') userId: string,
    @Req() req: Request,
    @Query('sync') sync?: string,
  ) {
    const requesterId = (req as any).user?.sub;
    if (!requesterId || requesterId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isConnected = !!user.mcomUserId;
    const tokenExpired = user.mcomTokenExpiresAt
      ? new Date(user.mcomTokenExpiresAt) < new Date()
      : true;

    if (
      sync === 'true' &&
      isConnected &&
      !tokenExpired &&
      user.mcomRefreshToken
    ) {
      try {
        const refreshToken = this.mcomService.decryptToken(
          user.mcomRefreshToken,
        );
        const tokenResponse =
          await this.mcomService.refreshTokens(refreshToken);
        await this.mcomService.storeTokens(
          userId,
          tokenResponse.accessToken,
          tokenResponse.refreshToken,
          tokenResponse.expiresIn,
        );
      } catch {
        // Token refresh failed, continue with existing status
      }
    }

    return {
      connected: isConnected,
      membershipLevel: user.mcomMembershipLevel,
      membershipTier: user.mcomMembershipTier,
      membershipStatus: user.mcomMembershipStatus,
      canAccessVcard: user.mcomCanAccessVcard,
      tokenExpired,
      lastUpdated: user.mcomTokensUpdatedAt,
    };
  }

  @Get('data/permissions')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Fetch permissions from MCOM Central Hub' })
  async getPermissions(@Query('userId') userId: string, @Req() req: Request) {
    const requesterId = (req as any).user?.sub;
    const effectiveUserId = userId || requesterId;
    if (!requesterId || effectiveUserId !== requesterId) {
      throw new ForbiddenException('Access denied.');
    }
    const user =
      await this.mcomService['usersService'].findById(effectiveUserId);
    if (!user || !user.mcomAccessToken) {
      throw new HttpException('No MCOM tokens found', HttpStatus.NOT_FOUND);
    }

    try {
      const accessToken = this.mcomService.decryptToken(user.mcomAccessToken);
      const permissions = await this.mcomService.fetchPermissions(accessToken);
      return { permissions };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch permissions',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
