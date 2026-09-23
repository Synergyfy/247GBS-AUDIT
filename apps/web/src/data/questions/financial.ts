import { Question } from "@/types/audit";

export const FINANCIAL_QUESTIONS: Question[] = [
    // 1. Financial Services
    {
        id: "fin-finance-stock-trigger-01",
        text: "Are office supplies overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["financial-insurance"],
        groupId: "fin-svcs",
        weight: 1.0
    },
    {
        id: "fin-finance-stock-deep-01",
        text: "Value of idle office supplies?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["financial-insurance"],
        groupId: "fin-svcs",
        isLongFormOnly: true,
        weight: 1.5
    },

    // 2. Insurance Services
    {
        id: "fin-insurance-stock-trigger-01",
        text: "Are IT systems or hardware underutilised?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["financial-insurance"],
        groupId: "insurance",
        weight: 1.8
    },
    {
        id: "fin-insurance-stock-deep-01",
        text: "Underutilised IT systems/hardware cost?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["financial-insurance"],
        groupId: "insurance",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 3. Real Estate Development
    {
        id: "fin-realestate-stock-trigger-01",
        text: "Are property documents/contracts over-printed or unused?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["financial-insurance"],
        groupId: "real-estate-dev",
        weight: 1.2
    },
    {
        id: "fin-realestate-stock-deep-01",
        text: "Over-printed property documents/contracts cost?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["financial-insurance"],
        groupId: "real-estate-dev",
        isLongFormOnly: true,
        weight: 1.8
    }
];
