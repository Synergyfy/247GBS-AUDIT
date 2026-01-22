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
