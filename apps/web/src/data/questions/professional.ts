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
    },

    // ==========================================
    // SPARE CAPACITY QUESTIONS
    // ==========================================

    // 1. Consulting & Advisory
    {
        id: "prof-consulting-capacity-trigger-01",
        text: "What is your average consultant utilization rate?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "consulting",
        weight: 2.2
    },
    {
        id: "prof-consulting-capacity-trigger-02",
        text: "Are there unbilled hours or idle project days weekly?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "consulting",
        weight: 1.8
    },
    {
        id: "prof-consulting-capacity-deep-01",
        text: "How many hours per week are lost to scheduling inefficiencies?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "consulting",
        helpText: "Enter hours per week.",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 2. Legal & Compliance
    {
        id: "prof-legal-capacity-trigger-01",
        text: "What is the average lawyer utilization rate?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "legal-compliance",
        weight: 2.2
    },
    {
        id: "prof-legal-capacity-trigger-02",
        text: "Are court downtimes or client backlogs common?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "legal-compliance",
        weight: 1.8
    },
    {
        id: "prof-legal-capacity-deep-01",
        text: "How many unbilled case hours accumulate weekly?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "legal-compliance",
        isLongFormOnly: true,
        weight: 2.8
    },

    // 3. Accounting & Finance
    {
        id: "prof-accounting-capacity-trigger-01",
        text: "What is your chargeable hours ratio?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "accounting",
        weight: 2.0
    },
    {
        id: "prof-accounting-capacity-trigger-02",
        text: "Is there idle capacity outside of tax season?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "accounting",
        weight: 1.5
    },
    {
        id: "prof-accounting-capacity-deep-01",
        text: "How many hours are lost to data collection delays weekly?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "accounting",
        helpText: "Enter hours per week.",
        isLongFormOnly: true,
        weight: 2.2
    },

    // 4. Marketing & Media
    {
        id: "prof-marketing-capacity-trigger-01",
        text: "Is your creative team fully utilized?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "marketing",
        weight: 1.8
    },
    {
        id: "prof-marketing-capacity-trigger-02",
        text: "Do you have idle pitch capacity or client gaps?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "marketing",
        weight: 1.8
    },
    {
        id: "prof-marketing-capacity-deep-01",
        text: "How many hours are wasted on approval delays weekly?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "marketing",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 5. Recruitment & Training
    {
        id: "prof-recruitment-capacity-trigger-01",
        text: "What is your consultant placement capacity usage?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "recruitment",
        weight: 2.0
    },
    {
        id: "prof-recruitment-capacity-trigger-02",
        text: "Are candidate pipelines idle?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "recruitment",
        weight: 1.8
    },
    {
        id: "prof-recruitment-capacity-deep-01",
        text: "How many interview slots go unfilled weekly?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["professional-business"],
        groupId: "recruitment",
        isLongFormOnly: true,
        weight: 2.2
    }
];
