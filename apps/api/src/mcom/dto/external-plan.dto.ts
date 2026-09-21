import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ExternalPlanQuotasDto {
  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  maxProducts?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  maxPoints?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  customFeatures?: boolean;
}

export class CreateExternalPlanDto {
  @ApiProperty({ example: 'Standard Plan' })
  @IsString()
  name: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  monthlyPrice: number;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  annualPrice: number;

  @ApiProperty({ type: [String], example: ['Feature 1', 'Feature 2'] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiPropertyOptional({ example: 'tier-1' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional({ type: ExternalPlanQuotasDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExternalPlanQuotasDto)
  quotas?: ExternalPlanQuotasDto;
}

export class UpdateExternalPlanDto {
  @ApiPropertyOptional({ example: 'Standard Plan' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 29.99 })
  @IsOptional()
  @IsNumber()
  monthlyPrice?: number;

  @ApiPropertyOptional({ example: 299.99 })
  @IsOptional()
  @IsNumber()
  annualPrice?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ type: ExternalPlanQuotasDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExternalPlanQuotasDto)
  quotas?: ExternalPlanQuotasDto;
}

export class ExternalPlanResponseDto {
  @ApiProperty({ example: 'tier-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Standard Plan' })
  @IsString()
  name: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  monthlyPrice: number;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  annualPrice: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({ type: ExternalPlanQuotasDto })
  @ValidateNested()
  @Type(() => ExternalPlanQuotasDto)
  quotas: ExternalPlanQuotasDto;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: '2026-09-18T10:00:00.000Z' })
  @IsString()
  createdAt: string;

  @ApiProperty({ example: '2026-09-18T10:00:00.000Z' })
  @IsString()
  updatedAt: string;
}