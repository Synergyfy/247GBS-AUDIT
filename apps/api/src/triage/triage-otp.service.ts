import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { escapeHtml } from '../mail/mail.service';

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

@Injectable()
export class TriageOtpService {
  private readonly logger = new Logger(TriageOtpService.name);
  // Keyed by normalized lowercase email
  private readonly otpStore = new Map<string, OtpRecord>();

  constructor(private readonly mailService: MailService) {}

  /**
   * Generates a 6-digit code, stores it for 10 minutes, and delivers via Resend.
   */
  async sendOtp(rawEmail: string): Promise<{ success: boolean; message: string }> {
    const email = rawEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new BadRequestException('A valid email address is required.');
    }

    // Rate-limiting check: 60s cooldown if code was requested very recently
    const existing = this.otpStore.get(email);
    const now = Date.now();
    if (existing && existing.expiresAt - now > 9 * 60 * 1000) {
      // Requested within the last 60 seconds
      throw new BadRequestException('Please wait a moment before requesting another verification code.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    this.otpStore.set(email, {
      code,
      expiresAt,
      attempts: 0,
      verified: false,
    });

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
                      <span style="font-family:Consolas,Monaco,monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#ea580c;display:inline-block;">${code}</span>
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
   * Verifies the provided 6-digit OTP code against the record.
   */
  verifyOtp(rawEmail: string, rawCode: string): { verified: boolean; message: string } {
    const email = rawEmail.trim().toLowerCase();
    const code = rawCode.trim();

    const record = this.otpStore.get(email);
    if (!record) {
      throw new BadRequestException('No verification code found for this email. Please request a new code.');
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(email);
      throw new BadRequestException('Verification code has expired. Please request a new code.');
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      this.otpStore.delete(email);
      throw new BadRequestException('Too many incorrect attempts. Please request a new code.');
    }

    if (record.code !== code) {
      throw new BadRequestException('Invalid verification code. Please check and try again.');
    }

    record.verified = true;
    return { verified: true, message: 'Email successfully verified.' };
  }

  /**
   * Checks if an email has already been verified via OTP.
   */
  isVerified(rawEmail: string): boolean {
    const email = rawEmail.trim().toLowerCase();
    const record = this.otpStore.get(email);
    return Boolean(record && record.verified);
  }
}
