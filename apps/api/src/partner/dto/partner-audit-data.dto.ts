import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PreAuditDiagnosticSummary } from '../../triage/pre-audit-calculator';

export class PartnerPreAuditResponseDto {
  @ApiProperty({
    example: true,
    description:
      'Whether a completed, consenting pre-audit exists for the delegated user.',
  })
  available: boolean;

  @ApiPropertyOptional({
    enum: ['no_email', 'no_pre_audit'],
    description: 'Present only when `available` is false.',
  })
  reason?: 'no_email' | 'no_pre_audit';

  @ApiPropertyOptional({ example: 'uuid-pre-1' })
  id?: string;

  @ApiPropertyOptional({ example: 'LONG_FORM', nullable: true })
  recommendedAuditType?: string | null;

  @ApiPropertyOptional({ example: 'LONG_FORM', nullable: true })
  destinationType?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  destinationTarget?: string | null;

  @ApiPropertyOptional({
    example: '1',
    description: 'Consent version recorded at submission.',
  })
  consentVersion?: string;

  @ApiPropertyOptional({ example: '2026-02-03T10:00:00.000Z', nullable: true })
  completedAt?: string | null;

  @ApiPropertyOptional({
    type: Object,
    description:
      'Server-computed pre-audit diagnostic (funding need/gap, operations, readiness, recommendation).',
  })
  diagnosticSummary?: PreAuditDiagnosticSummary;
}

export class PartnerAuditMetricsDto {
  @ApiProperty({ example: 25 })
  capacityDrainPct: number;

  @ApiProperty({ example: 15000 })
  totalStockImpact: number;

  @ApiProperty({ example: 12000 })
  annualRecovery: number;

  @ApiProperty({ example: 65 })
  impactScore: number;
}

export class PartnerAuditSummaryDto {
  @ApiProperty({ example: 'uuid-audit-1' })
  id: string;

  @ApiProperty({ example: 'COMPLETED' })
  status: string;

  @ApiProperty({ example: 'LONG_FORM', nullable: true })
  auditType: string | null;

  @ApiProperty({ example: ['EXCESS_STOCK'], type: [String] })
  scopes: string[];

  @ApiProperty({ example: 'retail-wholesale', nullable: true })
  sectorId: string | null;

  @ApiProperty({ example: 'inventory', nullable: true })
  groupId: string | null;

  @ApiProperty({ example: 'warehouse', nullable: true })
  businessTypeId: string | null;

  @ApiProperty({ example: 'uuid-pre-1', nullable: true })
  preAuditSessionId: string | null;

  @ApiPropertyOptional({ type: PartnerAuditMetricsDto, nullable: true })
  calculatedMetrics: PartnerAuditMetricsDto | null;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    description: 'AI-generated strategic insight, when one has been produced.',
  })
  aiInsight: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-02-03T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-02-04T11:30:00.000Z' })
  updatedAt: string;
}

export class PartnerAuditsResponseDto {
  @ApiProperty({ example: true })
  available: boolean;

  @ApiPropertyOptional({
    enum: ['no_email', 'no_pre_audit', 'consent_required'],
    description: 'Present only when `available` is false.',
  })
  reason?: 'no_email' | 'no_pre_audit' | 'consent_required';

  @ApiProperty({ example: 2 })
  count: number;

  @ApiProperty({ type: [PartnerAuditSummaryDto] })
  audits: PartnerAuditSummaryDto[];
}

export class PartnerSummaryResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether any pre-audit or audit data is available.',
  })
  available: boolean;

  @ApiProperty({ type: PartnerPreAuditResponseDto })
  preAudit: PartnerPreAuditResponseDto;

  @ApiProperty({ type: PartnerAuditsResponseDto })
  audits: PartnerAuditsResponseDto;
}
