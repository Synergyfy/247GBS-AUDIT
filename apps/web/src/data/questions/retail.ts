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
    },

    // ==========================================
    // SPARE CAPACITY QUESTIONS
    // ==========================================

    // 1. Grocery & Convenience
    {
        id: "retail-grocery-capacity-trigger-01",
        text: "Are shelves, aisles, or fridges regularly underused?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "grocery",
        weight: 1.5
    },
    {
        id: "retail-grocery-capacity-trigger-02",
        text: "Do you experience quiet hours with low customer traffic?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "grocery",
        weight: 1.5
    },
    {
        id: "retail-grocery-capacity-deep-01",
        text: "How much refrigerated/frozen space is unused weekly?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "grocery",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 2. Fashion & Accessories
    {
        id: "retail-fashion-capacity-trigger-01",
        text: "Do fitting rooms remain unused most days?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "fashion",
        weight: 1.5
    },
    {
        id: "retail-fashion-capacity-deep-01",
        text: "What percentage of floor space generates low sales?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "fashion",
        isLongFormOnly: true,
        weight: 2.2
    },

    // 3. Electronics & Appliances
    {
        id: "retail-electronics-capacity-trigger-01",
        text: "Do demo stations or technicians remain idle?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "electronics",
        weight: 1.8
    },
    {
        id: "retail-electronics-capacity-deep-01",
        text: "What percentage of repair bay time is idle?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "electronics",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 4. Home & Lifestyle
    {
        id: "retail-home-capacity-trigger-01",
        text: "Do showrooms have significant low-traffic areas?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "home-lifestyle",
        weight: 1.5
    },
    {
        id: "retail-home-capacity-trigger-02",
        text: "Are delivery vehicles underused?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "home-lifestyle",
        weight: 2.0
    },
    {
        id: "retail-home-capacity-deep-01",
        text: "What percentage of warehouse storage space is unused?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "home-lifestyle",
        isLongFormOnly: true,
        weight: 2.2
    },

    // 5. Wholesale & Distribution
    {
        id: "retail-wholesale-capacity-trigger-01",
        text: "Are pallets or racking spaces visibly empty?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "wholesale-dist",
        weight: 2.0
    },
    {
        id: "retail-wholesale-capacity-trigger-02",
        text: "Are delivery vehicles or loading bays idle?",
        type: "boolean",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "wholesale-dist",
        weight: 2.2
    },
    {
        id: "retail-wholesale-capacity-deep-01",
        text: "What percentage of total warehouse capacity is unused?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        sectorSpecific: ["retail-wholesale"],
        groupId: "wholesale-dist",
        isLongFormOnly: true,
        weight: 2.8
    }
];
