import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditStatus } from './entities/audit-session.entity';

describe('AuditService.createFromPreAudit', () => {
  let auditFindOne: jest.Mock;
  let auditCreate: jest.Mock;
  let auditSave: jest.Mock;
  let preAuditFindOne: jest.Mock;
  let service: AuditService;

  const preAudit = {
    id: 'pre-1',
    recommendedAuditType: 'SHORT_FORM',
    destinationType: 'SHORT_FORM',
  };

  beforeEach(() => {
    auditFindOne = jest.fn();
    auditCreate = jest.fn((value) => value);
    auditSave = jest.fn(async (value) => value);
    preAuditFindOne = jest.fn();

    service = new AuditService(
      { findOne: auditFindOne, create: auditCreate, save: auditSave } as any,
      { findOne: preAuditFindOne } as any,
      {} as any,
    );
  });

  it('refuses to start from an unknown pre-audit', async () => {
    preAuditFindOne.mockResolvedValue(null);
    await expect(service.createFromPreAudit('user-1', 'pre-missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('refuses when the pre-audit has no audit recommendation', async () => {
    preAuditFindOne.mockResolvedValue({ id: 'pre-1', recommendedAuditType: null, destinationType: null });
    await expect(service.createFromPreAudit('user-1', 'pre-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates an audit session from the pre-audit recommendation', async () => {
    preAuditFindOne.mockResolvedValue(preAudit);
    auditFindOne.mockResolvedValue(null);

    const result = await service.createFromPreAudit('user-1', 'pre-1');

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        auditType: 'SHORT_FORM',
        scopes: [],
        answers: {},
        preAuditSessionId: 'pre-1',
      }),
    );
    expect(result.status).toBe(AuditStatus.TRIAGE_COMPLETED);
  });

  it('honours an explicit auditType override', async () => {
    preAuditFindOne.mockResolvedValue(preAudit);
    auditFindOne.mockResolvedValue(null);

    await service.createFromPreAudit('user-1', 'pre-1', 'LONG_FORM');
    expect(auditCreate).toHaveBeenCalledWith(expect.objectContaining({ auditType: 'LONG_FORM' }));
  });

  it('is idempotent and returns the existing session for the same user', async () => {
    preAuditFindOne.mockResolvedValue(preAudit);
    const existing = {
      id: 'audit-1',
      userId: 'user-1',
      preAuditSessionId: 'pre-1',
      auditType: 'SHORT_FORM',
    };
    auditFindOne.mockResolvedValue(existing);

    const result = await service.createFromPreAudit('user-1', 'pre-1');
    expect(result).toBe(existing);
    expect(auditCreate).not.toHaveBeenCalled();
    expect(auditSave).not.toHaveBeenCalled();
  });

  it('rejects a pre-audit that is already linked to another account', async () => {
    preAuditFindOne.mockResolvedValue(preAudit);
    auditFindOne.mockResolvedValue({ id: 'audit-1', userId: 'other-user', preAuditSessionId: 'pre-1' });

    await expect(service.createFromPreAudit('user-1', 'pre-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});