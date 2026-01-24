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
    }
];
