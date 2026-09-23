import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { PreAuditMailer } from './pre-audit-mailer';

/**
 * Outbound emails. Both services are intentionally fire-and-forget wrappers
 * around nodemailer: a mail failure can never break a user's submission.
 */
@Module({
  providers: [MailService, PreAuditMailer],
  exports: [MailService, PreAuditMailer],
})
export class MailModule {}