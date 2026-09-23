import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'node:crypto';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageAnswer } from './entities/triage-answer.entity';
import { PreAuditSession } from './entities/pre-audit-session.entity';
import { SubmitPreAuditDto, PreAuditStepDto, PreAuditSubmissionResultDto } from './dto/pre-audit.dto';
import { normalizeQuestionType, isChoiceType } from './question-types';

type Destination = { nextQuestionId: string | null; auditType: string | null };
type EvaluatedStep = {
  questionId: string;
  questionText: string;
  type: string;
  optionIds?: string[];
  optionTexts?: string[];
  value?: any;
  nextQuestionId: string | null;
  auditType: string | null;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const MAX_TEXT_LENGTH = 5000;

@Injectable()
export class PreAuditService {
  constructor(
    @InjectRepository(TriageQuestion)
    private readonly questionRepository: Repository<TriageQuestion>,
    @InjectRepository(TriageAnswer)
    private readonly answerRepository: Repository<TriageAnswer>,
    @InjectRepository(PreAuditSession)
    private readonly sessionRepository: Repository<PreAuditSession>,
  ) {}

  /**
   * Evaluates a public pre-audit submission. The client is NEVER trusted: the
   * server re-walks the active question chain from the start, validates every
   * step against the database and computes the audit destination itself.
   */
  async evaluateAndSave(dto: SubmitPreAuditDto): Promise<PreAuditSubmissionResultDto> {
    const steps = dto.steps;
    if (steps.length === 0) {
      throw new BadRequestException('At least one answered step is required.');
    }

    const startQuestion = await this.questionRepository.findOne({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
    if (!startQuestion) {
      throw new BadRequestException('No active questions are configured yet.');
    }

    if (steps[0].questionId !== startQuestion.id) {
      throw new BadRequestException('The first step must start with the current start question.');
    }

    const evaluated: EvaluatedStep[] = [];
    let current = startQuestion;
    let recommended: string | null = null;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.questionId !== current.id) {
        throw new BadRequestException(
          `Step ${i + 1} does not match the expected question. Routing is determined server-side.`,
        );
      }

      const type = normalizeQuestionType(current.type);
      const stepResult = await this.evaluateStep(current, step, type);
      evaluated.push(stepResult);

      if (stepResult.auditType) {
        recommended = stepResult.auditType;
        current = null as unknown as TriageQuestion;
        break;
      }

      if (stepResult.nextQuestionId) {
        const next = await this.questionRepository.findOne({ where: { id: stepResult.nextQuestionId } });
        if (!next || !next.isActive) {
          throw new BadRequestException(
            `Step ${i + 1} resolved to an inactive or missing question. Please refresh and try again.`,
          );
        }
        current = next;
        continue;
      }

      // No destination configured — the flow cannot continue.
      throw new BadRequestException(
        `Question "${current.text}" has no destination configured for the selected answer.`,
      );
    }

    if (recommended === null) {
      throw new BadRequestException('The submitted flow did not conclude with an audit type. Please refresh and try again.');
    }

    const fingerprint = this.makeFingerprint(dto);

    // Idempotent: a repeat of an identical submission returns the earlier result.
    const existing = await this.sessionRepository.findOne({ where: { fingerprint } });
    if (existing) {
      return this.toResult(existing, true);
    }

    const session = this.sessionRepository.create({
      email: dto.email ?? null,
      answers: evaluated,
      fingerprint,
      recommendedAuditType: recommended,
      completedAt: new Date(),
    });

    try {
      const saved = await this.sessionRepository.save(session);
      return this.toResult(saved, false);
    } catch (error: any) {
      // Unique constraint race on fingerprint → treat as duplicate.
      if (error?.code === '23505') {
        const dup = await this.sessionRepository.findOne({ where: { fingerprint } });
        if (dup) return this.toResult(dup, true);
      }
      throw error;
    }
  }

  // ============================================================
  // Step evaluation
  // ============================================================

  private async evaluateStep(
    question: TriageQuestion,
    step: PreAuditStepDto,
    type: string,
  ): Promise<EvaluatedStep> {
    if (isChoiceType(type)) {
      return this.evaluateChoice(question, step, type);
    }
    return this.evaluateTyped(question, step, type);
  }

  private async evaluateChoice(
    question: TriageQuestion,
    step: PreAuditStepDto,
    type: string,
  ): Promise<EvaluatedStep> {
    const optionIds = Array.isArray(step.optionIds) ? step.optionIds : [];
    const isSingle = type === 'single_choice' || type === 'dropdown' || type === 'yes_no';
    const isMulti = type === 'multiple_choice' || type === 'checkbox';

    if (optionIds.length === 0) {
      throw new BadRequestException(`Question "${question.text}" must be answered.`);
    }
    if (isSingle && optionIds.length > 1) {
      throw new BadRequestException(`Question "${question.text}" accepts a single answer only.`);
    }

    const options = await this.answerRepository.find({
      where: { questionId: question.id, isActive: true },
    });
    const optionMap = new Map(options.map((o) => [o.id, o]));

    const selected: TriageAnswer[] = [];
    for (const optionId of optionIds) {
      const option = optionMap.get(optionId);
      if (!option) {
        throw new BadRequestException(
          `Option "${optionId}" on question "${question.text}" is not valid.`,
        );
      }
      selected.push(option);
    }

    // Deterministic multi-select rule: every selected option must agree on the
    // destination, otherwise the routing is ambiguous and the submission is
    // rejected until the admin configures it consistently.
    let destination: Destination;
    if (isMulti) {
      const destinations = selected.map((o) => this.destinationOf(o));
      const distinct = new Set(destinations.map((d) => JSON.stringify(d)));
      if (distinct.size > 1) {
        throw new BadRequestException(
          `Question "${question.text}" allows multiple answers but those selections lead to conflicting destinations.`,
        );
      }
      destination = destinations[0];
    } else {
      destination = this.destinationOf(selected[0]);
    }

    if (!destination.nextQuestionId && !destination.auditType) {
      return {
        questionId: question.id,
        questionText: question.text,
        type,
        optionIds,
        optionTexts: selected.map((o) => o.text),
        nextQuestionId: null,
        auditType: null,
      };
    }

    return {
      questionId: question.id,
      questionText: question.text,
      type,
      optionIds,
      optionTexts: selected.map((o) => o.text),
      nextQuestionId: destination.nextQuestionId,
      auditType: destination.auditType,
    };
  }

  private destinationOf(answer: TriageAnswer): Destination {
    return { nextQuestionId: answer.nextQuestionId, auditType: answer.auditType };
  }

  private evaluateTyped(
    question: TriageQuestion,
    step: PreAuditStepDto,
    type: string,
  ): EvaluatedStep {
    const cfg = question.config ?? {};
    const value = step.value;
    const required = question.required;

    if (value === undefined || value === null || value === '') {
      if (required) {
        throw new BadRequestException(`Question "${question.text}" must be answered.`);
      }
      if (!question.defaultNextQuestionId && !question.defaultAuditType) {
        throw new BadRequestException(
          `Question "${question.text}" has no destination. Please refresh and try again.`,
        );
      }
      return {
        questionId: question.id,
        questionText: question.text,
        type,
        value: null,
        nextQuestionId: question.defaultNextQuestionId,
        auditType: question.defaultAuditType,
      };
    }

    let normalized: any = value;
    switch (type) {
      case 'short_text':
      case 'long_text':
        normalized = this.validateText(question, value, type, cfg);
        break;
      case 'number':
        normalized = this.validateNumber(question, value, cfg);
        break;
      case 'date':
        normalized = this.validateDate(question, value, cfg);
        break;
      case 'time':
        normalized = this.validateTime(question, value);
        break;
      case 'rating':
      case 'linear_scale':
        normalized = this.validateScale(question, value, type, cfg);
        break;
      case 'file':
        normalized = this.validateFile(question, value, cfg);
        break;
      default:
        throw new BadRequestException(`Unsupported answer type "${type}".`);
    }

    return {
      questionId: question.id,
      questionText: question.text,
      type,
      value: normalized,
      nextQuestionId: question.defaultNextQuestionId,
      auditType: question.defaultAuditType,
    };
  }

  private validateText(question: TriageQuestion, value: any, type: string, cfg: any): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(`Question "${question.text}" expects text.`);
    }
    const max = cfg.maxLength ?? (type === 'short_text' ? 500 : MAX_TEXT_LENGTH);
    if (value.length > max) {
      throw new BadRequestException(`Question "${question.text}" is limited to ${max} characters.`);
    }
    return value;
  }

  private validateNumber(question: TriageQuestion, value: any, cfg: any): number {
    const number = typeof value === 'number' ? value : Number(value);
    if (typeof value === 'string' && value.trim() === '') {
      throw new BadRequestException(`Question "${question.text}" expects a number.`);
    }
    if (!Number.isFinite(number)) {
      throw new BadRequestException(`Question "${question.text}" expects a number.`);
    }
    if (cfg.min !== undefined && number < cfg.min) {
      throw new BadRequestException(`Question "${question.text}" must be at least ${cfg.min}.`);
    }
    if (cfg.max !== undefined && number > cfg.max) {
      throw new BadRequestException(`Question "${question.text}" must be at most ${cfg.max}.`);
    }
    return number;
  }

  private validateDate(question: TriageQuestion, value: any, cfg: any): string {
    if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
      throw new BadRequestException(`Question "${question.text}" expects a date (YYYY-MM-DD).`);
    }
    if (cfg.minDate && value < cfg.minDate) {
      throw new BadRequestException(`Question "${question.text}" cannot be before ${cfg.minDate}.`);
    }
    if (cfg.maxDate && value > cfg.maxDate) {
      throw new BadRequestException(`Question "${question.text}" cannot be after ${cfg.maxDate}.`);
    }
    return value;
  }

  private validateTime(question: TriageQuestion, value: any): string {
    if (typeof value !== 'string' || !TIME_PATTERN.test(value)) {
      throw new BadRequestException(`Question "${question.text}" expects a time (HH:MM).`);
    }
    return value;
  }

  private validateScale(question: TriageQuestion, value: any, type: string, cfg: any): number {
    const min = cfg.min ?? 1;
    const max = cfg.max ?? (type === 'rating' ? 5 : 10);
    const number = typeof value === 'number' ? value : Number(value);
    if (!Number.isInteger(number) || number < min || number > max) {
      throw new BadRequestException(
        `Question "${question.text}" expects a whole number between ${min} and ${max}.`,
      );
    }
    return number;
  }

  private validateFile(question: TriageQuestion, value: any, cfg: any): any {
    const cfgMaxMb = cfg.maxFileSizeMb ?? 10;
    const allowed = Array.isArray(cfg.allowedTypes) && cfg.allowedTypes.length > 0 ? cfg.allowedTypes : null;
    const multiple = cfg.multipleFiles === true;

    const items = Array.isArray(value) ? value : [value];
    for (const item of items) {
      if (!item || typeof item !== 'object') {
        throw new BadRequestException(`Question "${question.text}" expects a file.`);
      }
      const size = item.size ?? item.byteLength ?? 0;
      if (typeof size !== 'number' || size <= 0) {
        throw new BadRequestException(`Question "${question.text}" expects a file.`);
      }
      if (size > cfgMaxMb * 1024 * 1024) {
        throw new BadRequestException(
          `Question "${question.text}" files must be at most ${cfgMaxMb}MB.`,
        );
      }
      const mimeType = item.mimeType ?? item.type ?? '';
      if (allowed && allowed.length > 0 && mimeType && !allowed.includes(mimeType)) {
        throw new BadRequestException(
          `Question "${question.text}" only accepts ${allowed.join(', ')} files.`,
        );
      }
    }

    if (!multiple && items.length > 1) {
      throw new BadRequestException(`Question "${question.text}" accepts a single file only.`);
    }
    return multiple ? items : items[0];
  }

  // ============================================================
  // Helpers
  // ============================================================

  private makeFingerprint(dto: SubmitPreAuditDto): string {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const body = JSON.stringify({
      steps: dto.steps.map((s) => ({
        q: s.questionId,
        o: (s.optionIds ?? []).slice().sort(),
        v: s.value ?? null,
      })),
    });
    return createHash('sha256').update(`${email}|${body}`).digest('hex');
  }

  private toResult(session: PreAuditSession, isDuplicate: boolean): PreAuditSubmissionResultDto {
    return {
      id: session.id,
      email: session.email,
      recommendedAuditType: session.recommendedAuditType,
      answeredCount: Array.isArray(session.answers) ? session.answers.length : 0,
      isDuplicate,
    };
  }
}