import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'node:crypto';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageAnswer } from './entities/triage-answer.entity';
import { PreAuditSession } from './entities/pre-audit-session.entity';
import { SubmitPreAuditDto, PreAuditStepDto, PreAuditSubmissionResultDto } from './dto/pre-audit.dto';
import {
  TriageResponseDetailDto,
  TriageResponsesOverviewDto,
  TriageResponseStepDto,
  TriageResponseSummaryDto,
} from './dto/triage-form.dto';
import { normalizeQuestionType, isChoiceType } from './question-types';
import { destinationAuditType, resolveDestination } from './destination-types';
import { PreAuditMailer } from '../mail/pre-audit-mailer';

type Destination = {
  nextQuestionId: string | null;
  destinationType: string | null;
  destinationTarget: string | null;
};
type EvaluatedStep = {
  questionId: string;
  questionText: string;
  type: string;
  optionIds?: string[];
  optionTexts?: string[];
  value?: any;
  nextQuestionId: string | null;
  destinationType: string | null;
  destinationTarget: string | null;
  auditType: string | null;
};

/**
 * A not-yet-walked alternative route selected on an earlier question (P5
 * multi-branch traversal). Multi-select questions may pick options that route
 * to different places; the lowest-sortOrder route is walked first and every
 * other route is queued here. The engine replays the exact same canonical DFS
 * the client uses: sibling branches are pushed in reverse canonical order so
 * the lowest pops next, and one branch is fully processed before the next.
 */
type PendingBranch = {
  nextQuestionId: string | null;
  destinationType: string | null;
  destinationTarget: string | null;
  auditType: string | null;
};

