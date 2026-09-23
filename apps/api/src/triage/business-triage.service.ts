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
    const question = await this.questionRepository.findOne({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
    if (!question) {
      throw new NotFoundException('No active triage questions are configured yet.');
    }
    return this.toPublicQuestion(question);
  }

  async getQuestion(id: string): Promise<TriageQuestionItemDto> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question || !question.isActive) {
      throw new NotFoundException('Triage question not found.');
    }
    return this.toPublicQuestion(question);
  }

  private async toPublicQuestion(question: TriageQuestion): Promise<TriageQuestionItemDto> {
    const answers = await this.answerRepository.find({
      where: { questionId: question.id, isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
    return {
      id: question.id,
      text: question.text,
      type: normalizeQuestionType(question.type),
      description: question.description,
      hint: question.hint,
      required: question.required,
      config: question.config ?? {},
      defaultNextQuestionId: question.defaultNextQuestionId,
      defaultAuditType: question.defaultAuditType,
      answers: answers.map((a) => ({
        id: a.id,
        text: a.text,
        nextQuestionId: a.nextQuestionId,
        auditType: a.auditType,
      })),
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

    // Apply question-level destination with the same next-XOR-audit rule.
    if (
      dto.defaultNextQuestionId !== undefined ||
      dto.defaultAuditType !== undefined
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
      };
      await this.validateQuestionDestination(merged, question.id);
      question.defaultNextQuestionId = merged.defaultNextQuestionId ?? null;
      question.defaultAuditType = merged.defaultAuditType ?? null;
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

    const destinationPatch = {
      nextQuestionId: dto.nextQuestionId,
      auditType: dto.auditType,
    };
    if (destinationPatch.nextQuestionId !== undefined || destinationPatch.auditType !== undefined) {
      const merged = {
        nextQuestionId: destinationPatch.nextQuestionId !== undefined ? destinationPatch.nextQuestionId : answer.nextQuestionId,
        auditType: destinationPatch.auditType !== undefined ? destinationPatch.auditType : answer.auditType,
      };
      const destination = await this.validateDestination(merged, answer.questionId);
      answer.nextQuestionId = destination.nextQuestionId ?? null;
      answer.auditType = destination.auditType ?? null;
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
   * Enforces the core rule: an answer points to EITHER a next question OR an
   * audit type — never both, never neither — and the target must exist.
   */
  private async validateDestination(
    dto: { nextQuestionId?: string | null; auditType?: string | null },
    owningQuestionId: string,
  ): Promise<{ nextQuestionId?: string | null; auditType?: string | null }> {
    const hasNext = dto.nextQuestionId !== undefined && dto.nextQuestionId !== null;
    const hasAudit = dto.auditType !== undefined && dto.auditType !== null;

    if (hasNext && hasAudit) {
      throw new BadRequestException('An answer cannot point to both a next question and an audit.');
    }
    if (!hasNext && !hasAudit) {
      throw new BadRequestException('An answer must have a destination — either a next question or an audit type.');
    }

    if (hasNext) {
      const target = await this.questionRepository.findOne({ where: { id: dto.nextQuestionId as string } });
      if (!target) throw new BadRequestException('The destination question does not exist.');
      if (target.id === owningQuestionId) {
        throw new BadRequestException('An answer cannot point back to the question it belongs to.');
      }
      return { nextQuestionId: target.id, auditType: null };
    }

    return { nextQuestionId: null, auditType: dto.auditType as string };
  }

  /**
   * Question-level destination uses the same rule as answers, but is optional —
   * an option-less question can also simply forward sequentially without a branch.
   */
  private async validateQuestionDestination(
    dto: { defaultNextQuestionId?: string | null; defaultAuditType?: string | null },
    owningQuestionId: string | null,
  ): Promise<void> {
    const hasNext = dto.defaultNextQuestionId !== undefined && dto.defaultNextQuestionId !== null;
    const hasAudit = dto.defaultAuditType !== undefined && dto.defaultAuditType !== null;

    if (hasNext && hasAudit) {
      throw new BadRequestException('A question cannot point to both a next question and an audit.');
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
    for (const answer of answers) {
      if (!answer.isActive) continue;
      if (!answer.questionId) continue;
      if (!nextIds.has(answer.questionId)) nextIds.set(answer.questionId, []);
      if (answer.nextQuestionId && byId.has(answer.nextQuestionId) && byId.get(answer.nextQuestionId)!.isActive) {
        nextIds.get(answer.questionId)!.push(answer.nextQuestionId);
      }
      if (answer.auditType) exitsToAudit.set(answer.questionId, true);
    }
    // Question-level destinations for option-less questions.
    for (const question of questions) {
      if (!question.isActive) continue;
      if (question.defaultAuditType) exitsToAudit.set(question.id, true);
      if (question.defaultNextQuestionId && byId.has(question.defaultNextQuestionId) && byId.get(question.defaultNextQuestionId)!.isActive) {
        if (!nextIds.has(question.id)) nextIds.set(question.id, []);
        nextIds.get(question.id)!.push(question.defaultNextQuestionId);
      }
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