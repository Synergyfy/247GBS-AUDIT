import { Injectable } from '@nestjs/common';
import {
  DEFAULT_THRESHOLDS,
  DiagnosisAnswerInput,
  DiagnosisCategoryConfig,
  DiagnosisChallenge,
  DiagnosisCondition,
  DiagnosisConfig,
  DiagnosisHealthCategory,
  DiagnosisOpportunity,
  DiagnosisPriorityItem,
  DiagnosisPriority,
  DiagnosisRecommendation,
  DiagnosisResult,
  DiagnosisRisk,
  DiagnosisStrength,
  HealthRating,
  PriorityLevel,
  RecommendationRule,
  SeverityLevel,
} from './diagnosis.types';
import { getMcomService, MCOM_SERVICES } from './mcom-services.catalog';

const DEFAULT_CATEGORIES: DiagnosisCategoryConfig[] = [
  {
    key: 'operations',
    label: 'Operations & Capacity',
    weight: 1,
    questionCategories: ['Operations', 'Spare Capacity', 'SPARE_CAPACITY'],
    keywords: ['capacity', 'idle', 'staff', 'equipment', 'utilisation', 'utilization', 'spare'],
  },
  {
    key: 'inventory',
    label: 'Inventory & Stock',
    weight: 1,
    questionCategories: ['Inventory', 'Excess Stock', 'EXCESS_STOCK'],
    keywords: ['stock', 'inventory', 'warehouse', 'storage', 'slow-moving'],
  },
  {
    key: 'marketing',
    label: 'Marketing & Visibility',
    weight: 1,
    questionCategories: ['Marketing', 'MARKETING'],
    keywords: ['marketing', 'campaign', 'advert', 'visibility', 'channel', 'outreach'],
  },
  {
    key: 'customers',
    label: 'Customers & Retention',
    weight: 1,
    questionCategories: ['Customers', 'CUSTOMERS'],
    keywords: ['customer', 'retention', 'loyalty', 'repeat', 'satisfaction'],
  },
  {
    key: 'technology',
    label: 'Technology & Systems',
    weight: 1,
    questionCategories: ['Technology', 'TECHNOLOGY'],
    keywords: ['technology', 'software', 'digital', 'automation', 'system', 'online'],
  },
  {
    key: 'finance',
    label: 'Finance & Profitability',
    weight: 1,
    questionCategories: ['Finance', 'FINANCE'],
    keywords: ['finance', 'profit', 'margin', 'cash', 'turnover', 'cost', 'funding'],
  },
  {
    key: 'growth',
    label: 'Growth & Strategy',
    weight: 1,
    questionCategories: ['Growth', 'Strategy'],
    keywords: ['growth', 'expand', 'planning', 'new customer', 'market'],
  },
];

