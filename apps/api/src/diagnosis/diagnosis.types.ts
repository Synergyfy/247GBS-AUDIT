/**
 * Admin-configurable diagnosis + recommendation model.
 *
 * The same shape is stored in `audit_forms.settings.diagnosis` and
 * `triage_forms.settings.diagnosis`, edited from the admin builders, and
 * evaluated server-side after submission.
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
  /** Stable key used by rules, e.g. `operations`. */
  key: string;
  label: string;
  /** Relative contribution to the overall score (default 1). */
  weight?: number;
  /** Audit question `category` values that belong to this category. */
  questionCategories?: string[];
  /** Fallback: keywords matched against the question text (pre-audit). */
  keywords?: string[];
}

export interface DiagnosisCondition {
  /** `category` compares a scored category; `answer` compares a raw answer. */
  source: 'category' | 'answer';
  /** Category key or question id. */
  key: string;
  operator: DiagnosisOperator;
  value: string | number | boolean;
}

export interface RecommendationRule {
  id: string;
  title: string;
  /** "Why it matters" narrative. */
  summary: string;
  /** "What should happen next". */
  action: string;
  priority: DiagnosisPriority;
  /** MCOM capability/service ids this recommendation maps to. */
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

export type HealthRating = 'excellent' | 'good' | 'average' | 'poor' | 'critical';
export type SeverityLevel = 'high' | 'medium' | 'low';
export type PriorityLevel = 'immediate' | 'medium' | 'long-term';

export interface DiagnosisHealthCategory {
  id: string;
  name: string;
  rating: HealthRating;
  score: number;
  explanation: string;
  impact: string[];
}

export interface DiagnosisStrength {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
}

export interface DiagnosisChallenge {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
}

export interface DiagnosisOpportunity {
  id: string;
  title: string;
  currentSituation: string;
  potentialOutcome: string;
  businessBenefit: string;
}

export interface DiagnosisPriorityItem {
  id: string;
  title: string;
  description: string;
  level: PriorityLevel;
}

export interface DiagnosisRisk {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  potentialImpact: string;
  urgency: string;
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
  healthCategories: DiagnosisHealthCategory[];
  strengths: DiagnosisStrength[];
  challenges: DiagnosisChallenge[];
  opportunities: DiagnosisOpportunity[];
  priorities: DiagnosisPriorityItem[];
  risks: DiagnosisRisk[];
  readiness: { status: string; explanation: string };
  whatWeFound: string;
  completedAt: string;
  recommendations: DiagnosisRecommendation[];
  mcomServiceMapping: { issue: string; serviceId: string; serviceName: string }[];
  configSource: 'admin' | 'default';
}

export interface DiagnosisAnswerInput {
  questionId: string;
  questionText?: string;
  category?: string | null;
  /** Selected numeric score, option text, or array of option texts. */
  value?: unknown;
  optionTexts?: string[];
  /** Option labels the respondent actually selected (choice questions). */
  selectedTexts?: string[];
  /** Max score this question can award (used to normalise 0-100). */
  scoreMax?: number;
  /**
   * Whether a higher answer score means a healthier business. The admin
   * builder's defaults (10 = optimal) use `higher`; legacy seeded 1-3 risk
   * scales use `lower`.
   */
  scoreDirection?: 'higher' | 'lower';
}

export interface McomServiceDefinition {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  capabilities: string[];
}

export const DEFAULT_THRESHOLDS: DiagnosisThresholds = {
  excellent: 80,
  good: 60,
  average: 40,
  poor: 20,
};
