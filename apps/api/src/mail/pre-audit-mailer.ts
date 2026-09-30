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
        subject: 'Your Central Hub Solution pre-audit results are ready',
        heading: 'You are recommended a Short Business Audit',
        body: "Based on your answers, a focused short audit is the recommended next step to get your tailored business diagnosis. It's fast, structured, and insightful.",
        ctaLabel: 'Start your Short Audit',
        ctaHref: '/audit/flow?type=SHORT_FORM',
      };
    case 'LONG_FORM':
      return {
        subject: 'Your Central Hub Solution pre-audit results are ready',
        heading: 'You are recommended a Full Business Audit',
        body: 'Based on your answers, a comprehensive business audit will give you the most thorough diagnosis and strategic roadmap for your organization.',
        ctaLabel: 'Start your Business Audit',
        ctaHref: '/audit/flow?type=LONG_FORM',
      };
    case 'SECTOR':
      return {
        subject: 'Your Central Hub Solution pre-audit results are ready',
        heading: `You are recommended ${target ? `the ${target} sector audit` : 'a sector-specific audit'}`,
        body: [
          'Based on your answers, a sector-specific audit will provide the most tailored diagnostic insights for your industry.',
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
        body: 'Your answers indicate you don\u2019t need a standard audit at this moment. A specialist from our team will reach out to provide direct guidance.',
        ctaLabel: 'Back to Central Hub Solution',
        ctaHref: '/support',
      };
    case 'FUND_OR_DONATE':
      return {
        subject: 'Thank you for supporting Central Hub Solution',
        heading: 'Thank you for your support',
        body: 'Your responses indicate an interest in partnering or supporting our business ecosystem. We appreciate your engagement!',
        ctaLabel: 'Make a contribution',
        ctaHref: target || '/funding',
      };
    case 'MCOM':
      return {
        subject: 'Your next step at Central Hub Solution',
        heading: 'A dedicated service matches your answers',
        body: target
          ? `Based on your answers, the ${target} service is the recommended next step for your business.`
          : 'Based on your answers, one of our ecosystem services is the best next step.',
        ctaLabel: 'Explore the service',
        ctaHref: target ? `/${target}` : '/services',
      };
    case 'HUMAN_REVIEW':
      return {
        subject: 'Your pre-audit is with our specialist team',
        heading: 'A specialist is reviewing your answers',
        body: 'A dedicated member of our team is reviewing your pre-audit responses to tailor the next steps specifically for your business.',
        ctaLabel: 'Back to Central Hub Solution',
        ctaHref: '/',
      };
    case 'NO_ACTION':
    case 'CUSTOM':
    default:
      return {
        subject: 'Your Central Hub Solution pre-audit results are ready',
        heading: 'Your pre-audit assessment is complete',
        body: 'Thank you for completing your pre-audit with Central Hub Solution. Your answers are recorded below and can be referenced anytime.',
        ctaLabel: 'View Audit Dashboard',
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
      return `<tr><td style="padding:10px 14px;border:1px solid #e2e8f0;font-size:13px;color:#0f172a;vertical-align:top;background:#f8fafc;width:55%;"><strong>${escapeHtml(step.questionText)}</strong></td><td style="padding:10px 14px;border:1px solid #e2e8f0;font-size:13px;color:#ea580c;vertical-align:top;font-weight:600;background:#ffffff;">${escapeHtml(answer)}</td></tr>`;
    })
    .join('');
  return `<table style="width:100%;border-collapse:collapse;margin-top:12px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">${rows}</table>`;
}

