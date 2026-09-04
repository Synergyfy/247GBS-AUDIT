import { Question } from "@/types/audit";

export const COMMUNITY_QUESTIONS: Question[] = [
    // 1. Charities & NGOs
    {
        id: "comm-charity-stock-trigger-01",
        text: "Are donated goods overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["community-public"],
        groupId: "charity-ngo",
        weight: 1.5
    },
    {
        id: "comm-charity-stock-deep-01",
        text: "Value of unused donated goods?",
        type: "currency",
        category: "EXCESS_STOCK",
        sectorSpecific: ["community-public"],
        groupId: "charity-ngo",
        isLongFormOnly: true,
        weight: 2.0
    },

    // 3. Public & Social Services
    {
        id: "comm-social-stock-trigger-01",
        text: "Are medical or care supplies overstocked?",
        type: "boolean",
        category: "EXCESS_STOCK",
        sectorSpecific: ["community-public"],
        groupId: "public-svcs",
        weight: 1.8
    }
];
