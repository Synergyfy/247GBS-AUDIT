import { Question } from "@/types/audit";

export const PROFESSIONAL_QUESTIONS: Question[] = [
    // 1. Consulting & Advisory
    {
        id: "prof-consulting-stock-trigger-01",
        text: "How many unused software licences are paid for monthly?",
        type: "number",
        category: "EXCESS_STOCK",
        sectorSpecific: ["professional-business"],
        groupId: "consulting",
        weight: 1.5
    },
    {
        id: "prof-consulting-stock-deep-01",
        text: "Annual unused subscription cost?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["professional-business"],
        groupId: "consulting",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 2. Legal & Compliance
    {
        id: "prof-legal-stock-trigger-01",
        text: "How many unused legal databases are subscribed?",
        type: "number",
        category: "EXCESS_STOCK",
        sectorSpecific: ["professional-business"],
        groupId: "legal-compliance",
        weight: 1.8
    },
    {
        id: "prof-legal-stock-deep-01",
        text: "Legal database underutilisation cost annually?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["professional-business"],
        groupId: "legal-compliance",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 3. Accounting & Finance
    {
        id: "prof-accounting-stock-trigger-01",
        text: "How many accounting software licences are unused?",
        type: "number",
        category: "EXCESS_STOCK",
        sectorSpecific: ["professional-business"],
        groupId: "accounting",
        weight: 1.5
    },
    {
        id: "prof-accounting-stock-deep-01",
        text: "Software licence waste value annually?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["professional-business"],
        groupId: "accounting",
        isLongFormOnly: true,
        weight: 2.2
    },

    // 4. Marketing & Media
    {
        id: "prof-marketing-stock-trigger-01",
        text: "How many unused marketing tools are paid for?",
        type: "number",
        category: "EXCESS_STOCK",
        sectorSpecific: ["professional-business"],
        groupId: "marketing",
        weight: 1.8
    },
    {
        id: "prof-marketing-stock-deep-01",
        text: "Tool subscription leakage cost annually?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["professional-business"],
        groupId: "marketing",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 5. Recruitment & Training
    {
        id: "prof-recruitment-stock-trigger-01",
        text: "How many unused recruitment platforms are subscribed?",
        type: "number",
        category: "EXCESS_STOCK",
        sectorSpecific: ["professional-business"],
        groupId: "recruitment",
        weight: 1.5
    },
    {
        id: "prof-recruitment-stock-deep-01",
        text: "Platform underutilisation cost annually?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["professional-business"],
        groupId: "recruitment",
        isLongFormOnly: true,
        weight: 2.0
    }
];
