import { Sector } from "@/types/audit";

export const SECTORS: Sector[] = [
    {
        id: "hospitality-food",
        name: "Hospitality / Food Services",
        visuals: {
            backgroundImage: "/backgrounds/hospitality.jpg",
            primaryColor: "#f97316", // orange-500
            accentColor: "#0f172a",  // slate-900
            iconName: "Utensils"
        },
        calculationModels: {
            capacity: "hospitality_occupancy_model",
            stock: "perishable_waste_model"
        },
        recommendationTemplates: [
            {
                id: "high_idle_staff",
                condition: "answers.idle_staff > 5",
                title: "Staff Performance Pivot",
                description: "Your staff idle time is exceeding industry standard for casual dining.",
                actionItem: "Implement cross-training for floor staff to handle kitchen prep during lows."
            },
            {
                id: "high_stock_waste",
                condition: "answers.waste_levels > 10",
                title: "Inventory Forensic Audit",
                description: "Significant value is being lost to perishable waste.",
                actionItem: "Transition to a Daily-Fresh ordering model for top 5 high-value ingredients."
            }
        ],
        groups: [
            {
                id: "restaurants",
                name: "Restaurants",
                types: [
                    {
                        id: "fine-dining",
                        name: "Fine Dining Restaurant",
                        specificQuestions: ["peak_hour_vacant_seats", "waiter_idle_time_cost"]
                    },
                    {
                        id: "casual-dining",
                        name: "Casual Dining Restaurant"
                    },
                    {
                        id: "fast-food",
                        name: "Fast Food / QSR"
                    }
                ],
            },
            {
                id: "cafes",
                name: "Cafés & Coffee Shops",
                types: [
                    { id: "independent-cafe", name: "Independent Café" },
                    { id: "chain-cafe", name: "Chain Franchise" },
                ],
            }
        ],
    },
    {
        id: "manufacturing",
        name: "Manufacturing",
        visuals: {
            backgroundImage: "/backgrounds/manufacturing.jpg",
            primaryColor: "#3b82f6", // blue-500
            accentColor: "#1e293b",  // slate-800
            iconName: "Factory"
        },
        calculationModels: {
            capacity: "machine_uptime_model",
            stock: "raw_material_turnover"
        },
        recommendationTemplates: [
            {
                id: "machine_idle",
                condition: "answers.idle_equipment_pct > 25",
                title: "Maintenance Scheduling Optimization",
                description: "Machine downtime is hitting critical levels.",
                actionItem: "Implement predictive maintenance tracking to reduce emergency idle time."
            }
        ],
        groups: [
            {
                id: "industrial",
                name: "Industrial Goods",
                types: [
                    { id: "heavy-machinery", name: "Heavy Machinery" },
                    { id: "component-parts", name: "Component Parts" }
                ],
            }
        ],
    },
];
