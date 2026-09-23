import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PreAuditStepDto {
  @ApiProperty({ description: 'A question the user actually reached and answered.' })
  @IsUUID(undefined, { message: 'questionId must be a valid question id.' })
  questionId: string;

  @ApiPropertyOptional({
    description: 'Selected option ids for choice-based answers (single_choice, multiple_choice, checkbox, dropdown, yes_no).',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionIds?: string[];

  @ApiPropertyOptional({
    description: 'Typed value for option-less answers (string/number/file metadata array).',
  })
  @IsOptional()
  value?: any;
}

export class SubmitPreAuditDto {
  @ApiPropertyOptional({ description: 'Optional email recorded with the submission.' })
  @IsOptional()
  @IsEmail({}, { message: 'A valid email address is required when provided.' })
  @MaxLength(254)
  email?: string | null;

  @ApiProperty({
    description: 'Ordered sequence of questions answered, starting from the current start question.',
    type: [PreAuditStepDto],
  })
  @IsArray()
  @IsNotEmpty({ message: 'At least one answered step is required.' })
  @ValidateNested({ each: true })
  @Type(() => PreAuditStepDto)
  steps: PreAuditStepDto[];

  @ApiProperty({
    description: 'Explicit consent to save and process the supplied answers. Required before the pre-audit is stored server-side.',
  })
  @IsBoolean({ message: 'consentGranted must be a boolean.' })
  consentGranted: boolean;

  @ApiPropertyOptional({ description: 'Consent text version the visitor agreed to. Defaults to "1".' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  consentVersion?: string;
}

export class PreAuditSubmissionResultDto {
  @ApiProperty() id: string;
  @ApiProperty({ nullable: true }) email: string | null;
  @ApiProperty({ enum: ['SHORT_FORM', 'LONG_FORM', 'NONE'], nullable: true }) recommendedAuditType: string | null;
  @ApiProperty({ nullable: true }) destinationType: string | null;
  @ApiProperty({ nullable: true }) destinationTarget: string | null;
  @ApiProperty({ nullable: true }) consentGrantedAt: string | null;
  @ApiProperty() answeredCount: number;
  @ApiProperty({ description: 'True when this submission is a duplicate of an earlier one.' }) isDuplicate: boolean;
}