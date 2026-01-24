import { Sector } from "@/types/audit";

export const SECTORS: Sector[] = [
    {
        id: "hospitality-food",
        name: "Hospitality, Food & Beverage",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80",
            primaryColor: "#f97316",
            accentColor: "#0f172a",
            iconName: "Utensils"
        },
        calculationModels: { capacity: "hospitality_model", stock: "food_waste_model" },
        recommendationTemplates: [],
        groups: [
            {
                id: "dining",
                name: "Restaurants & Dining",
                types: [
                    { id: "fine-dining", name: "Fine Dining Restaurants" },
                    { id: "casual-dining", name: "Casual Dining Restaurants" },
                    { id: "fast-food", name: "Fast Food / QSR" },
                    { id: "takeaway", name: "Takeaway Shops" },
                    { id: "street-food", name: "Street Food Vendors" },
                    { id: "ghost-kitchen", name: "Ghost Kitchens" },
                    { id: "specialty-dining", name: "Ethnic / Specialty Restaurants" }
                ]
            },
            {
                id: "cafes",
                name: "Cafés & Beverage Outlets",
                types: [
                    { id: "coffee-shop", name: "Coffee Shops" },
                    { id: "tea-house", name: "Tea Houses" },
                    { id: "juice-bar", name: "Juice Bars" },
                    { id: "bubble-tea", name: "Bubble Tea Shops" },
                    { id: "dessert-cafe", name: "Dessert Cafés" }
                ]
            },
            {
                id: "catering",
                name: "Catering & Events",
                types: [
                    { id: "corp-catering", name: "Corporate Catering" },
                    { id: "wedding-catering", name: "Wedding Catering" },
                    { id: "mobile-catering", name: "Mobile Catering Vans" },
                    { id: "event-food", name: "Event Food Services" },
                    { id: "institutional-catering", name: "School / Hospital Catering" }
                ]
            },
            {
                id: "nightlife",
                name: "Pubs, Bars & Nightlife",
                types: [
                    { id: "trad-pub", name: "Traditional Pubs" },
                    { id: "cocktail-bar", name: "Cocktail Bars" },
                    { id: "sports-bar", name: "Sports Bars" },
                    { id: "wine-bar", name: "Wine Bars" },
                    { id: "nightclub", name: "Nightclubs" },
                    { id: "music-venue", name: "Live Music Venues" }
                ]
            },
            {
                id: "food-production",
                name: "Food Production & Distribution",
                types: [
                    { id: "bakery", name: "Bakeries" },
                    { id: "food-mfg", name: "Food Manufacturers" },
                    { id: "meal-prep", name: "Meal Prep Companies" },
                    { id: "food-wholesalers", name: "Food Wholesalers" },
                    { id: "food-importers", name: "Food Importers" }
                ]
            }
        ]
    },
    {
        id: "retail-wholesale",
        name: "Retail & Wholesale",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80",
            primaryColor: "#3b82f6",
            accentColor: "#1e293b",
            iconName: "ShoppingBag"
        },
        calculationModels: { capacity: "retail_model", stock: "inventory_model" },
        recommendationTemplates: [],
        groups: [
            {
                id: "grocery",
                name: "Grocery & Convenience",
                types: [
                    { id: "supermarket", name: "Supermarkets" },
                    { id: "convenience", name: "Convenience Stores" },
                    { id: "off-licence", name: "Off-Licences" },
                    { id: "mini-mart", name: "Mini-Marts" }
                ]
            },
            {
                id: "fashion",
                name: "Fashion & Accessories",
                types: [
                    { id: "clothing-store", name: "Clothing Stores" },
                    { id: "shoe-shop", name: "Shoe Shops" },
                    { id: "jewellery", name: "Jewellery Shops" },
                    { id: "bags-luggage", name: "Bag & Luggage Stores" },
                    { id: "tailor", name: "Tailor Shops" }
                ]
            },
            {
                id: "electronics",
                name: "Electronics & Appliances",
                types: [
                    { id: "mobile-shop", name: "Mobile Phone Shops" },
                    { id: "computer-store", name: "Computer Stores" },
                    { id: "appliance-retail", name: "Appliance Retailers" },
                    { id: "gaming-store", name: "Gaming Stores" }
                ]
            },
            {
                id: "home-lifestyle",
                name: "Home & Lifestyle",
                types: [
                    { id: "furniture-store", name: "Furniture Stores" },
                    { id: "home-decor", name: "Home Décor Shops" },
                    { id: "lighting-store", name: "Lighting Stores" },
                    { id: "kitchenware", name: "Kitchenware Stores" }
                ]
            },
            {
                id: "wholesale-dist",
                name: "Wholesale & Distribution",
                types: [
                    { id: "cash-carry", name: "Cash & Carry" },
                    { id: "trade-wholesalers", name: "Trade Wholesalers" },
                    { id: "import-export", name: "Import / Export Traders" },
                    { id: "dist-centres", name: "Distribution Centres" }
                ]
            }
        ]
    },
    {
        id: "manufacturing-industrial",
        name: "Manufacturing & Industrial",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
            primaryColor: "#10b981",
            accentColor: "#064e3b",
            iconName: "Factory"
        },
        calculationModels: { capacity: "mfg_model", stock: "material_model" },
        recommendationTemplates: [],
        groups: [
            {
                id: "light-mfg",
                name: "Light Manufacturing",
                types: [
                    { id: "clothing-mfg", name: "Clothing Manufacturing" },
                    { id: "furniture-mfg", name: "Furniture Manufacturing" },
                    { id: "packaging-prod", name: "Packaging Production" },
                    { id: "printing-press", name: "Printing Presses" }
                ]
            },
            {
                id: "heavy-mfg",
                name: "Heavy Manufacturing",
                types: [
                    { id: "metal-fab", name: "Metal Fabrication" },
                    { id: "machinery-mfg", name: "Machinery Manufacturing" },
                    { id: "auto-parts", name: "Automotive Parts" },
                    { id: "construction-mat", name: "Construction Materials" }
                ]
            },
            {
                id: "fb-mfg",
                name: "Food & Beverage Manufacturing",
                types: [
                    { id: "bev-bottling", name: "Beverage Bottling" },
                    { id: "meat-processing", name: "Meat Processing" },
                    { id: "dairy-processing", name: "Dairy Processing" },
                    { id: "confectionery-prod", name: "Confectionery Production" }
                ]
            },
            {
                id: "chem-materials",
                name: "Chemical & Materials",
                types: [
                    { id: "paint-mfg", name: "Paint Manufacturing" },
                    { id: "plastic-proc", name: "Plastic Processing" },
                    { id: "cleaning-prod", name: "Cleaning Products" },
                    { id: "ind-chem", name: "Industrial Chemicals" }
                ]
            },
            {
                id: "engineering-fab",
                name: "Engineering & Fabrication",
                types: [
                    { id: "cnc-workshop", name: "CNC Workshops" },
                    { id: "welding-svcs", name: "Welding Services" },
                    { id: "tool-making", name: "Tool Making" },
                    { id: "prototyping-lab", name: "Prototyping Labs" }
                ]
            }
        ]
    },
    {
        id: "professional-business",
        name: "Professional & Business Services",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1454165833772-d996d49513d7?auto=format&fit=crop&q=80",
            primaryColor: "#6366f1",
            accentColor: "#312e81",
            iconName: "Briefcase"
        },
        calculationModels: { capacity: "service_model", stock: "digital_inventory" },
        recommendationTemplates: [],
        groups: [
            {
                id: "consulting",
                name: "Consulting & Advisory",
                types: [
                    { id: "management-cons", name: "Management Consulting" },
                    { id: "financial-cons", name: "Financial Consulting" },
                    { id: "hr-cons", name: "HR Consulting" },
                    { id: "strategy-adv", name: "Strategy Advisory" }
                ]
            },
            {
                id: "legal-compliance",
                name: "Legal & Compliance",
                types: [
                    { id: "law-firms", name: "Law Firms" },
                    { id: "imm-advisors", name: "Immigration Advisors" },
                    { id: "compliance-cons", name: "Compliance Consultants" },
                    { id: "notary-svcs", name: "Notary Services" }
                ]
            }
        ]
    },
    {
        id: "construction-property",
        name: "Construction, Property & Trades",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80",
            primaryColor: "#8b5cf6",
            accentColor: "#4c1d95",
            iconName: "HardHat"
        },
        calculationModels: { capacity: "industrial_model", stock: "materials_model" },
        recommendationTemplates: [],
        groups: [
            {
                id: "construction",
                name: "Construction",
                types: [
                    { id: "res-builders", name: "Residential Builders" },
                    { id: "comm-contractors", name: "Commercial Contractors" },
                    { id: "renovation-cos", name: "Renovation Companies" },
                    { id: "civil-eng", name: "Civil Engineering Firms" }
                ]
            },
            {
                id: "property",
                name: "Property Services",
                types: [
                    { id: "estate-agents", name: "Estate Agents" },
                    { id: "letting-agents", name: "Letting Agents" },
                    { id: "prop-managers", name: "Property Managers" },
                    { id: "surveyors", name: "Surveyors" }
                ]
            },
            {
                id: "trades",
                name: "Trade & Handyman Services",
                types: [
                    { id: "electricians", name: "Electricians" },
                    { id: "plumbers", name: "Plumbers" },
                    { id: "carpenters", name: "Carpenters" },
                    { id: "painters", name: "Painters & Decorators" }
                ]
            }
        ]
    },
    {
        id: "health-wellness",
        name: "Health, Wellness & Personal Care",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80",
            primaryColor: "#ec4899",
            accentColor: "#831843",
            iconName: "Heart"
        },
        calculationModels: { capacity: "appointment_model", stock: "supply_model" },
        recommendationTemplates: [],
        groups: [
            {
                id: "medical",
                name: "Medical & Clinical",
                types: [
                    { id: "gp-clinics", name: "GP Clinics" },
                    { id: "dental-practices", name: "Dental Practices" },
                    { id: "physio-clinics", name: "Physiotherapy Clinics" },
                    { id: "private-hospitals", name: "Private Hospitals" }
                ]
            },
            {
                id: "beauty",
                name: "Beauty & Grooming",
                types: [
                    { id: "hair-salon", name: "Hair Salons" },
                    { id: "barbershop", name: "Barbershops" },
                    { id: "nail-salon", name: "Nail Salons" },
                    { id: "beauty-clinic", name: "Beauty Clinics" }
                ]
            }
        ]
    },
    {
        id: "education-training",
        name: "Education, Training & Childcare",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80",
            primaryColor: "#0ea5e9",
            accentColor: "#0c4a6e",
            iconName: "GraduationCap"
        },
        calculationModels: { capacity: "enrollment_model", stock: "resource_model" },
        recommendationTemplates: [],
        groups: [
            {
                id: "schools",
                name: "Schools & Colleges",
                types: [
                    { id: "private-schools", name: "Private Schools" },
                    { id: "tutorial-colleges", name: "Tutorial Colleges" },
                    { id: "sixth-form", name: "Sixth Form Colleges" }
                ]
            },
            {
                id: "childcare",
                name: "Childcare Services",
                types: [
                    { id: "nurseries", name: "Nurseries" },
                    { id: "daycare", name: "Daycare Centres" },
                    { id: "after-school", name: "After-School Clubs" }
                ]
            }
        ]
    },
    {
        id: "transport-logistics",
        name: "Transport, Logistics & Automotive",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80",
            primaryColor: "#f43f5e",
            accentColor: "#881337",
            iconName: "Truck"
        },
        calculationModels: { capacity: "fleet_model", stock: "logistics_model" },
        recommendationTemplates: [
            {
                id: "rec-transport-fleet-idle",
                condition: "answers['trans-passenger-stock-trigger-01'] === 1 || capacityDrain > 15",
                title: "Optimise Fleet Utilisation",
                description: "Your fleet has significant idle time. Consider partnering with last-mile delivery services during off-peak hours.",
                actionItem: "Register fleet with local logistics networks"
            },
            {
                id: "rec-transport-parts-stock",
                condition: "answers['trans-auto-stock-trigger-01'] === 1",
                title: "Liquidy Spare Parts",
                description: "Holding excess vehicle parts ties up capital. Return unused stock to suppliers or list on B2B marketplaces.",
                actionItem: "Audit parts inventory for returns"
            }
        ],
        groups: [
            {
                id: "freight",
                name: "Freight & Logistics",
                types: [
                    { id: "courier-svcs", name: "Courier Services" },
                    { id: "haulage-cos", name: "Haulage Companies" },
                    { id: "warehousing", name: "Warehousing Providers" },
                    { id: "fulfilment", name: "Fulfilment Centres" }
                ]
            },
            {
                id: "automotive",
                name: "Automotive Services",
                types: [
                    { id: "car-garage", name: "Car Garages" },
                    { id: "mot-centre", name: "MOT Centres" },
                    { id: "tyre-shop", name: "Tyre Shops" },
                    { id: "auto-body", name: "Auto Body Repair" }
                ]
            }
        ]
    },
    {
        id: "technology-digital",
        name: "Technology, Digital & Creative",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
            primaryColor: "#84cc16",
            accentColor: "#365314",
            iconName: "Cpu"
        },
        calculationModels: { capacity: "developer_model", stock: "digital_asset_model" },
        recommendationTemplates: [
            {
                id: "rec-tech-retainer",
                condition: "capacityDrain > 20",
                title: "Shift to Retainer Models",
                description: "Project-based work leaves gaps. Package your spare developer/creative hours into monthly maintenance retainers.",
                actionItem: "Create 'Priority Support' packages"
            },
            {
                id: "rec-tech-licenses",
                condition: "answers['tech-software-stock-trigger-01'] === 1",
                title: "Consolidate Software Licenses",
                description: "You are paying for unused seats. Convert individual licenses to enterprise plans or cancel unused SaaS tools.",
                actionItem: "Conduct a SaaS subscription audit"
            }
        ],
        groups: [
            {
                id: "software-it",
                name: "Software & IT",
                types: [
                    { id: "sw-devs", name: "Software Developers" },
                    { id: "saas-prov", name: "SaaS Providers" },
                    { id: "it-support", name: "IT Support Firms" }
                ]
            },
            {
                id: "media-content",
                name: "Media & Content",
                types: [
                    { id: "video-prod", name: "Video Production" },
                    { id: "photo-studio", name: "Photography Studios" },
                    { id: "podcast-net", name: "Podcast Networks" }
                ]
            }
        ]
    },
    {
        id: "financial-insurance",
        name: "Financial, Insurance & Real Estate",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80",
            primaryColor: "#d946ef",
            accentColor: "#701a75",
            iconName: "Landmark"
        },
        calculationModels: { capacity: "financial_model", stock: "asset_model" },
        recommendationTemplates: [
            {
                id: "rec-fin-lead-gen",
                condition: "capacityDrain > 15",
                title: "Webinar-Led Sales",
                description: "Utilise idle advisor time to host educational webinars, generating qualified leads for wealth management.",
                actionItem: "Schedule a 'Market Update' webinar"
            },
            {
                id: "rec-fin-digital-docs",
                condition: "answers['fin-realestate-stock-trigger-01'] === 1",
                title: "Digitise Documentation",
                description: "Reduce physical storage costs and printing waste by shifting contracts and brochures to digital-first formats.",
                actionItem: "Implement e-signature workflows"
            }
        ],
        groups: [
            {
                id: "fin-svcs",
                name: "Financial Services",
                types: [
                    { id: "fin-advisors", name: "Financial Advisors" },
                    { id: "mortgage-brk", name: "Mortgage Brokers" },
                    { id: "invest-firms", name: "Investment Firms" }
                ]
            },
            {
                id: "real-estate-dev",
                name: "Real Estate Development",
                types: [
                    { id: "prop-devs", name: "Property Developers" },
                    { id: "comm-invest", name: "Commercial Investors" },
                    { id: "housing-assoc", name: "Housing Associations" }
                ]
            }
        ]
    },
    {
        id: "tourism-travel",
        name: "Tourism, Travel & Leisure",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80",
            primaryColor: "#f59e0b",
            accentColor: "#78350f",
            iconName: "Plane"
        },
        calculationModels: { capacity: "booking_model", stock: "ticket_model" },
        recommendationTemplates: [
            {
                id: "rec-tour-dynamic-pricing",
                condition: "capacityDrain > 25",
                title: "Implement Dynamic Pricing",
                description: "High vacancy rates suggest pricing rigidity. Use automated tools to lower rates during low-demand periods.",
                actionItem: "Review booking engine pricing rules"
            },
            {
                id: "rec-tour-bundles",
                condition: "answers['tour-stay-stock-trigger-01'] === 1",
                title: "Bundle Amenities",
                description: "Excess guest amenities can be packaged into 'Premium Welcome Kits' to increase perceived value and reduce waste.",
                actionItem: "Create a VIP upgrade package"
            }
        ],
        groups: [
            {
                id: "accommodation",
                name: "Accommodation",
                types: [
                    { id: "hotels", name: "Hotels" },
                    { id: "guest-houses", name: "Guest Houses" },
                    { id: "serviced-apts", name: "Serviced Apartments" },
                    { id: "hostels", name: "Hostels" },
                    { id: "bnb", name: "B&Bs" }
                ]
            },
            {
                id: "leisure-ent",
                name: "Leisure & Entertainment",
                types: [
                    { id: "theme-parks", name: "Theme Parks" },
                    { id: "cinemas", name: "Cinemas" },
                    { id: "escape-rooms", name: "Escape Rooms" },
                    { id: "casinos", name: "Casinos" }
                ]
            }
        ]
    },
    {
        id: "agriculture-environment",
        name: "Agriculture, Environment & Energy",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80",
            primaryColor: "#16a34a",
            accentColor: "#052e16",
            iconName: "Sprout"
        },
        calculationModels: { capacity: "yield_model", stock: "commodity_model" },
        recommendationTemplates: [
            {
                id: "rec-agri-contracting",
                condition: "capacityDrain > 20",
                title: "Offer Contracting Services",
                description: "Idle machinery is a depreciating asset. Offer ploughing, harvesting, or maintenance services to smaller neighbouring farms.",
                actionItem: "List machinery for hire"
            },
            {
                id: "rec-agri-biomass",
                condition: "answers['agri-farming-stock-trigger-01'] === 1",
                title: "Biomass Diversification",
                description: "Convert crop residue or organic waste into biomass fuel or compost for additional revenue streams.",
                actionItem: "Investigate local biomass buyers"
            }
        ],
        groups: [
            {
                id: "farming",
                name: "Farming & Food Production",
                types: [
                    { id: "crop-farms", name: "Crop Farms" },
                    { id: "livestock-farms", name: "Livestock Farms" },
                    { id: "poultry-farms", name: "Poultry Farms" },
                    { id: "fish-farms", name: "Fish Farms" }
                ]
            },
            {
                id: "energy",
                name: "Renewable Energy",
                types: [
                    { id: "solar-inst", name: "Solar Installers" },
                    { id: "wind-energy", name: "Wind Energy Firms" },
                    { id: "ev-charging", name: "EV Charging Providers" }
                ]
            }
        ]
    },
    {
        id: "community-public",
        name: "Community, Non-Profit & Public Services",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80",
            primaryColor: "#06b6d4",
            accentColor: "#083344",
            iconName: "Users"
        },
        calculationModels: { capacity: "community_model", stock: "donation_model" },
        recommendationTemplates: [
            {
                id: "rec-comm-venue-hire",
                condition: "capacityDrain > 30",
                title: "Commercial Venue Hire",
                description: "Your premises are empty during weekdays. Market your halls or meeting rooms to local businesses for off-sites.",
                actionItem: "Create a 'Corporate Hire' brochure"
            },
            {
                id: "rec-comm-flash-sale",
                condition: "answers['comm-charity-stock-trigger-01'] === 1",
                title: "Flash Charity Sales",
                description: "Overstocked donations take up valuable space. Run 'Fill a Bag for £5' events to clear stock quickly.",
                actionItem: "Schedule a clearance event"
            }
        ],
        groups: [
            {
                id: "charity-ngo",
                name: "Charities & NGOs",
                types: [
                    { id: "relief-orgs", name: "Relief Organisations" },
                    { id: "comm-trusts", name: "Community Trusts" },
                    { id: "foundations", name: "Foundations" }
                ]
            },
            {
                id: "public-svcs",
                name: "Public & Social Services",
                types: [
                    { id: "care-homes", name: "Care Homes" },
                    { id: "supported-living", name: "Supported Living" },
                    { id: "social-enterp", name: "Social Enterprises" }
                ]
            }
        ]
    },
    {
        id: "online-micro",
        name: "Home-Based, Online & Micro-Businesses",
        visuals: {
            backgroundImage: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&q=80",
            primaryColor: "#64748b",
            accentColor: "#0f172a",
            iconName: "Monitor"
        },
        calculationModels: { capacity: "solopreneur_model", stock: "micro_inventory" },
        recommendationTemplates: [
            {
                id: "rec-online-content",
                condition: "capacityDrain > 20",
                title: "Content Marketing Push",
                description: "Use downtime to batch-create content (blogs, videos) to drive long-term organic traffic.",
                actionItem: "Plan a content calendar"
            },
            {
                id: "rec-online-mystery-box",
                condition: "answers['online-ecom-stock-trigger-01'] === 1",
                title: "Mystery Box Bundles",
                description: "Clear slow-moving inventory by packaging it into 'Mystery Boxes' sold at a perceived discount.",
                actionItem: "Create a mystery product listing"
            }
        ],
        groups: [
            {
                id: "ecommerce",
                name: "E-Commerce",
                types: [
                    { id: "online-retail", name: "Online Retailers" },
                    { id: "dropshipping", name: "Dropshipping Stores" },
                    { id: "mkt-sellers", name: "Marketplace Sellers" }
                ]
            },
            {
                id: "digital-ent",
                name: "Digital Entrepreneurs",
                types: [
                    { id: "influencers", name: "Influencers" },
                    { id: "course-creators", name: "Course Creators" },
                    { id: "affiliate-mkt", name: "Affiliate Marketers" }
                ]
            }
        ]
    }
];
