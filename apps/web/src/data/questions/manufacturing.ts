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
    },

    // ==========================================
    // SPARE CAPACITY QUESTIONS
    // ==========================================

    // 1. Light Manufacturing
    {
        id: "mfg-light-capacity-trigger-01",
        text: "What is your average machine utilization rate?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "light-mfg",
        weight: 2.0
    },
    {
        id: "mfg-light-capacity-trigger-02",
        text: "Are there regular idle staff hours per shift?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "light-mfg",
        weight: 1.5
    },
    {
        id: "mfg-light-capacity-deep-01",
        text: "How much production line capacity is unused weekly?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "light-mfg",
        isLongFormOnly: true,
        weight: 2.2
    },

    // 2. Heavy Manufacturing
    {
        id: "mfg-heavy-capacity-trigger-01",
        text: "What is the average machine load vs capacity?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "heavy-mfg",
        weight: 2.2
    },
    {
        id: "mfg-heavy-capacity-trigger-02",
        text: "Are fabrication bays idle during shifts?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "heavy-mfg",
        weight: 1.8
    },
    {
        id: "mfg-heavy-capacity-deep-01",
        text: "How many shift hours are under-utilized?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "heavy-mfg",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 3. Food & Beverage (F&B) Manufacturing
    {
        id: "mfg-fb-capacity-trigger-01",
        text: "What is your bottling/filling line utilization?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "fb-mfg",
        weight: 2.0
    },
    {
        id: "mfg-fb-capacity-trigger-02",
        text: "Is cold storage capacity fully used?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "fb-mfg",
        weight: 1.5
    },
    {
        id: "mfg-fb-capacity-deep-01",
        text: "How much cleaning/changeover downtime occurs weekly?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "fb-mfg",
        helpText: "Enter hours per week.",
        isLongFormOnly: true,
        weight: 2.2
    },

    // 4. Chemical & Materials
    {
        id: "mfg-chem-capacity-trigger-01",
        text: "What is your reactor/mixer utilization rate?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "chem-materials",
        weight: 2.5
    },
    {
        id: "mfg-chem-capacity-trigger-02",
        text: "Are tanks or storage silos idle?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "chem-materials",
        weight: 2.0
    },
    {
        id: "mfg-chem-capacity-deep-01",
        text: "How much time is lost to batch changeovers?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "chem-materials",
        helpText: "Enter hours per week.",
        isLongFormOnly: true,
        weight: 2.8
    },

    // 5. Engineering & Fabrication
    {
        id: "mfg-engineering-capacity-trigger-01",
        text: "What is your CNC/Machine utilization rate?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "engineering-fab",
        weight: 2.2
    },
    {
        id: "mfg-engineering-capacity-trigger-02",
        text: "Are there idle shifts in the schedule?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "engineering-fab",
        weight: 1.8
    },
    {
        id: "mfg-engineering-capacity-deep-01",
        text: "How much time is lost to tool changes/setup?",
        type: "number",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["manufacturing-industrial"],
        groupId: "engineering-fab",
        helpText: "Enter hours per week.",
        isLongFormOnly: true,
        weight: 2.0
    }
];
