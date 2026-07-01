import type { AuditCategory } from "@/types/audit";

export interface AuditStage {
    id: string;
    number: number;
    title: string;
    description: string;
    purpose: string;
    icon: string;
    category: AuditCategory;
}

export const AUDIT_STAGES: AuditStage[] = [
    {
        id: "stock-inventory",
        number: 1,
        title: "Stock & Inventory",
        description: "We are now reviewing your inventory levels, stock management practices, and identifying opportunities to reduce excess or slow-moving stock.",
        purpose: "This helps us understand where capital may be tied up and how efficiently your inventory is being managed.",
        icon: "Package",
        category: "EXCESS_STOCK"
    },
    {
        id: "capacity-operations",
        number: 2,
        title: "Capacity & Operations",
        description: "We are now assessing how effectively you are utilising your operational capacity — including staff, equipment, and facilities.",
        purpose: "This helps identify opportunities to increase output without proportionally increasing costs.",
        icon: "Zap",
        category: "SPARE_CAPACITY"
    },
    {
        id: "customers-loyalty",
        number: 3,
        title: "Customers & Loyalty",
        description: "We are now reviewing how your business acquires, retains, and engages customers.",
        purpose: "This helps identify opportunities to increase repeat business and customer lifetime value.",
        icon: "Users",
        category: "CUSTOMERS"
    },
    {
        id: "marketing-growth",
        number: 4,
        title: "Marketing & Growth",
        description: "We are now examining your marketing efforts, customer acquisition channels, and growth strategies.",
        purpose: "This helps us understand how effectively you are attracting new customers and positioning your business for growth.",
        icon: "Target",
        category: "MARKETING"
    },
    {
        id: "technology-systems",
        number: 5,
        title: "Technology & Systems",
        description: "We are now reviewing the technology and systems you use to manage your business operations.",
        purpose: "This helps identify opportunities to improve efficiency through better tools and automation.",
        icon: "Cpu",
        category: "TECHNOLOGY"
    },
    {
        id: "financial-management",
        number: 6,
        title: "Financial Management",
        description: "We are now examining your financial processes, pricing strategies, and cost management.",
        purpose: "This helps us understand your financial health and identify opportunities to improve profitability.",
        icon: "BarChart3",
        category: "FINANCE"
    }
];

export function getStageByCategory(category: AuditCategory): AuditStage | undefined {
    return AUDIT_STAGES.find(s => s.category === category);
}

export function getStageById(id: string): AuditStage | undefined {
    return AUDIT_STAGES.find(s => s.id === id);
}
