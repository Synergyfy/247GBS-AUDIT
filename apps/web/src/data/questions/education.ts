import { Question } from "@/types/audit";

export const EDUCATION_QUESTIONS: Question[] = [
    // 1. Schools & Colleges
    {
        id: "edu-schools-stock-trigger-01",
        text: "Are textbooks or learning materials overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["education-training"],
        groupId: "schools",
        weight: 1.5,
    },
    {
        id: "edu-schools-stock-deep-01",
        text: "Value of overstocked learning materials?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["education-training"],
        groupId: "schools",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 2. Training Providers
    {
        id: "edu-training-stock-trigger-01",
        text: "Are course materials overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["education-training"],
        groupId: "training-providers",
        weight: 1.5,
    },
    {
        id: "edu-training-stock-deep-01",
        text: "Value of overstocked course materials?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["education-training"],
        groupId: "training-providers",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 3. Childcare Services
    {
        id: "edu-childcare-stock-trigger-01",
        text: "Are learning toys or activity materials overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["education-training"],
        groupId: "childcare",
        weight: 1.2,
    },
    {
        id: "edu-childcare-stock-deep-01",
        text: "Value of overstocked toys/materials?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["education-training"],
        groupId: "childcare",
        isLongFormOnly: true,
        weight: 1.5
    },

    // 4. Online Education
    {
        id: "edu-online-stock-trigger-01",
        text: "Are digital learning assets underutilised?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["education-training"],
        groupId: "online-education",
        weight: 2.0,
    },
    {
        id: "edu-online-stock-deep-01",
        text: "Value of underutilised digital assets?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["education-training"],
        groupId: "online-education",
        isLongFormOnly: true,
        weight: 3.0
    }
];
