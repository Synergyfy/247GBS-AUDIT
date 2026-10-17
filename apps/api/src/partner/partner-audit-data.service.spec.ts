import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PartnerAuditDataService } from './partner-audit-data.service';

function makeQb(result: unknown) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(result),
  };
}

describe('PartnerAuditDataService', () => {
  let createQueryBuilder: jest.Mock;
  let auditFind: jest.Mock;
  let auditFindOne: jest.Mock;
  let findByMcomUserId: jest.Mock;
  let service: PartnerAuditDataService;

  const user = {
    id: 'internal-1',
    email: 'Owner@Example.com',
    mcomUserId: 'mcom-1',
  };

  beforeEach(() => {
    createQueryBuilder = jest.fn();
    auditFind = jest.fn();
    auditFindOne = jest.fn();
    findByMcomUserId = jest.fn().mockResolvedValue(user);
    service = new PartnerAuditDataService(
      { createQueryBuilder } as any,
      { find: auditFind, findOne: auditFindOne } as any,
      { findByMcomUserId } as any,
    );
  });

  it('throws when the MCOM user has no linked account', async () => {
    findByMcomUserId.mockResolvedValue(null);
    await expect(service.getPreAudit('unknown')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns available:false when the user has no pre-audit', async () => {
    createQueryBuilder.mockReturnValue(makeQb(null));
    await expect(service.getPreAudit('mcom-1')).resolves.toEqual({
      available: false,
      reason: 'no_pre_audit',
    });
  });

  it('returns the diagnostic for a consented pre-audit', async () => {
    createQueryBuilder.mockReturnValue(
      makeQb({
        id: 'pre-1',
        recommendedAuditType: 'LONG_FORM',
        destinationType: 'LONG_FORM',
        destinationTarget: null,
        consentVersion: '1',
        consentGrantedAt: new Date(),
        completedAt: new Date('2026-02-03T10:00:00Z'),
        answers: [],
      }),
    );

    const result = await service.getPreAudit('mcom-1');
    expect(result.available).toBe(true);
    expect(result.id).toBe('pre-1');
    expect(result.recommendedAuditType).toBe('LONG_FORM');
    expect(result.completedAt).toBe('2026-02-03T10:00:00.000Z');
    expect(result.diagnosticSummary).toBeDefined();
  });

  it('denies a pre-audit that was submitted without consent', async () => {
    createQueryBuilder.mockReturnValue(
      makeQb({
        id: 'pre-1',
        consentGrantedAt: null,
        completedAt: new Date(),
        answers: [],
      }),
    );

    await expect(service.getPreAudit('mcom-1')).rejects.toMatchObject({
      response: { code: 'PARTNER_CONSENT_REQUIRED' },
    });
  });

  it('denies audits when the user has no consenting pre-audit', async () => {
    createQueryBuilder.mockReturnValue(makeQb(null));
    await expect(service.getAudits('mcom-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('returns mapped audit summaries for a consented user', async () => {
    createQueryBuilder.mockReturnValue(
      makeQb({ id: 'pre-1', consentGrantedAt: new Date() }),
    );
    auditFind.mockResolvedValue([
      {
        id: 'a1',
        status: 'COMPLETED',
        auditType: 'LONG_FORM',
        scopes: ['EXCESS_STOCK'],
        sectorId: 'retail-wholesale',
        groupId: 'inventory',
        businessTypeId: 'warehouse',
        preAuditSessionId: 'pre-1',
        calculatedMetrics: {
          capacityDrainPct: 25,
          totalStockImpact: 15000,
          annualRecovery: 12000,
          impactScore: 65,
        },
        aiInsight: { summary: 'Fix waste' },
        createdAt: new Date('2026-02-03T10:00:00Z'),
        updatedAt: new Date('2026-02-04T10:00:00Z'),
      },
    ]);

    const result = await service.getAudits('mcom-1');
    expect(result.available).toBe(true);
    expect(result.count).toBe(1);
    expect(result.audits[0]).toMatchObject({
      id: 'a1',
      status: 'COMPLETED',
      sectorId: 'retail-wholesale',
      calculatedMetrics: { annualRecovery: 12000 },
      aiInsight: { summary: 'Fix waste' },
      createdAt: '2026-02-03T10:00:00.000Z',
    });
    // Raw answers are never part of the projection.
    expect(result.audits[0]).not.toHaveProperty('answers');
  });

  it('scopes a single audit lookup to the delegated user', async () => {
    createQueryBuilder.mockReturnValue(
      makeQb({ id: 'pre-1', consentGrantedAt: new Date() }),
    );
    auditFindOne.mockResolvedValue(null);

    await expect(service.getAudit('mcom-1', 'a-other')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(auditFindOne).toHaveBeenCalledWith({
      where: { id: 'a-other', userId: 'internal-1' },
    });
  });

  it('combines pre-audit and audits in the summary view', async () => {
    createQueryBuilder.mockReturnValue(
      makeQb({
        id: 'pre-1',
        recommendedAuditType: 'LONG_FORM',
        destinationType: 'LONG_FORM',
        destinationTarget: null,
        consentVersion: '1',
        consentGrantedAt: new Date(),
        completedAt: new Date('2026-02-03T10:00:00Z'),
        answers: [],
      }),
    );
    auditFind.mockResolvedValue([]);

    const result = await service.getSummary('mcom-1');

    expect(result.available).toBe(true);
    expect(result.preAudit.id).toBe('pre-1');
    expect(result.audits.count).toBe(0);
  });
});