const DEFAULT_RULES: RecommendationRule[] = [
  {
    id: 'rule-capacity',
    title: 'Unlock underused capacity',
    summary:
      'Your operations score suggests capacity, staff hours or equipment are not being fully monetised.',
    action:
      'Run a capacity audit, package the spare capacity and activate it through the Spare Capacity Programme.',
    priority: 'high',
    serviceIds: ['spare-capacity-programme', 'account-manager'],
    conditions: [{ source: 'category', key: 'operations', operator: 'lt', value: 50 }],
    match: 'all',
  },
  {
    id: 'rule-stock',
    title: 'Release working capital tied up in stock',
    summary:
      'Stock levels are likely absorbing cash and storage space that could fund growth.',
    action:
      'Classify and value slow-moving stock, then clear it through the Excess Stock Programme while protecting margin.',
    priority: 'high',
    serviceIds: ['excess-stock-programme', 'cash-flow-management'],
    conditions: [{ source: 'category', key: 'inventory', operator: 'lt', value: 50 }],
    match: 'all',
  },
  {
    id: 'rule-marketing',
    title: 'Build a predictable acquisition engine',
    summary:
      'Marketing activity is not yet translating into a reliable customer pipeline.',
    action:
      'Set up consistent campaigns and channels with Marketing Automation, then measure cost per acquisition.',
    priority: 'medium',
    serviceIds: ['marketing-automation', 'gbs-expo'],
    conditions: [{ source: 'category', key: 'marketing', operator: 'lt', value: 50 }],
    match: 'all',
  },
  {
    id: 'rule-retention',
    title: 'Increase repeat purchases and lifetime value',
    summary:
      'Customer retention and loyalty are below where they should be for sustainable growth.',
    action:
      'Launch a structured loyalty and rewards programme and track repeat-purchase rate as the primary KPI.',
    priority: 'medium',
    serviceIds: ['rewards-loyalty', 'marketing-automation'],
    conditions: [{ source: 'category', key: 'customers', operator: 'lt', value: 50 }],
    match: 'all',
  },
  {
    id: 'rule-technology',
    title: 'Digitise manual processes',
    summary:
      'Manual systems are limiting visibility and consuming time that should go into growth.',
    action:
      'Map the highest-friction processes, select the right tools and phase in Digital Transformation.',
    priority: 'medium',
    serviceIds: ['digital-transformation', 'mcom-mall'],
    conditions: [{ source: 'category', key: 'technology', operator: 'lt', value: 50 }],
    match: 'all',
  },
  {
    id: 'rule-finance',
    title: 'Stabilise cash flow and funding readiness',
    summary:
      'Financial management and cash-flow visibility need attention before the business can scale safely.',
    action:
      'Introduce a cash-flow forecast, review margins and prepare a funding case with Cash-Flow Management and Funding Readiness.',
    priority: 'high',
    serviceIds: ['cash-flow-management', 'funding-readiness'],
    conditions: [{ source: 'category', key: 'finance', operator: 'lt', value: 50 }],
    match: 'all',
  },
  {
    id: 'rule-growth',
    title: 'Prepare the next stage of growth',
    summary:
      'Growth planning and market readiness are still developing, which limits expansion options.',
    action:
      'Clarify the growth route and build the operating capability to execute it with Business Mentoring.',
    priority: 'low',
    serviceIds: ['business-mentoring', 'international-expansion'],
    conditions: [{ source: 'category', key: 'growth', operator: 'lt', value: 50 }],
    match: 'all',
  },
];

export const DEFAULT_DIAGNOSIS_CONFIG: DiagnosisConfig = {
  enabled: true,
  categories: DEFAULT_CATEGORIES,
  rules: DEFAULT_RULES,
  thresholds: DEFAULT_THRESHOLDS,
};

const PRIORITY_ORDER: Record<DiagnosisPriority, number> = { high: 0, medium: 1, low: 2 };

function clamp(n: number, min = 0, max = 100): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function stringOf(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(stringOf).join(' ');
  return String(value);
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    if (Number.isFinite(parsed) && value.trim() !== '') return parsed;
  }
  return null;
}

function sentimentScore(text: string): number {
  const t = text.toLowerCase();
  if (!t.trim()) return 50;
  const positive = /(yes|good|strong|excellent|increas|profit|active|high|always|ready|dedicated|automated|weekly)/;
  const negative = /(no\b|poor|weak|declin|none|low|never|serious|critical|blocked|not sure|not-sure|manual|paper)/;
  if (negative.test(t) && !positive.test(t)) return 20;
  if (positive.test(t) && !negative.test(t)) return 80;
  return 50;
}

function normaliseValue(input: DiagnosisAnswerInput): number {
  const direction = input.scoreDirection === 'lower' ? 'lower' : 'higher';
  const value = input.value;
  const numeric = asNumber(value);

  if (numeric !== null) {
    const normalised =
      input.scoreMax && input.scoreMax > 0
        ? clamp((numeric / input.scoreMax) * 100)
        : clamp(numeric);
    return direction === 'lower' ? clamp(100 - normalised) : normalised;
  }

  const text = stringOf(value) || (input.optionTexts ?? []).join(' ');
  const sentiment = sentimentScore(text);
  return direction === 'lower' ? clamp(100 - sentiment) : sentiment;
}

function ratingFor(score: number, thresholds: DiagnosisConfig['thresholds']): HealthRating {
  const t = thresholds ?? DEFAULT_THRESHOLDS;
  if (score >= t.excellent) return 'excellent';
  if (score >= t.good) return 'good';
  if (score >= t.average) return 'average';
  if (score >= t.poor) return 'poor';
  return 'critical';
}

function severityFor(score: number, thresholds: DiagnosisConfig['thresholds']): SeverityLevel {
  const rating = ratingFor(score, thresholds);
  if (rating === 'critical' || rating === 'poor') return 'high';
  if (rating === 'average') return 'medium';
  return 'low';
}

