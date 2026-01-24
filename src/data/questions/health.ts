import { Question } from "@/types/audit";

export const HEALTH_QUESTIONS: Question[] = [
    // 1. Medical & Clinical
    {
        id: "health-medical-stock-trigger-01",
        text: "Are medical/clinical supplies overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["health-wellness"],
        groupId: "medical",
        weight: 1.8,
    },
    {
        id: "health-medical-stock-deep-01",
        text: "Value of overstocked medical/clinical supplies?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["health-wellness"],
        groupId: "medical",
        isLongFormOnly: true,
        weight: 2.8
    },

    // 2. Beauty & Grooming
    {
        id: "health-beauty-stock-trigger-01",
        text: "Are beauty/grooming products overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["health-wellness"],
        groupId: "beauty",
        weight: 1.5,
    },
    {
        id: "health-beauty-stock-deep-01",
        text: "Value of overstocked beauty/grooming products?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["health-wellness"],
        groupId: "beauty",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 3. Fitness & Sports
    {
        id: "health-fitness-stock-trigger-01",
        text: "Are training tools or accessories overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["health-wellness"],
        groupId: "fitness",
        weight: 1.2,
    },
    {
        id: "health-fitness-stock-deep-01",
        text: "Overstocked training tools/accessories cost?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["health-wellness"],
        groupId: "fitness",
        isLongFormOnly: true,
        weight: 1.5
    },

    // 4. Alternative & Wellness
    {
        id: "health-wellness-stock-trigger-01",
        text: "Are wellness products or tools overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["health-wellness"],
        groupId: "alternative-wellness",
        weight: 1.5,
    },
    {
        id: "health-wellness-stock-deep-01",
        text: "Value of overstocked wellness products?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["health-wellness"],
        groupId: "alternative-wellness",
        isLongFormOnly: true,
        weight: 2.0
    }
];
