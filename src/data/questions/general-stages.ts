import { Question } from "@/types/audit";

// ============================================================
// STAGE 3: CUSTOMERS & LOYALTY
// ============================================================

export const CUSTOMER_QUESTIONS: Question[] = [
    // SHORT FORM
    {
        id: "customer_retention_rate",
        text: "How would you describe your customer retention rate?",
        type: "multiple-choice",
        category: "CUSTOMERS",
        options: [
            { id: "high", label: "High", sub: "Most customers return regularly" },
            { id: "moderate", label: "Moderate", sub: "Some customers return, many don't" },
            { id: "low", label: "Low", sub: "Most customers are one-time visitors" },
            { id: "not-sure", label: "Not sure", sub: "I don't track this" }
        ],
        helpText: "Consider how many of your customers return within 3 months.",
        weight: 1.5
    },
    {
        id: "customer_satisfaction",
        text: "How would you rate your overall customer satisfaction?",
        type: "rating",
        category: "CUSTOMERS",
        min: 1,
        max: 5,
        options: [
            { id: "1", label: "Very Poor", value: 1 },
            { id: "2", label: "Poor", value: 2 },
            { id: "3", label: "Average", value: 3 },
            { id: "4", label: "Good", value: 4 },
            { id: "5", label: "Excellent", value: 5 }
        ],
        weight: 1.5
    },
    {
        id: "loyalty_programme",
        text: "Do you currently have a customer loyalty or rewards programme?",
        type: "multiple-choice",
        category: "CUSTOMERS",
        options: [
            { id: "yes-active", label: "Yes, actively used", sub: "Many customers participate" },
            { id: "yes-minimal", label: "Yes, but minimal use", sub: "Few customers participate" },
            { id: "no-planning", label: "No, but planning to", sub: "We want to set one up" },
            { id: "no", label: "No", sub: "We don't have one" }
        ],
        weight: 1
    },
    {
        id: "customer_complaints",
        text: "How do you currently handle customer complaints or feedback?",
        type: "multiple-choice",
        category: "CUSTOMERS",
        options: [
            { id: "formal-system", label: "Formal system", sub: "We have a structured process" },
            { id: "informal", label: "Informally", sub: "We handle them as they come" },
            { id: "rarely-get", label: "We rarely get complaints", sub: "Customers seem satisfied" },
            { id: "no-process", label: "No specific process", sub: "We don't track complaints" }
        ],
        weight: 1
    },
    // LONG FORM
    {
        id: "customer_lifetime_value",
        text: "What is your estimated average customer lifetime value?",
        type: "currency",
        category: "CUSTOMERS",
        isLongFormOnly: true,
        helpText: "How much does a typical customer spend with your business over their entire relationship?",
        placeholder: "e.g., 500",
        weight: 2
    },
    {
        id: "customer_acquisition_cost",
        text: "What is your estimated cost to acquire a new customer?",
        type: "currency",
        category: "CUSTOMERS",
        isLongFormOnly: true,
        helpText: "Include marketing, advertising, and sales costs divided by new customers acquired.",
        placeholder: "e.g., 50",
        weight: 2
    },
    {
        id: "repeat_purchase_frequency",
        text: "How often do your best customers return to purchase?",
        type: "multiple-choice",
        category: "CUSTOMERS",
        isLongFormOnly: true,
        options: [
            { id: "weekly", label: "Weekly" },
            { id: "fortnightly", label: "Every 2 weeks" },
            { id: "monthly", label: "Monthly" },
            { id: "quarterly", label: "Every 3 months" },
            { id: "annually", label: "Once a year or less" },
            { id: "not-sure", label: "Not sure" }
        ],
        weight: 1.5
    },
    {
        id: "customer_feedback_method",
        text: "How do you collect customer feedback?",
        type: "multi-select",
        category: "CUSTOMERS",
        isLongFormOnly: true,
        options: [
            { id: "surveys", label: "Surveys" },
            { id: "reviews", label: "Online reviews" },
            { id: "direct", label: "Direct conversations" },
            { id: "social", label: "Social media" },
            { id: "none", label: "We don't collect feedback" }
        ],
        weight: 1
    }
];

// ============================================================
// STAGE 4: MARKETING & GROWTH
// ============================================================

