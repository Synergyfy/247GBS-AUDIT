import { Question } from "@/types/audit";

export const HOSPITALITY_QUESTIONS: Question[] = [
    // 1. Restaurants & Dining
    // Short Form
    {
        id: "hosp-dining-stock-trigger-01",
        text: "What percentage of food stock expires before use each month?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "dining",
        weight: 1.5
    },
    {
        id: "hosp-dining-stock-trigger-02",
        text: "How often do you dispose of unsold cooked food weekly?",
        type: "number",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "dining",
        weight: 1.2,
        helpText: "Enter number of times per week."
    },
    {
        id: "hosp-dining-stock-trigger-03",
        text: "Do you regularly over-order ingredients due to demand uncertainty?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "dining",
        weight: 1.0,
    },
    // Long Form
    {
        id: "hosp-dining-stock-deep-01",
        text: "What is your average monthly food waste value?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "dining",
        isLongFormOnly: true,
        weight: 2.0
    },
    {
        id: "hosp-dining-stock-deep-02",
        text: "What percentage of stock is slow-moving (over 60 days)?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "dining",
        isLongFormOnly: true,
        weight: 1.8
    },

    // 2. Cafés & Beverage Outlets
    // Short Form
    {
        id: "hosp-cafes-stock-trigger-01",
        text: "How much milk and dairy is discarded weekly?",
        type: "number",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "cafes",
        weight: 1.5,
        helpText: "Enter volume in litres."
    },
    {
        id: "hosp-cafes-stock-trigger-02",
        text: "What percentage of pastries expire unsold?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "cafes",
        weight: 1.8
    },
    // Long Form
    {
        id: "hosp-cafes-stock-deep-01",
        text: "Monthly beverage ingredient wastage value?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "cafes",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 3. Catering & Events
    // Short Form
    {
        id: "hosp-catering-stock-trigger-01",
        text: "What percentage of prepared food is unused per event?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "catering",
        weight: 2.0
    },
    // Long Form
    {
        id: "hosp-catering-stock-deep-01",
        text: "Average waste cost per event?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "catering",
        isLongFormOnly: true,
        weight: 2.2
    },

    // 4. Pubs, Bars & Nightlife
    // Short Form
    {
        id: "hosp-nightlife-stock-trigger-01",
        text: "What percentage of draft drinks are wasted?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "nightlife",
        weight: 1.8
    },
    // Long Form
    {
        id: "hosp-nightlife-stock-deep-01",
        text: "Monthly beverage wastage value?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "nightlife",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 5. Food Production & Distribution
    // Short Form
    {
        id: "hosp-production-stock-trigger-01",
        text: "What percentage of raw materials expires?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "food-production",
        weight: 2.0
    },
    // Long Form
    {
        id: "hosp-production-stock-deep-01",
        text: "Finished goods obsolescence cost?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["hospitality-food"],
        groupId: "food-production",
        isLongFormOnly: true,
        weight: 2.8
    }
];
