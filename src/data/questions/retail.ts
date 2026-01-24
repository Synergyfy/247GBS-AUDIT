import { Question } from "@/types/audit";

export const RETAIL_QUESTIONS: Question[] = [
    // 1. Grocery & Convenience
    {
        id: "retail-grocery-stock-trigger-01",
        text: "What percentage of perishable goods expires monthly?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["retail-wholesale"],
        groupId: "grocery",
        weight: 1.8
    },
    {
        id: "retail-grocery-stock-trigger-02",
        text: "How often are unsold fresh items discarded?",
        type: "number",
        category: "EXCESS_STOCK",
        sectorSpecific: ["retail-wholesale"],
        groupId: "grocery",
        weight: 1.5,
        helpText: "Enter times per week."
    },
    {
        id: "retail-grocery-stock-deep-01",
        text: "Monthly expired stock value?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["retail-wholesale"],
        groupId: "grocery",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 2. Fashion & Accessories
    {
        id: "retail-fashion-stock-trigger-01",
        text: "What percentage of seasonal stock remains unsold?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["retail-wholesale"],
        groupId: "fashion",
        weight: 2.0
    },
    {
        id: "retail-fashion-stock-deep-01",
        text: "Average stock age in days?",
        type: "number",
        category: "EXCESS_STOCK",
        sectorSpecific: ["retail-wholesale"],
        groupId: "fashion",
        isLongFormOnly: true,
        weight: 1.8
    },

    // 3. Electronics & Appliances
    {
        id: "retail-electronics-stock-trigger-01",
        text: "How much obsolete stock is held monthly?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["retail-wholesale"],
        groupId: "electronics",
        weight: 2.2
    },
    {
        id: "retail-electronics-stock-deep-01",
        text: "Obsolete model write-off value?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["retail-wholesale"],
        groupId: "electronics",
        isLongFormOnly: true,
        weight: 2.8
    },

    // 4. Home & Lifestyle
    {
        id: "retail-home-stock-trigger-01",
        text: "How much display stock remains unsold?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["retail-wholesale"],
        groupId: "home-lifestyle",
        weight: 1.5
    },
    {
        id: "retail-home-stock-deep-01",
        text: "Ageing bulky stock value?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["retail-wholesale"],
        groupId: "home-lifestyle",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 5. Wholesale & Distribution
    {
        id: "retail-wholesale-stock-trigger-01",
        text: "What percentage of bulk stock remains unsold?",
        type: "percentage",
        category: "EXCESS_STOCK",
        sectorSpecific: ["retail-wholesale"],
        groupId: "wholesale-dist",
        weight: 2.5
    },
    {
        id: "retail-wholesale-stock-deep-01",
        text: "Ageing pallet stock value?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["retail-wholesale"],
        groupId: "wholesale-dist",
        isLongFormOnly: true,
        weight: 3.0
    }
];
