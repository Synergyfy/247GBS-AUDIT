import { PreAuditMailer } from './pre-audit-mailer';
import type { MailMessage } from './mail.service';

describe('PreAuditMailer', () => {
  let sendAsync: jest.Mock;
  let mailer: PreAuditMailer;

  const config = (overrides: Record<string, string> = {}) => ({
    get: (key: string): string | undefined =>
      ({
        FRONTEND_URL: 'https://app.example.com',
        MAIL_INTERNAL_TO: 'team@example.com',
        ...overrides,
      })[key],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (overrides: Record<string, unknown> = {}): any => ({
    id: 'session-1',
    email: 'user@example.com',
    recommendedAuditType: null,
    destinationType: null,
    destinationTarget: null,
    answers: [
      { questionText: 'How many staff?', optionTexts: ['2 - 5'], value: null },
      { questionText: 'In which sector?', optionTexts: [], value: 'Retail' },
    ],
    ...overrides,
  });

  beforeEach(() => {
    sendAsync = jest.fn();
    mailer = new PreAuditMailer({ sendAsync } as any, config() as any);
  });

  it('skips duplicate submissions entirely', () => {
    mailer.sendPostSubmission(session(), true);
    expect(sendAsync).not.toHaveBeenCalled();
  });

  it('sends only a confirmation email on audit routes', () => {
    mailer.sendPostSubmission(session({ destinationType: 'SHORT_FORM' }), false);
    expect(sendAsync).toHaveBeenCalledTimes(1);
    const message: MailMessage = sendAsync.mock.calls[0][0];
    expect(message.to).toBe('user@example.com');
    expect(message.subject).toContain('results');
    expect(message.html).toContain('/audit/flow?type=SHORT_FORM');
  });

  it('uses the sector target in the confirmation', () => {
    mailer.sendPostSubmission(
      session({ destinationType: 'SECTOR', destinationTarget: 'hospitality' }),
      false,
    );
    const message: MailMessage = sendAsync.mock.calls[0][0];
    expect(message.subject).toContain('results');
    expect(message.html).toContain('hospitality');
  });

  it('notifies the internal team for HUMAN_REVIEW', () => {
    mailer.sendPostSubmission(session({ destinationType: 'HUMAN_REVIEW' }), false);
    expect(sendAsync).toHaveBeenCalledTimes(2);
    const [userMail, internalMail] = sendAsync.mock.calls.map((c) => c[0] as MailMessage);
    expect(userMail.to).toBe('user@example.com');
    expect(internalMail.to).toBe('team@example.com');
    expect(internalMail.subject).toContain('Human Review');
    expect(internalMail.html).toContain('/');
  });

  it('notifies the internal team for SUPPORT', () => {
    const sessionWithSupport = session({ destinationType: 'SUPPORT' });
    mailer.sendPostSubmission(sessionWithSupport, false);
    expect(sendAsync).toHaveBeenCalledTimes(2);
    const internalMail = sendAsync.mock.calls[1][0] as MailMessage;
    expect(internalMail.to).toBe('team@example.com');
    expect(internalMail.subject).toContain('Support');
  });

  it('still notifies the team when the user left no email', () => {
    mailer.sendPostSubmission(session({ email: null, destinationType: 'SUPPORT' }), false);
    expect(sendAsync).toHaveBeenCalledTimes(1);
    const internalMail = sendAsync.mock.calls[0][0] as MailMessage;
    expect(internalMail.to).toBe('team@example.com');
  });

  it('renders every answer into the internal notification', () => {
    mailer.sendPostSubmission(session({ destinationType: 'HUMAN_REVIEW' }), false);
    const internalMail = sendAsync.mock.calls[1][0] as MailMessage;
    expect(internalMail.html).toContain('How many staff?');
    expect(internalMail.html).toContain('2 - 5');
    expect(internalMail.html).toContain('Retail');
  });
});