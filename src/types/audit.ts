import { z } from "zod";

export const BusinessTypeSchema = z.enum([
    "Hotel",
    "Restaurant",
    "Shop",
    "Salon",
    "Gym",
    "Service",
    "Online",
    "Other",
]);

export const BusinessBasicsSchema = z.object({
    businessName: z.string().min(1, "Business name is required"),
    businessType: BusinessTypeSchema, // Using the enum directly
    location: z.string().min(1, "Location is required"),
    operatingHours: z.string().min(1, "Operating hours are required"),
});

export const ExcessStockItemSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Item name is required"),
    normalPrice: z.number().min(0),
    quantity: z.number().min(1),
    sellRate: z.string().min(1, "Selling rate description is required"),
});

export const SpareCapacityServiceSchema = z.object({
    id: z.string(),
    serviceType: z.string().min(1, "Service type is required"),
    totalCapacity: z.number().min(1),
    usedCapacity: z.number().min(0),
    normalPrice: z.number().min(0),
});

export const SpareCapacityOverviewSchema = z.object({
    dailyCapacity: z.number().min(1),
    dailyServed: z.number().min(0),
    quietDays: z.string(),
    quietTimes: z.string(),
});

export const CostAndLimitsSchema = z.object({
    unitCost: z.number().min(0),
    minPrice: z.number().min(0),
});

export const RewardRulesSchema = z.object({
    maxRewardValue: z.number().min(0),
    minCashComponent: z.number().min(0),
});

// Complete Audit Data Structure
export const AuditDataSchema = z.object({
    basics: BusinessBasicsSchema.optional(),
    excessStock: z.array(ExcessStockItemSchema).default([]),
    capacityOverview: SpareCapacityOverviewSchema.optional(),
    capacityServices: z.array(SpareCapacityServiceSchema).default([]),
    costs: CostAndLimitsSchema.optional(),
    rules: RewardRulesSchema.optional(),
});

export type AuditData = z.infer<typeof AuditDataSchema>;
export type BusinessBasics = z.infer<typeof BusinessBasicsSchema>;
export type ExcessStockItem = z.infer<typeof ExcessStockItemSchema>;
export type SpareCapacityService = z.infer<typeof SpareCapacityServiceSchema>;
export type SpareCapacityOverview = z.infer<typeof SpareCapacityOverviewSchema>;
export type CostAndLimits = z.infer<typeof CostAndLimitsSchema>;
export type RewardRules = z.infer<typeof RewardRulesSchema>;

export type StepId =
    | "welcome"
    | "basics"
    | "excess-stock"
    | "capacity-overview"
    | "capacity-details"
    | "costs"
    | "rules"
    | "recommendation"
    | "review"
    | "complete";

export const STEPS: StepId[] = [
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
];
