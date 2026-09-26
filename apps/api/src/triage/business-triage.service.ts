import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageAnswer } from './entities/triage-answer.entity';
import { AuditType } from './entities/triage.entity';
import {
  CreateTriageQuestionDto,
  UpdateTriageQuestionDto,
  CreateTriageAnswerDto,
  UpdateTriageAnswerDto,
  TriageQuestionItemDto,
  AdminTriageQuestionDto,
} from './dto/triage-question.dto';
import {
  normalizeQuestionType,
  isChoiceType,
  isOptionlessType,
  YES_NO_OPTIONS,
  QuestionType,
  QuestionConfig,
} from './question-types';

@Injectable()
export class BusinessTriageService {
  constructor(
    @InjectRepository(TriageQuestion)
    private readonly questionRepository: Repository<TriageQuestion>,
    @InjectRepository(TriageAnswer)
    private readonly answerRepository: Repository<TriageAnswer>,
  ) {}

  // ============================================================
  // Public flow
  // ============================================================

  async getStartQuestion(): Promise<TriageQuestionItemDto> {
    const ordered = await this.linearOrder();
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
    const ordered = await this.linearOrder();
    return this.toPublicQuestion(question, ordered);
  }

  /**
   * All active questions in linear (order) sequence. Used to resolve the
   * dynamic "next question" default: anything without an explicit destination
   * advances to the next active question, or ends the form ("End / Submit")
   * when it is last. Because the next step is derived from `order` at request
   * time, drag-and-drop reordering never leaves a stale stored next id behind.
   */
  private async linearOrder(): Promise<TriageQuestion[]> {
    return this.questionRepository.find({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
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
   * the final question. Mirrored by the server-side replay in PreAuditService
   * so the client's (baked) routing always matches what the server re-walks.
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

    const defaultNextQuestionId = hasDefault
      ? defaultNext
      : linearNext;
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
          ? hasDefault
            ? question.defaultAuditType
            : null
          : defaultDestinationType,
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
        // No explicit route — follow the linear default.
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

  async listQuestions(): Promise<AdminTriageQuestionDto[]> {
    const [questions, answers] = await Promise.all([
      this.questionRepository.find({ order: { order: 'ASC', createdAt: 'ASC' } }),
      this.answerRepository.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } }),
    ]);

    const answersByQuestion = new Map<string, TriageAnswer[]>();
    for (const answer of answers) {
      const bucket = answersByQuestion.get(answer.questionId) ?? [];
      bucket.push(answer);
      answersByQuestion.set(answer.questionId, bucket);
    }

    const auditPath = this.computeAuditReachability(questions, answers);

    return questions.map((question) => ({
      id: question.id,
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
    await this.validateQuestionDestination(dto, null);

    const question = this.questionRepository.create({
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

    // Apply question-level destination with the same next-XOR-destination rule.
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
      await this.validateQuestionDestination(merged, question.id);
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

  // ============================================================
  // Admin: answers
  // ============================================================

  async createAnswer(questionId: string, dto: CreateTriageAnswerDto): Promise<TriageAnswer> {
    const question = await this.questionRepository.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Triage question not found.');

    const type = normalizeQuestionType(question.type);
    if (isOptionlessType(type)) {
      throw new BadRequestException(
        `This question uses the "${type}" answer type and does not accept answer options.`,
      );
    }

    const destination = await this.validateDestination(dto, questionId);

    const answer = this.answerRepository.create({
      questionId,
      text: dto.text.trim(),
      nextQuestionId: destination.nextQuestionId ?? null,
      auditType: destination.auditType ?? null,
      destinationType: destination.destinationType ?? null,
      destinationTarget: destination.destinationTarget ?? null,
      internalValue: dto.internalValue?.trim() || null,
      tag: dto.tag?.trim() || null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
    return this.answerRepository.save(answer);
  }

  async updateAnswer(id: string, dto: UpdateTriageAnswerDto): Promise<TriageAnswer> {
    const answer = await this.answerRepository.findOne({ where: { id } });
    if (!answer) throw new NotFoundException('Triage answer not found.');

    if (dto.text !== undefined) answer.text = dto.text.trim();
    if (dto.isActive !== undefined) answer.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) answer.sortOrder = dto.sortOrder;
    if (dto.internalValue !== undefined) answer.internalValue = dto.internalValue?.trim() || null;
    if (dto.tag !== undefined) answer.tag = dto.tag?.trim() || null;

    const destinationPatch = {
      nextQuestionId: dto.nextQuestionId,
      auditType: dto.auditType,
      destinationType: dto.destinationType,
      destinationTarget: dto.destinationTarget,
    };
    const patchHasDestination =
      destinationPatch.nextQuestionId !== undefined ||
      destinationPatch.auditType !== undefined ||
      destinationPatch.destinationType !== undefined ||
      destinationPatch.destinationTarget !== undefined;
    if (patchHasDestination) {
      const merged = {
        nextQuestionId: destinationPatch.nextQuestionId !== undefined ? destinationPatch.nextQuestionId : answer.nextQuestionId,
        auditType: destinationPatch.auditType !== undefined ? destinationPatch.auditType : answer.auditType,
        destinationType: destinationPatch.destinationType !== undefined ? destinationPatch.destinationType : answer.destinationType,
        destinationTarget: destinationPatch.destinationTarget !== undefined ? destinationPatch.destinationTarget : answer.destinationTarget,
      };
      const destination = await this.validateDestination(merged, answer.questionId);
      answer.nextQuestionId = destination.nextQuestionId ?? null;
      answer.auditType = destination.auditType ?? null;
      answer.destinationType = destination.destinationType ?? null;
      answer.destinationTarget = destination.destinationTarget ?? null;
    }

    return this.answerRepository.save(answer);
  }

  async removeAnswer(id: string): Promise<{ message: string }> {
    const answer = await this.answerRepository.findOne({ where: { id } });
    if (!answer) throw new NotFoundException('Triage answer not found.');

    answer.isActive = false;
    await this.answerRepository.save(answer);
    return { message: 'Triage answer deactivated.' };
  }

  // ============================================================
  // Validation helpers
  // ============================================================

  /**
   * Enforces the core rule: an answer points to EITHER a next question OR a
   * terminal destination (auditType/destinationType) — never both, never
   * neither — and the target must exist.
   */
  private async validateDestination(
    dto: {
      nextQuestionId?: string | null;
      auditType?: string | null;
      destinationType?: string | null;
      destinationTarget?: string | null;
    },
    owningQuestionId: string,
  ): Promise<{
    nextQuestionId?: string | null;
    auditType?: string | null;
    destinationType?: string | null;
    destinationTarget?: string | null;
  }> {
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
    // SHORT/LONG destinations backfill the legacy audit column so the Audit
    // handoff keeps working without a separate migration.
    const auditType = hasDestination && (dto.destinationType === 'SHORT_FORM' || dto.destinationType === 'LONG_FORM')
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
  private async validateQuestionDestination(
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
      if (!target) throw new BadRequestException('The destination question does not exist.');
      if (owningQuestionId && target.id === owningQuestionId) {
        throw new BadRequestException('A question cannot point to itself.');
      }
    }
  }

  /**
   * Type-specific config validation. Rejects impossible combinations so the
   * public renderer never has to guess.
   */
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

  /**
   * A yes_no question stores "Yes" / "No" as ordinary options so branching
   * destinations stay uniform. Auto-create them when the builder switches the
   * question to yes_no and no options exist yet.
   */
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

  // ============================================================
  // Flow safety: cycle / dead-end detection
  // ============================================================

  /**
   * Publishes only after a full flow-health check. Every active question must:
   * - have content configured,
   * - route every active option (or its question-level default) somewhere,
   * - not point to a missing or deactivated question,
   * - be able to eventually reach an audit destestination (no dead-ends/loops).
   * Non-blocking warnings are returned separately (e.g. multi-select options
   * that route to different places are supported by the traversal engine, but
   * worth surfacing to the builder admin).
   */
  async validateFlowForPublish(): Promise<{
    ok: boolean;
    issues: string[];
    warnings: string[];
  }> {
    const questions = await this.questionRepository.find({ order: { order: 'ASC', createdAt: 'ASC' } });
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
          // An answer without an explicit route follows the linear default
          // (next active question, or "End / Submit" for the final question),
          // so it is always valid — only explicit routes need checking.
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
        // Option-less questions default to the next active question in order
        // (or "End / Submit" when last) — no explicit destination is required.
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
  private computeAuditReachability(
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
    // Question-level destinations for option-less questions.
    for (const question of questions) {
      if (!question.isActive) continue;
      const terminal = question.defaultAuditType || question.defaultDestinationType;
      if (terminal) exitsToAudit.set(question.id, true);
      if (question.defaultNextQuestionId && byId.has(question.defaultNextQuestionId) && byId.get(question.defaultNextQuestionId)!.isActive) {
        if (!nextIds.has(question.id)) nextIds.set(question.id, []);
        nextIds.get(question.id)!.push(question.defaultNextQuestionId);
      }
    }
    // Dynamic linear default: a question advances to the next active question
    // (or ends the form) whenever an active answer carries no explicit route,
    // or an option-less question declares no explicit default. Only routes
    // that genuinely participate in runtime traffic are added, so explicit
    // branching loops still fail the reachability walk.
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
        // Final question — the form concludes ("End / Submit").
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