import { Question } from "@/types/audit";

export const ONLINE_QUESTIONS: Question[] = [
    // 1. E-Commerce
    {
        id: "online-ecom-stock-trigger-01",
        text: "Do you have unsold products in storage?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["online-micro"],
        groupId: "ecommerce",
        weight: 2.0,
    },
    {
        id: "online-ecom-stock-deep-01",
        text: "Value of unsold inventory?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["online-micro"],
        groupId: "ecommerce",
        isLongFormOnly: true,
        weight: 3.0
    },

    // 4. Digital Entrepreneurs
    {
        id: "online-digital-stock-trigger-01",
        text: "Are digital products unsold or unused?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["online-micro"],
        groupId: "digital-ent",
        weight: 1.5
    },
    {
        id: "online-digital-stock-deep-01",
        text: "Value of unsold digital products?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["online-micro"],
        groupId: "digital-ent",
        isLongFormOnly: true,
        weight: 2.0
    }
];
