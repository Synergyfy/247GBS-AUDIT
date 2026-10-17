import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export const AUDIT_FORM_TYPES = ['SHORT_FORM', 'LONG_FORM'] as const;
export type AuditFormType = (typeof AUDIT_FORM_TYPES)[number];

export class CreateAuditFormDto {
  @ApiProperty({ description: 'Name of the audit template' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiProperty({ enum: AUDIT_FORM_TYPES, default: 'SHORT_FORM' })
  @IsEnum(AUDIT_FORM_TYPES)
  auditType: AuditFormType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  sectorId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  sectorName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  categoryName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  subcategoryId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  subcategoryName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateAuditFormDto extends PartialType(CreateAuditFormDto) {
  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateAuditFormQuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional({ default: 'single_choice' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  hint?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAuditFormQuestionDto extends PartialType(CreateAuditFormQuestionDto) {}

export class CreateAuditFormAnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  scoreImpact?: number | null;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAuditFormAnswerDto extends PartialType(CreateAuditFormAnswerDto) {}

export class AuditFormAnswerDto {
  @ApiProperty() id: string;
  @ApiProperty() questionId: string;
  @ApiProperty() text: string;
  @ApiPropertyOptional({ nullable: true }) scoreImpact?: number | null;
  @ApiProperty() sortOrder: number;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
}

export class AuditFormQuestionDto {
  @ApiProperty() id: string;
  @ApiProperty() formId: string;
  @ApiProperty() text: string;
  @ApiProperty() type: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ nullable: true }) hint: string | null;
  @ApiProperty() required: boolean;
  @ApiProperty({ nullable: true }) category: string | null;
  @ApiProperty() config: Record<string, any>;
  @ApiProperty() order: number;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ type: [AuditFormAnswerDto] }) answers: AuditFormAnswerDto[];
  @ApiProperty() createdAt: Date;
}

export class AuditFormDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ enum: AUDIT_FORM_TYPES }) auditType: AuditFormType;
  @ApiProperty({ nullable: true }) slug: string | null;
  @ApiProperty() isDefault: boolean;
  @ApiProperty() status: string;
  @ApiProperty({ nullable: true }) sectorId?: string | null;
  @ApiProperty({ nullable: true }) sectorName?: string | null;
  @ApiProperty({ nullable: true }) categoryId?: string | null;
  @ApiProperty({ nullable: true }) categoryName?: string | null;
  @ApiProperty({ nullable: true }) subcategoryId?: string | null;
  @ApiProperty({ nullable: true }) subcategoryName?: string | null;
  @ApiPropertyOptional() questionCount?: number;
  @ApiPropertyOptional({ type: [AuditFormQuestionDto] }) questions?: AuditFormQuestionDto[];
  @ApiProperty() settings: Record<string, any>;
  @ApiProperty({ nullable: true }) publishedAt: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