function priorityLevelFor(score: number, thresholds: DiagnosisConfig['thresholds']): PriorityLevel {
  const severity = severityFor(score, thresholds);
  if (severity === 'high') return 'immediate';
  if (severity === 'medium') return 'medium';
  return 'long-term';
}

function normaliseCategory(raw: Partial<DiagnosisCategoryConfig>, index: number): DiagnosisCategoryConfig {
  const key = (raw.key || `category-${index + 1}`).trim();
  return {
    key,
    label: (raw.label || key).trim(),
    weight: typeof raw.weight === 'number' && raw.weight > 0 ? raw.weight : 1,
    questionCategories: Array.isArray(raw.questionCategories)
      ? raw.questionCategories.map((v) => String(v).trim()).filter(Boolean)
      : [],
    keywords: Array.isArray(raw.keywords)
      ? raw.keywords.map((v) => String(v).trim().toLowerCase()).filter(Boolean)
      : [],
  };
}

export function normaliseDiagnosisConfig(input: unknown): DiagnosisConfig {
  const raw = (input ?? {}) as Partial<DiagnosisConfig>;
  const categories = Array.isArray(raw.categories) && raw.categories.length > 0
    ? raw.categories.map((c, i) => normaliseCategory(c, i))
    : DEFAULT_CATEGORIES;
  const rules: RecommendationRule[] = Array.isArray(raw.rules)
    ? raw.rules
        .filter((r): r is RecommendationRule => Boolean(r && typeof r === 'object'))
        .map((r, i): RecommendationRule => ({
          id: r.id || `rule-${i + 1}`,
          title: r.title || 'Recommendation',
          summary: r.summary || '',
          action: r.action || '',
          priority: (['high', 'medium', 'low'] as const).includes(r.priority) ? r.priority : 'medium',
          serviceIds: Array.isArray(r.serviceIds) ? r.serviceIds.map(String) : [],
          match: r.match === 'any' ? 'any' : 'all',
          conditions: Array.isArray(r.conditions)
            ? r.conditions
                .filter((c) => c && typeof c === 'object')
                .map((c): DiagnosisCondition => ({
                  source: c.source === 'answer' ? 'answer' : 'category',
                  key: String(c.key ?? ''),
                  operator: (['lt', 'lte', 'gt', 'gte', 'eq', 'neq', 'includes', 'not_includes'] as const).includes(c.operator)
                    ? c.operator
                    : 'lt',
                  value: c.value as string | number | boolean,
                }))
            : [],
          isActive: r.isActive !== false,
        }))
    : DEFAULT_RULES;

  return {
    enabled: raw.enabled !== false,
    categories,
    rules,
    thresholds: {
      excellent: raw.thresholds?.excellent ?? DEFAULT_THRESHOLDS.excellent,
      good: raw.thresholds?.good ?? DEFAULT_THRESHOLDS.good,
      average: raw.thresholds?.average ?? DEFAULT_THRESHOLDS.average,
      poor: raw.thresholds?.poor ?? DEFAULT_THRESHOLDS.poor,
    },
  };
}

function matchesCategory(
  input: DiagnosisAnswerInput,
  category: DiagnosisCategoryConfig,
): boolean {
  const questionCategory = (input.category || '').trim().toLowerCase();
  if (questionCategory) {
    const normalised = (category.questionCategories ?? []).map((c) => c.trim().toLowerCase());
    if (normalised.includes(questionCategory)) return true;
    if (questionCategory === category.key.toLowerCase() || questionCategory === category.label.toLowerCase()) {
      return true;
    }
  }
  const text = `${input.questionText || ''} ${(input.optionTexts ?? []).join(' ')}`.toLowerCase();
  return (category.keywords ?? []).some((keyword) => keyword && text.includes(keyword));
}

