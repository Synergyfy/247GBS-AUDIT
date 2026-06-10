import { z } from 'zod';

export type AuditCategory = 'SPARE_CAPACITY' | 'EXCESS_STOCK';

export type AuditType = 'SHORT_FORM' | 'LONG_FORM';

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

export interface Question {
    id: string;
    text: string;
    type: 'number' | 'percentage' | 'boolean' | 'text' | 'currency';
    category: AuditCategory;
    isLongFormOnly?: boolean;
    helpText?: string;
    weight?: number; // For weighted calculations in Long Form
    sectorSpecific?: string[]; // Sector IDs this question applies to
    groupId?: string; // Optinal Group ID (Category)
    typeId?: string; // Optional Type ID (Subcategory)
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
// AUDIT TRIAGE (ONBOARDING)
// ============================================================

export type TriageStageId =
    | 'stock-awareness'
    | 'stock-extent'
    | 'stock-impact'
    | 'capacity-awareness'
    | 'capacity-extent'
    | 'capacity-impact'
    | 'validation'
    | 'financials'
    | 'decision'
    | 'readiness'
    | 'healthy';

export interface TriageData {
    sectorId?: string;
    hasExcessStock?: 'yes' | 'no' | 'not-sure';
    stockExtent?: number;
    stockImpact?: 'serious' | 'little' | 'not-yet' | 'not-sure';
    hasSpareCapacity?: 'yes' | 'no' | 'not-sure';
    capacityExtent?: number;
    capacityImpact?: 'serious' | 'little' | 'not-yet' | 'not-sure';
    confidenceStock?: 'very' | 'fairly' | 'guessing' | 'not-sure';
    confidenceCapacity?: 'very' | 'fairly' | 'guessing' | 'not-sure';
    staffCost?: 'under' | 'around' | 'above' | 'not-sure';
    stockValue?: 'under5k' | '5k-20k' | '20k-50k' | '50k+';
    monthlyTurnover?: 'under10k' | '10k-50k' | '50k-100k' | '100k+';
    isReady?: 'yes' | 'maybe' | 'not-yet';
}
