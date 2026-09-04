import { SolutionDefinition } from "./solutions";

export const MCOM_SOLUTIONS: SolutionDefinition[] = [
  {
    id: "excess-stock-programme",
    solutionName: "247GBS Excess Stock Programme",
    mcomService: "247GBS Excess Stock Programme",
    description: "A structured programme to identify, value, and liquidate slow-moving or excess stock through discount channels, B2B marketplaces, and bundled offerings — recovering capital tied up in unsold inventory.",
    whyThisSolution: "Excess stock consumes storage space, ties up working capital, and risks becoming obsolete. This programme systematically clears inventory while maximising recovery value.",
    expectedOutcomes: [
      "Improved cash flow from recovered capital",
      "Reduced storage and carrying costs",
      "Better inventory turnover ratios",
      "Clearer warehouse and retail space"
    ],
    implementationActivities: [
      "Full inventory audit and classification",
      "Valuation and pricing strategy development",
      "Channel selection (B2B, clearance, bundles)",
      "Listing and promotion execution",
      "Performance tracking and reporting"
    ],
    estimatedTimeline: "30-60 Days",
    estimatedInvestment: "£500-£2,000",
    businessImpact: "high",
    dependencies: ["Accurate inventory data", "Management time for audit"],
    relatedMcomServices: ["247GBS Spare Capacity Programme", "MCOM Mall"],
    icon: "Package"
  },
  {
    id: "spare-capacity-programme",
    solutionName: "247GBS Spare Capacity Programme",
    mcomService: "247GBS Spare Capacity Programme",
    description: "A monetisation programme that helps businesses identify underutilised staff hours, equipment time, or facility space and convert them into revenue-generating opportunities.",
    whyThisSolution: "Unused capacity is hidden revenue. This programme identifies where your resources are underutilised and creates practical ways to fill that gap without additional fixed costs.",
    expectedOutcomes: [
      "Increased revenue from existing resources",
      "Improved operational efficiency",
      "Higher staff and asset productivity",
      "Better profit margins"
    ],
    implementationActivities: [
      "Capacity audit and utilisation analysis",
      "Opportunity identification workshop",
      "Pricing and packaging development",
      "Marketing and sales activation",
      "Monitoring and optimisation"
    ],
    estimatedTimeline: "30-60 Days",
    estimatedInvestment: "£500-£2,000",
    businessImpact: "high",
    dependencies: ["Willingness to adapt operations", "Staff engagement"],
    relatedMcomServices: ["247GBS Excess Stock Programme", "Account Manager Services"],
    icon: "Zap"
  },
  {
    id: "rewards-loyalty",
    solutionName: "MCOM Rewards & Loyalty",
    mcomService: "MCOM Rewards & Loyalty",
    description: "A customer retention platform that designs and deploys a structured loyalty programme — points, tiers, referrals, and rewards — tailored to your business model and customer behaviour.",
    whyThisSolution: "Acquiring new customers costs 5-7x more than retaining existing ones. A formal loyalty programme turns occasional buyers into regular customers and brand advocates.",
    expectedOutcomes: [
      "Increased repeat purchase rate",
      "Higher customer lifetime value",
      "Reduced customer acquisition costs",
      "Word-of-mouth referrals through rewards"
    ],
    implementationActivities: [
      "Customer data review and segmentation",
      "Reward structure design",
      "Platform setup and integration",
      "Staff training and launch",
      "Performance tracking and optimisation"
    ],
    estimatedTimeline: "30-90 Days",
    estimatedInvestment: "£2,000-£5,000",
    businessImpact: "high",
    dependencies: ["Customer contact data", "Basic POS or CRM system"],
    relatedMcomServices: ["247GBS Expo", "Account Manager Services"],
    icon: "Heart"
  },
  {
    id: "mcom-mall",
    solutionName: "MCOM Mall",
    mcomService: "MCOM Mall",
    description: "A digital marketplace presence that puts your products and services in front of a wider audience — increasing online visibility and creating an additional sales channel beyond your physical location.",
    whyThisSolution: "If customers can't find you online, they choose competitors. MCOM Mall gives your business a professional digital storefront with built-in traffic and sales infrastructure.",
    expectedOutcomes: [
      "Increased online visibility and reach",
      "Additional revenue from online sales",
      "Reduced dependency on foot traffic",
      "24/7 sales capability"
    ],
    implementationActivities: [
      "Product/service catalogue creation",
      "Digital storefront setup",
      "Payment and delivery integration",
      "Listing optimisation",
      "Launch and promotion"
    ],
    estimatedTimeline: "30-60 Days",
    estimatedInvestment: "£2,000-£5,000",
    businessImpact: "high",
    dependencies: ["Product photography", "Pricing and inventory data"],
    relatedMcomServices: ["247GBS Expo", "MCOM Rewards & Loyalty", "Digital Marketplace"],
    icon: "Store"
  },
  {
    id: "gbs-expo",
    solutionName: "247GBS Expo",
    mcomService: "247GBS Expo",
    description: "A business exhibition and networking platform that increases your brand's exposure to potential customers, partners, and industry peers through physical and virtual events.",
    whyThisSolution: "Limited business exposure restricts growth. 247GBS Expo connects you with the right audience — decision-makers, buyers, and collaborators who need what you offer.",
    expectedOutcomes: [
      "Increased brand awareness",
      "New customer leads and partnerships",
      "Industry networking opportunities",
      "Market positioning and credibility"
    ],
    implementationActivities: [
      "Exhibitor profile and materials preparation",
      "Event selection and registration",
      "Pre-event promotion",
      "Exhibition execution and networking",
      "Lead follow-up and conversion"
    ],
    estimatedTimeline: "60-90 Days",
    estimatedInvestment: "£2,000-£5,000",
    businessImpact: "medium",
    dependencies: ["Marketing materials", "Staff availability for events"],
    relatedMcomServices: ["MCOM Mall", "Account Manager Services"],
    icon: "Megaphone"
  },
  {
    id: "account-manager",
    solutionName: "Account Manager Services",
    mcomService: "Account Manager Services",
    description: "A dedicated account manager who provides ongoing business support — helping you navigate challenges, identify opportunities, and stay on track with your improvement plan.",
    whyThisSolution: "Many business owners know what needs to improve but struggle with execution. An account manager provides the accountability, guidance, and expertise to turn plans into results.",
    expectedOutcomes: [
      "Faster implementation of improvements",
      "Reduced decision fatigue for business owners",
      "Access to expert guidance and resources",
      "Accountability and progress tracking"
    ],
    implementationActivities: [
      "Initial onboarding and needs assessment",
      "Regular check-in meetings and reviews",
      "Progress tracking and plan adjustments",
      "Ongoing support and problem-solving",
      "Quarterly business reviews"
    ],
    estimatedTimeline: "Ongoing (Monthly)",
    estimatedInvestment: "£500-£2,000 per month",
    businessImpact: "high",
    dependencies: ["Commitment to regular reviews", "Open communication"],
    relatedMcomServices: ["Business Consulting Programme", "All MCOM services"],
    icon: "UserCheck"
  },
  {
    id: "business-consulting",
    solutionName: "Business Consulting Programme",
    mcomService: "Business Consulting Programme",
    description: "A structured consulting engagement that provides expert analysis, strategic guidance, and implementation support for complex business challenges and growth initiatives.",
    whyThisSolution: "Some challenges require deeper expertise than day-to-day management can provide. This programme brings specialised knowledge to address specific operational, financial, or strategic issues.",
    expectedOutcomes: [
      "Expert solutions to complex problems",
      "Strategic clarity and direction",
      "Improved business processes and systems",
      "Measurable performance improvements"
    ],
    implementationActivities: [
      "Diagnostic deep-dive and discovery",
      "Strategy development and planning",
      "Implementation support and coaching",
      "Results measurement and reporting"
    ],
    estimatedTimeline: "90 Days+",
    estimatedInvestment: "£5,000-£10,000+",
    businessImpact: "high",
    dependencies: ["Management commitment", "Access to business data"],
    relatedMcomServices: ["Account Manager Services", "All MCOM services"],
    icon: "Briefcase"
  },
  {
    id: "marketing-automation",
    solutionName: "Marketing Automation Suite",
    mcomService: "Marketing Automation",
    description: "An automated marketing system that nurtures leads, engages customers, and drives sales through email campaigns, social media scheduling, and performance tracking — without requiring daily manual effort.",
    whyThisSolution: "Limited marketing activity is often due to time constraints, not lack of intent. Automation handles the repetitive work so consistent marketing happens without burning out the team.",
    expectedOutcomes: [
      "Consistent marketing without daily effort",
      "Higher lead conversion rates",
      "Better customer engagement and retention",
      "Measurable ROI on marketing spend"
    ],
    implementationActivities: [
      "Marketing audit and strategy definition",
      "Platform selection and setup",
      "Campaign design and content creation",
      "Automation workflow configuration",
      "Launch and performance monitoring"
    ],
    estimatedTimeline: "30-60 Days",
    estimatedInvestment: "£2,000-£5,000",
    businessImpact: "medium",
    dependencies: ["Customer email list", "Basic marketing content"],
    relatedMcomServices: ["MCOM Mall", "MCOM Rewards & Loyalty"],
    icon: "Mail"
  },
  {
    id: "digital-transformation",
    solutionName: "Digital Transformation Programme",
    mcomService: "Digital Transformation",
    description: "A comprehensive programme that moves your business from paper-based or disconnected systems to integrated digital tools — improving data accuracy, decision-making, and operational efficiency.",
    whyThisSolution: "Manual data management creates errors, inefficiencies, and missed opportunities. Digital tools automate routine tasks and give you real-time visibility into your business performance.",
    expectedOutcomes: [
      "Centralised and accurate business data",
      "Improved decision-making with real-time insights",
      "Reduced administrative overhead",
      "Scalable systems for growth"
    ],
    implementationActivities: [
      "Current systems audit and gap analysis",
      "Technology selection and roadmap",
      "Data migration and system setup",
      "Staff training and adoption",
      "Ongoing optimisation and support"
    ],
    estimatedTimeline: "60-120 Days",
    estimatedInvestment: "£5,000-£10,000+",
    businessImpact: "high",
    dependencies: ["Staff buy-in and training capacity", "Data migration resources"],
    relatedMcomServices: ["Account Manager Services", "Business Consulting Programme"],
    icon: "Monitor"
  },
  {
    id: "cash-flow-management",
    solutionName: "Cash Flow & Margin Improvement",
    mcomService: "Financial Management Services",
    description: "A financial health programme that analyses your cash flow, cost structure, and profit margins — then implements practical measures to improve financial stability and profitability.",
    whyThisSolution: "Thin margins and cash flow pressure are among the most common reasons businesses fail. This programme addresses the root causes and builds financial resilience.",
    expectedOutcomes: [
      "Improved cash flow and working capital",
      "Higher profit margins",
      "Better financial forecasting and control",
      "Reduced financial risk"
    ],
    implementationActivities: [
      "Financial statement analysis",
      "Cost structure review and optimisation",
      "Cash flow forecasting setup",
      "Pricing strategy review",
      "Ongoing monitoring and reporting"
    ],
    estimatedTimeline: "30-60 Days",
    estimatedInvestment: "£2,000-£5,000",
    businessImpact: "high",
    dependencies: ["Access to financial records", "Management commitment"],
    relatedMcomServices: ["Account Manager Services", "Business Consulting Programme"],
    icon: "TrendingUp"
  },
  {
    id: "digital-marketplace",
    solutionName: "Digital Marketplace Expansion",
    mcomService: "Digital Marketplace",
    description: "A multi-channel expansion strategy that lists your products on major digital marketplaces — reaching customers who are already searching for what you sell but haven't found your business yet.",
    whyThisSolution: "Your competitors are already selling on marketplaces. Listing there puts your products where customers are actively shopping, without requiring you to build your own traffic.",
    expectedOutcomes: [
      "Access to established customer bases",
      "Increased sales volume and revenue",
      "Brand exposure to new audiences",
      "Diversified sales channels"
    ],
    implementationActivities: [
      "Marketplace selection and registration",
      "Product listing optimisation",
      "Inventory and order management setup",
      "Pricing and promotion strategy",
      "Performance monitoring"
    ],
    estimatedTimeline: "30-90 Days",
    estimatedInvestment: "£2,000-£5,000",
    businessImpact: "medium",
    dependencies: ["Product data and images", "Fulfilment capacity"],
    relatedMcomServices: ["MCOM Mall", "Excess Stock Programme"],
    icon: "Globe"
  },
  {
    id: "international-expansion",
    solutionName: "International Expansion Programme",
    mcomService: "International Business Development",
    description: "A structured programme that assesses your readiness for international markets and provides the framework to expand your business beyond domestic borders.",
    whyThisSolution: "International markets represent significant growth potential, but expansion without preparation is risky. This programme provides the research, planning, and execution support needed for successful entry.",
    expectedOutcomes: [
      "New revenue streams from international markets",
      "Diversified customer base reducing local dependency",
      "Increased brand value and recognition",
      "Competitive advantage through early market entry"
    ],
    implementationActivities: [
      "Market research and opportunity assessment",
      "Export/entry strategy development",
      "Regulatory and compliance review",
      "Distribution and partnership setup",
      "Launch and market entry execution"
    ],
    estimatedTimeline: "6-12 Months",
    estimatedInvestment: "£10,000+",
    businessImpact: "medium",
    dependencies: ["Strong domestic base", "Financial capacity for investment"],
    relatedMcomServices: ["Business Consulting Programme", "Account Manager Services"],
    icon: "Earth"
  },
  {
    id: "advanced-analytics",
    solutionName: "Advanced Analytics & AI",
    mcomService: "Advanced Business Intelligence",
    description: "An AI-powered analytics solution that uncovers hidden patterns in your business data — providing predictive insights, customer behaviour analysis, and automated reporting for smarter decision-making.",
    whyThisSolution: "Most businesses sit on valuable data but lack the tools to extract actionable insights. AI analytics reveals opportunities and risks that manual analysis would miss.",
    expectedOutcomes: [
      "Data-driven decision-making culture",
      "Predictive insights for proactive management",
      "Automated reporting saves management time",
      "Competitive advantage through intelligence"
    ],
    implementationActivities: [
      "Data audit and integration",
      "Analytics platform setup",
      "Custom dashboard and report creation",
      "Team training and adoption",
      "Continuous improvement and refinement"
    ],
    estimatedTimeline: "60-90 Days",
    estimatedInvestment: "£5,000-£10,000+",
    businessImpact: "medium",
    dependencies: ["Quality business data", "Team readiness for adoption"],
    relatedMcomServices: ["Digital Transformation Programme", "Account Manager Services"],
    icon: "BrainCircuit"
  }
];

export function getSolutionById(id: string): SolutionDefinition | undefined {
  return MCOM_SOLUTIONS.find(s => s.id === id);
}
