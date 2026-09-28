import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageAnswer } from './entities/triage-answer.entity';
import { CreateTriageAnswerDto, UpdateTriageAnswerDto } from './dto/triage-question.dto';
import { isOptionlessType, normalizeQuestionType } from './question-types';
import { TriageFlowValidatorService } from './triage-flow-validator.service';

@Injectable()
export class TriageAnswerService {
  constructor(
    @InjectRepository(TriageQuestion)
    private readonly questionRepository: Repository<TriageQuestion>,
    @InjectRepository(TriageAnswer)
    private readonly answerRepository: Repository<TriageAnswer>,
    private readonly validatorService: TriageFlowValidatorService,
  ) {}

  async createAnswer(questionId: string, dto: CreateTriageAnswerDto): Promise<TriageAnswer> {
    const question = await this.questionRepository.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Triage question not found.');

    const type = normalizeQuestionType(question.type);
    if (isOptionlessType(type)) {
      throw new BadRequestException(
        `This question uses the "${type}" answer type and does not accept answer options.`,
      );
    }

    const destination = await this.validatorService.validateDestination(dto, questionId);

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
        nextQuestionId:
          destinationPatch.nextQuestionId !== undefined
            ? destinationPatch.nextQuestionId
            : answer.nextQuestionId,
        auditType:
          destinationPatch.auditType !== undefined
            ? destinationPatch.auditType
            : answer.auditType,
        destinationType:
          destinationPatch.destinationType !== undefined
            ? destinationPatch.destinationType
            : answer.destinationType,
        destinationTarget:
          destinationPatch.destinationTarget !== undefined
            ? destinationPatch.destinationTarget
            : answer.destinationTarget,
      };
      const destination = await this.validatorService.validateDestination(merged, answer.questionId);
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
    await this.answerRepository.delete(id);
    return { message: 'Triage answer deleted.' };
  }
}
