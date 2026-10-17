import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditSession } from '../audit/entities/audit-session.entity';
import { PreAuditSession } from '../triage/entities/pre-audit-session.entity';
import { calculatePreAuditDiagnosis } from '../triage/pre-audit-calculator';
import type { GenericAnswerStep } from '../triage/pre-audit-calculator';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  PartnerAuditSummaryDto,
  PartnerAuditsResponseDto,
  PartnerPreAuditResponseDto,
  PartnerSummaryResponseDto,
} from './dto/partner-audit-data.dto';

/**
 * Read-only projection of a single user's pre-audit and audit data for
 * consented M2M peers (e.g. fundordonate). The caller identity always comes
 * from the delegated token (`req.peerCaller.userId`) — never from the request
 * body/path — so a peer can only ever read the user it was delegated for.
 *
 * Consent model: sharing reuses the pre-audit consent recorded at submission
 * (`pre_audit_sessions.consentGrantedAt`). A user with no consenting pre-audit
 * has no data to share and is denied.
 */
@Injectable()
export class PartnerAuditDataService {
  constructor(
    @InjectRepository(PreAuditSession)
    private readonly preAuditRepository: Repository<PreAuditSession>,
    @InjectRepository(AuditSession)
    private readonly auditRepository: Repository<AuditSession>,
    private readonly usersService: UsersService,
  ) {}

  async getPreAudit(mcomUserId: string): Promise<PartnerPreAuditResponseDto> {
    const user = await this.resolveUser(mcomUserId);
    const email = this.normalizeEmail(user.email);
    if (!email) {
      return { available: false, reason: 'no_email' };
    }

    const session = await this.preAuditRepository
      .createQueryBuilder('s')
      .where('LOWER(s.email) = :email', { email })
      .andWhere('s.completedAt IS NOT NULL')
      .orderBy('s.completedAt', 'DESC')
      .addOrderBy('s.createdAt', 'DESC')
      .getOne();

    if (!session) {
      return { available: false, reason: 'no_pre_audit' };
    }
    if (!session.consentGrantedAt) {
      throw new ForbiddenException({
        error: 'User has not consented to share pre-audit data.',
        code: 'PARTNER_CONSENT_REQUIRED',
      });
    }

    return {
      available: true,
      id: session.id,
      recommendedAuditType: session.recommendedAuditType,
      destinationType: session.destinationType ?? null,
      destinationTarget: session.destinationTarget ?? null,
      consentVersion: session.consentVersion,
      completedAt: session.completedAt
        ? session.completedAt.toISOString()
        : null,
      diagnosticSummary: calculatePreAuditDiagnosis(
        (session.answers as GenericAnswerStep[]) || [],
      ),
    };
  }

  async getAudits(mcomUserId: string): Promise<PartnerAuditsResponseDto> {
    const user = await this.resolveUser(mcomUserId);
    await this.requireConsent(user);

    const audits = await this.auditRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });

    return {
      available: true,
      count: audits.length,
      audits: audits.map((audit) => this.toAuditSummary(audit)),
    };
  }

  async getAudit(
    mcomUserId: string,
    auditId: string,
  ): Promise<PartnerAuditSummaryDto> {
    const user = await this.resolveUser(mcomUserId);
    await this.requireConsent(user);

    const audit = await this.auditRepository.findOne({
      where: { id: auditId, userId: user.id },
    });
    if (!audit) {
      throw new NotFoundException('Audit session not found.');
    }
    return this.toAuditSummary(audit);
  }

  /**
   * Combined pre-audit + audit view for a single funding decision. Requires
   * both `preaudit:read` and `audit:read`.
   */
  async getSummary(mcomUserId: string): Promise<PartnerSummaryResponseDto> {
    const [preAudit, audits] = await Promise.all([
      this.getPreAudit(mcomUserId),
      this.getAudits(mcomUserId),
    ]);
    return {
      available: preAudit.available || audits.available,
      preAudit,
      audits,
    };
  }

  // ============================================================
  // Helpers
  // ============================================================

  private async resolveUser(mcomUserId: string): Promise<User> {
    if (!mcomUserId) {
      throw new NotFoundException('No MCOM user id was provided by the token.');
    }
    const user = await this.usersService.findByMcomUserId(mcomUserId);
    if (!user) {
      throw new NotFoundException(
        'No 247GBS Audit account is linked to this MCOM user.',
      );
    }
    return user;
  }

  /** Reuses the pre-audit consent as the authorization to share audit data. */
  private async requireConsent(user: User): Promise<void> {
    const email = this.normalizeEmail(user.email);
    if (!email) {
      throw new ForbiddenException({
        error: 'User has no email on record to match a pre-audit consent.',
        code: 'PARTNER_CONSENT_REQUIRED',
      });
    }

    const consenting = await this.preAuditRepository
      .createQueryBuilder('s')
      .where('LOWER(s.email) = :email', { email })
      .andWhere('s.consentGrantedAt IS NOT NULL')
      .andWhere('s.completedAt IS NOT NULL')
      .getOne();

    if (!consenting) {
      throw new ForbiddenException({
        error: 'User has not consented to share audit data.',
        code: 'PARTNER_CONSENT_REQUIRED',
      });
    }
  }

  private toAuditSummary(audit: AuditSession): PartnerAuditSummaryDto {
    const metrics = audit.calculatedMetrics;
    return {
      id: audit.id,
      status: audit.status,
      auditType: audit.auditType ?? null,
      scopes: audit.scopes ?? [],
      sectorId: audit.sectorId ?? null,
      groupId: audit.groupId ?? null,
      businessTypeId: audit.businessTypeId ?? null,
      preAuditSessionId: audit.preAuditSessionId ?? null,
      calculatedMetrics: metrics
        ? {
            capacityDrainPct: metrics.capacityDrainPct,
            totalStockImpact: metrics.totalStockImpact,
            annualRecovery: metrics.annualRecovery,
            impactScore: metrics.impactScore,
          }
        : null,
      aiInsight: (audit.aiInsight as Record<string, unknown>) ?? null,
      createdAt: audit.createdAt.toISOString(),
      updatedAt: audit.updatedAt.toISOString(),
    };
  }

  private normalizeEmail(email: string | null | undefined): string {
    return (email || '').trim().toLowerCase();
  }
}
