import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { jwtVerify } from 'jose';
import { PeerAuthGuard } from './peer-auth.guard';
import type { PeerCaller, PeerScope } from './peer.types';

jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(() => jest.fn()),
  jwtVerify: jest.fn(),
}));

const mockedJwtVerify = jwtVerify as unknown as jest.Mock;

interface MockRequest {
  headers: Record<string, string>;
  peerCaller?: PeerCaller;
}

const CONFIG: Record<string, string> = {
  MCOM_SOLUTIONS_URL: 'https://api.centralhubsolution.com',
  MCOM_CLIENT_ID: '247gbs-audit',
  MCOM_SERVICE_ISSUER: 'mcom-solutions',
  MCOM_ALLOWED_CALLERS: 'fundordonate',
};

function makeConfig(overrides: Record<string, string> = {}): ConfigService {
  const values = { ...CONFIG, ...overrides };
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

function makeContext(
  headers: Record<string, string>,
  reflector: Reflector,
  requiredScopes: PeerScope[] = [],
): { context: ExecutionContext; request: MockRequest } {
  const request: MockRequest = { headers };
  (reflector.getAllAndOverride as jest.Mock).mockReturnValue(requiredScopes);
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('PeerAuthGuard', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    mockedJwtVerify.mockReset();
  });

  it('rejects requests with no bearer token', async () => {
    const guard = new PeerAuthGuard(reflector, makeConfig());
    const { context } = makeContext({}, reflector);

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { code: 'PEER_TOKEN_MISSING' },
    });
    expect(mockedJwtVerify).not.toHaveBeenCalled();
  });

  it('accepts a valid delegated token and attaches the caller', async () => {
    mockedJwtVerify.mockResolvedValue({
      payload: {
        sub: 'mcom-user-1',
        act: { sub: 'fundordonate' },
        typ: 'delegated',
        scope: 'preaudit:read audit:read',
      },
    });
    const guard = new PeerAuthGuard(reflector, makeConfig());
    const { context, request } = makeContext(
      { authorization: 'Bearer abc.def.ghi' },
      reflector,
      ['audit:read'],
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.peerCaller).toEqual({
      callerId: 'fundordonate',
      isDelegated: true,
      userId: 'mcom-user-1',
      scopes: ['preaudit:read', 'audit:read'],
    });
    expect(mockedJwtVerify).toHaveBeenCalledWith(
      'abc.def.ghi',
      expect.anything(),
      { issuer: 'mcom-solutions', audience: '247gbs-audit' },
    );
  });

  it('rejects a plain service token (no delegation)', async () => {
    mockedJwtVerify.mockResolvedValue({
      payload: { sub: 'fundordonate', scope: 'audit:read' },
    });
    const guard = new PeerAuthGuard(reflector, makeConfig());
    const { context } = makeContext(
      { authorization: 'Bearer service-token' },
      reflector,
    );

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { code: 'PEER_DELEGATION_REQUIRED' },
    });
  });

  it('rejects an invalid or expired token', async () => {
    mockedJwtVerify.mockRejectedValue(
      new Error('signature verification failed'),
    );
    const guard = new PeerAuthGuard(reflector, makeConfig());
    const { context } = makeContext(
      { authorization: 'Bearer tampered' },
      reflector,
    );

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { code: 'PEER_TOKEN_INVALID' },
    });
  });

  it('denies a caller that is not on the ingress allow-list', async () => {
    mockedJwtVerify.mockResolvedValue({
      payload: {
        sub: 'mcom-user-1',
        act: { sub: 'mcom-mall' },
        typ: 'delegated',
        scope: 'audit:read',
      },
    });
    const guard = new PeerAuthGuard(reflector, makeConfig());
    const { context } = makeContext(
      { authorization: 'Bearer delegated' },
      reflector,
    );

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { code: 'PEER_CALLER_DENIED' },
    });
  });

  it('denies when the token is missing the required scope', async () => {
    mockedJwtVerify.mockResolvedValue({
      payload: {
        sub: 'mcom-user-1',
        act: { sub: 'fundordonate' },
        typ: 'delegated',
        scope: 'preaudit:read',
      },
    });
    const guard = new PeerAuthGuard(reflector, makeConfig());
    const { context } = makeContext(
      { authorization: 'Bearer delegated' },
      reflector,
      ['audit:read'],
    );

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { code: 'PEER_SCOPE_MISSING' },
    });
  });
});
