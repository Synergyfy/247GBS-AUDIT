export interface KeyMetric {
  label: string;
  value: string;
  color?: string;
}

export interface Trajectory {
  dataPoints: number[];
}

export interface EfficiencyBreakdownItem {
  label: string;
  value: number;
  color?: string;
}

export interface IntelligenceResponse {
  strategicInsight: string;
  keyMetrics: KeyMetric[];
  trajectory: Trajectory;
  efficiencyBreakdown: EfficiencyBreakdownItem[];
  maxRecoveryTarget: number;
  marketRank: number;
}

export default IntelligenceResponse;
