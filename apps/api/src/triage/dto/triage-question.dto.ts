import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { AuditType } from './../entities/triage.entity';
import { QUESTION_TYPES } from '../question-types';
import { DESTINATION_TYPES, TriageDestinationType } from '../destination-types';
import type { QuestionType } from '../question-types';

// ============================================================
// Create / Update payloads
// ============================================================

export class CreateTriageQuestionDto {
  @ApiProperty({ description: 'Question text shown to the user.' })
  @IsNotEmpty({ message: 'Question text cannot be empty.' })
  text: string;

  @ApiPropertyOptional({
    description: 'Answer type that drives rendering.',
    enum: QUESTION_TYPES,
    default: 'single_choice',
  })
  @IsOptional()
  @IsEnum(QUESTION_TYPES, { message: 'type must be a valid question type.' })
  type?: QuestionType;

  @ApiPropertyOptional({ description: 'Longer description shown under the question text.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({ description: 'Short helper hint shown to the user.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  hint?: string | null;

  @ApiPropertyOptional({ description: 'Optional icon name used by the renderer.' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string | null;

  @ApiPropertyOptional({ description: 'Whether the question must be answered before continuing.', default: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({
    description: 'Type-specific configuration (placeholder, min/max, file limits, scale labels...).',
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'config must be an object.' })
  config?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Default next question for option-less types. Mutually exclusive with defaultAuditType.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'defaultNextQuestionId must be a valid question id.' })
  defaultNextQuestionId?: string | null;

  @ApiPropertyOptional({
    description: 'Default terminal destination (SHORT_FORM | LONG_FORM) for option-less types. Mutually exclusive with defaultNextQuestionId.',
    enum: AuditType,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(AuditType, { message: 'defaultAuditType must be a valid audit type.' })
  defaultAuditType?: AuditType | null;

  @ApiPropertyOptional({
    description: 'Default terminal destination type for option-less questions. Mutually exclusive with defaultNextQuestionId.',
    enum: DESTINATION_TYPES,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(DESTINATION_TYPES, { message: 'defaultDestinationType must be a valid destination type.' })
  defaultDestinationType?: TriageDestinationType | null;

  @ApiPropertyOptional({
    description: 'Target for the default destination (sector id, MCOM slug, custom label).',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultDestinationTarget?: string | null;

  @ApiPropertyOptional({ description: 'Display ordering within the flow (start = lowest).' })
  @IsOptional()
  @IsInt({ message: 'Order must be a whole number.' })
  order?: number;

  @ApiPropertyOptional({ description: 'Whether the question is live in the public flow.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTriageQuestionDto extends PartialType(CreateTriageQuestionDto) {}

export class CreateTriageAnswerDto {
  @ApiProperty({ description: 'Answer text shown to the user.' })
  @IsNotEmpty({ message: 'Answer text cannot be empty.' })
  text: string;

  @ApiPropertyOptional({
    description: 'If set, choosing this answer jumps to this question. Mutually exclusive with auditType.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'nextQuestionId must be a valid question id.' })
  nextQuestionId?: string | null;

  @ApiPropertyOptional({
    description: 'If set, choosing this answer ends the triage and assigns this audit type. Mutually exclusive with nextQuestionId.',
    enum: AuditType,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(AuditType, { message: 'auditType must be a valid audit type.' })
  auditType?: AuditType | null;

  @ApiPropertyOptional({
    description: 'If set, choosing this answer ends the triage at this destination type. Mutually exclusive with nextQuestionId.',
    enum: DESTINATION_TYPES,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(DESTINATION_TYPES, { message: 'destinationType must be a valid destination type.' })
  destinationType?: TriageDestinationType | null;

  @ApiPropertyOptional({
    description: 'Target for the destination (sector id, MCOM slug, custom label).',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  destinationTarget?: string | null;

  @ApiPropertyOptional({
    description: 'Hidden internal value used by business logic (never shown to respondents).',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  internalValue?: string | null;

  @ApiPropertyOptional({
    description: 'Optional tag attached to the option (never shown to respondents).',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tag?: string | null;

  @ApiPropertyOptional({ description: 'Display order of the option within the question.' })
  @IsOptional()
  @IsInt({ message: 'sortOrder must be a whole number.' })
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Whether the answer option is active.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTriageAnswerDto extends PartialType(CreateTriageAnswerDto) {}

// ============================================================
// Response DTOs (also used by Swagger)
// ============================================================

export class TriageAnswerItemDto {
  @ApiProperty() id: string;
  @ApiProperty() text: string;
  @ApiProperty({ nullable: true }) nextQuestionId: string | null;
  @ApiProperty({ enum: AuditType, nullable: true }) auditType: string | null;
  @ApiProperty({ enum: DESTINATION_TYPES, nullable: true }) destinationType: string | null;
  @ApiProperty({ nullable: true }) destinationTarget: string | null;
}

export class TriageQuestionItemDto {
  @ApiProperty() id: string;
  @ApiProperty() text: string;
  @ApiProperty({ enum: QUESTION_TYPES, default: 'single_choice' }) type: QuestionType;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ nullable: true }) hint: string | null;
  @ApiProperty({ default: true }) required: boolean;
  @ApiProperty({ type: Object }) config: Record<string, any>;
  @ApiProperty({ nullable: true }) defaultNextQuestionId: string | null;
  @ApiProperty({ enum: AuditType, nullable: true }) defaultAuditType: string | null;
  @ApiProperty({ enum: DESTINATION_TYPES, nullable: true }) defaultDestinationType: string | null;
  @ApiProperty({ nullable: true }) defaultDestinationTarget: string | null;
  @ApiProperty({ type: [TriageAnswerItemDto] }) answers: TriageAnswerItemDto[];
}

export class AdminTriageAnswerDto {
  @ApiProperty() id: string;
  @ApiProperty() questionId: string;
  @ApiProperty() text: string;
  @ApiProperty({ nullable: true }) nextQuestionId: string | null;
  @ApiProperty({ enum: AuditType, nullable: true }) auditType: string | null;
  @ApiProperty({ enum: DESTINATION_TYPES, nullable: true }) destinationType: string | null;
  @ApiProperty({ nullable: true }) destinationTarget: string | null;
  @ApiProperty({ nullable: true }) internalValue: string | null;
  @ApiProperty({ nullable: true }) tag: string | null;
  @ApiProperty({ default: 0 }) sortOrder: number;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
}

export class AdminTriageQuestionDto {
  @ApiProperty() id: string;
  @ApiProperty() text: string;
  @ApiProperty({ enum: QUESTION_TYPES, default: 'single_choice' }) type: QuestionType;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ nullable: true }) hint: string | null;
  @ApiProperty({ nullable: true }) icon: string | null;
  @ApiProperty({ default: true }) required: boolean;
  @ApiProperty({ type: Object }) config: Record<string, any>;
  @ApiProperty({ nullable: true }) defaultNextQuestionId: string | null;
  @ApiProperty({ enum: AuditType, nullable: true }) defaultAuditType: string | null;
  @ApiProperty({ enum: DESTINATION_TYPES, nullable: true }) defaultDestinationType: string | null;
  @ApiProperty({ nullable: true }) defaultDestinationTarget: string | null;
  @ApiProperty() order: number;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ description: 'Whether this question can eventually reach an audit (no dead-ends or cycles).' })
  hasAuditPath: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ type: [AdminTriageAnswerDto] }) answers: AdminTriageAnswerDto[];
}

export class DeleteMessageDto {
  @ApiProperty() message: string;
}