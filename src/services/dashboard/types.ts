export interface DashboardStats {
  totalAudits: number;
  activeRecovery: number;
  efficiencyGain: number;
  nextAuditDate: string;
}

export interface AuditMetrics {
  capacityDrain: number;
  annualRecovery: number;
  impactScore?: number;
}

export interface SavedAudit {
  id: string;
  date: string;
  type: string;
  sector: string;
  metrics: AuditMetrics;
  status: string;
}

export interface DashboardResponse {
  userName: string;
  tokenBalance: number;
  aiAdvisorSuggestion: string;
  stats: DashboardStats;
  recentAudits: SavedAudit[];
}

export default DashboardResponse;
