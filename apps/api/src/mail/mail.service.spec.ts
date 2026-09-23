import { MailService, escapeHtml } from './mail.service';

describe('MailService', () => {
  const config = (values: Record<string, string | undefined>) => ({
    get: (key: string) => values[key],
  });

  it('is disabled when SMTP is not configured', () => {
    const service = new MailService(config({}) as any);
    expect(service.isEnabled()).toBe(false);
  });

  it('is disabled when MAIL_ENABLED is not "true"', () => {
    const service = new MailService(config({ SMTP_HOST: 'smtp.example.com' }) as any);
    expect(service.isEnabled()).toBe(false);
  });

  it('is enabled when host is set and MAIL_ENABLED=true', () => {
    const service = new MailService(
      config({ SMTP_HOST: 'smtp.example.com', MAIL_ENABLED: 'true' }) as any,
    );
    expect(service.isEnabled()).toBe(true);
  });

  it('send is a safe no-op when disabled', async () => {
    const service = new MailService(config({}) as any);
    await expect(
      service.send({ to: 'a@example.com', subject: 'Hi', html: '<p>Hello</p>' }),
    ).resolves.toBeUndefined();
  });

  it('escapes HTML-unsafe characters', () => {
    expect(escapeHtml('<script>alert("x&")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&amp;&quot;)&lt;/script&gt;',
    );
  });
});