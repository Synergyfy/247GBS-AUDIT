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
    },

    // ==========================================
    // SPARE CAPACITY QUESTIONS
    // ==========================================

    // 1. Medical & Clinical
    {
        id: "health-medical-capacity-trigger-01",
        text: "What is your appointment slot utilization rate?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "medical",
        weight: 2.5
    },
    {
        id: "health-medical-capacity-trigger-02",
        text: "Are missed or cancelled appointments frequent?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "medical",
        weight: 2.0
    },
    {
        id: "health-medical-capacity-deep-01",
        text: "How many consultation hours are idle weekly?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "medical",
        isLongFormOnly: true,
        weight: 2.2
    },

    // 2. Beauty & Grooming
    {
        id: "health-beauty-capacity-trigger-01",
        text: "What is your chair/bed utilization rate?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "beauty",
        weight: 2.2
    },
    {
        id: "health-beauty-capacity-trigger-02",
        text: "Are there significant booking gaps or no-shows?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "beauty",
        weight: 1.8
    },
    {
        id: "health-beauty-capacity-deep-01",
        text: "How many stylist/technician hours are idle weekly?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "beauty",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 3. Fitness & Sports
    {
        id: "health-fitness-capacity-trigger-01",
        text: "What is your average class attendance rate?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "fitness",
        weight: 2.0
    },
    {
        id: "health-fitness-capacity-trigger-02",
        text: "Is equipment under-utilized during off-peak hours?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "fitness",
        weight: 1.5
    },
    {
        id: "health-fitness-capacity-deep-01",
        text: "How many trainer hours are unbilled weekly?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "fitness",
        isLongFormOnly: true,
        weight: 2.2
    },

    // 4. Alternative & Wellness
    {
        id: "health-wellness-capacity-trigger-01",
        text: "What is your treatment room utilization rate?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "alternative-wellness",
        weight: 2.0
    },
    {
        id: "health-wellness-capacity-trigger-02",
        text: "Are practitioner gaps or cancellations common?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "alternative-wellness",
        weight: 1.8
    },
    {
        id: "health-wellness-capacity-deep-01",
        text: "How many appointment slots go unfilled weekly?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["health-wellness"],
        groupId: "alternative-wellness",
        isLongFormOnly: true,
        weight: 2.0
    }
];