function compare(actual: unknown, operator: DiagnosisCondition['operator'], expected: unknown): boolean {
  if (operator === 'includes' || operator === 'not_includes') {
    const expectedText = stringOf(expected).toLowerCase();
    const haystack = Array.isArray(actual)
      ? actual.map((v) => stringOf(v).toLowerCase())
      : [stringOf(actual).toLowerCase()];
    const found = haystack.some((entry) => entry.includes(expectedText));
    return operator === 'includes' ? found : !found;
  }

  const a = asNumber(actual);
  const b = asNumber(expected);
  if (a !== null && b !== null) {
    switch (operator) {
      case 'lt': return a < b;
      case 'lte': return a <= b;
      case 'gt': return a > b;
      case 'gte': return a >= b;
      case 'eq': return a === b;
      case 'neq': return a !== b;
    }
  }

  const actualText = stringOf(actual).trim().toLowerCase();
  const expectedText = stringOf(expected).trim().toLowerCase();
  switch (operator) {
    case 'eq': return actualText === expectedText;
    case 'neq': return actualText !== expectedText;
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte':
      return false;
    default:
      return false;
  }
}

function impactFor(key: string, label: string): string[] {
  const map: Record<string, string[]> = {
    operations: ['Wasted operational resources', 'Lower revenue potential', 'Higher per-unit cost'],
    inventory: ['Reduced cash flow', 'Higher storage costs', 'Lower profitability'],
    marketing: ['Limited customer pipeline', 'Slow growth', 'Dependence on repeat customers'],
    customers: ['Higher acquisition costs', 'Unstable revenue base', 'Lower lifetime value'],
    technology: ['Manual processes waste time', 'Poor data visibility', 'Inconsistent operations'],
    finance: ['Financial vulnerability', 'Limited growth investment', 'Sustainability concerns'],
    growth: ['Missed market opportunities', 'Stalled expansion', 'Reactive planning'],
  };
  return map[key] ?? [`${label} is limiting overall performance`, 'Reduced profitability'];
}

@Injectable()
export class DiagnosisService {
  listServices() {
    return MCOM_SERVICES;
  }

  defaultConfig(): DiagnosisConfig {
    return DEFAULT_DIAGNOSIS_CONFIG;
  }

  build(input: {
    answers: DiagnosisAnswerInput[];
    config?: DiagnosisConfig | null;
  }): DiagnosisResult {
    const configSource: 'admin' | 'default' = input.config ? 'admin' : 'default';
    const config = normaliseDiagnosisConfig(input.config ?? DEFAULT_DIAGNOSIS_CONFIG);
    const thresholds = config.thresholds ?? DEFAULT_THRESHOLDS;

    if (config.enabled === false) {
      return this.emptyResult(configSource);
    }

    const categories = this.scoreCategories(input.answers, config, thresholds);
    const overallScore = this.weightedOverall(categories, config);

    const strengths: DiagnosisStrength[] = categories
      .filter((c) => c.rating === 'excellent' || c.rating === 'good')
      .map((c) => ({
        id: `strength-${c.id}`,
        title: `${c.name} is a strength`,
        description: c.explanation,
        whyItMatters: `A strong ${c.name.toLowerCase()} position gives the business a stable base for growth.`,
      }));

    const challenges: DiagnosisChallenge[] = categories
      .filter((c) => c.rating === 'average' || c.rating === 'poor' || c.rating === 'critical')
      .map((c) => ({
        id: `challenge-${c.id}`,
        title: `${c.name} needs attention`,
        description: c.explanation,
        severity: c.rating === 'average' ? 'medium' : 'high',
      }));

    const opportunities: DiagnosisOpportunity[] = categories
      .filter((c) => c.rating !== 'excellent' && c.rating !== 'good')
      .map((c) => ({
        id: `opportunity-${c.id}`,
        title: `Improve ${c.name.toLowerCase()}`,
        currentSituation: c.explanation,
        potentialOutcome: `A measurable improvement in ${c.name.toLowerCase()} and its contribution to profit.`,
        businessBenefit: impactFor(c.id, c.name)[0],
      }));

    const priorities: DiagnosisPriorityItem[] = [...categories]
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((c) => ({
        id: `priority-${c.id}`,
        title: c.name,
        description: c.explanation,
        level: priorityLevelFor(c.score, thresholds),
      }));

    const risks: DiagnosisRisk[] = categories
      .filter((c) => c.rating === 'critical' || c.rating === 'poor')
      .map((c) => ({
        id: `risk-${c.id}`,
        title: `${c.name} risk`,
        description: c.explanation,
        severity: 'high',
        potentialImpact: impactFor(c.id, c.name).join('; '),
        urgency: 'Address in the next 30 days',
      }));

    const recommendations = this.evaluateRules(config.rules, categories, input.answers);
    const mcomServiceMapping = recommendations.flatMap((rec) =>
      rec.services.map((service) => ({
        issue: rec.businessIssue,
        serviceId: service.id,
        serviceName: service.name,
      })),
    );

    const overallStatus =
      overallScore >= 75 ? 'healthy' : overallScore >= 50 ? 'needs-attention' : 'critical';
    const readiness = this.readinessFor(overallScore, risks.length);

    return {
      overallScore,
      overallStatus,
      executiveSummary: this.executiveSummary(categories, overallScore, strengths, challenges),
      healthCategories: categories,
      strengths: strengths.slice(0, 6),
      challenges,
      opportunities: opportunities.slice(0, 6),
      priorities,
      risks,
      readiness,
      whatWeFound: this.whatWeFound(categories, strengths, challenges, overallScore),
      completedAt: new Date().toISOString(),
      recommendations,
      mcomServiceMapping,
      configSource,
    };
  }

