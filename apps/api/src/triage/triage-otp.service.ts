import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { escapeHtml } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';

interface OtpRecord {
  hash: string;
  attempts: number;
  verified: boolean;
  createdAt: number;
}

const OTP_TTL_SECONDS = 10 * 60;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

@Injectable()
export class TriageOtpService {
  private readonly logger = new Logger(TriageOtpService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private otpKey(email: string): string {
    return `otp:${email}`;
  }

  private getPepper(): string {
    const pepper = this.configService.get<string>('OTP_PEPPER');
    if (!pepper) {
      throw new Error('OTP_PEPPER must be set');
    }
    return pepper;
  }

  private hashCode(email: string, code: string): string {
    return createHmac('sha256', this.getPepper())
      .update(`${email}:${code}`)
      .digest('hex');
  }

  private async readRecord(email: string): Promise<OtpRecord | null> {
    const raw = await this.redis.get(this.otpKey(email));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as OtpRecord;
    } catch {
      return null;
    }
  }

  private async writeRecord(
    email: string,
    record: OtpRecord,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redis.setex(
      this.otpKey(email),
      ttlSeconds,
      JSON.stringify(record),
    );
  }

  /**
   * Generates a 6-digit code, stores only its HMAC hash in Redis for 10 minutes,
   * and delivers the plaintext via Resend.
   */
  async sendOtp(
    rawEmail: string,
  ): Promise<{ success: boolean; message: string }> {
    const email = rawEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new BadRequestException('A valid email address is required.');
    }

    // Rate-limiting check: 60s cooldown if code was requested very recently
    const existing = await this.readRecord(email);
    const now = Date.now();
    if (existing && now - existing.createdAt < OTP_COOLDOWN_SECONDS * 1000) {
      throw new BadRequestException(
        'Please wait a moment before requesting another verification code.',
      );
    }

    const code = randomInt(100000, 1000000).toString();
    const hash = this.hashCode(email, code);

    await this.writeRecord(
      email,
      { hash, attempts: 0, verified: false, createdAt: now },
      OTP_TTL_SECONDS,
    );

    const safeCode = escapeHtml(code);
    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                <tr>
                  <td style="background:#0f172a;padding:24px 32px;color:#ffffff;">
                    <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#fdba74;font-weight:700;">Central Hub Solution</p>
                    <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;color:#ffffff;">Verify Your Email Address</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;color:#334155;font-size:14px;line-height:1.6;">
                    <p style="margin:0 0 16px;font-size:15px;color:#1e293b;">
                      Thank you for completing the business pre-audit. To verify your email and receive your diagnostic results and answer breakdown, please enter this verification code:
                    </p>
                    <div style="background:#fff7ed;border:2px dashed #f97316;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
                      <span style="font-family:Consolas,Monaco,monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#ea580c;display:inline-block;">${safeCode}</span>
                    </div>
                    <p style="margin:0 0 12px;font-size:13px;color:#64748b;">
                      This code is valid for <strong>10 minutes</strong>. Once entered, your assessment report and answers will be immediately delivered to your inbox.
                    </p>
                    <p style="margin:0;font-size:12px;color:#94a3b8;">
                      If you did not request this verification code, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 32px;border-top:1px solid #f1f5f9;font-size:12px;color:#94a3b8;background:#fafafa;">
                    Central Hub Solution &bull; Secure Email Verification
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;

    await this.mailService.send({
      to: email,
      subject: `Your Central Hub Solution Verification Code: ${code}`,
      html,
      text: `Your Central Hub Solution verification code is: ${code}. It expires in 10 minutes.`,
    });

    this.logger.log(`Triage OTP dispatched to ${email}`);
    return { success: true, message: 'Verification code sent to your email.' };
  }

  /**
   * Verifies the provided 6-digit OTP code against the stored HMAC hash.
   */
  async verifyOtp(
    rawEmail: string,
    rawCode: string,
  ): Promise<{ verified: boolean; message: string }> {
    const email = rawEmail.trim().toLowerCase();
    const code = rawCode.trim();

    const record = await this.readRecord(email);
    if (!record) {
      throw new BadRequestException(
        'No verification code found for this email. Please request a new code.',
      );
    }

    record.attempts += 1;
    if (record.attempts > OTP_MAX_ATTEMPTS) {
      await this.redis.del(this.otpKey(email));
      throw new BadRequestException(
        'Too many incorrect attempts. Please request a new code.',
      );
    }

    const candidate = this.hashCode(email, code);
    let match = false;
    try {
      match = timingSafeEqual(
        Buffer.from(record.hash, 'hex'),
        Buffer.from(candidate, 'hex'),
      );
    } catch {
      match = false;
    }

    if (!match) {
      // Persist incremented attempt count with remaining TTL approximation.
      await this.writeRecord(email, record, OTP_TTL_SECONDS);
      throw new BadRequestException(
        'Invalid verification code. Please check and try again.',
      );
    }

    record.verified = true;
    await this.writeRecord(email, record, OTP_TTL_SECONDS);
    return { verified: true, message: 'Email successfully verified.' };
  }

  /**
   * Checks if an email has already been verified via OTP.
   */
  async isVerified(rawEmail: string): Promise<boolean> {
    const email = rawEmail.trim().toLowerCase();
    const record = await this.readRecord(email);
    return Boolean(record && record.verified);
  }
}