function wrapHtml(title: string, content: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
              <tr>
                <td style="background:#0f172a;padding:24px 32px;color:#ffffff;">
                  <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#fdba74;font-weight:700;">Central Hub Solution</p>
                  <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;color:#ffffff;">${escapeHtml(title)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#334155;font-size:14px;line-height:1.6;">${content}</td>
              </tr>
              <tr>
                <td style="padding:24px 32px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;background:#fafafa;">
                  You received this email because you completed a business pre-audit assessment on Central Hub Solution.
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
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#f97316;color:#ffffff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;margin:12px 0 18px;text-align:center;">${escapeHtml(label)} &rarr;</a>`;
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
      configService.get<string>('FRONTEND_URL') || 'http://localhost:9009'
    ).replace(/\/+$/, '');
    this.internalTo = configService.get<string>('MAIL_INTERNAL_TO') || undefined;
  }

  /** Sends user + internal notifications for a freshly-stored session. */
  sendPostSubmission(session: PreAuditSession, isDuplicate: boolean, diagnostic?: any): void {
    if (isDuplicate) return;

    const route = routeFor(session);

    if (session.email) {
      const gapBlock =
        diagnostic?.funding?.fundingGapFormatted && diagnostic.funding.status === 'gap_identified'
          ? `<div style="background:#fff7ed;border:1px solid #fdba74;border-radius:12px;padding:16px;margin:16px 0;">
               <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;color:#c2410c;letter-spacing:0.5px;">Financial Snapshot &amp; Funding Gap</p>
               <p style="margin:0 0 4px;font-size:14px;color:#7c2d12;">Total Requirement: <strong>${diagnostic.funding.fundingNeedFormatted || 'N/A'}</strong> | Available Funds: <strong>${diagnostic.funding.ownContributionFormatted || '£0'}</strong></p>
               <p style="margin:0;font-size:16px;font-weight:700;color:#ea580c;">Calculated Funding Gap: ${diagnostic.funding.fundingGapFormatted}</p>
             </div>`
          : '';

      const content = [
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1e293b;">${route.body}</p>`,
        gapBlock,
        buttonHtml(`${this.frontendUrl}${route.ctaHref}`, route.ctaLabel),
        `<div style="margin:24px 0 16px;border-top:1px solid #e2e8f0;padding-top:20px;">
           <h3 style="margin:0 0 8px;font-size:16px;color:#0f172a;font-weight:700;">Your Responses &amp; Audit Information</h3>
           <p style="margin:0 0 12px;font-size:13px;color:#64748b;">Here is a summary of the answers you provided during your assessment:</p>
           ${renderAnswerRows(session)}
         </div>`,
        `<p style="margin:20px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Your answers are saved. You can revisit your results or take the full audit whenever you are ready.</p>`,
      ].join('');
      this.mail.sendAsync({
        to: session.email,
        subject: route.subject,
        html: wrapHtml(route.heading, content),
        text: `${route.body}\n\n${this.frontendUrl}${route.ctaHref}`,
      });
    }

    // Accountant collaboration workflow
    if (diagnostic?.accountant?.email) {
      const accountantEmail = diagnostic.accountant.email;
      const accContent = [
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1e293b;">A client or business contact (${escapeHtml(session.email || 'A business owner')}) has completed their initial Business Pre-Audit with Central Hub Solution and requested to involve you as their accountant to assist with financial verification and seasonal figures.</p>`,
        diagnostic.funding?.fundingGapFormatted
          ? `<div style="background:#fff7ed;border:1px solid #fdba74;border-radius:12px;padding:16px;margin:16px 0;">
               <h4 style="margin:0 0 8px;color:#c2410c;font-size:14px;">Identified Funding Analysis</h4>
               <p style="margin:0;font-size:13px;color:#7c2d12;">Total Need: <strong>${diagnostic.funding.fundingNeedFormatted || 'N/A'}</strong> | Available Funds: <strong>${diagnostic.funding.ownContributionFormatted || 'N/A'}</strong> | Estimated Funding Gap: <strong>${diagnostic.funding.fundingGapFormatted}</strong></p>
             </div>`
          : '',
        `<div style="margin:20px 0 16px;border-top:1px solid #e2e8f0;padding-top:16px;">
           <h3 style="margin:0 0 8px;font-size:16px;color:#0f172a;font-weight:700;">Recorded Business Pre-Audit Answers</h3>
           ${renderAnswerRows(session)}
         </div>`,
        `<p style="margin:20px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Thank you for partnering with Central Hub Solution to help this business assess their position and thrive.</p>`,
      ].join('');
      this.mail.sendAsync({
        to: accountantEmail,
        subject: '[Central Hub Solution] Business Pre-Audit: Financial Review & Collaboration Request',
        html: wrapHtml('Business Pre-Audit Financial Review', accContent),
        text: `A business has requested to involve you in their Central Hub Solution Business Pre-Audit.\n\nFunding Gap: ${diagnostic.funding?.fundingGapFormatted || 'N/A'}`,
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
        subject: `[Central Hub Solution] Pre-audit needs attention — ${label}`,
        html: wrapHtml('New pre-audit for your team', content),
      });
    }

    this.logger.debug('Pre-audit mail queued for session ' + session.id);
  }
}