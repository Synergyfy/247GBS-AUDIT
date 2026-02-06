export type AdminStat = {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  bg?: string;
  icon?: any;
};

export type AdminActivity = {
  user: string;
  action: string;
  target?: string;
  time: string;
  color?: string;
  icon?: any;
};

export type AuditTrend = {
  month: string;
  count: number;
};

export type AdminDashboardResponse = {
  stats: AdminStat[];
  activities: AdminActivity[];
  auditTrends: AuditTrend[];
};

export default AdminDashboardResponse;
