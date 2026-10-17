import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageAnswer } from './entities/triage-answer.entity';
import { isChoiceType, normalizeQuestionType } from './question-types';

export interface FlowValidationResult {
  ok: boolean;
  issues: string[];
  warnings: string[];
}

export interface ValidatedDestination {
  nextQuestionId?: string | null;
  auditType?: string | null;
  destinationType?: string | null;
  destinationTarget?: string | null;
}

@Injectable()
export class TriageFlowValidatorService {
  constructor(
    @InjectRepository(TriageQuestion)
    private readonly questionRepository: Repository<TriageQuestion>,
    @InjectRepository(TriageAnswer)
    private readonly answerRepository: Repository<TriageAnswer>,
  ) {}

  /**
   * Enforces the core rule: an answer points to EITHER a next question OR a
   * terminal destination (auditType/destinationType) — never both, never
   * neither — and the target must exist.
   */
  async validateDestination(
    dto: {
      nextQuestionId?: string | null;
      auditType?: string | null;
      destinationType?: string | null;
      destinationTarget?: string | null;
    },
    owningQuestionId: string,
  ): Promise<ValidatedDestination> {
    const hasNext = dto.nextQuestionId !== undefined && dto.nextQuestionId !== null;
    const hasLegacyDestination = dto.auditType !== undefined && dto.auditType !== null;
    const hasDestination = dto.destinationType !== undefined && dto.destinationType !== null;

    if (hasNext && (hasLegacyDestination || hasDestination)) {
      throw new BadRequestException('An answer cannot point to both a next question and a destination.');
    }
    if (hasLegacyDestination && hasDestination) {
      throw new BadRequestException('An answer cannot point to both an audit type and a destination type.');
    }
    if (!hasNext && !hasLegacyDestination && !hasDestination) {
      throw new BadRequestException(
        'An answer must have a destination — either a next question or a destination type.',
      );
    }

    if (hasNext) {
      const target = await this.questionRepository.findOne({ where: { id: dto.nextQuestionId as string } });
      if (!target) throw new BadRequestException('The destination question does not exist.');
      if (target.id === owningQuestionId) {
        throw new BadRequestException('An answer cannot point back to the question it belongs to.');
      }
      return {
        nextQuestionId: target.id,
        auditType: null,
        destinationType: null,
        destinationTarget: null,
      };
    }

    const destinationType = (hasDestination ? dto.destinationType : dto.auditType) as string;
    const auditType =
      hasDestination && (dto.destinationType === 'SHORT_FORM' || dto.destinationType === 'LONG_FORM')
        ? (dto.destinationType as string)
        : hasLegacyDestination
          ? (dto.auditType as string)
          : null;

    return {
      nextQuestionId: null,
      auditType,
      destinationType,
      destinationTarget: hasDestination ? (dto.destinationTarget ?? null) : null,
    };
  }

  /**
   * Question-level destination uses the same rule as answers, but is optional —
   * an option-less question can also simply forward sequentially without a branch.
   */
  async validateQuestionDestination(
    dto: {
      defaultNextQuestionId?: string | null;
      defaultAuditType?: string | null;
      defaultDestinationType?: string | null;
      defaultDestinationTarget?: string | null;
    },
    owningQuestionId: string | null,
  ): Promise<void> {
    const hasNext = dto.defaultNextQuestionId !== undefined && dto.defaultNextQuestionId !== null;
    const hasLegacyDestination =
      dto.defaultAuditType !== undefined && dto.defaultAuditType !== null;
    const hasDestination =
      dto.defaultDestinationType !== undefined && dto.defaultDestinationType !== null;

    if (hasNext && (hasLegacyDestination || hasDestination)) {
      throw new BadRequestException('A question cannot point to both a next question and a destination.');
    }
    if (hasLegacyDestination && hasDestination) {
      throw new BadRequestException('A question cannot point to both an audit type and a destination type.');
    }
    if (hasNext) {
      const target = await this.questionRepository.findOne({
        where: { id: dto.defaultNextQuestionId as string },
      });
      if (!target) throw new BadRequestException('The default destination question does not exist.');
      if (owningQuestionId && target.id === owningQuestionId) {
        throw new BadRequestException('A question cannot point to itself as its default destination.');
      }
    }
  }

