import { z } from 'zod';

export type AuditCategory = 'SPARE_CAPACITY' | 'EXCESS_STOCK' | 'CUSTOMERS' | 'MARKETING' | 'TECHNOLOGY' | 'FINANCE';

export type AuditType = 'SHORT_FORM' | 'LONG_FORM';

export type QuestionType = 'multiple-choice' | 'multi-select' | 'rating' | 'number' | 'percentage' | 'currency' | 'text' | 'long-text' | 'boolean';

export interface VisualConfig {
    backgroundImage: string;
    primaryColor: string;
    accentColor: string;
    iconName?: string;
}

export interface RecommendationTemplate {
    id: string;
    condition: string; // Dynamic expression e.g. "answers.staff_idle > 20"
    title: string;
    description: string;
    actionItem: string;
}

export interface BusinessType {
    id: string;
    name: string;
    visuals?: Partial<VisualConfig>;
    specificQuestions?: string[]; // List of question IDs
}

export interface BusinessGroup {
    id: string;
    name: string;
    types: BusinessType[];
}

export interface Sector {
    id: string;
    name: string;
    groups: BusinessGroup[];
    visuals: VisualConfig;
    calculationModels: {
        capacity: string; // Reference to a formula ID
        stock: string;
    };
    recommendationTemplates: RecommendationTemplate[];
}

export interface QuestionOption {
    id: string;
    label: string;
    sub?: string;
    value?: number;
}

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    category: AuditCategory;
    options?: QuestionOption[]; // For multiple-choice, multi-select, rating
    isLongFormOnly?: boolean;
    helpText?: string;
    placeholder?: string; // For text/number inputs
    min?: number; // For number/rating
    max?: number; // For number/rating
    weight?: number;
    sectorSpecific?: string[];
    groupId?: string;
    typeId?: string;
    conditionalOn?: { // Show this question only if condition is met
        questionId: string;
        value: string | string[];
    };
}

export interface AuditStrategy {
    type: AuditType;
    depth: 'surface' | 'forensic';
    hasAI: boolean;
    hasBranching: boolean;
    calculationModel: 'simple_sum' | 'weighted_weighted_opportunity_cost';
    outputType: 'score_only' | 'strategic_roadmap';
}

export interface AuditState {
    auditType: AuditType | null;
    selectedSector: string | null;
    selectedGroup: string | null;
    selectedBusinessType: string | null;
    answers: Record<string, any>;
    currentStep: number;
}

export const AUDIT_STRATEGIES: Record<AuditType, AuditStrategy> = {
    SHORT_FORM: {
        type: 'SHORT_FORM',
        depth: 'surface',
        hasAI: false,
        hasBranching: false,
        calculationModel: 'simple_sum',
        outputType: 'score_only'
    },
    LONG_FORM: {
        type: 'LONG_FORM',
        depth: 'forensic',
        hasAI: true,
        hasBranching: true,
        calculationModel: 'weighted_weighted_opportunity_cost',
        outputType: 'strategic_roadmap'
    }
};

export const AUDIT_CATEGORIES: AuditCategory[] = ['SPARE_CAPACITY', 'EXCESS_STOCK'];

// ============================================================
// AUDIT WIZARD SCHEMAS & TYPES
// ============================================================

export const BusinessTypeSchema = z.enum([
    "Restaurant",
    "Hotel",
    "Retail",
    "Service Business",
    "Manufacturing",
    "Other"
]);

export const BusinessBasicsSchema = z.object({
    businessName: z.string().min(2, "Business name must be at least 2 characters"),
    businessType: BusinessTypeSchema,
    location: z.string().min(2, "Location is required"),
    operatingHours: z.string().min(1, "Operating hours are required"),
});

export type BusinessBasics = z.infer<typeof BusinessBasicsSchema>;

export const SpareCapacityOverviewSchema = z.object({
    dailyCapacity: z.number().min(1, "Capacity must be at least 1"),
    dailyServed: z.number().min(0, "Daily served cannot be negative"),
    quietDays: z.string(),
    quietTimes: z.string(),
});

export type SpareCapacityOverview = z.infer<typeof SpareCapacityOverviewSchema>;

export const SpareCapacityServiceSchema = z.object({
    id: z.string(),
    serviceType: z.string().min(2, "Service type is required"),
    totalCapacity: z.number().min(1, "Capacity must be at least 1"),
    usedCapacity: z.number().min(0, "Used capacity cannot be negative"),
    normalPrice: z.number().min(0.01, "Price must be positive"),
});

