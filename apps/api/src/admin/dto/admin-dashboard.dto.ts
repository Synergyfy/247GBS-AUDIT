import { ApiProperty } from '@nestjs/swagger';

export class AdminStatItemDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  change: string;

  @ApiProperty({ enum: ['up', 'down', 'neutral'] })
  trend: 'up' | 'down' | 'neutral';

  @ApiProperty()
  color: string;

  @ApiProperty()
  bg: string;
}

export class AdminActivityItemDto {
  @ApiProperty()
  user: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  target: string;

  @ApiProperty()
  time: string;

  @ApiProperty()
  color: string;
}

export class AdminAuditTrendDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  count: number;
}

export class AdminAuditItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  company: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  stage: string;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  dueDate: string;

  @ApiProperty()
  assignee: string;
}

export class AdminAuditMetricsDto {
  @ApiProperty()
  totalActive: number;

  @ApiProperty()
  overdue: number;

  @ApiProperty()
  inReview: number;

  @ApiProperty()
  completedThisMonth: number;
}

export class AdminUserItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  joinDate: string;

  @ApiProperty()
  avatar: string;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: [AdminStatItemDto] })
  stats: AdminStatItemDto[];

  @ApiProperty({ type: [AdminActivityItemDto] })
  activities: AdminActivityItemDto[];

  @ApiProperty({ type: [AdminAuditTrendDto] })
  auditTrends: AdminAuditTrendDto[];
}
