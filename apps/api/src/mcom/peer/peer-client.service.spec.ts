import { PeerClientService } from './peer-client.service';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  };
}

interface FetchInit {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

describe('PeerClientService', () => {
  let fetchMock: jest.Mock;
  let service: PeerClientService;

  const config = {
    get: jest.fn(
      (key: string) =>
        ({
          MCOM_SOLUTIONS_URL: 'https://api.centralhubsolution.com',
          MCOM_CLIENT_ID: '247gbs-audit',
          MCOM_CLIENT_SECRET: 'cs_secret',
        })[key],
    ),
  };

  const basic = `Basic ${Buffer.from('247gbs-audit:cs_secret').toString('base64')}`;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    service = new PeerClientService(config as any);
  });

  it('mints a service token and caches it across calls', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ access_token: 'tok-1', expires_in: 300 }),
    );

    const first = await service.getServiceToken('fundordonate', 'audit:read');
    const second = await service.getServiceToken('fundordonate', 'audit:read');

    expect(first).toBe('tok-1');
    expect(second).toBe('tok-1');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, FetchInit];
    expect(url).toBe(
      'https://api.centralhubsolution.com/api/v1/auth/service-token',
    );
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe(basic);
    expect(init.body).toBe(
      JSON.stringify({
        grant_type: 'client_credentials',
        audience: 'fundordonate',
        scope: 'audit:read',
      }),
    );
  });

  it('calls a peer API directly with a bearer token and caller id', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'tok-1', expires_in: 300 }),
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await service.callPeerApi<{ ok: boolean }>(
      'https://api.fundordonate.mcom.com/',
      'fundordonate',
      '/api/v1/partner/audit-events',
      { method: 'POST', scope: 'audit:write', data: { auditId: 'a1' } },
    );

    expect(result).toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[1] as [string, FetchInit];
    expect(url).toBe(
      'https://api.fundordonate.mcom.com/api/v1/partner/audit-events',
    );
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ auditId: 'a1' }));
    expect(init.headers.Authorization).toBe('Bearer tok-1');
    expect(init.headers['X-Caller-Id']).toBe('247gbs-audit');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('throws when the peer call fails', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'tok-1', expires_in: 300 }),
      )
      .mockResolvedValueOnce(jsonResponse({}, false, 503));

    await expect(
      service.callPeerApi(
        'https://api.fundordonate.mcom.com',
        'fundordonate',
        '/x',
      ),
    ).rejects.toThrow('failed with 503');
  });

  it('exchanges a user SSO token for a delegated token', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ access_token: 'delegated-1' }));

    const token = await service.getDelegatedServiceToken(
      'user-sso-token',
      'fundordonate',
      'audit:read',
    );

    expect(token).toBe('delegated-1');

    const [url, init] = fetchMock.mock.calls[0] as [string, FetchInit];
    expect(url).toBe(
      'https://api.centralhubsolution.com/api/v1/auth/service-token/exchange',
    );
    expect(init.body).toBe(
      JSON.stringify({
        subject_token: 'user-sso-token',
        audience: 'fundordonate',
        scope: 'audit:read',
      }),
    );
  });
});
