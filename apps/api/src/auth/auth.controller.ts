import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'strict', // Protects against CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account and sets HttpOnly refresh cookie.' })
  @ApiResponse({ status: 201, description: 'User successfully registered.', schema: { example: { accessToken: 'jwt...' } } })
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const { tokens, user } = await this.authService.signup(createUserDto);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @ApiOperation({ summary: 'Sign in', description: 'Authenticates a user and sets HttpOnly refresh cookie.' })
  @ApiResponse({ status: 201, description: 'User successfully logged in or MFA required.', schema: { example: { accessToken: 'jwt...', mfaRequired: false } } })
  @Post('signin')
  async signin(@Body() data: AuthDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signin(data);
    
    if ('mfaRequired' in result) {
      return result;
    }

    const { tokens, user } = result;
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @ApiOperation({ summary: 'Generate MFA Secret', description: 'Generates a new TOTP secret and QR code for the authenticated user.' })
  @ApiBearerAuth('access-token')
  @UseGuards(AccessTokenGuard)
  @Post('mfa/generate')
  async generateMfaSecret(@Req() req: Request) {
    const userId = (req as any).user['sub'];
    return this.authService.generateMfaSecret(userId);
  }

  @ApiOperation({ summary: 'Enable MFA', description: 'Verifies the provided TOTP code and enables MFA for the user.' })
  @ApiBearerAuth('access-token')
  @ApiBody({ schema: { example: { code: '123456' } } })
  @UseGuards(AccessTokenGuard)
  @Post('mfa/enable')
  async enableMfa(@Req() req: Request, @Body('code') code: string) {
    const userId = (req as any).user['sub'];
    return this.authService.enableMfa(userId, code);
  }

  @ApiOperation({ summary: 'Authenticate with MFA', description: 'Second step of login: verifies the TOTP code for a user with MFA enabled.' })
  @ApiBody({ schema: { example: { userId: 'uuid...', code: '123456' } } })
  @Post('mfa/authenticate')
  async authenticateWithMfa(@Body('userId') userId: string, @Body('code') code: string, @Res({ passthrough: true }) res: Response) {
    const { tokens, user } = await this.authService.signinWithMfa(userId, code);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @ApiOperation({ summary: 'Logout', description: 'Invalidates the refresh token and clears the cookie.' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Successfully logged out.' })
  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout((req as any).user['sub']);
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }

  @ApiOperation({ summary: 'Refresh Tokens', description: 'Uses the HttpOnly Refresh Cookie to obtain a new Access Token.' })
  @ApiResponse({ status: 200, description: 'Tokens successfully refreshed.', schema: { example: { accessToken: 'jwt...' } } })
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = (req as any).user['sub'];
    const refreshToken = (req as any).user['refreshToken'];
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    
    // Rotate the refresh token (security best practice)
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    
    return { accessToken: tokens.accessToken };
  }
}
