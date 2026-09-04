import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditSession, AuditStatus } from './entities/audit-session.entity';
import { AuditType } from '../triage/entities/triage.entity';
import { User } from '../users/entities/user.entity';
import { CalculationFactory } from './calculators/calculation.factory';
import { AIService } from '../ai/ai.service';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditSession)
    private auditRepository: Repository<AuditSession>,
    private aiService: AIService,
  ) {}

  async createFromTriage(
    user: User,
    auditType: string,
    scopes: string[]
  ): Promise<AuditSession> {
    const session = this.auditRepository.create({
      userId: user.id,
      status: AuditStatus.TRIAGE_COMPLETED,
      auditType,
      scopes,
      answers: {},
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

  async updateSector(id: string, userId: string, sectorId: string, groupId: string, businessTypeId: string) {
    const session = await this.findOne(id, userId);
    if (!session) throw new NotFoundException('Audit session not found');

    session.sectorId = sectorId;
    session.groupId = groupId;
    session.businessTypeId = businessTypeId;
    session.status = AuditStatus.SECTOR_SELECTED;

    return this.auditRepository.save(session);
  }

  async updateAnswers(id: string, userId: string, newAnswers: Record<string, any>) {
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

    const context = { sector: session.sectorId, businessType: session.businessTypeId };
    const questions = await this.aiService.generateFollowUpQuestions(context, session.answers, session.calculatedMetrics);
    
    session.followUpQuestions = questions;
    return this.auditRepository.save(session);
  }

  async generateInsight(id: string, userId: string) {
    const session = await this.findOne(id, userId);
    if (!session) throw new NotFoundException('Audit session not found');

    const context = { sector: session.sectorId, businessType: session.businessTypeId };
    const insight = await this.aiService.generateStrategicInsight(context, session.answers, session.calculatedMetrics);
    
    session.aiInsight = insight;
    session.status = AuditStatus.COMPLETED;
    return this.auditRepository.save(session);
  }

  async getVaultStats(userId: string) {
    const audits = await this.findAllByUser(userId);
    const completedAudits = audits.filter(a => a.status === AuditStatus.COMPLETED);

    // Calculate total data points (number of answers)
    const totalDataPoints = audits.reduce((sum, audit) => {
      return sum + Object.keys(audit.answers || {}).length;
    }, 0);

    // Calculate efficiency trend (mocking the comparison logic for now based on last two audits)
    let trendStr = "0%";
    if (completedAudits.length >= 2) {
      const latest = completedAudits[0].calculatedMetrics?.capacityDrainPct || 0;
      const previous = completedAudits[1].calculatedMetrics?.capacityDrainPct || 0;
      
      if (previous > 0) {
        const diff = ((previous - latest) / previous) * 100;
        trendStr = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
      }
    }

    const totalAudits = audits.length;
    const completedAuditsList = completedAudits.length;
    const archivalIntegrity = totalAudits > 0
      ? `${Math.round((completedAuditsList / totalAudits) * 100)}%`
      : '0%';

    return {
      totalDataPoints,
      efficiencyTrend: trendStr,
      archivalIntegrity,
    };
  }
}
