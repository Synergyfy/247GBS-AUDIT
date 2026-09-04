import { Question } from "@/types/audit";

export const AGRICULTURE_QUESTIONS: Question[] = [
    // 1. Farming & Food Production
    {
        id: "agri-farming-stock-trigger-01",
        text: "Are seeds or feed overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["agriculture-environment"],
        groupId: "farming",
        weight: 2.0
    },
    {
        id: "agri-farming-stock-deep-01",
        text: "Value of overstocked seeds/feed/fertiliser?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["agriculture-environment"],
        groupId: "farming",
        isLongFormOnly: true,
        weight: 3.0
    },

    // 2. Horticulture & Landscaping
    {
        id: "agri-hort-stock-trigger-01",
        text: "Are plants, soils, or seeds overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["agriculture-environment"],
        groupId: "horticulture",
        weight: 1.5
    },

    // 3. Renewable Energy
    {
        id: "agri-energy-stock-trigger-01",
        text: "Are solar panels, wind turbines, or EV chargers overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["agriculture-environment"],
        groupId: "energy",
        weight: 2.5
    }
];
