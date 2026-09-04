import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { toDataURL } from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MfaService {
  constructor(private readonly configService: ConfigService) {}

  async generateSecret(): Promise<string> {
    const secret = speakeasy.generateSecret({ length: 20 });
    return secret.base32;
  }

  async generateQrCodeUri(email: string, secret: string): Promise<string> {
    const appName = this.configService.get<string>('APP_NAME') || '247GBS Audit';
    const otpauth = speakeasy.otpauthURL({
      issuer: appName,
      label: encodeURIComponent(email),
      secret: secret,
      encoding: 'base32',
    });
    return toDataURL(otpauth);
  }

  async verifyCode(code: string, secret: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 1, // allow 1 step tolerance (30s before/after)
    });
  }
}