export const MARKETING_QUESTIONS: Question[] = [
    // SHORT FORM
    {
        id: "marketing_budget",
        text: "What is your approximate monthly marketing budget?",
        type: "currency",
        category: "MARKETING",
        helpText: "Include advertising, promotions, social media, and any other marketing spend.",
        placeholder: "e.g., 500",
        weight: 1.5
    },
    {
        id: "primary_marketing_channels",
        text: "Which marketing channels do you primarily use?",
        type: "multi-select",
        category: "MARKETING",
        options: [
            { id: "social-media", label: "Social media" },
            { id: "google-ads", label: "Google Ads" },
            { id: "local-print", label: "Local print/radio" },
            { id: "word-of-mouth", label: "Word of mouth" },
            { id: "email", label: "Email marketing" },
            { id: "none", label: "No active marketing" }
        ],
        weight: 1
    },
    {
        id: "marketing_effectiveness",
        text: "How effective would you say your current marketing efforts are?",
        type: "rating",
        category: "MARKETING",
        min: 1,
        max: 5,
        options: [
            { id: "1", label: "Very Ineffective", value: 1 },
            { id: "2", label: "Ineffective", value: 2 },
            { id: "3", label: "Neutral", value: 3 },
            { id: "4", label: "Effective", value: 4 },
            { id: "5", label: "Very Effective", value: 5 }
        ],
        weight: 1.5
    },
    {
        id: "new_customer_sources",
        text: "Where do most of your new customers come from?",
        type: "multiple-choice",
        category: "MARKETING",
        options: [
            { id: "online-search", label: "Online search (Google, etc.)" },
            { id: "social-media", label: "Social media" },
            { id: "referrals", label: "Customer referrals" },
            { id: "walk-in", label: "Walk-ins / foot traffic" },
            { id: "advertising", label: "Paid advertising" },
            { id: "not-sure", label: "Not sure" }
        ],
        weight: 1
    },
    // LONG FORM
    {
        id: "marketing_roi",
        text: "What is your estimated return on marketing investment (ROI)?",
        type: "percentage",
        category: "MARKETING",
        isLongFormOnly: true,
        helpText: "For every £1 spent on marketing, how much revenue does it generate?",
        placeholder: "e.g., 300",
        weight: 2
    },
    {
        id: "online_presence",
        text: "How would you rate your online presence?",
        type: "rating",
        category: "MARKETING",
        isLongFormOnly: true,
        min: 1,
        max: 5,
        options: [
            { id: "1", label: "Very Poor", value: 1 },
            { id: "2", label: "Poor", value: 2 },
            { id: "3", label: "Average", value: 3 },
            { id: "4", label: "Good", value: 4 },
            { id: "5", label: "Excellent", value: 5 }
        ],
        weight: 1.5
    },
    {
        id: "competitor_awareness",
        text: "How well do you understand your competitors?",
        type: "rating",
        category: "MARKETING",
        isLongFormOnly: true,
        min: 1,
        max: 5,
        options: [
            { id: "1", label: "Not at all", value: 1 },
            { id: "2", label: "Slightly", value: 2 },
            { id: "3", label: "Moderately", value: 3 },
            { id: "4", label: "Well", value: 4 },
            { id: "5", label: "Very Well", value: 5 }
        ],
        weight: 1
    }
];

// ============================================================
// STAGE 5: TECHNOLOGY & SYSTEMS
// ============================================================

export const TECHNOLOGY_QUESTIONS: Question[] = [
    // SHORT FORM
    {
        id: "business_software",
        text: "What business software do you currently use?",
        type: "multi-select",
        category: "TECHNOLOGY",
        options: [
            { id: "accounting", label: "Accounting software" },
            { id: "pos", label: "Point of Sale (POS)" },
            { id: "crm", label: "CRM system" },
            { id: "inventory", label: "Inventory management" },
            { id: "scheduling", label: "Staff scheduling" },
            { id: "none", label: "No business software" }
        ],
        weight: 1
    },
    {
        id: "online_sales",
        text: "Do you currently sell products or services online?",
        type: "multiple-choice",
        category: "TECHNOLOGY",
        options: [
            { id: "yes-active", label: "Yes, actively", sub: "Online sales are a significant channel" },
            { id: "yes-minimal", label: "Yes, but minimal", sub: "Online sales are a small portion" },
            { id: "no-planning", label: "No, but planning to", sub: "We want to start" },
            { id: "no", label: "No", sub: "We only sell in-person" }
        ],
        weight: 1.5
    },
    {
        id: "data_management",
        text: "How do you currently manage your business data?",
        type: "multiple-choice",
        category: "TECHNOLOGY",
        options: [
            { id: "dedicated-software", label: "Dedicated software", sub: "Specialised tools for our business" },
            { id: "spreadsheets", label: "Spreadsheets", sub: "Excel, Google Sheets, etc." },
            { id: "paper", label: "Paper-based", sub: "Physical records" },
            { id: "mixed", label: "Mix of methods", sub: "Combination of the above" }
        ],
        weight: 1
    },
    {
        id: "automation_level",
        text: "How much of your business operations are automated?",
        type: "rating",
        category: "TECHNOLOGY",
        min: 1,
        max: 5,
        options: [
            { id: "1", label: "None — everything is manual", value: 1 },
            { id: "2", label: "Minimal — a few tools", value: 2 },
            { id: "3", label: "Moderate — some automation", value: 3 },
            { id: "4", label: "High — most processes automated", value: 4 },
            { id: "5", label: "Extensive — fully automated", value: 5 }
        ],
        weight: 1.5
    },
    // LONG FORM
    {
        id: "tech_monthly_spend",
        text: "What is your approximate monthly spend on technology and software?",
        type: "currency",
        category: "TECHNOLOGY",
        isLongFormOnly: true,
        helpText: "Include subscriptions, licenses, and maintenance costs.",
        placeholder: "e.g., 200",
        weight: 1.5
    },
    {
        id: "website_quality",
        text: "How would you rate your website's effectiveness?",
        type: "rating",
        category: "TECHNOLOGY",
        isLongFormOnly: true,
        min: 1,
        max: 5,
        options: [
            { id: "1", label: "No website", value: 1 },
            { id: "2", label: "Basic / outdated", value: 2 },
            { id: "3", label: "Functional", value: 3 },
            { id: "4", label: "Professional", value: 4 },
            { id: "5", label: "Excellent / high-converting", value: 5 }
        ],
        weight: 1.5
    },
    {
        id: "digital_transformation",
        text: "Are you planning any digital transformation initiatives in the next 12 months?",
        type: "multiple-choice",
        category: "TECHNOLOGY",
        isLongFormOnly: true,
        options: [
            { id: "yes-active", label: "Yes, actively implementing" },
            { id: "yes-planning", label: "Yes, in planning stage" },
            { id: "considering", label: "Considering it" },
            { id: "no", label: "No plans" }
        ],
        weight: 1
    }
];

