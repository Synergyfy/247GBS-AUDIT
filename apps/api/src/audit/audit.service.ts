import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AuditSession, AuditStatus } from './entities/audit-session.entity';
import { AuditForm } from './entities/audit-form.entity';
import { AuditFormQuestion } from './entities/audit-form-question.entity';
import { AuditFormAnswer } from './entities/audit-form-answer.entity';
import { User } from '../users/entities/user.entity';
import { PreAuditSession } from '../triage/entities/pre-audit-session.entity';
import { CalculationFactory } from './calculators/calculation.factory';
import { AIService } from '../ai/ai.service';
import { AuditPartnerNotifier } from '../partner/audit-partner-notifier.service';
import { DiagnosisService } from '../diagnosis/diagnosis.service';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditSession)
    private auditRepository: Repository<AuditSession>,
    @InjectRepository(PreAuditSession)
    private preAuditRepository: Repository<PreAuditSession>,
    @InjectRepository(AuditForm)
    private auditFormRepository: Repository<AuditForm>,
    @InjectRepository(AuditFormQuestion)
    private auditQuestionRepository: Repository<AuditFormQuestion>,
    @InjectRepository(AuditFormAnswer)
    private auditAnswerRepository: Repository<AuditFormAnswer>,
    private aiService: AIService,
    private auditNotifier: AuditPartnerNotifier,
    private diagnosisService: DiagnosisService,
  ) {}

  async createFromTriage(
    user: User,
    auditType: string,
    scopes: string[],
    auditFormId?: string | null,
  ): Promise<AuditSession> {
    const session = this.auditRepository.create({
      userId: user.id,
      status: AuditStatus.TRIAGE_COMPLETED,
      auditType,
      scopes,
      answers: {},
      auditFormId: auditFormId ?? null,
    });
    return this.auditRepository.save(session);
  }

  /**
   * Runs the admin-configured diagnosis + recommendation engine against the
   * session's answers and persists the result on the session.
   */
  async diagnose(
    id: string,
    userId: string,
    formId?: string | null,
  ): Promise<Record<string, any>> {
    const session = await this.findOne(id, userId);
    if (!session) throw new NotFoundException('Audit session not found');

    const resolvedFormId = formId || session.auditFormId || null;
    let form: AuditForm | null = null;

    if (resolvedFormId) {
      form = await this.auditFormRepository.findOne({ where: { id: resolvedFormId } });
    }
    if (!form && session.auditType) {
      form =
        (await this.auditFormRepository.findOne({
          where: { auditType: session.auditType as any, isDefault: true },
          order: { updatedAt: 'DESC' },
        })) ??
        (await this.auditFormRepository.findOne({
          where: { auditType: session.auditType as any },
          order: { updatedAt: 'DESC' },
        }));
    }

    const inputs: Array<{
      questionId: string;
      questionText?: string;
      category?: string | null;
      value?: unknown;
      optionTexts?: string[];
      selectedTexts?: string[];
      scoreMax?: number;
      scoreDirection?: 'higher' | 'lower';
    }> = [];

    if (form) {
      session.auditFormId = form.id;
      const questions = await this.auditQuestionRepository.find({
        where: { formId: form.id, isActive: true },
        order: { order: 'ASC', createdAt: 'ASC' },
      });
      const questionIds = questions.map((q) => q.id);
      const answers = questionIds.length
        ? await this.auditAnswerRepository.find({
            where: { questionId: In(questionIds), isActive: true },
            order: { sortOrder: 'ASC' },
          })
        : [];
      const byQuestion = new Map<string, AuditFormAnswer[]>();
      for (const answer of answers) {
        const bucket = byQuestion.get(answer.questionId) ?? [];
        bucket.push(answer);
        byQuestion.set(answer.questionId, bucket);
      }

      for (const question of questions) {
        const rawValue = session.answers?.[question.id];
        if (rawValue === undefined || rawValue === null || rawValue === '') continue;
        const questionAnswers = byQuestion.get(question.id) ?? [];
        const scoreMax = questionAnswers.reduce(
          (max, answer) => Math.max(max, answer.scoreImpact ?? 0),
          0,
        );

        // The public flow stores the selected option id (or ids), while the
        // API accepts raw score numbers. Resolve ids to their scoreImpact so
        // both paths feed the engine the same numeric value.
        let value: unknown = rawValue;
        let selectedTexts: string[] | undefined;
        if (Array.isArray(rawValue)) {
          const scores: number[] = [];
          const texts: string[] = [];
          for (const entry of rawValue) {
            const match = questionAnswers.find(
              (answer) => answer.id === entry || answer.text === entry,
            );
            if (match) {
              if (match.scoreImpact !== null && match.scoreImpact !== undefined) {
                scores.push(match.scoreImpact);
              }
              texts.push(match.text);
            } else if (typeof entry === 'number') {
              scores.push(entry);
            }
          }
          if (scores.length > 0) {
            value = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          }
          if (texts.length > 0) selectedTexts = texts;
        } else {
          const match = questionAnswers.find(
            (answer) => answer.id === rawValue || answer.text === rawValue,
          );
          if (match) {
            value = match.scoreImpact ?? rawValue;
            selectedTexts = [match.text];
          }
        }
        // New templates use 10 = optimal (higher is better). Legacy seeded
        // short-form questions use a 1-3 risk scale (higher is worse); if an
        // explicit direction is not set, infer it from the small scale.
        const configuredDirection = question.config?.scoreDirection;
        const scoreDirection: 'higher' | 'lower' =
          configuredDirection === 'lower_is_better' ||
          (!configuredDirection && scoreMax > 0 && scoreMax <= 3)
            ? 'lower'
            : 'higher';

        inputs.push({
          questionId: question.id,
          questionText: question.text,
          category: question.category,
          value,
          optionTexts: questionAnswers.map((a) => a.text),
          selectedTexts,
          scoreMax: scoreMax > 0 ? scoreMax : undefined,
          scoreDirection,
        });
      }
    }

    // Fallback for legacy sessions whose answers are not tied to a form.
    if (inputs.length === 0) {
      for (const [questionId, value] of Object.entries(session.answers ?? {})) {
        inputs.push({ questionId, value });
      }
    }

    const diagnosis = this.diagnosisService.build({
      answers: inputs,
      config: form?.settings?.diagnosis,
    });

    session.diagnosis = diagnosis as unknown as Record<string, any>;
    await this.auditRepository.save(session);
    return session.diagnosis;
  }

  async getDiagnosis(id: string, userId: string): Promise<Record<string, any>> {
    const session = await this.findOne(id, userId);
    if (!session) throw new NotFoundException('Audit session not found');
    return session.diagnosis ?? (await this.diagnose(id, userId));
  }

  /**
   * Pre-Audit -> Audit handoff. One audit is created per pre-audit session, so
   * repeat handoffs are idempotent. The audit type comes from the pre-audit's
   * recommendation unless the caller overrides it with `auditType`.
   */
  async createFromPreAudit(
    userId: string,
    preAuditSessionId: string,
    auditType?: string,
  ): Promise<AuditSession> {
    const preAudit = await this.preAuditRepository.findOne({
      where: { id: preAuditSessionId },
    });
    if (!preAudit) {
      throw new NotFoundException('Pre-audit session not found.');
    }

    const resolvedType =
      auditType ||
      preAudit.recommendedAuditType ||
      preAudit.destinationType ||
      null;
    if (!resolvedType) {
      throw new BadRequestException(
        'This pre-audit has no audit recommendation to start from.',
      );
    }

    const existing = await this.auditRepository.findOne({
      where: { preAuditSessionId },
    });
    if (existing) {
      if (existing.userId !== userId) {
        throw new ConflictException(
          'This pre-audit has already been linked to another account.',
        );
      }
      return existing;
    }

    const session = this.auditRepository.create({
      userId,
      status: AuditStatus.TRIAGE_COMPLETED,
      auditType: resolvedType,
      scopes: [],
      answers: {},
      preAuditSessionId,
    });
    return this.auditRepository.save(session);
  }

  async findOne(id: string, userId: string): Promise<AuditSession | null> {
    return this.auditRepository.findOne({
      where: { id, userId },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const session = await this.findOne(id, userId);
    if (!session) throw new NotFoundException('Audit session not found');
    await this.auditRepository.remove(session);
  }

  async findAllByUser(userId: string): Promise<AuditSession[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateSector(
    id: string,
    userId: string,
    sectorId: string,
    groupId: string,
    businessTypeId: string,
  ) {
    const session = await this.findOne(id, userId);
    if (!session) throw new NotFoundException('Audit session not found');

    session.sectorId = sectorId;
    session.groupId = groupId;
    session.businessTypeId = businessTypeId;
    session.status = AuditStatus.SECTOR_SELECTED;

    return this.auditRepository.save(session);
  }

  async updateAnswers(
    id: string,
    userId: string,
    newAnswers: Record<string, any>,
  ) {
    const session = await this.findOne(id, userId);
    if (!session) throw new NotFoundException('Audit session not found');

    // Merge new answers
    session.answers = { ...session.answers, ...newAnswers };
    session.status = AuditStatus.IN_PROGRESS;

    // Trigger Calculation Engine
    if (session.sectorId) {
      const calculator = CalculationFactory.getCalculator(session.sectorId);
      session.calculatedMetrics = calculator.calculate(session.answers);
    }

    return this.auditRepository.save(session);
  }

  async generateFollowUp(id: string, userId: string) {
    const session = await this.findOne(id, userId);
    if (!session) throw new NotFoundException('Audit session not found');

    const context = {
      sector: session.sectorId,
      businessType: session.businessTypeId,
    };
    const questions = await this.aiService.generateFollowUpQuestions(
      context,
      session.answers,
      session.calculatedMetrics,
    );

    session.followUpQuestions = questions;
    const saved = await this.auditRepository.save(session);
    return { ...saved, aiAvailable: this.aiService.isAvailable() };
  }

  async generateInsight(id: string, userId: string) {
    const session = await this.findOne(id, userId);
    if (!session) throw new NotFoundException('Audit session not found');

    const context = {
      sector: session.sectorId,
      businessType: session.businessTypeId,
    };
    const insight: unknown = await this.aiService.generateStrategicInsight(
      context,
      session.answers,
      session.calculatedMetrics,
    );

    session.aiInsight = insight;
    session.status = AuditStatus.COMPLETED;
    const saved = await this.auditRepository.save(session);

    // Optional outbound push (no-op unless configured). Never blocks or fails
    // the completion — the notifier swallows its own errors.
    await this.auditNotifier.notifyAuditCompleted({
      id: saved.id,
      userId: saved.userId,
      status: saved.status,
      auditType: saved.auditType,
      sectorId: saved.sectorId,
      calculatedMetrics: saved.calculatedMetrics,
    });

    return { ...saved, aiAvailable: this.aiService.isAvailable() };
  }

  async getVaultStats(userId: string) {
    const audits = await this.findAllByUser(userId);
    const completedAudits = audits.filter(
      (a) => a.status === AuditStatus.COMPLETED,
    );

    // Calculate total data points (number of answers)
    const totalDataPoints = audits.reduce((sum, audit) => {
      return sum + Object.keys(audit.answers || {}).length;
    }, 0);

    // Calculate efficiency trend (mocking the comparison logic for now based on last two audits)
    let trendStr = '0%';
    if (completedAudits.length >= 2) {
      const latest =
        completedAudits[0].calculatedMetrics?.capacityDrainPct || 0;
      const previous =
        completedAudits[1].calculatedMetrics?.capacityDrainPct || 0;

      if (previous > 0) {
        const diff = ((previous - latest) / previous) * 100;
        trendStr = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
      }
    }

    const totalAudits = audits.length;
    const completedAuditsList = completedAudits.length;
    const archivalIntegrity =
      totalAudits > 0
        ? `${Math.round((completedAuditsList / totalAudits) * 100)}%`
        : '0%';

    return {
      totalDataPoints,
      efficiencyTrend: trendStr,
      archivalIntegrity,
    };
  }
}
