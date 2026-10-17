import { AuditPartnerNotifier } from './audit-partner-notifier.service';

describe('AuditPartnerNotifier', () => {
  let callPeerApi: jest.Mock;
  let findById: jest.Mock;
  let notifier: AuditPartnerNotifier;
  let configValues: Record<string, string>;

  const audit = {
    id: 'audit-1',
    userId: 'internal-1',
    status: 'COMPLETED',
    auditType: 'LONG_FORM',
    sectorId: 'retail-wholesale',
    calculatedMetrics: { annualRecovery: 12000 },
  };

  function build(): AuditPartnerNotifier {
    const config = { get: jest.fn((key: string) => configValues[key]) };
    return new AuditPartnerNotifier(
      config as any,
      { callPeerApi } as any,
      { findById } as any,
    );
  }

  beforeEach(() => {
    callPeerApi = jest.fn().mockResolvedValue({});
    findById = jest.fn().mockResolvedValue({ mcomUserId: 'mcom-1' });
    configValues = {
      FUNDORDONATE_AUDIT_EVENTS_ENABLED: 'true',
      FUNDORDONATE_BASE_URL: 'https://api.fundordonate.mcom.com',
      FUNDORDONATE_AUDIT_EVENT_PATH: '/api/v1/partner/audit-events',
      FUNDORDONATE_CLIENT_ID: 'fundordonate',
      FUNDORDONATE_AUDIT_EVENT_SCOPE: 'audit:write',
    };
    notifier = build();
  });

  it('does nothing when disabled', async () => {
    configValues.FUNDORDONATE_AUDIT_EVENTS_ENABLED = 'false';
    notifier = build();

    await notifier.notifyAuditCompleted(audit);

    expect(callPeerApi).not.toHaveBeenCalled();
  });

  it('does nothing when no base URL is configured', async () => {
    configValues.FUNDORDONATE_BASE_URL = '';
    notifier = build();

    await notifier.notifyAuditCompleted(audit);

    expect(callPeerApi).not.toHaveBeenCalled();
  });

  it('pushes the completed audit with the resolved MCOM user id', async () => {
    await notifier.notifyAuditCompleted(audit);

    expect(callPeerApi).toHaveBeenCalledTimes(1);
    const [base, audience, path, options] = callPeerApi.mock.calls[0] as [
      string,
      string,
      string,
      { method: string; scope: string; data: Record<string, unknown> },
    ];
    expect(base).toBe('https://api.fundordonate.mcom.com');
    expect(audience).toBe('fundordonate');
    expect(path).toBe('/api/v1/partner/audit-events');
    expect(options.method).toBe('POST');
    expect(options.scope).toBe('audit:write');
    expect(options.data).toMatchObject({
      auditId: 'audit-1',
      mcomUserId: 'mcom-1',
      status: 'COMPLETED',
      sectorId: 'retail-wholesale',
    });
  });

  it('swallows peer failures so completion is never blocked', async () => {
    callPeerApi.mockRejectedValue(new Error('peer down'));

    await expect(notifier.notifyAuditCompleted(audit)).resolves.toBeUndefined();
  });
});
