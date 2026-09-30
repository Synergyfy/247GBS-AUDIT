import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageAnswer } from './entities/triage-answer.entity';
import {
  CreateTriageQuestionDto,
  UpdateTriageQuestionDto,
  TriageQuestionItemDto,
  AdminTriageQuestionDto,
} from './dto/triage-question.dto';
import {
  normalizeQuestionType,
  YES_NO_OPTIONS,
  QuestionType,
  QuestionConfig,
} from './question-types';
import { TriageFlowValidatorService } from './triage-flow-validator.service';

@Injectable()
export class TriageQuestionService {
  constructor(
    @InjectRepository(TriageQuestion)
    private readonly questionRepository: Repository<TriageQuestion>,
    @InjectRepository(TriageAnswer)
    private readonly answerRepository: Repository<TriageAnswer>,
    private readonly validatorService: TriageFlowValidatorService,
  ) {}

  // ============================================================
  // Public flow
  // ============================================================

  async getStartQuestion(formId?: string): Promise<TriageQuestionItemDto> {
    const ordered = await this.linearOrder(formId);
    const question = ordered[0];
    if (!question) {
      throw new NotFoundException('No active triage questions are configured yet.');
    }
    return this.toPublicQuestion(question, ordered);
  }

  async getQuestion(id: string): Promise<TriageQuestionItemDto> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question || !question.isActive) {
      throw new NotFoundException('Triage question not found.');
    }
    const ordered = await this.linearOrder(question.formId ?? undefined);
    return this.toPublicQuestion(question, ordered);
  }

  /**
   * All active questions in linear (order) sequence. Used to resolve the
   * dynamic "next question" default: anything without an explicit destination
   * advances to the next active question, or ends the form ("End / Submit")
   * when it is last.
   */
  async linearOrder(formId?: string): Promise<TriageQuestion[]> {
    const qb = this.questionRepository
      .createQueryBuilder('q')
      .where('q.isActive = :active', { active: true });

    if (formId) {
      qb.andWhere('q.formId = :formId', { formId });
    }

    qb.orderBy('q.order', 'ASC').addOrderBy('q.createdAt', 'ASC');
    let results = await qb.getMany();
    // Fallback if formId specified returned nothing: try all active questions if form has no questions
    if (results.length === 0 && formId) {
      results = await this.questionRepository.find({
        where: { isActive: true },
        order: { order: 'ASC', createdAt: 'ASC' },
      });
    }
    return results;
  }

  private nextLinearQuestionId(
    questionId: string,
    ordered: TriageQuestion[],
  ): string | null {
    const index = ordered.findIndex((q) => q.id === questionId);
    if (index < 0) return null;
    return ordered[index + 1]?.id ?? null;
  }

  /**
   * Effective linear default for an edge with no explicit destination: the
   * next active question, or the "End / Submit" terminal (human review) for
   * the final question.
   */
  private async toPublicQuestion(
    question: TriageQuestion,
    ordered: TriageQuestion[],
  ): Promise<TriageQuestionItemDto> {
    const answers = await this.answerRepository.find({
      where: { questionId: question.id, isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
    const linearNext = this.nextLinearQuestionId(question.id, ordered);

    const defaultNext = question.defaultNextQuestionId;
    const hasDefault = Boolean(
      defaultNext ||
        question.defaultDestinationType ||
        question.defaultAuditType,
    );
    const isTail = linearNext === null;

    const defaultNextQuestionId = hasDefault ? defaultNext : linearNext;
    const defaultDestinationType = hasDefault
      ? (question.defaultDestinationType ?? question.defaultAuditType)
      : isTail
        ? 'HUMAN_REVIEW'
        : null;
    const defaultDestinationTarget = hasDefault
      ? question.defaultDestinationTarget
      : null;

    return {
      id: question.id,
      text: question.text,
      type: normalizeQuestionType(question.type),
      description: question.description,
      hint: question.hint,
      required: question.required,
      config: question.config ?? {},
      defaultNextQuestionId,
      defaultAuditType:
        defaultDestinationType === null
          ? null
          : defaultDestinationType === 'SHORT_FORM' || defaultDestinationType === 'LONG_FORM'
            ? defaultDestinationType
            : null,
      defaultDestinationType,
      defaultDestinationTarget,
      answers: answers.map((a) => {
        const hasExplicit = Boolean(
          a.nextQuestionId || a.destinationType || a.auditType,
        );
        if (hasExplicit) {
          return {
            id: a.id,
            text: a.text,
            nextQuestionId: a.nextQuestionId,
            auditType: a.auditType,
            destinationType: a.destinationType,
            destinationTarget: a.destinationTarget,
          };
        }
        return {
          id: a.id,
          text: a.text,
          nextQuestionId: isTail ? null : linearNext,
          auditType: isTail ? ('HUMAN_REVIEW' as string) : null,
          destinationType: isTail ? ('HUMAN_REVIEW' as string) : null,
          destinationTarget: null,
        };
      }),
    };
  }

  // ============================================================
  // Admin: questions
  // ============================================================

  async listQuestions(formId?: string): Promise<AdminTriageQuestionDto[]> {
    const qb = this.questionRepository.createQueryBuilder('q');
    if (formId) {
      qb.where('q.formId = :formId', { formId });
    }
    qb.orderBy('q.order', 'ASC').addOrderBy('q.createdAt', 'ASC');

    let [questions, answers] = await Promise.all([
      qb.getMany(),
      this.answerRepository.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } }),
    ]);

    // Fallback: if formId was specified but has no questions yet, check if there are legacy questions with no formId
    if (questions.length === 0 && formId) {
      const legacyQuestions = await this.questionRepository.find({
        where: { formId: null as any },
        order: { order: 'ASC', createdAt: 'ASC' },
      });
      if (legacyQuestions.length > 0) {
        questions = legacyQuestions;
      }
    }

    const answersByQuestion = new Map<string, TriageAnswer[]>();
    for (const answer of answers) {
      const bucket = answersByQuestion.get(answer.questionId) ?? [];
      bucket.push(answer);
      answersByQuestion.set(answer.questionId, bucket);
    }

    const auditPath = this.validatorService.computeAuditReachability(questions, answers);

    return questions.map((question) => ({
      id: question.id,
      formId: question.formId ?? null,
      text: question.text,
      type: normalizeQuestionType(question.type),
      description: question.description,
      hint: question.hint,
      icon: question.icon,
      required: question.required,
      config: question.config ?? {},
      defaultNextQuestionId: question.defaultNextQuestionId,
      defaultAuditType: question.defaultAuditType,
      defaultDestinationType: question.defaultDestinationType,
      defaultDestinationTarget: question.defaultDestinationTarget,
      order: question.order,
      isActive: question.isActive,
      hasAuditPath: auditPath.has(question.id),
      createdAt: question.createdAt,
      answers: (answersByQuestion.get(question.id) ?? []).map((a) => ({
        id: a.id,
        questionId: a.questionId,
        text: a.text,
        nextQuestionId: a.nextQuestionId,
        auditType: a.auditType,
        destinationType: a.destinationType,
        destinationTarget: a.destinationTarget,
        internalValue: a.internalValue,
        tag: a.tag,
        sortOrder: a.sortOrder,
        isActive: a.isActive,
        createdAt: a.createdAt,
      })),
    }));
  }

  async createQuestion(dto: CreateTriageQuestionDto): Promise<TriageQuestion> {
    const type = dto.type ?? 'single_choice';
    this.validateConfig(type, dto.config ?? {});
    await this.validatorService.validateQuestionDestination(dto, null);

    const question = this.questionRepository.create({
      formId: dto.formId ?? null,
      text: dto.text.trim(),
      type,
      description: dto.description ?? null,
      hint: dto.hint ?? null,
      icon: dto.icon ?? null,
      required: dto.required ?? true,
      config: dto.config ?? {},
      defaultNextQuestionId: dto.defaultNextQuestionId ?? null,
      defaultAuditType: dto.defaultAuditType ?? null,
      defaultDestinationType: dto.defaultDestinationType ?? null,
      defaultDestinationTarget: dto.defaultDestinationTarget ?? null,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });
    return this.questionRepository.save(question);
  }

  async updateQuestion(id: string, dto: UpdateTriageQuestionDto): Promise<TriageQuestion> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Triage question not found.');

    if (dto.text !== undefined) question.text = dto.text.trim();
    if (dto.order !== undefined) question.order = dto.order;
    if (dto.isActive !== undefined) question.isActive = dto.isActive;
    if (dto.required !== undefined) question.required = dto.required;
    if (dto.description !== undefined) question.description = dto.description;
    if (dto.hint !== undefined) question.hint = dto.hint;
    if (dto.icon !== undefined) question.icon = dto.icon;

    const nextType = dto.type !== undefined ? normalizeQuestionType(dto.type) : normalizeQuestionType(question.type);
    this.validateConfig(nextType, dto.config ?? question.config ?? {});
    if (dto.config !== undefined) question.config = dto.config;

    if (
      dto.defaultNextQuestionId !== undefined ||
      dto.defaultAuditType !== undefined ||
      dto.defaultDestinationType !== undefined ||
      dto.defaultDestinationTarget !== undefined
    ) {
      const merged = {
        defaultNextQuestionId:
          dto.defaultNextQuestionId !== undefined
            ? dto.defaultNextQuestionId
            : question.defaultNextQuestionId,
        defaultAuditType:
          dto.defaultAuditType !== undefined
            ? dto.defaultAuditType
            : question.defaultAuditType,
        defaultDestinationType:
          dto.defaultDestinationType !== undefined
            ? dto.defaultDestinationType
            : question.defaultDestinationType,
        defaultDestinationTarget:
          dto.defaultDestinationTarget !== undefined
            ? dto.defaultDestinationTarget
            : question.defaultDestinationTarget,
      };
      await this.validatorService.validateQuestionDestination(merged, question.id);
      question.defaultNextQuestionId = merged.defaultNextQuestionId ?? null;
      question.defaultAuditType = merged.defaultAuditType ?? null;
      question.defaultDestinationType = merged.defaultDestinationType ?? null;
      question.defaultDestinationTarget = merged.defaultDestinationTarget ?? null;
    }

    if (dto.type !== undefined && dto.type !== question.type) {
      question.type = nextType;
      await this.ensureYesNoOptions(question);
    }

    return this.questionRepository.save(question);
  }

  /**
   * Deactivate a question (soft delete). A question that is still used as the
   * "next question" destination of another answer cannot be removed.
   */
  async removeQuestion(id: string): Promise<{ message: string }> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Triage question not found.');

    const references = await this.answerRepository.count({ where: { nextQuestionId: id } });
    if (references > 0) {
      throw new BadRequestException(
        `This question is used as the destination of ${references} answer(s). Update or disable those answers before removing it.`,
      );
    }

    question.isActive = false;
    await this.questionRepository.save(question);
    return { message: 'Triage question deleted.' };
  }

  private validateConfig(type: QuestionType, config: QuestionConfig | Record<string, any>): void {
    const cfg = config ?? {};
    if (cfg.placeholder !== undefined && typeof cfg.placeholder !== 'string') {
      throw new BadRequestException('config.placeholder must be a string.');
    }

    const numericLevels = ['min', 'max', 'step'];
    for (const key of numericLevels) {
      if (cfg[key] !== undefined && typeof cfg[key] !== 'number') {
        throw new BadRequestException(`config.${key} must be a number.`);
      }
    }

    if (cfg.maxLength !== undefined && (!Number.isInteger(cfg.maxLength) || cfg.maxLength < 1)) {
      throw new BadRequestException('config.maxLength must be a positive integer.');
    }

    if (type === 'rating' || type === 'linear_scale') {
      const hasMin = cfg.min !== undefined;
      const hasMax = cfg.max !== undefined;
      if (hasMin !== hasMax) {
        throw new BadRequestException(`config.min and config.max must be set together for "${type}".`);
      }
      if (hasMin) {
        if (!Number.isInteger(cfg.min) || !Number.isInteger(cfg.max) || cfg.min < 1 || cfg.max > 10 || cfg.min > cfg.max) {
          throw new BadRequestException(
            `config for "${type}" must satisfy 1 <= min <= max <= 10.`,
          );
        }
      }
      if (type === 'linear_scale') {
        if (cfg.minLabel !== undefined && typeof cfg.minLabel !== 'string') {
          throw new BadRequestException('config.minLabel must be a string.');
        }
        if (cfg.maxLabel !== undefined && typeof cfg.maxLabel !== 'string') {
          throw new BadRequestException('config.maxLabel must be a string.');
        }
      }
    }

    if (type === 'file') {
      if (cfg.allowedTypes !== undefined && !Array.isArray(cfg.allowedTypes)) {
        throw new BadRequestException('config.allowedTypes must be an array of strings.');
      }
      if (
        cfg.maxFileSizeMb !== undefined &&
        (typeof cfg.maxFileSizeMb !== 'number' || cfg.maxFileSizeMb <= 0)
      ) {
        throw new BadRequestException('config.maxFileSizeMb must be a positive number.');
      }
      if (cfg.multipleFiles !== undefined && typeof cfg.multipleFiles !== 'boolean') {
        throw new BadRequestException('config.multipleFiles must be a boolean.');
      }
    }

    if (type === 'date') {
      if (cfg.minDate !== undefined && typeof cfg.minDate !== 'string') {
        throw new BadRequestException('config.minDate must be a string (YYYY-MM-DD).');
      }
      if (cfg.maxDate !== undefined && typeof cfg.maxDate !== 'string') {
        throw new BadRequestException('config.maxDate must be a string (YYYY-MM-DD).');
      }
    }
  }

  private async ensureYesNoOptions(question: TriageQuestion): Promise<void> {
    if (normalizeQuestionType(question.type) !== 'yes_no') return;

    const existing = await this.answerRepository.find({
      where: { questionId: question.id, isActive: true },
    });
    if (existing.length > 0) return;

    const options = YES_NO_OPTIONS.map((text, index) =>
      this.answerRepository.create({
        questionId: question.id,
        text,
        nextQuestionId: null,
        auditType: null,
        sortOrder: index,
        isActive: true,
      }),
    );
    await this.answerRepository.save(options);
  }
}
