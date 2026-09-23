import { Injectable, ForbiddenException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { MfaService } from './mfa.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mfaService: MfaService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return { tokens, user: newUser };
  }

  async signin(data: AuthDto) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) throw new BadRequestException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) throw new BadRequestException('Invalid credentials');

    if (user.isMfaEnabled) {
      return {
        mfaRequired: true,
        userId: user.id,
        message: 'MFA is enabled. Please provide the 6-digit code.',
      };
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return { tokens, user };
  }

  async signinWithMfa(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.mfaSecret) throw new UnauthorizedException('Authentication failed');

    const isCodeValid = await this.mfaService.verifyCode(code, user.mfaSecret);
    if (!isCodeValid) throw new BadRequestException('Invalid MFA code');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return { tokens, user };
  }

  async generateMfaSecret(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const secret = await this.mfaService.generateSecret();
    const qrCode = await this.mfaService.generateQrCodeUri(user.email, secret);

    // Temp store secret in DB before verified enablement
    await this.usersService.update(userId, { mfaSecret: secret });

    return { secret, qrCode };
  }

  async enableMfa(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.mfaSecret) throw new BadRequestException('MFA Setup not initiated');

    const isCodeValid = await this.mfaService.verifyCode(code, user.mfaSecret);
    if (!isCodeValid) throw new BadRequestException('Invalid MFA code');

    await this.usersService.update(userId, { isMfaEnabled: true });
    return { success: true, message: 'MFA enabled successfully' };
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { currentHashedRefreshToken: null });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.currentHashedRefreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      currentHashedRefreshToken: hash,
    });
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET')!,
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION')! as any,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION')! as any,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
