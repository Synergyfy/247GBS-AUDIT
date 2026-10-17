import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Thin, fire-and-forget wrapper around nodemailer.
 *
 * Mailing is only attempted when the transport is configured (SMTP_HOST set)
 * AND MAIL_ENABLED=true. Every send swallows errors and logs them, so nothing
 * in the request path can break because of email delivery.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transport: Transporter | null = null;
  private readonly resendApiKey: string | null = null;
  private readonly from: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const rawFrom =
      configService.get<string>('SMTP_FROM') ||
      configService.get<string>('MAIL_FROM') ||
      'Central Hub Solution <no-reply@centralhubsolution.com>';
    this.from = rawFrom.replace(/^["']|["']$/g, '');

    const resendKey = configService.get<string>('RESEND_API_KEY');
    if (resendKey && resendKey.trim().length > 0) {
      this.resendApiKey = resendKey.trim();
      this.enabled = true;
      this.logger.log(`Resend email provider active with sender: ${this.from}`);
      return;
    }

    const host = configService.get<string>('SMTP_HOST');
    const consentFlag = configService.get<string>('MAIL_ENABLED') === 'true';
    this.enabled = Boolean(host && consentFlag);

    if (!this.enabled) {
      this.transport = null;
      this.logger.warn(
        'Mail is disabled (set RESEND_API_KEY or set MAIL_ENABLED=true and SMTP_HOST to enable).',
      );
      return;
    }

    this.transport = nodemailer.createTransport({
      host,
      port: parseInt(configService.get<string>('SMTP_PORT') || '587', 10),
      secure: configService.get<string>('SMTP_SECURE') === 'true',
      auth:
        configService.get<string>('SMTP_USER') &&
        configService.get<string>('SMTP_PASS')
          ? {
              user: configService.get<string>('SMTP_USER')!,
              pass: configService.get<string>('SMTP_PASS')!,
            }
          : undefined,
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Sends a message; never rejects. Failures are logged and ignored. */
  async send(message: MailMessage): Promise<void> {
    try {
      if (!this.enabled || !message.to) return;

      if (this.resendApiKey) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: this.from,
            to: [message.to],
            subject: message.subject,
            html: message.html,
            text: message.text,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          this.logger.error(`Resend API error (${response.status}): ${errorBody}`);
          return;
        }

        const data = await response.json();
        this.logger.log(`Mail sent via Resend to ${message.to} (ID: ${data?.id})`);
        return;
      }

      if (this.transport) {
        await this.transport.sendMail({
          from: this.from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html,
        });
        this.logger.log(`Mail sent via SMTP to ${message.to}: ${message.subject}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send mail to ${message.to}: ${message.subject}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Fire-and-forget convenience: logs/ignores delivery errors. */
  sendAsync(message: MailMessage): void {
    void this.send(message);
  }
}

/** Escape user-provided text before embedding it into HTML templates. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}