// ============================================================
// STAGE 6: FINANCIAL MANAGEMENT
// ============================================================

export const FINANCE_QUESTIONS: Question[] = [
    // SHORT FORM
    {
        id: "monthly_turnover",
        text: "What is your approximate monthly turnover?",
        type: "multiple-choice",
        category: "FINANCE",
        options: [
            { id: "under10k", label: "Under £10,000" },
            { id: "10k-50k", label: "£10,000 – £50,000" },
            { id: "50k-100k", label: "£50,000 – £100,000" },
            { id: "100k-250k", label: "£100,000 – £250,000" },
            { id: "250k+", label: "£250,000+" },
            { id: "prefer-not", label: "Prefer not to say" }
        ],
        weight: 1.5
    },
    {
        id: "profit_margin",
        text: "What is your approximate profit margin?",
        type: "multiple-choice",
        category: "FINANCE",
        options: [
            { id: "negative", label: "We are making a loss" },
            { id: "0-5", label: "0–5%" },
            { id: "5-15", label: "5–15%" },
            { id: "15-25", label: "15–25%" },
            { id: "25+", label: "25%+" },
            { id: "not-sure", label: "Not sure" }
        ],
        weight: 1.5
    },
    {
        id: "cost_management",
        text: "How would you describe your cost management?",
        type: "rating",
        category: "FINANCE",
        min: 1,
        max: 5,
        options: [
            { id: "1", label: "Very Poor", value: 1 },
            { id: "2", label: "Poor", value: 2 },
            { id: "3", label: "Average", value: 3 },
            { id: "4", label: "Good", value: 4 },
            { id: "5", label: "Excellent", value: 5 }
        ],
        weight: 1.5
    },
    {
        id: "financial_reporting",
        text: "How regularly do you review your financial reports?",
        type: "multiple-choice",
        category: "FINANCE",
        options: [
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
            { id: "quarterly", label: "Quarterly" },
            { id: "annually", label: "Annually" },
            { id: "never", label: "Never / rarely" }
        ],
        weight: 1
    },
    // LONG FORM
    {
        id: "stock_value",
        text: "What is the total value of your current stock inventory?",
        type: "currency",
        category: "FINANCE",
        isLongFormOnly: true,
        helpText: "Include all stock at cost value.",
        placeholder: "e.g., 25000",
        weight: 2
    },
    {
        id: "overhead_costs",
        text: "What are your approximate monthly overhead costs?",
        type: "currency",
        category: "FINANCE",
        isLongFormOnly: true,
        helpText: "Include rent, utilities, insurance, and other fixed costs.",
        placeholder: "e.g., 5000",
        weight: 2
    },
    {
        id: "cash_flow_health",
        text: "How would you describe your cash flow situation?",
        type: "multiple-choice",
        category: "FINANCE",
        isLongFormOnly: true,
        options: [
            { id: "strong", label: "Strong — always have surplus" },
            { id: "stable", label: "Stable — meets obligations" },
            { id: "tight", label: "Tight — sometimes struggles" },
            { id: "critical", label: "Critical —经常 has shortfalls" },
            { id: "not-sure", label: "Not sure" }
        ],
        weight: 2
    },
    {
        id: "pricing_strategy",
        text: "How do you currently set your prices?",
        type: "multiple-choice",
        category: "FINANCE",
        isLongFormOnly: true,
        options: [
            { id: "cost-plus", label: "Cost-plus (markup on costs)" },
            { id: "competitor", label: "Based on competitors" },
            { id: "value", label: "Value-based pricing" },
            { id: "gut", label: "Gut feeling / instinct" },
            { id: "mixed", label: "Mix of methods" }
        ],
        weight: 1.5
    }
];

export const ALL_NEW_QUESTIONS: Question[] = [
    ...CUSTOMER_QUESTIONS,
    ...MARKETING_QUESTIONS,
    ...TECHNOLOGY_QUESTIONS,
    ...FINANCE_QUESTIONS
];