  private scoreCategories(
    answers: DiagnosisAnswerInput[],
    config: DiagnosisConfig,
    thresholds: DiagnosisConfig['thresholds'],
  ): DiagnosisHealthCategory[] {
    const buckets = new Map<string, number[]>();
    const dynamicCategories = new Map<string, DiagnosisCategoryConfig>();

    for (const answer of answers) {
      let matched: DiagnosisCategoryConfig | undefined;
      for (const category of config.categories) {
        if (matchesCategory(answer, category)) {
          matched = category;
          break;
        }
      }
      if (!matched) {
        const key = (answer.category || 'general').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'general';
        matched = { key, label: answer.category || 'General', weight: 1 };
        dynamicCategories.set(key, matched);
      }
      const bucket = buckets.get(matched.key) ?? [];
      bucket.push(normaliseValue(answer));
      buckets.set(matched.key, bucket);
    }

    const allCategories = [...config.categories, ...Array.from(dynamicCategories.values())];
    const scored: DiagnosisHealthCategory[] = [];

    for (const category of allCategories) {
      const values = buckets.get(category.key);
      if (!values || values.length === 0) continue;
      const score = clamp(values.reduce((sum, v) => sum + v, 0) / values.length);
      const rating = ratingFor(score, thresholds);
      scored.push({
        id: category.key,
        name: category.label,
        rating,
        score,
        explanation: this.explanationFor(category.label, score, rating),
        impact: impactFor(category.key, category.label),
      });
    }

    if (scored.length === 0) {
      return [
        {
          id: 'general',
          name: 'Business Performance',
          rating: 'average',
          score: 50,
          explanation:
            'There was not enough categorised answer data to produce a detailed diagnosis. Add question categories in the diagnosis settings.',
          impact: ['Diagnosis confidence is reduced'],
        },
      ];
    }

    return scored;
  }

  private weightedOverall(
    categories: DiagnosisHealthCategory[],
    config: DiagnosisConfig,
  ): number {
    const weights = new Map(config.categories.map((c) => [c.key, c.weight ?? 1]));
    let total = 0;
    let weightTotal = 0;
    for (const category of categories) {
      const weight = weights.get(category.id) ?? 1;
      total += category.score * weight;
      weightTotal += weight;
    }
    return clamp(weightTotal > 0 ? total / weightTotal : 50);
  }

  private evaluateRules(
    rules: RecommendationRule[],
    categories: DiagnosisHealthCategory[],
    answers: DiagnosisAnswerInput[],
  ): DiagnosisRecommendation[] {
    const categoryScores = new Map(categories.map((c) => [c.id, c.score]));
    const answerValues = new Map(answers.map((a) => [a.questionId, a.value]));
    const out: DiagnosisRecommendation[] = [];

    for (const rule of rules) {
      if (rule.isActive === false) continue;
      if (!Array.isArray(rule.conditions) || rule.conditions.length === 0) continue;

      const results = rule.conditions.map((condition) => {
        const actual =
          condition.source === 'category'
            ? categoryScores.get(condition.key)
            : answerValues.get(condition.key);
        return compare(actual, condition.operator, condition.value);
      });

      const matched = rule.match === 'any' ? results.some(Boolean) : results.every(Boolean);
      if (!matched) continue;

      const services = (rule.serviceIds ?? [])
        .map((id) => getMcomService(id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s))
        .map((s) => ({ id: s.id, name: s.name, category: s.category }));

      out.push({
        id: rule.id,
        businessIssue: rule.title,
        priority: rule.priority,
        summary: rule.summary,
        action: rule.action,
        serviceIds: rule.serviceIds ?? [],
        services,
      });
    }

    return out.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }

