import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'; // Import PassportModule
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { UsersModule } from '../users/users.module';
import { MfaService } from './mfa.service';

@Module({
  imports: [
      JwtModule.register({}), 
      UsersModule,
      PassportModule,
    ],
  controllers: [AuthController],
  providers: [AuthService, MfaService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService, MfaService],
})
export class AuthModule {}
