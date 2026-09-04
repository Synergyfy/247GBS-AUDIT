import { Question } from "@/types/audit";

export const TRANSPORT_QUESTIONS: Question[] = [
    // 1. Passenger Transport
    {
        id: "trans-passenger-stock-trigger-01",
        text: "Are vehicle spare parts overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["transport-logistics"],
        groupId: "passenger-transport",
        weight: 1.8
    },
    {
        id: "trans-passenger-stock-deep-01",
        text: "Value of overstocked spare parts?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["transport-logistics"],
        groupId: "passenger-transport",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 2. Freight & Logistics
    {
        id: "trans-freight-stock-trigger-01",
        text: "Are packaging materials overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["transport-logistics"],
        groupId: "freight",
        weight: 1.5
    },
    {
        id: "trans-freight-stock-deep-01",
        text: "Value of overstocked packaging/logistics materials?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["transport-logistics"],
        groupId: "freight",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 3. Automotive Services
    {
        id: "trans-auto-stock-trigger-01",
        text: "Are vehicle parts overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["transport-logistics"],
        groupId: "automotive",
        weight: 2.0
    },
    {
        id: "trans-auto-stock-deep-01",
        text: "Value of overstocked vehicle parts?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["transport-logistics"],
        groupId: "automotive",
        isLongFormOnly: true,
        weight: 2.8
    },

    // 4. Vehicle Sales & Rental
    {
        id: "trans-sales-stock-trigger-01",
        text: "Are vehicles or parts overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["transport-logistics"],
        groupId: "vehicle-sales-rental",
        weight: 2.5
    },
    {
        id: "trans-sales-stock-deep-01",
        text: "Value of overstocked vehicles/parts?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["transport-logistics"],
        groupId: "vehicle-sales-rental",
        isLongFormOnly: true,
        weight: 3.5
    }
];