export type SpareCapacityService = z.infer<typeof SpareCapacityServiceSchema>;

export const ExcessStockItemSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Item name is required"),
    normalPrice: z.number().min(0.01, "Price must be positive"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    sellRate: z.string(),
});

export type ExcessStockItem = z.infer<typeof ExcessStockItemSchema>;

export const CostAndLimitsSchema = z.object({
    unitCost: z.number().min(0, "Unit cost cannot be negative"),
    minPrice: z.number().min(0, "Minimum price cannot be negative"),
});

export type CostAndLimits = z.infer<typeof CostAndLimitsSchema>;

export const RewardRulesSchema = z.object({
    maxRewardValue: z.number().min(0, "Max reward value cannot be negative"),
    minCashComponent: z.number().min(0, "Minimum cash component cannot be negative"),
});

export type RewardRules = z.infer<typeof RewardRulesSchema>;

export const AuditDataSchema = z.object({
    basics: BusinessBasicsSchema.optional(),
    capacityOverview: SpareCapacityOverviewSchema.optional(),
    excessStock: z.array(ExcessStockItemSchema).optional(),
    capacityServices: z.array(SpareCapacityServiceSchema).optional(),
    costs: CostAndLimitsSchema.optional(),
    rules: RewardRulesSchema.optional(),
});

export type AuditData = z.infer<typeof AuditDataSchema>;

export const STEPS = [
    "welcome",
    "basics",
    "excess-stock",
    "capacity-overview",
    "capacity-details",
    "costs",
    "rules",
    "recommendation",
    "review",
    "complete",
] as const;

export type StepId = (typeof STEPS)[number];

// ============================================================
// DASHBOARD & SAVED RESULTS
// ============================================================

export interface SavedAudit {
    id: string;
    date: string;
    type: AuditType;
    sector: string;
    metrics: {
        capacityDrain: number;
        annualRecovery: number;
        impactScore: number;
    };
    status: 'completed' | 'draft';
}

export interface DashboardStats {
    totalAudits: number;
    activeRecovery: number;
    efficiencyGain: number;
    nextAuditDate: string;
}

// ============================================================
// AUDIT TRIAGE (MODULE 1 - BUSINESS TRIAGE)
// ============================================================

export type TriageStageId =
    | 'business-performance'
    | 'operations'
    | 'customers-marketing'
    | 'growth-technology'
    | 'business-priorities'
    | 'processing'
    | 'result';

export interface TriageData {
    // Stage 1: Business Performance
    businessPerformance?: 'good' | 'stable' | 'declining' | 'not-sure';
    salesTrend?: 'increasing' | 'stable' | 'declining' | 'not-sure';
    isProfitable?: 'yes' | 'no' | 'not-sure';
    measuresPerformance?: 'yes' | 'no' | 'sometimes';

    // Stage 2: Operations
    hasExcessStock?: 'yes' | 'no' | 'not-sure';
    hasUnusedCapacity?: 'yes' | 'no' | 'not-sure';
    operationalChallenges?: 'yes' | 'no' | 'not-sure';
    processImprovements?: 'yes' | 'no' | 'not-sure';

    // Stage 3: Customers & Marketing
    hasLoyaltyProgramme?: 'yes' | 'no' | 'considering';
    activelyMarketing?: 'yes' | 'no' | 'sometimes';
    knowsCustomerAcquisition?: 'yes' | 'no' | 'partially';
    hasRepeatCustomers?: 'yes' | 'no' | 'not-sure';

    // Stage 4: Growth & Technology
    sellsOnline?: 'yes' | 'no' | 'planning';
    usesBusinessSoftware?: 'yes' | 'no' | 'limited';
    planningGrowth?: 'yes' | 'no' | 'unsure';
    lookingForNewCustomers?: 'yes' | 'no' | 'always';

    // Stage 5: Business Priorities
    biggestChallenge?: string;
    priorityArea?: 'stock' | 'capacity' | 'customers' | 'marketing' | 'technology' | 'efficiency' | 'other';
    desiredOutcome?: string;

    // System
    assignedAudit?: 'SHORT_FORM' | 'LONG_FORM';
    sectorId?: string;
}