type EvaluatedChoice = {
  result: EvaluatedStep;
  branches: PendingBranch[];
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const MAX_TEXT_LENGTH = 5000;
const MAX_STEPS = 50;

@Injectable()
export class PreAuditService {
  constructor(
    @InjectRepository(TriageQuestion)
    private readonly questionRepository: Repository<TriageQuestion>,
    @InjectRepository(TriageAnswer)
    private readonly answerRepository: Repository<TriageAnswer>,
    @InjectRepository(PreAuditSession)
    private readonly sessionRepository: Repository<PreAuditSession>,
    private readonly mailer: PreAuditMailer,
  ) {}

  /**
   * Evaluates a public pre-audit submission. The client is NEVER trusted: the
   * server re-walks the active question chain from the start, validates every
   * step against the database and computes the audit destination itself.
   */
  async evaluateAndSave(dto: SubmitPreAuditDto): Promise<PreAuditSubmissionResultDto> {
    if (dto.consentGranted !== true) {
      throw new BadRequestException('Consent is required before your pre-audit can be saved.');
    }

    const steps = dto.steps;
    if (steps.length === 0) {
      throw new BadRequestException('At least one answered step is required.');
    }
    if (steps.length > MAX_STEPS) {
      throw new BadRequestException(
        `Too many steps (max ${MAX_STEPS}). Please refresh and try again.`,
      );
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
    const visitedQuestionIds = new Set<string>([startQuestion.id]);
    // LIFO stack of alternative routes: one branch fully walked before the next.
    const pending: PendingBranch[] = [];
    let current = startQuestion;
    // The next question the primary/branch line expects, or null once the line
    // has concluded and the continuation must come from the pending stack.
    let expectedNext: string | null = null;
    let recommendedAuditType: string | null = null;
    let destinationType: string | null = null;
    let destinationTarget: string | null = null;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      if (i === 0) {
        if (step.questionId !== startQuestion.id) {
          throw new BadRequestException('The first step must start with the current start question.');
        }
      } else if (expectedNext !== null) {
        // Linear continuation of the current (primary or branch) line.
        if (step.questionId !== expectedNext) {
          throw new BadRequestException(
            `Step ${i + 1} does not match the expected question. Routing is determined server-side.`,
          );
        }
      } else {
        // The previous line concluded; this step must be the head of a pending
        // branch (DFS), after skipping any that rejoin an answered question.
        const switched = this.resolvePendingNext(pending, visitedQuestionIds);
        if (switched !== step.questionId) {
          throw new BadRequestException(
            `Step ${i + 1} does not match the expected question. Routing is determined server-side.`,
          );
        }
      }

      if (i > 0) {
        const question = await this.questionRepository.findOne({ where: { id: step.questionId } });
        if (!question || !question.isActive) {
          throw new BadRequestException(
            `Step ${i + 1} referenced an inactive or missing question. Please refresh and try again.`,
          );
        }
        current = question;
      }

      const type = normalizeQuestionType(current.type);
      const { result: stepResult, branches } = await this.evaluateStep(current, step, type);
      evaluated.push(stepResult);
      visitedQuestionIds.add(current.id);

      // Push sibling branches (reverse canonical order so the lowest pops next).
      for (let b = branches.length - 1; b >= 0; b--) {
        pending.push(branches[b]);
      }

      if (stepResult.nextQuestionId) {
        if (visitedQuestionIds.has(stepResult.nextQuestionId)) {
          // This line rejoins an already-answered question — the shared subtree
          // is already accounted for, so continue with the pending stack.
          expectedNext = this.resolvePendingNext(pending, visitedQuestionIds);
        } else {
          expectedNext = stepResult.nextQuestionId;
        }
      } else if (stepResult.destinationType || stepResult.auditType) {
        // A branch concluded. The LAST concluded branch is authoritative for the
        // recommendation (matching the client's last-terminal-wins rule).
        recommendedAuditType = destinationAuditType(stepResult.destinationType || stepResult.auditType);
        destinationType = stepResult.destinationType || stepResult.auditType || null;
        destinationTarget = stepResult.destinationTarget;
        expectedNext = this.resolvePendingNext(pending, visitedQuestionIds);
      } else {
        // No destination configured — the flow cannot continue.
        throw new BadRequestException(
          `Question "${current.text}" has no destination configured for the selected answer.`,
        );
      }
    }

    if (destinationType === null && recommendedAuditType === null) {
      throw new BadRequestException('The submitted flow did not conclude with a destination. Please refresh and try again.');
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
      recommendedAuditType,
      destinationType,
      destinationTarget,
      consentGrantedAt: new Date(),
      consentVersion: dto.consentVersion ?? '1',
      completedAt: new Date(),
    });

    try {
      const saved = await this.sessionRepository.save(session);
      this.mailer.sendPostSubmission(saved, false);
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
  ): Promise<EvaluatedChoice> {
    if (isChoiceType(type)) {
      return this.evaluateChoice(question, step, type);
    }
    return { result: this.evaluateTyped(question, step, type), branches: [] };
  }

  private async evaluateChoice(
    question: TriageQuestion,
    step: PreAuditStepDto,
    type: string,
  ): Promise<EvaluatedChoice> {
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
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
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

    // Canonical order — identical to the order the public flow presents options.
    const ordered = [...selected].sort(
      (a, b) =>
        a.sortOrder === b.sortOrder
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : a.sortOrder - b.sortOrder,
    );

    // Group the selections by their resolved route (one next question OR one
    // destination). The group containing the earliest option is the primary
    // route; every other route is queued as a pending branch (DFS).
    const groups: { route: string; options: TriageAnswer[]; destination: Destination }[] = [];
    for (const option of ordered) {
      const destination = this.destinationOf(option);
      const route = JSON.stringify([
        destination.nextQuestionId ?? null,
        destination.destinationType ?? null,
        destination.destinationTarget ?? null,
      ]);
      let group = groups.find((g) => g.route === route);
      if (!group) {
        group = { route, options: [], destination };
        groups.push(group);
      }
      group.options.push(option);
    }

    const primary = groups[0];
    const destination = primary.destination;

    if (!destination.nextQuestionId && !destination.destinationType) {
      return {
        result: {
          questionId: question.id,
          questionText: question.text,
          type,
          optionIds,
          optionTexts: selected.map((o) => o.text),
          nextQuestionId: null,
          destinationType: null,
          destinationTarget: null,
          auditType: null,
        },
        branches: [],
      };
    }

    const branches: PendingBranch[] = [];
    for (let i = 1; i < groups.length; i++) {
      const group = groups[i];
      branches.push({
        nextQuestionId: group.destination.nextQuestionId,
        destinationType: group.destination.destinationType,
        destinationTarget: group.destination.destinationTarget,
        auditType: destinationAuditType(group.destination.destinationType),
      });
    }

    return {
      result: {
        questionId: question.id,
        questionText: question.text,
        type,
        optionIds,
        optionTexts: selected.map((o) => o.text),
        nextQuestionId: destination.nextQuestionId,
        destinationType: destination.destinationType,
        destinationTarget: destination.destinationTarget,
        auditType: destinationAuditType(destination.destinationType),
      },
      branches,
    };
  }

  private destinationOf(answer: TriageAnswer): Destination {
    const resolved = resolveDestination(answer);
    return {
      nextQuestionId: answer.nextQuestionId,
      destinationType: resolved.destinationType,
      destinationTarget: resolved.destinationTarget,
    };
  }

  /**
   * Pops the head of the pending-branch stack and returns the next question to
   * walk, mirroring the client's DFS traversal. Branches that rejoin an
   * already-answered question, or that have no next question (destination-only
   * branches), contribute no further step and are skipped. Returns null when
   * every branch has been processed and the traversal is complete.
   */
  private resolvePendingNext(
    pending: PendingBranch[],
    visitedQuestionIds: ReadonlySet<string>,
  ): string | null {
    while (pending.length > 0) {
      const top = pending[pending.length - 1];
      if (top.nextQuestionId && !visitedQuestionIds.has(top.nextQuestionId)) {
        return top.nextQuestionId;
      }
      pending.pop();
    }
    return null;
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
      const resolved = resolveDestination(question);
      if (required) {
        throw new BadRequestException(`Question "${question.text}" must be answered.`);
      }
      if (!question.defaultNextQuestionId && !resolved.destinationType) {
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
        destinationType: resolved.destinationType,
        destinationTarget: resolved.destinationTarget,
        auditType: destinationAuditType(resolved.destinationType),
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

    const resolved = resolveDestination(question);
    return {
      questionId: question.id,
      questionText: question.text,
      type,
      value: normalized,
      nextQuestionId: question.defaultNextQuestionId,
      destinationType: resolved.destinationType,
      destinationTarget: resolved.destinationTarget,
      auditType: destinationAuditType(resolved.destinationType),
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
      destinationType: session.destinationType ?? null,
      destinationTarget: session.destinationTarget ?? null,
      consentGrantedAt: session.consentGrantedAt
        ? session.consentGrantedAt.toISOString()
        : null,
      answeredCount: Array.isArray(session.answers) ? session.answers.length : 0,
      isDuplicate,
    };
  }

  // ============================================================
  // Admin: responses
  // ============================================================

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