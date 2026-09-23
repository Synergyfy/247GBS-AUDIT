import { Question } from "@/types/audit";

export const TOURISM_QUESTIONS: Question[] = [
    // 1. Accommodation
    {
        id: "tour-stay-stock-trigger-01",
        text: "Are guest amenities overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["tourism-travel"],
        groupId: "accommodation",
        weight: 1.5
    },
    {
        id: "tour-stay-stock-deep-01",
        text: "Value of overstocked guest amenities?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["tourism-travel"],
        groupId: "accommodation",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 2. Travel Services
    {
        id: "tour-travel-stock-trigger-01",
        text: "Are printed travel guides or brochures overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["tourism-travel"],
        groupId: "travel-svcs",
        weight: 1.2
    },
    {
        id: "tour-travel-stock-deep-01",
        text: "Value of overstocked travel guides/brochures?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["tourism-travel"],
        groupId: "travel-svcs",
        isLongFormOnly: true,
        weight: 1.8
    },

    // 3. Leisure & Entertainment
    {
        id: "tour-leisure-stock-trigger-01",
        text: "Are tickets or passes overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["tourism-travel"],
        groupId: "leisure-ent",
        weight: 1.8
    },

    // 4. Events & Recreation
    {
        id: "tour-events-stock-trigger-01",
        text: "Are event supplies overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["tourism-travel"],
        groupId: "events-rec",
        weight: 2.0
    }
];
