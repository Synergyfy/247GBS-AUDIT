import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreAuditSession } from './entities/pre-audit-session.entity';
import {
  TriageResponseDetailDto,
  TriageResponsesOverviewDto,
  TriageResponseStepDto,
  TriageResponseSummaryDto,
} from './dto/triage-form.dto';

@Injectable()
export class TriageReportService {
  constructor(
    @InjectRepository(PreAuditSession)
    private readonly sessionRepository: Repository<PreAuditSession>,
  ) {}

  private toSummary(session: PreAuditSession): TriageResponseSummaryDto {
    return {
      id: session.id,
      email: session.email,
      recommendedAuditType: session.recommendedAuditType,
      destinationType: session.destinationType ?? null,
      destinationTarget: session.destinationTarget ?? null,
      answeredCount: Array.isArray(session.answers) ? session.answers.length : 0,
      completedAt: session.completedAt ? session.completedAt.toISOString() : null,
      createdAt: session.createdAt.toISOString(),
    };
  }

  private toDetail(session: PreAuditSession): TriageResponseDetailDto {
    const rawSteps: any[] = Array.isArray(session.answers) ? session.answers : [];
    const steps: TriageResponseStepDto[] = rawSteps.map((step: any) => ({
      questionId: step.questionId,
      questionText: step.questionText,
      answerTexts: Array.isArray(step.optionTexts) ? step.optionTexts : [],
      value: step.optionTexts?.length ? undefined : (step.value ?? null),
      nextQuestionId: step.nextQuestionId ?? null,
      destinationType: step.destinationType ?? null,
      destinationTarget: step.destinationTarget ?? null,
      auditType: step.auditType ?? null,
    }));

    return {
      id: session.id,
      email: session.email,
      recommendedAuditType: session.recommendedAuditType,
      destinationType: session.destinationType ?? null,
      destinationTarget: session.destinationTarget ?? null,
      answeredCount: steps.length,
      steps,
      consentGrantedAt: session.consentGrantedAt
        ? session.consentGrantedAt.toISOString()
        : null,
      consentVersion: session.consentVersion,
      completedAt: session.completedAt ? session.completedAt.toISOString() : null,
      createdAt: session.createdAt.toISOString(),
    };
  }

  async listResponses(): Promise<TriageResponsesOverviewDto> {
    const sessions = await this.sessionRepository.find({
      order: { completedAt: 'DESC', createdAt: 'DESC' },
    });

    const byAuditType: Record<string, number> = {};
    const byDestination: Record<string, number> = {};
    const emails = new Set<string>();
    let withEmail = 0;
    let submittedToday = 0;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const session of sessions) {
      if (session.recommendedAuditType) {
        byAuditType[session.recommendedAuditType] = (byAuditType[session.recommendedAuditType] ?? 0) + 1;
      }
      const dest = session.destinationType ?? 'NONE';
      byDestination[dest] = (byDestination[dest] ?? 0) + 1;
      if (session.email) {
        withEmail += 1;
        emails.add(session.email.trim().toLowerCase());
      }
      const submittedAt = session.completedAt ?? session.createdAt;
      if (submittedAt >= startOfToday) submittedToday += 1;
    }

    return {
      total: sessions.length,
      withEmail,
      uniqueEmails: emails.size,
      submittedToday,
      byAuditType,
      byDestination,
      recent: sessions.slice(0, 50).map((s) => this.toSummary(s)),
    };
  }

  async getResponse(id: string): Promise<TriageResponseDetailDto> {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException('Response not found.');
    }
    return this.toDetail(session);
  }
}
