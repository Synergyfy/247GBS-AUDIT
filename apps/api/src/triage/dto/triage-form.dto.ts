import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { TriageQuestionItemDto } from './triage-question.dto';

export const TRIAGE_FORM_SETTINGS_KEYS = [
  'acceptResponses',
  'collectEmail',
  'requireEmail',
  'allowEditing',
  'showProgressBar',
  'showConfirmation',
  'confirmationMessage',
] as const;

export type TriageFormSettingsKey = (typeof TRIAGE_FORM_SETTINGS_KEYS)[number];

export class TriageFormSettingsDto {
  @ApiPropertyOptional({ default: true, description: 'Accept new submissions from the public responder.' })
  @IsOptional()
  @IsBoolean()
  acceptResponses?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Ask the respondent for an email address.' })
  @IsOptional()
  @IsBoolean()
  collectEmail?: boolean;

  @ApiPropertyOptional({ default: false, description: 'Require the email when collecting it.' })
  @IsOptional()
  @IsBoolean()
  requireEmail?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Let respondents change earlier answers before submitting.' })
  @IsOptional()
  @IsBoolean()
  allowEditing?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Show the progress bar in the responder.' })
  @IsOptional()
  @IsBoolean()
  showProgressBar?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Show a confirmation screen after submitting.' })
  @IsOptional()
  @IsBoolean()
  showConfirmation?: boolean;

  @ApiPropertyOptional({ default: '', description: 'Custom confirmation message shown after submitting.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  confirmationMessage?: string;
}

export class UpdateTriageFormDto {
  @ApiPropertyOptional({ default: 'Business Triage' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Short description shown above the first question.', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({ type: TriageFormSettingsDto })
  @IsOptional()
  @IsObject()
  settings?: TriageFormSettingsDto;
}

export class TriageFormDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ nullable: true }) slug: string | null;
  @ApiProperty({ default: 'draft', enum: ['draft', 'published'] }) status: string;
  @ApiProperty({ type: Object }) settings: Record<string, any>;
  @ApiProperty({ nullable: true }) publishedAt: string | null;
}

export class PublishTriageFormResultDto {
  @ApiProperty() id: string;
  @ApiProperty({ default: 'draft', enum: ['draft', 'published'] }) status: string;
  @ApiProperty({ nullable: true }) slug: string | null;
  @ApiProperty({ description: 'The public responder URL.', nullable: true }) publicUrl: string | null;
  @ApiProperty({ nullable: true }) publishedAt: string | null;
}

export class PublishValidationIssueDto {
  @ApiProperty() message: string;
}

export class PublishValidationResultDto {
  @ApiProperty() ok: boolean;
  @ApiProperty({ type: [PublishValidationIssueDto] }) issues: PublishValidationIssueDto[];
  @ApiProperty({ type: [PublishValidationIssueDto] }) warnings: PublishValidationIssueDto[];
}

// ============================================================
// Responses
// ============================================================

export class TriageResponseStepDto {
  @ApiProperty() questionId: string;
  @ApiProperty() questionText: string;
  @ApiProperty({ type: [String] }) answerTexts: string[];
  @ApiPropertyOptional() value?: any;
  @ApiProperty({ nullable: true }) nextQuestionId: string | null;
  @ApiProperty({ nullable: true }) destinationType: string | null;
  @ApiProperty({ nullable: true }) destinationTarget: string | null;
  @ApiProperty({ nullable: true }) auditType: string | null;
}

export class TriageResponseSummaryDto {
  @ApiProperty() id: string;
  @ApiProperty({ nullable: true }) email: string | null;
  @ApiProperty({ nullable: true }) recommendedAuditType: string | null;
  @ApiProperty({ nullable: true }) destinationType: string | null;
  @ApiProperty({ nullable: true }) destinationTarget: string | null;
  @ApiProperty() answeredCount: number;
  @ApiProperty({ nullable: true }) completedAt: string | null;
  @ApiProperty() createdAt: string;
}

export class TriageResponsesOverviewDto {
  @ApiProperty({ description: 'Total stored submissions (deduplicated by fingerprint).' }) total: number;
  @ApiProperty() withEmail: number;
  @ApiProperty() uniqueEmails: number;
  @ApiProperty() submittedToday: number;
  @ApiProperty({ type: Object }) byAuditType: Record<string, number>;
  @ApiProperty({ type: Object }) byDestination: Record<string, number>;
  @ApiProperty({ type: [TriageResponseSummaryDto] }) recent: TriageResponseSummaryDto[];
}

export class TriageResponseDetailDto {
  @ApiProperty() id: string;
  @ApiProperty({ nullable: true }) email: string | null;
  @ApiProperty({ nullable: true }) recommendedAuditType: string | null;
  @ApiProperty({ nullable: true }) destinationType: string | null;
  @ApiProperty({ nullable: true }) destinationTarget: string | null;
  @ApiProperty() answeredCount: number;
  @ApiProperty({ type: [TriageResponseStepDto] }) steps: TriageResponseStepDto[];
  @ApiProperty({ nullable: true }) consentGrantedAt: string | null;
  @ApiProperty() consentVersion: string;
  @ApiProperty({ nullable: true }) completedAt: string | null;
  @ApiProperty() createdAt: string;
}

// ============================================================
// Public responder
// ============================================================

export class PublicTriageFormDto {
  @ApiProperty() title: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ default: 'published', enum: ['draft', 'published'] }) status: string;
  @ApiProperty({ description: 'Only the settings the responder needs.' }) settings: Record<string, any>;
  @ApiProperty({ type: TriageQuestionItemDto, nullable: true }) startQuestion: TriageQuestionItemDto | null;
}