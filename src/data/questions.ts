import { Question } from "@/types/audit";
import { HOSPITALITY_QUESTIONS } from "./questions/hospitality";
import { RETAIL_QUESTIONS } from "./questions/retail";
import { MANUFACTURING_QUESTIONS } from "./questions/manufacturing";
import { PROFESSIONAL_QUESTIONS } from "./questions/professional";
import { CONSTRUCTION_QUESTIONS } from "./questions/construction";
import { HEALTH_QUESTIONS } from "./questions/health";
import { EDUCATION_QUESTIONS } from "./questions/education";
import { TRANSPORT_QUESTIONS } from "./questions/transport";
import { TECHNOLOGY_QUESTIONS } from "./questions/technology";
import { FINANCIAL_QUESTIONS } from "./questions/financial";
import { TOURISM_QUESTIONS } from "./questions/tourism";
import { AGRICULTURE_QUESTIONS } from "./questions/agriculture";
import { COMMUNITY_QUESTIONS } from "./questions/community";
import { ONLINE_QUESTIONS } from "./questions/online";

const GENERAL_QUESTIONS: Question[] = [
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
    // EXCESS STOCK - SHORT FORM (GENERAL)
    {
        id: "stock_value_excess",
        text: "Total estimated value of stock older than 90 days?",
        type: "number",
        category: "EXCESS_STOCK",
        weight: 1,
    },
    // SPARE CAPACITY - LONG FORM (GENERAL)
    {
        id: "peak_hour_vacant_seats_gen",
        text: "Average unused capacity during peak hours?",
        type: "percentage",
        category: "SPARE_CAPACITY",
        isLongFormOnly: true,
        weight: 2,
    },
    // EXCESS STOCK - LONG FORM (GENERAL)
    {
        id: "storage_sqft_cost_gen",
        text: "Monthly cost per square foot of your storage facility?",
        type: "currency",
        category: "EXCESS_STOCK",
        isLongFormOnly: true,
        weight: 1.5,
    }
];

export const AUDIT_QUESTIONS: Question[] = [
    ...GENERAL_QUESTIONS,
    ...HOSPITALITY_QUESTIONS,
    ...RETAIL_QUESTIONS,
    ...MANUFACTURING_QUESTIONS,
    ...PROFESSIONAL_QUESTIONS,
    ...CONSTRUCTION_QUESTIONS,
    ...HEALTH_QUESTIONS,
    ...EDUCATION_QUESTIONS,
    ...TRANSPORT_QUESTIONS,
    ...TECHNOLOGY_QUESTIONS,
    ...FINANCIAL_QUESTIONS,
    ...TOURISM_QUESTIONS,
    ...AGRICULTURE_QUESTIONS,
    ...COMMUNITY_QUESTIONS,
    ...ONLINE_QUESTIONS
];
