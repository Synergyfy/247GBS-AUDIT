import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService, escapeHtml } from './mail.service';
import { DESTINATION_LABELS } from '../triage/destination-types';
import { PreAuditSession } from '../triage/entities/pre-audit-session.entity';

interface MailRoute {
  subject: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Tailored user-facing copy per destination route. */
function routeFor(session: PreAuditSession): MailRoute {
  const type = session.destinationType || session.recommendedAuditType || null;
  const target = session.destinationTarget;

  switch (type) {
    case 'SHORT_FORM':
      return {
        subject: 'Your 247GBS pre-audit results are ready',
        heading: 'You are recommended a Short Audit',
        body: "Based on your answers, a short audit is the right next step to get your tailored diagnosis. It's quick and focused.",
        ctaLabel: 'Start your Short Audit',
        ctaHref: '/audit/flow?type=SHORT_FORM',
      };
    case 'LONG_FORM':
      return {
        subject: 'Your 247GBS pre-audit results are ready',
        heading: 'You are recommended a Full Business Audit',
        body: 'Based on your answers, a full business audit will give you the most accurate, in-depth diagnosis for your business.',
        ctaLabel: 'Start your Business Audit',
        ctaHref: '/audit/flow?type=LONG_FORM',
      };
    case 'SECTOR':
      return {
        subject: 'Your 247GBS pre-audit results are ready',
        heading: `You are recommended ${target ? `the ${target} sector audit` : 'a sector-specific audit'}`,
        body: [
          'Based on your answers, a sector-specific audit will give you the most relevant guidance for your business.',
          target ? `Industry focus: ${target}.` : '',
        ]
          .filter(Boolean)
          .join(' '),
        ctaLabel: 'Start the Sector Audit',
        ctaHref: '/audit/flow?type=SECTOR',
      };
    case 'SUPPORT':
      return {
        subject: "We've received your support request",
        heading: 'Support is on its way',
        body: 'Your answers show you don\u2019t need a full audit right now. One of our team will get back to you with the support and information you asked for.',
        ctaLabel: 'Back to 247GBS',
        ctaHref: '/support',
      };
    case 'FUND_OR_DONATE':
      return {
        subject: 'Thank you for supporting 247GBS',
        heading: 'Thank you for supporting our work',
        body: 'Your answers suggest you\u2019d like to support 247GBS. Every contribution helps more businesses access the guidance they need.',
        ctaLabel: 'Make a contribution',
        ctaHref: target || '/funding',
      };
    case 'MCOM':
      return {
        subject: 'Your next step at 247GBS',
        heading: 'Another MCOM service matches your answers',
        body: target
          ? `Based on your answers, the ${target} service is the best next step for you.`
          : 'Based on your answers, one of our other services is the best next step.',
        ctaLabel: 'Go to the service',
        ctaHref: target ? `/${target}` : '/services',
      };
    case 'HUMAN_REVIEW':
      return {
        subject: 'Your pre-audit is with our team',
        heading: 'A specialist is looking over your answers',
        body: 'A member of our team will review your responses and come back to you with the most suitable next step.',
        ctaLabel: 'Back to 247GBS',
        ctaHref: '/',
      };
    case 'NO_ACTION':
    case 'CUSTOM':
    default:
      return {
        subject: 'Your 247GBS pre-audit results are ready',
        heading: 'Your pre-audit is complete',
        body: 'Thank you for completing the 247GBS pre-audit. Your answers are saved and you can revisit them any time.',
        ctaLabel: 'Back to 247GBS',
        ctaHref: '/',
      };
  }
}

function renderAnswerRows(session: PreAuditSession): string {
  const answers = Array.isArray(session.answers) ? session.answers : [];
  const rows = answers
    .map((step: any) => {
      const texts = Array.isArray(step.optionTexts) ? step.optionTexts : [];
      const answer =
        texts.length > 0
          ? texts.join(', ')
          : step.value !== undefined && step.value !== null
            ? String(step.value)
            : 'No answer';
      return `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:13px;color:#0f172a;vertical-align:top;">${escapeHtml(step.questionText)}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:13px;color:#f97316;vertical-align:top;font-weight:600;">${escapeHtml(answer)}</td></tr>`;
    })
    .join('');
  return `<table style="width:100%;border-collapse:collapse;margin-top:8px;">${rows}</table>`;
}

function wrapHtml(title: string, content: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
              <tr>
                <td style="background:#0f172a;padding:24px 32px;color:#ffffff;">
                  <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#fdba74;">247GBS Audit</p>
                  <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;color:#ffffff;">${escapeHtml(title)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#334155;font-size:14px;line-height:1.6;">${content}</td>
              </tr>
              <tr>
                <td style="padding:24px 32px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
                  You received this email because you completed the 247GBS pre-audit.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function buttonHtml(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#f97316;color:#ffffff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;margin:8px 0 16px;">${escapeHtml(label)}</a>`;
}

/**
 * Emails triggered by a successful Pre-Audit submission. Route-dependent
 * templates render tailored next steps; SUPPORT and HUMAN_REVIEW also notify
 * the internal team. All sends are fire-and-forget.
 */
@Injectable()
export class PreAuditMailer {
  private readonly logger = new Logger(PreAuditMailer.name);
  private readonly frontendUrl: string;
  private readonly internalTo: string | undefined;

  constructor(
    private readonly mail: MailService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = (
      configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'
    ).replace(/\/+$/, '');
    this.internalTo = configService.get<string>('MAIL_INTERNAL_TO') || undefined;
  }

  /** Sends user + internal notifications for a freshly-stored session. */
  sendPostSubmission(session: PreAuditSession, isDuplicate: boolean): void {
    if (isDuplicate) return;

    const route = routeFor(session);

    if (session.email) {
      const content = [
        `<p style="margin:0 0 16px;">${route.body}</p>`,
        buttonHtml(`${this.frontendUrl}${route.ctaHref}`, route.ctaLabel),
        `<p style="margin:0;font-size:13px;color:#64748b;">Your answers are stored on this device with your results email. You can repeat the pre-audit any time — your recommendation may change as your business does.</p>`,
      ].join('');
      this.mail.sendAsync({
        to: session.email,
        subject: route.subject,
        html: wrapHtml(route.heading, content),
        text: `${route.body}\n\n${this.frontendUrl}${route.ctaHref}`,
      });
    }

    const needsInternal = session.destinationType === 'SUPPORT' || session.destinationType === 'HUMAN_REVIEW';
    if (needsInternal && this.internalTo) {
      const label = DESTINATION_LABELS[session.destinationType as keyof typeof DESTINATION_LABELS] ?? session.destinationType;
      const content = [
        `<p style="margin:0 0 16px;">A new pre-audit has been routed to <strong>${escapeHtml(label)}</strong>.</p>`,
        `<p style="margin:0 0 4px;font-size:13px;color:#475569;"><strong>User email:</strong> ${escapeHtml(session.email || 'Not provided')}</p>`,
        `<p style="margin:0 0 16px;font-size:13px;color:#475569;"><strong>Destination target:</strong> ${escapeHtml(session.destinationTarget || '—')}</p>`,
        renderAnswerRows(session),
        `<p style="margin:16px 0 0;font-size:13px;color:#64748b;">Reference: ${escapeHtml(session.id)}</p>`,
      ].join('');
      this.mail.sendAsync({
        to: this.internalTo,
        subject: `[247GBS] Pre-audit needs attention — ${label}`,
        html: wrapHtml('New pre-audit for your team', content),
      });
    }

    this.logger.debug('Pre-audit mail queued for session ' + session.id);
  }
}