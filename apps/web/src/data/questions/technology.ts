import { Question } from "@/types/audit";

export const TECHNOLOGY_QUESTIONS: Question[] = [
    // 1. Software & IT
    {
        id: "tech-software-stock-trigger-01",
        text: "Are hardware items (servers, computers, peripherals) overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["technology-digital"],
        groupId: "software-it",
        weight: 1.8
    },
    {
        id: "tech-software-stock-deep-01",
        text: "Value of overstocked hardware?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["technology-digital"],
        groupId: "software-it",
        isLongFormOnly: true,
        weight: 2.5
    },

    // 2. Web & Design
    {
        id: "tech-web-stock-trigger-01",
        text: "Are creative tools (tablets, PCs, cameras) overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["technology-digital"],
        groupId: "web-design",
        weight: 1.5
    },
    {
        id: "tech-web-stock-deep-01",
        text: "Value of overstocked creative tools?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["technology-digital"],
        groupId: "web-design",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 3. Media & Content
    {
        id: "tech-media-stock-trigger-01",
        text: "Are production equipment or tools overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["technology-digital"],
        groupId: "media-content",
        weight: 2.0
    }
];
