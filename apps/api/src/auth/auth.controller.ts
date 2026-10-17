import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production';
    const domain = isProd ? '.centralhubsolution.com' : undefined;

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      domain,
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      domain,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearCookies(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const domain = isProd ? '.centralhubsolution.com' : undefined;
    const base = {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
      domain,
      path: '/',
    };

    res.clearCookie('access_token', base);
    res.clearCookie('refresh_token', base);
  }

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account and sets HttpOnly cookies.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
    schema: { example: { accessToken: 'jwt...' } },
  })
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, user } = await this.authService.signup(createUserDto);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  @ApiOperation({
    summary: 'Sign in',
    description: 'Authenticates a user and sets HttpOnly cookies.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged in or MFA required.',
    schema: { example: { accessToken: 'jwt...', mfaRequired: false } },
  })
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signin')
  async signin(
    @Body() data: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signin(data);

    if ('mfaRequired' in result) {
      return result;
    }

    const { tokens, user } = result;
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  @ApiOperation({
    summary: 'Admin Dedicated Sign in',
    description:
      'Authenticates an administrator exclusively and sets HttpOnly cookies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin successfully logged in.',
    schema: { example: { accessToken: 'jwt...' } },
  })
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('admin/signin')
  async adminSignin(
    @Body() data: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.adminSignin(data);

    if ('mfaRequired' in result) {
      return result;
    }

    const { tokens, user } = result;
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  @ApiOperation({
    summary: 'Generate MFA Secret',
    description:
      'Generates a new TOTP secret and QR code for the authenticated user.',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AccessTokenGuard)
  @Post('mfa/generate')
  async generateMfaSecret(@Req() req: Request) {
    const userId = (req as any).user['sub'];
    return this.authService.generateMfaSecret(userId);
  }

  @ApiOperation({
    summary: 'Enable MFA',
    description:
      'Verifies the provided TOTP code and enables MFA for the user.',
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ schema: { example: { code: '123456' } } })
  @UseGuards(AccessTokenGuard)
  @Post('mfa/enable')
  async enableMfa(@Req() req: Request, @Body('code') code: string) {
    const userId = (req as any).user['sub'];
    return this.authService.enableMfa(userId, code);
  }

  @ApiOperation({
    summary: 'Authenticate with MFA',
    description:
      'Second step of login: verifies the TOTP code for a user with MFA enabled.',
  })
  @ApiBody({ schema: { example: { userId: 'uuid...', code: '123456' } } })
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('mfa/authenticate')
  async authenticateWithMfa(
    @Body('userId') userId: string,
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, user } = await this.authService.signinWithMfa(userId, code);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  @ApiOperation({
    summary: 'Logout',
    description: 'Invalidates the refresh token and clears the cookies.',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Successfully logged out.' })
  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout((req as any).user['sub']);
    this.clearCookies(res);
    return { message: 'Logged out' };
  }

  @ApiOperation({
    summary: 'Refresh Tokens',
    description:
      'Uses the HttpOnly Refresh Cookie or Bearer token to obtain new tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully refreshed.',
    schema: { example: { accessToken: 'jwt...' } },
  })
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = (req as any).user['sub'];
    const refreshToken = (req as any).user['refreshToken'];
    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    // Rotate tokens and update HttpOnly cookies
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