  private explanationFor(label: string, score: number, rating: HealthRating): string {
    if (rating === 'excellent') return `${label} is performing strongly (${score}/100) and should be protected.`;
    if (rating === 'good') return `${label} is healthy (${score}/100) with only minor room for improvement.`;
    if (rating === 'average') return `${label} is average (${score}/100). There is clear room to improve without a crisis.`;
    if (rating === 'poor') return `${label} is weak (${score}/100) and is likely holding back performance.`;
    return `${label} is critical (${score}/100) and needs immediate attention.`;
  }

  private executiveSummary(
    categories: DiagnosisHealthCategory[],
    overallScore: number,
    strengths: DiagnosisStrength[],
    challenges: DiagnosisChallenge[],
  ): string {
    const best = [...categories].sort((a, b) => b.score - a.score)[0];
    const worst = [...categories].sort((a, b) => a.score - b.score)[0];
    const parts = [
      `The business scored ${overallScore}/100 overall across ${categories.length} assessed areas.`,
    ];
    if (best) parts.push(`Its strongest area is ${best.name.toLowerCase()} (${best.score}/100).`);
    if (worst) parts.push(`The biggest constraint is ${worst.name.toLowerCase()} (${worst.score}/100).`);
    if (strengths.length > 0) {
      parts.push(`${strengths.length} strength${strengths.length === 1 ? '' : 's'} can be used as a platform for improvement.`);
    }
    if (challenges.length > 0) {
      parts.push(`${challenges.length} area${challenges.length === 1 ? '' : 's'} need attention in the improvement plan.`);
    }
    return parts.join(' ');
  }

  private whatWeFound(
    categories: DiagnosisHealthCategory[],
    strengths: DiagnosisStrength[],
    challenges: DiagnosisChallenge[],
    overallScore: number,
  ): string {
    const narrative = [
      `We reviewed the answers against your configured diagnosis model and produced an overall score of ${overallScore}/100.`,
    ];
    if (strengths.length > 0) {
      narrative.push(
        `The business is strongest in ${strengths.map((s) => s.title.replace(' is a strength', '')).join(', ')}.`,
      );
    }
    if (challenges.length > 0) {
      narrative.push(
        `The areas requiring the most attention are ${challenges.map((c) => c.title.replace(' needs attention', '')).join(', ')}.`,
      );
    }
    const weakest = [...categories].sort((a, b) => a.score - b.score)[0];
    if (weakest) {
      narrative.push(
        `Starting with ${weakest.name.toLowerCase()} is likely to produce the fastest measurable improvement.`,
      );
    }
    return narrative.join(' ');
  }

  private readinessFor(
    overallScore: number,
    highRiskCount: number,
  ): { status: string; explanation: string } {
    if (overallScore >= 75 && highRiskCount === 0) {
      return {
        status: 'ready-for-growth',
        explanation: 'The fundamentals are in place to pursue growth opportunities now.',
      };
    }
    if (overallScore >= 55) {
      return {
        status: 'needs-improvements',
        explanation: 'The business is stable but should close the priority gaps before scaling.',
      };
    }
    if (overallScore >= 40) {
      return {
        status: 'requires-stabilisation',
        explanation: 'Stabilise the weakest areas first, then move on to growth initiatives.',
      };
    }
    return {
      status: 'requires-stabilisation',
      explanation: 'The business needs urgent stabilisation before growth investment will pay off.',
    };
  }

  private emptyResult(configSource: 'admin' | 'default'): DiagnosisResult {
    return {
      overallScore: 0,
      overallStatus: 'critical',
      executiveSummary: 'Diagnosis is disabled for this form.',
      healthCategories: [],
      strengths: [],
      challenges: [],
      opportunities: [],
      priorities: [],
      risks: [],
      readiness: { status: 'requires-stabilisation', explanation: 'Diagnosis is disabled.' },
      whatWeFound: '',
      completedAt: new Date().toISOString(),
      recommendations: [],
      mcomServiceMapping: [],
      configSource,
    };
  }
}
