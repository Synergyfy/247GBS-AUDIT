import { Question } from "@/types/audit";

export const CONSTRUCTION_QUESTIONS: Question[] = [
    // 1. Construction (Builders, Contractors, Civil)
    {
        id: "cons-general-stock-trigger-01",
        text: "Are construction materials overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["construction-property"],
        groupId: "construction",
        weight: 1.5,
    },
    {
        id: "cons-general-stock-deep-01",
        text: "Value of overstocked construction materials?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["construction-property"],
        groupId: "construction",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 2. Property Services (Agents, Managers)
    {
        id: "cons-property-stock-trigger-01",
        text: "Are printed brochures or property flyers overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["construction-property"],
        groupId: "property",
        weight: 1.2,
    },
    {
        id: "cons-property-stock-deep-01",
        text: "Value of overstocked brochures/flyers?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["construction-property"],
        groupId: "property",
        isLongFormOnly: true,
        weight: 1.8
    },

    // 3. Trade & Handyman Services
    {
        id: "cons-trades-stock-trigger-01",
        text: "Are spare parts or materials idle?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["construction-property"],
        groupId: "trades",
        weight: 1.5,
    },
    {
        id: "cons-trades-stock-deep-01",
        text: "Idle spare parts/materials cost?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["construction-property"],
        groupId: "trades",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 4. Facilities Management
    {
        id: "cons-facilities-stock-trigger-01",
        text: "Are cleaning supplies overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["construction-property"],
        groupId: "facilities",
        weight: 1.2,
    },
    {
        id: "cons-facilities-stock-deep-01",
        text: "Value of overstocked cleaning supplies/PPE?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["construction-property"],
        groupId: "facilities",
        isLongFormOnly: true,
        weight: 1.5
    },

    // ==========================================
    // SPARE CAPACITY QUESTIONS
    // ==========================================

    // 1. Construction (Builders, Contractors, Civil)
    {
        id: "cons-general-capacity-trigger-01",
        text: "What is your average site utilization rate?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "construction",
        weight: 2.5
    },
    {
        id: "cons-general-capacity-trigger-02",
        text: "Are there idle worker days per month?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "construction",
        weight: 2.0
    },
    {
        id: "cons-general-capacity-deep-01",
        text: "How many days are lost to planning/weather delays?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "construction",
        helpText: "Enter days per month.",
        isLongFormOnly: true,
        weight: 2.2
    },

    // 2. Property Services (Agents, Managers)
    {
        id: "cons-property-capacity-trigger-01",
        text: "What percentage of viewing slots are unused?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "property",
        weight: 2.0
    },
    {
        id: "cons-property-capacity-trigger-02",
        text: "Is there significant unsold inventory duration?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "property",
        weight: 1.8
    },
    {
        id: "cons-property-capacity-deep-01",
        text: "How many hours per week are lost to admin backlogs?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "property",
        isLongFormOnly: true,
        weight: 1.5
    },

    // 3. Trade & Handyman Services
    {
        id: "cons-trades-capacity-trigger-01",
        text: "What is your job booking utilization rate?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "trades",
        weight: 2.2
    },
    {
        id: "cons-trades-capacity-trigger-02",
        text: "Is travel or idle van time significant?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "trades",
        weight: 1.5
    },
    {
        id: "cons-trades-capacity-deep-01",
        text: "How many hours are lost to parts sourcing delays?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "trades",
        helpText: "Enter hours per week.",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 4. Facilities Management
    {
        id: "cons-facilities-capacity-trigger-01",
        text: "Is contract capacity fully utilized?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "facilities",
        weight: 2.0
    },
    {
        id: "cons-facilities-capacity-trigger-02",
        text: "Are there idle staff hours or route inefficiencies?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "facilities",
        weight: 1.8
    },
    {
        id: "cons-facilities-capacity-deep-01",
        text: "How many vehicle/equipment hours are idle weekly?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["construction-property"],
        groupId: "facilities",
        isLongFormOnly: true,
        weight: 2.2
    }
];
