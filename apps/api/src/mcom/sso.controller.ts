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
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { McomService } from './mcom.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('MCOM SSO')
@Controller('auth/sso')
export class SsoController {
  constructor(
    private mcomService: McomService,
    private configService: ConfigService,
  ) {}

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

    res.cookie('mcom_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600000,
    });

    const authorizeUrl = this.mcomService.buildAuthorizeUrl(
      this.configService.get<string>('MCOM_REDIRECT_URI') ||
        'http://localhost:3000/auth/callback',
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
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    try {
      if (!code) {
        throw new HttpException(
          'Missing authorization code',
          HttpStatus.BAD_REQUEST,
        );
      }

      const cookieState = (req as any).cookies?.mcom_oauth_state;
      if (!cookieState || cookieState !== state) {
        throw new HttpException(
          'Invalid state parameter',
          HttpStatus.FORBIDDEN,
        );
      }

      const tokenResponse = await this.mcomService.exchangeCode(code);
      const {
        access_token,
        refresh_token,
        expires_in,
        user: mcomUser,
      } = tokenResponse;

      const permissionKey = `canAccess_${(this.configService.get<string>('MCOM_PLATFORM_SLUG') || '247gbs-audit').replace(/-/g, '_')}`;
      const permissions = mcomUser.permissions || {};
      if (!permissions[permissionKey]) {
        throw new HttpException(
          'Access denied: no platform access',
          HttpStatus.FORBIDDEN,
        );
      }

      const localUser = await this.mcomService.jitProvision({
        ...mcomUser,
        permissions,
      });

      await this.mcomService.storeTokens(
        localUser.id,
        access_token,
        refresh_token,
        expires_in,
      );

      const jwt = this.mcomService.issueLocalJwt(localUser);

      res.clearCookie('mcom_oauth_state');
      res.redirect(
        `${frontendUrl}/auth/callback?token=${jwt}&role=${localUser.role}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof HttpException
          ? error.message
          : 'SSO authentication failed';
      res.redirect(
        `${frontendUrl}/auth/signin?error=oauth_failed&message=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh MCOM tokens for a user' })
  async refreshTokens(@Body('userId') userId: string) {
    const user = await this.mcomService['usersService'].findById(userId);
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
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        tokenResponse.expires_in,
      );

      return { success: true, message: 'Tokens refreshed successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to refresh MCOM tokens',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Public()
  @Get('status/:userId')
  @ApiOperation({ summary: 'Get SSO connection status for a user' })
  async getStatus(
    @Param('userId') userId: string,
    @Query('sync') sync?: string,
  ) {
    const user = await this.mcomService['usersService'].findById(userId);
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
          tokenResponse.access_token,
          tokenResponse.refresh_token,
          tokenResponse.expires_in,
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

  @Public()
  @Get('data/permissions')
  @ApiOperation({ summary: 'Fetch permissions from MCOM Central Hub' })
  async getPermissions(@Query('userId') userId: string) {
    const user = await this.mcomService['usersService'].findById(userId);
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
