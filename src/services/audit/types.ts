export interface AuditCalculatedMetrics {
  capacityDrainPct: number;
  annualRecovery: number;
}

export interface AuditResponseItem {
  id: string;
  status: string;
  auditType: string;
  sectorId: string;
  createdAt: string;
  calculatedMetrics: AuditCalculatedMetrics;
}

// Mapped shape used by the UI (keeps compatibility with existing page)
export interface SavedAudit {
  id: string;
  date: string;
  type: string;
  sector: string;
  metrics: {
    capacityDrain: number;
    annualRecovery: number;
  };
  status?: string;
}

export type AuditListResponse = AuditResponseItem[];

export interface VaultStats {
  totalDataPoints: number;
  efficiencyTrend: string;
  archivalIntegrity: string;
}

export default AuditResponseItem;
