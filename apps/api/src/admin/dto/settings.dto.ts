import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: '247GBS Audit', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  platformName?: string;

  @ApiPropertyOptional({ example: 'support@247gbs.com', maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  supportEmail?: string;

  @ApiPropertyOptional({ example: 'Find and fix what limits your business', maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  landingTitle?: string;

  @ApiPropertyOptional({ example: 'A guided audit that turns hidden losses into a growth plan.', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  landingSubtitle?: string;

  @ApiPropertyOptional({ example: 'Start your audit', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  landingCtaLabel?: string;

  @ApiPropertyOptional({ example: '/audit/pre-audit/flow', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  landingCtaHref?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  landingShowPreAudit?: boolean;
}

export class CreateHelpResourceDto {
  @ApiProperty({ example: 'Talk to an advisor', maxLength: 120 })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiPropertyOptional({ example: 'Get a direct conversation with our team.', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: ['support', 'service', 'funding', 'guide'], default: 'support' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @ApiPropertyOptional({ example: '/support', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  href?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateHelpResourceDto {
  @ApiPropertyOptional({ example: 'Talk to an advisor', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: ['support', 'service', 'funding', 'guide'] })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  href?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}