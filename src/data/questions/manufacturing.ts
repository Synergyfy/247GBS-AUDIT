import { Question } from "@/types/audit";

export const MANUFACTURING_QUESTIONS: Question[] = [
    // 1. Light Manufacturing
    {
        id: "mfg-light-stock-trigger-01",
        text: "What percentage of raw materials expires or degrades monthly?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "light-mfg",
        weight: 1.8
    },
    {
        id: "mfg-light-stock-trigger-02",
        text: "How much finished stock remains unsold after 90 days?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "light-mfg",
        weight: 2.0
    },
    {
        id: "mfg-light-stock-deep-01",
        text: "Raw material wastage value?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "light-mfg",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 2. Heavy Manufacturing
    {
        id: "mfg-heavy-stock-trigger-01",
        text: "How much scrap material is generated monthly?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "heavy-mfg",
        weight: 2.2
    },
    {
        id: "mfg-heavy-stock-deep-01",
        text: "Scrap and rework cost annually?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "heavy-mfg",
        isLongFormOnly: true,
        weight: 3.0
    },

    // 3. Food & Beverage (F&B) Manufacturing
    {
        id: "mfg-fb-stock-trigger-01",
        text: "What percentage of raw inputs expires?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "fb-mfg",
        weight: 2.0
    },
    {
        id: "mfg-fb-stock-deep-01",
        text: "Recall-related loss value?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "fb-mfg",
        isLongFormOnly: true,
        weight: 3.5
    },

    // 4. Chemical & Materials
    {
        id: "mfg-chem-stock-trigger-01",
        text: "What percentage of chemicals expire unused?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "chem-materials",
        weight: 2.5
    },
    {
        id: "mfg-chem-stock-deep-01",
        text: "Expired material disposal cost?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "chem-materials",
        isLongFormOnly: true,
        weight: 3.0
    },

    // 5. Engineering & Fabrication
    {
        id: "mfg-engineering-stock-trigger-01",
        text: "How much unused raw stock remains monthly?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "engineering-fab",
        weight: 1.8
    },
    {
        id: "mfg-engineering-stock-deep-01",
        text: "Scrap recovery value monthly?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "engineering-fab",
        isLongFormOnly: true,
        weight: 2.0
    }
];
