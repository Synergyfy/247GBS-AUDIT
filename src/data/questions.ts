import { Question } from "@/types/audit";

export const AUDIT_QUESTIONS: Question[] = [
    // SPARE CAPACITY - SHORT FORM (GENERAL)
    {
        id: "idle_staff_general",
        text: "Average number of staff with no active tasks during shift?",
        type: "number",
        category: "SPARE_CAPACITY",
        weight: 1,
    },
    {
        id: "idle_equipment_general",
        text: "Estimated percentage of core equipment not in use?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        weight: 1,
    },

    // SPARE CAPACITY - LONG FORM (SECTOR SPECIFIC - HOSPITALITY)
    {
        id: "peak_hour_vacant_seats",
        text: "Total number of seats unoccupied during peak Friday/Saturday hours?",
        type: "number",
        category: "SPARE_CAPACITY",
        isLongFormOnly: true,
        sectorSpecific: ["hospitality-food"],
        weight: 2,
        helpText: "Focus on your most profitable hours only.",
    },
    {
        id: "waiter_idle_time_cost",
        text: "Wait staff collective idle hours per week (Avg)?",
        type: "number",
        category: "SPARE_CAPACITY",
        isLongFormOnly: true,
        sectorSpecific: ["hospitality-food"],
        weight: 2.5,
        helpText: "Calculated as: (Total Staff x Total Shift Hours) - (Cover Count x Avg Service Duration)",
    },

    // EXCESS STOCK - SHORT FORM
    {
        id: "stock_value_excess",
        text: "Total estimated value of stock older than 90 days?",
        type: "currency",
        category: "EXCESS_STOCK",
        weight: 1,
    },

    // EXCESS STOCK - LONG FORM
    {
        id: "storage_sqft_cost",
        text: "Monthly cost per square foot of your storage facility?",
        type: "currency",
        category: "EXCESS_STOCK",
        isLongFormOnly: true,
        weight: 1.5,
    },
    {
        id: "perishable_waste_pct",
        text: "Percentage of inventory lost to expiration/spoilage?",
        type: "percentage",
        category: "EXCESS_STOCK",
        isLongFormOnly: true,
        sectorSpecific: ["hospitality-food"],
        weight: 3,
    },
];
