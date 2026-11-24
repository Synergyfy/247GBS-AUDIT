/**
 * Client mirror of the server's admin-configurable diagnosis model.
 * Kept structurally identical to `apps/api/src/diagnosis/diagnosis.types.ts`.
 */

export type DiagnosisPriority = 'high' | 'medium' | 'low';
export type DiagnosisOperator =
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'eq'
  | 'neq'
  | 'includes'
  | 'not_includes';

export interface DiagnosisCategoryConfig {
  key: string;
  label: string;
  weight?: number;
  questionCategories?: string[];
  keywords?: string[];
}

export interface DiagnosisCondition {
  source: 'category' | 'answer';
  key: string;
  operator: DiagnosisOperator;
  value: string | number | boolean;
}

export interface RecommendationRule {
  id: string;
  title: string;
  summary: string;
  action: string;
  priority: DiagnosisPriority;
  serviceIds: string[];
  match?: 'all' | 'any';
  conditions: DiagnosisCondition[];
  isActive?: boolean;
}

export interface DiagnosisThresholds {
  excellent: number;
  good: number;
  average: number;
  poor: number;
}

export interface DiagnosisConfig {
  enabled?: boolean;
  categories: DiagnosisCategoryConfig[];
  rules: RecommendationRule[];
  thresholds?: DiagnosisThresholds;
}

export interface McomService {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  capabilities: string[];
}

export interface DiagnosisRecommendation {
  id: string;
  businessIssue: string;
  priority: DiagnosisPriority;
  summary: string;
  action: string;
  serviceIds: string[];
  services: { id: string; name: string; category: string }[];
}

export interface DiagnosisResult {
  overallScore: number;
  overallStatus: 'healthy' | 'needs-attention' | 'critical' | 'growth-ready';
  executiveSummary: string;
  healthCategories: Array<{
    id: string;
    name: string;
    rating: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
    score: number;
    explanation: string;
    impact: string[];
  }>;
  strengths: Array<{ id: string; title: string; description: string; whyItMatters: string }>;
  challenges: Array<{ id: string; title: string; description: string; severity: 'high' | 'medium' | 'low' }>;
  opportunities: Array<{
    id: string;
    title: string;
    currentSituation: string;
    potentialOutcome: string;
    businessBenefit: string;
  }>;
  priorities: Array<{ id: string; title: string; description: string; level: string }>;
  risks: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
    potentialImpact: string;
    urgency: string;
  }>;
  readiness: { status: string; explanation: string };
  whatWeFound: string;
  completedAt: string;
  recommendations: DiagnosisRecommendation[];
  mcomServiceMapping: { issue: string; serviceId: string; serviceName: string }[];
  configSource: 'admin' | 'default';
}

export const EMPTY_DIAGNOSIS_CONFIG: DiagnosisConfig = {
  enabled: true,
  categories: [],
  rules: [],
  thresholds: { excellent: 80, good: 60, average: 40, poor: 20 },
};

export function newRule(index: number): RecommendationRule {
  return {
    id: `rule-${Date.now()}-${index}`,
    title: '',
    summary: '',
    action: '',
    priority: 'medium',
    serviceIds: [],
    match: 'all',
    conditions: [{ source: 'category', key: '', operator: 'lt', value: 50 }],
    isActive: true,
  };
}

export function newCategory(index: number): DiagnosisCategoryConfig {
  return {
    key: `category-${index + 1}`,
    label: `Category ${index + 1}`,
    weight: 1,
    questionCategories: [],
    keywords: [],
  };
}
