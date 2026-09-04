import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 12, description: 'Total number of audits performed' })
  totalAudits: number;

  @ApiProperty({ example: 150000, description: 'Total projected annual recovery value' })
  activeRecovery: number;

  @ApiProperty({ example: 12.4, description: 'Average efficiency gain percentage' })
  efficiencyGain: number;

  @ApiProperty({ example: '2026-04-20', description: 'Recommended date for next audit cycle' })
  nextAuditDate: string;
}

export class SavedAuditDto {
  @ApiProperty({ example: 'uuid-1234', description: 'Unique audit session ID' })
  id: string;

  @ApiProperty({ example: '2026-02-03T10:00:00Z', description: 'Date of audit creation' })
  date: string;

  @ApiProperty({ example: 'LONG_FORM', description: 'Type of audit performed' })
  type: string;

  @ApiProperty({ example: 'Hospitality', description: 'Sector name' })
  sector: string;

  @ApiProperty({ 
    example: { capacityDrain: 25, annualRecovery: 12000, impactScore: 65 }, 
    description: 'Key calculated metrics' 
  })
  metrics: {
    capacityDrain: number;
    annualRecovery: number;
    impactScore: number;
  };

  @ApiProperty({ example: 'completed', description: 'Status of the audit' })
  status: string;
}

export class DashboardResponseDto {
  @ApiProperty({ example: 'John', description: 'User first name' })
  userName: string;

  @ApiProperty({ example: 12, description: 'Current vault token balance' })
  tokenBalance: number;

  @ApiProperty({ example: 'I recommend the Inventory Rotation Engine', description: 'Dynamic AI suggestion' })
  aiAdvisorSuggestion: string;

  @ApiProperty({ type: DashboardStatsDto })
  stats: DashboardStatsDto;

  @ApiProperty({ type: [SavedAuditDto] })
  recentAudits: SavedAuditDto[];
}
