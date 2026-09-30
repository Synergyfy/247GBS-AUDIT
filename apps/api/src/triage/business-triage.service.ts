import { Injectable } from '@nestjs/common';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageAnswer } from './entities/triage-answer.entity';
import {
  CreateTriageQuestionDto,
  UpdateTriageQuestionDto,
  AdminTriageQuestionDto,
  CreateTriageAnswerDto,
  UpdateTriageAnswerDto,
} from './dto/triage-question.dto';
import { TriageQuestionItemDto } from './dto/triage-question.dto';
import { TriageQuestionService } from './triage-question.service';
import { TriageAnswerService } from './triage-answer.service';
import { TriageFlowValidatorService, FlowValidationResult } from './triage-flow-validator.service';

/**
 * BusinessTriageService acts as a high-level facade coordinating
 * question management, answer routing, and flow validation.
 */
@Injectable()
export class BusinessTriageService {
  constructor(
    private readonly questionService: TriageQuestionService,
    private readonly answerService: TriageAnswerService,
    private readonly validatorService: TriageFlowValidatorService,
  ) {}

  // ============================================================
  // Public flow delegation
  // ============================================================

  async getStartQuestion(formId?: string): Promise<TriageQuestionItemDto> {
    return this.questionService.getStartQuestion(formId);
  }

  async getQuestion(id: string): Promise<TriageQuestionItemDto> {
    return this.questionService.getQuestion(id);
  }

  // ============================================================
  // Admin: Question CRUD delegation
  // ============================================================

  async listQuestions(formId?: string): Promise<AdminTriageQuestionDto[]> {
    return this.questionService.listQuestions(formId);
  }

  async createQuestion(dto: CreateTriageQuestionDto): Promise<TriageQuestion> {
    return this.questionService.createQuestion(dto);
  }

  async updateQuestion(id: string, dto: UpdateTriageQuestionDto): Promise<TriageQuestion> {
    return this.questionService.updateQuestion(id, dto);
  }

  async removeQuestion(id: string): Promise<{ message: string }> {
    return this.questionService.removeQuestion(id);
  }

  // ============================================================
  // Admin: Answer CRUD delegation
  // ============================================================

  async createAnswer(
    questionId: string,
    dto: CreateTriageAnswerDto,
  ): Promise<TriageAnswer> {
    return this.answerService.createAnswer(questionId, dto);
  }

  async updateAnswer(
    id: string,
    dto: UpdateTriageAnswerDto,
  ): Promise<TriageAnswer> {
    return this.answerService.updateAnswer(id, dto);
  }

  async removeAnswer(id: string): Promise<{ message: string }> {
    return this.answerService.removeAnswer(id);
  }

  // ============================================================
  // Flow Validation delegation
  // ============================================================

  async validateFlowForPublish(formId?: string): Promise<FlowValidationResult> {
    return this.validatorService.validateFlowForPublish(formId);
  }
}