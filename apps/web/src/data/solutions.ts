export type SolutionPriority = 'high' | 'medium' | 'future';
export type ImpactLevel = 'high' | 'medium' | 'low';
export type BudgetRange = 'under-500' | '500-2000' | '2000-5000' | '5000-10000' | '10000-plus';
export type PaymentApproach = 'one-time' | 'monthly' | 'flexible';
export type InternalResources = 'yes' | 'no' | 'unsure';
export type TimeToResults = 'immediately' | 'within-30' | 'within-60' | 'within-90' | 'within-6-months' | 'long-term';
export type PriorityApproach = 'faster' | 'lower-investment' | 'max-return' | 'balanced';

export interface BudgetSelection {
  budgetRange: BudgetRange;
  paymentApproach: PaymentApproach;
  internalResources: InternalResources;
}

export interface TimeframeSelection {
  timeToResults: TimeToResults;
  priorityApproach: PriorityApproach;
}

export interface SolutionDefinition {
  id: string;
  solutionName: string;
  mcomService: string;
  description: string;
  whyThisSolution: string;
  expectedOutcomes: string[];
  implementationActivities: string[];
  estimatedTimeline: string;
  estimatedInvestment: string;
  businessImpact: ImpactLevel;
  dependencies: string[];
  relatedMcomServices: string[];
  icon: string;
}

export interface RecommendationCard {
  id: string;
  businessIssue: string;
  severity: string;
  evidence: string;
  businessImpact: string[];
  recommendedSolution: string;
  solutionId: string;
  whyThisSolution: string;
  expectedOutcomes: string[];
  implementationPriority: SolutionPriority;
  estimatedTimeline: string;
  estimatedInvestment: string;
  expectedBusinessImpact: ImpactLevel;
  phase: 1 | 2 | 3;
}

export interface ImplementationPhase {
  phaseNumber: 1 | 2 | 3;
  title: string;
  objectives: string[];
  problemsAddressed: string[];
  estimatedDuration: string;
  expectedOutcome: string;
  prerequisites: string;
}

export interface SolutionPlan {
  diagnosisId: string;
  createdAt: string;
  budget: BudgetSelection;
  timeframe: TimeframeSelection;
  recommendations: RecommendationCard[];
  phases: ImplementationPhase[];
  summary: {
    highPriority: number;
    mediumPriority: number;
    futureGrowth: number;
    estimatedOverallTimeline: string;
  };
  expectedBusinessOutcomes: string[];
  mcomServiceMapping: { issue: string; solution: string }[];
}
