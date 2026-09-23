import { ApiProperty } from '@nestjs/swagger';

export class AuditVaultStatsDto {
  @ApiProperty({ example: 1200, description: 'Total number of forensic data points across all audits' })
  totalDataPoints: number;

  @ApiProperty({ example: '+14.2%', description: 'Efficiency trend compared to previous period' })
  efficiencyTrend: string;

  @ApiProperty({ example: '100%', description: 'Archival integrity score' })
  archivalIntegrity: string;
}