  /**
   * Validates the whole flow ahead of publish. Requirements to publish:
   * - at least one active question
   * - all active questions have text
   * - choice questions have >= 1 answer option
   * - all explicit question destinations point to active questions
   * - be able to eventually reach an audit destination (no dead-ends/loops).
   */
  async validateFlowForPublish(formId?: string): Promise<FlowValidationResult> {
    const qb = this.questionRepository.createQueryBuilder('q');
    if (formId) {
      qb.where('q.formId = :formId', { formId });
    }
    qb.orderBy('q.order', 'ASC').addOrderBy('q.createdAt', 'ASC');
    let questions = await qb.getMany();
    // If no questions found and formId was specified, fallback check without formId for default form
    if (questions.length === 0 && formId) {
      questions = await this.questionRepository.find({ order: { order: 'ASC', createdAt: 'ASC' } });
    }
    const answers = await this.answerRepository.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } });
    const byId = new Map(questions.map((q) => [q.id, q]));
    const answersByQuestion = new Map<string, TriageAnswer[]>();
    for (const answer of answers) {
      const bucket = answersByQuestion.get(answer.questionId) ?? [];
      bucket.push(answer);
      answersByQuestion.set(answer.questionId, bucket);
    }

    const issues: string[] = [];
    const warnings: string[] = [];

    const active = questions.filter((q) => q.isActive);
    if (active.length === 0) {
      issues.push('There are no active questions in the form.');
    }

    const reachable = this.computeAuditReachability(questions, answers);

    for (const question of active) {
      if (!question.text?.trim()) {
        issues.push(`Question #${question.order} has no text.`);
      }
      const qAnswers = (answersByQuestion.get(question.id) ?? []).filter((a) => a.isActive);
      const type = normalizeQuestionType(question.type);

      if (isChoiceType(type)) {
        if (qAnswers.length === 0) {
          issues.push(`Question "${question.text}" is a choice question but has no answer options.`);
        }
        for (const answer of qAnswers) {
          if (!answer.nextQuestionId) continue;
          const target = byId.get(answer.nextQuestionId);
          if (!target) {
            issues.push(`Option "${answer.text}" routes to a question that no longer exists.`);
          } else if (!target.isActive) {
            issues.push(`Option "${answer.text}" routes to the inactive question "${target.text}".`);
          }
        }
        const destRoutes = new Set(
          qAnswers.map((a) =>
            JSON.stringify([a.nextQuestionId, a.destinationType ?? a.auditType, a.destinationTarget]),
          ),
        );
        if ((type === 'multiple_choice' || type === 'checkbox') && destRoutes.size > 1) {
          warnings.push(
            `Multi-select question "${question.text}" has options that lead to different places. ` +
              'Respondents who pick them will explore each branch in turn.',
          );
        }
      } else {
        if (!question.defaultNextQuestionId) continue;
        const target = byId.get(question.defaultNextQuestionId);
        if (!target) {
          issues.push(`Question "${question.text}" points to a question that no longer exists.`);
        } else if (!target.isActive) {
          issues.push(`Question "${question.text}" points to the inactive question "${target.text}".`);
        }
      }

      if (!reachable.has(question.id)) {
        issues.push(
          `Question "${question.text}" cannot reach an audit — it ends in a dead-end or a loop.`,
        );
      }
    }

    return { ok: issues.length === 0, issues, warnings };
  }

  /**
   * For each question, determine whether it can reach an audit type through its
   * active answers or its question-level default destination without looping.
   */
  computeAuditReachability(
    questions: TriageQuestion[],
    answers: TriageAnswer[],
  ): Set<string> {
    const byId = new Map(questions.map((q) => [q.id, q]));

    const nextIds = new Map<string, string[]>();
    const exitsToAudit = new Map<string, boolean>();
    const answersByQuestion = new Map<string, TriageAnswer[]>();
    for (const answer of answers) {
      if (!answer.isActive) continue;
      if (!answer.questionId) continue;
      const bucket = answersByQuestion.get(answer.questionId) ?? [];
      bucket.push(answer);
      answersByQuestion.set(answer.questionId, bucket);
      if (!nextIds.has(answer.questionId)) nextIds.set(answer.questionId, []);
      if (answer.nextQuestionId && byId.has(answer.nextQuestionId) && byId.get(answer.nextQuestionId)!.isActive) {
        nextIds.get(answer.questionId)!.push(answer.nextQuestionId);
      }
      const terminal = answer.auditType || answer.destinationType;
      if (terminal) exitsToAudit.set(answer.questionId, true);
    }

    for (const question of questions) {
      if (!question.isActive) continue;
      const terminal = question.defaultAuditType || question.defaultDestinationType;
      if (terminal) exitsToAudit.set(question.id, true);
      if (
        question.defaultNextQuestionId &&
        byId.has(question.defaultNextQuestionId) &&
        byId.get(question.defaultNextQuestionId)!.isActive
      ) {
        if (!nextIds.has(question.id)) nextIds.set(question.id, []);
        nextIds.get(question.id)!.push(question.defaultNextQuestionId);
      }
    }

    const ordered = questions
      .filter((q) => q.isActive)
      .sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime());

    for (let index = 0; index < ordered.length; index++) {
      const question = ordered[index];
      const isChoice = isChoiceType(normalizeQuestionType(question.type));
      let usesLinear = false;
      if (isChoice) {
        usesLinear = (answersByQuestion.get(question.id) ?? []).some(
          (a) =>
            a.isActive &&
            !a.nextQuestionId &&
            !a.auditType &&
            !a.destinationType,
        );
      } else {
        usesLinear =
          !question.defaultNextQuestionId &&
          !question.defaultAuditType &&
          !question.defaultDestinationType;
      }
      if (!usesLinear) continue;
      const follower = ordered[index + 1];
      if (!follower || !follower.isActive) {
        exitsToAudit.set(question.id, true);
        continue;
      }
      if (!nextIds.has(question.id)) nextIds.set(question.id, []);
      nextIds.get(question.id)!.push(follower.id);
    }

    const reachable = new Set<string>();
    const canReachAudit = new Map<string, boolean>();

    const dfs = (questionId: string, visiting: Set<string>): boolean => {
      if (canReachAudit.get(questionId)) return true;
      if (visiting.has(questionId)) return false;

      if (exitsToAudit.get(questionId)) {
        canReachAudit.set(questionId, true);
        return true;
      }

      const next = nextIds.get(questionId) ?? [];
      if (next.length === 0) return false;

      visiting.add(questionId);
      for (const nextId of next) {
        if (dfs(nextId, visiting)) {
          visiting.delete(questionId);
          canReachAudit.set(questionId, true);
          return true;
        }
      }
      visiting.delete(questionId);
      return false;
    };

    for (const question of questions) {
      if (question.isActive && dfs(question.id, new Set())) {
        reachable.add(question.id);
      }
    }

    return reachable;
  }
}
