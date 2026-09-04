import { ApiProperty } from '@nestjs/swagger';

export class IntelligenceMetricDto {
  @ApiProperty({ example: 'Confidence', description: 'Label for the metric' })
  label: string;

  @ApiProperty({ example: '94%', description: 'Value of the metric' })
  value: string;

  @ApiProperty({ example: 'orange', description: 'Color coding for UI' })
  color: string;
}

export class EfficiencyCategoryDto {
  @ApiProperty({ example: 'Idle Staff Capacity', description: 'Category name' })
  label: string;

  @ApiProperty({ example: 65, description: 'Percentage value' })
  value: number;

  @ApiProperty({ example: 'bg-orange-500', description: 'Color class for UI' })
  color: string;
}

export class RecoveryTrajectoryDto {
  @ApiProperty({ example: [40, 60, 45, 70], description: 'Monthly recovery values' })
  dataPoints: number[];
}

export class IntelligenceResponseDto {
  @ApiProperty({ example: 'Aggregated data suggests...', description: 'AI-generated strategic insight' })
  strategicInsight: string;

  @ApiProperty({ type: [IntelligenceMetricDto] })
  keyMetrics: IntelligenceMetricDto[];

  @ApiProperty({ type: RecoveryTrajectoryDto })
  trajectory: RecoveryTrajectoryDto;

  @ApiProperty({ type: [EfficiencyCategoryDto] })
  efficiencyBreakdown: EfficiencyCategoryDto[];

  @ApiProperty({ example: 150000, description: 'Maximum estimated recovery target' })
  maxRecoveryTarget: number;

  @ApiProperty({ example: 12, description: 'Market sector rank (lower is better)' })
  marketRank: number;
}
