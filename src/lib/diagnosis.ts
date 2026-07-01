// ============================================================
// BUSINESS DIAGNOSIS ENGINE
// Analyzes audit answers and produces a structured diagnosis
// ============================================================

export type HealthRating = 'excellent' | 'good' | 'average' | 'poor' | 'critical';
export type PriorityLevel = 'immediate' | 'medium' | 'long-term';
export type SeverityLevel = 'high' | 'medium' | 'low';
export type ReadinessStatus = 'ready-for-growth' | 'needs-improvements' | 'requires-stabilisation' | 'digital-ready' | 'expansion-ready';

export interface HealthCategory {
    id: string;
    name: string;
    rating: HealthRating;
    score: number; // 0-100
    explanation: string;
    impact: string[];
}

export interface BusinessStrength {
    id: string;
    title: string;
    description: string;
    whyItMatters: string;
}

export interface BusinessChallenge {
    id: string;
    title: string;
    description: string;
    severity: SeverityLevel;
}

export interface GrowthOpportunity {
    id: string;
    title: string;
    currentSituation: string;
    potentialOutcome: string;
    businessBenefit: string;
}

export interface PriorityItem {
    id: string;
    title: string;
    description: string;
    level: PriorityLevel;
}

export interface RiskItem {
    id: string;
    title: string;
    description: string;
    severity: SeverityLevel;
    potentialImpact: string;
    urgency: string;
}

export interface BusinessDiagnosis {
    overallScore: number;
    overallStatus: 'healthy' | 'needs-attention' | 'critical' | 'growth-ready';
    executiveSummary: string;
    healthCategories: HealthCategory[];
    strengths: BusinessStrength[];
    challenges: BusinessChallenge[];
    opportunities: GrowthOpportunity[];
    priorities: PriorityItem[];
    risks: RiskItem[];
    readiness: {
        status: ReadinessStatus;
        explanation: string;
    };
    whatWeFound: string;
    completedAt: string;
}

// ============================================================
// SCORING HELPERS
// ============================================================

function getRating(score: number): HealthRating {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    if (score >= 20) return 'poor';
    return 'critical';
}

function getRatingLabel(rating: HealthRating): string {
    const labels: Record<HealthRating, string> = {
        excellent: 'Excellent',
        good: 'Good',
        average: 'Average',
        poor: 'Poor',
        critical: 'Critical'
    };
    return labels[rating];
}

function getOverallStatus(score: number): BusinessDiagnosis['overallStatus'] {
    if (score >= 75) return 'healthy';
    if (score >= 50) return 'needs-attention';
    if (score >= 25) return 'critical';
    return 'critical';
}

export function getOverallStatusLabel(status: BusinessDiagnosis['overallStatus']): string {
    const labels: Record<string, string> = {
        'healthy': 'Healthy',
        'needs-attention': 'Needs Attention',
        'critical': 'Critical',
        'growth-ready': 'Growth Ready'
    };
    return labels[status] || status;
}

// ============================================================
// DIAGNOSIS GENERATOR
// ============================================================

export function generateDiagnosis(answers: Record<string, any>): BusinessDiagnosis {
    // Calculate category scores
    const inventoryScore = calculateInventoryScore(answers);
    const operationsScore = calculateOperationsScore(answers);
    const salesScore = calculateSalesScore(answers);
    const marketingScore = calculateMarketingScore(answers);
    const customerScore = calculateCustomerScore(answers);
    const technologyScore = calculateTechnologyScore(answers);
    const financeScore = calculateFinanceScore(answers);
    const growthScore = calculateGrowthScore(answers);
    const visibilityScore = calculateVisibilityScore(answers);
    const teamScore = calculateTeamScore(answers);

    const categories: HealthCategory[] = [
        {
            id: 'inventory',
            name: 'Inventory',
            rating: getRating(inventoryScore),
            score: inventoryScore,
            explanation: getInventoryExplanation(answers, inventoryScore),
            impact: getInventoryImpact(answers)
        },
        {
            id: 'operations',
            name: 'Operations',
            rating: getRating(operationsScore),
            score: operationsScore,
            explanation: getOperationsExplanation(answers, operationsScore),
            impact: getOperationsImpact(answers)
        },
        {
            id: 'sales',
            name: 'Sales',
            rating: getRating(salesScore),
            score: salesScore,
            explanation: getSalesExplanation(answers, salesScore),
            impact: getSalesImpact(answers)
        },
        {
            id: 'marketing',
            name: 'Marketing',
            rating: getRating(marketingScore),
            score: marketingScore,
            explanation: getMarketingExplanation(answers, marketingScore),
            impact: getMarketingImpact(answers)
        },
        {
            id: 'customer-retention',
            name: 'Customer Retention',
            rating: getRating(customerScore),
            score: customerScore,
            explanation: getCustomerExplanation(answers, customerScore),
            impact: getCustomerImpact(answers)
        },
        {
            id: 'technology',
            name: 'Technology',
            rating: getRating(technologyScore),
            score: technologyScore,
            explanation: getTechnologyExplanation(answers, technologyScore),
            impact: getTechnologyImpact(answers)
        },
        {
            id: 'financial',
            name: 'Financial Management',
            rating: getRating(financeScore),
            score: financeScore,
            explanation: getFinanceExplanation(answers, financeScore),
            impact: getFinanceImpact(answers)
        },
        {
            id: 'growth',
            name: 'Business Growth',
            rating: getRating(growthScore),
            score: growthScore,
            explanation: getGrowthExplanation(answers, growthScore),
            impact: getGrowthImpact(answers)
        },
        {
            id: 'visibility',
            name: 'Visibility',
            rating: getRating(visibilityScore),
            score: visibilityScore,
            explanation: getVisibilityExplanation(answers, visibilityScore),
            impact: getVisibilityImpact(answers)
        },
        {
            id: 'team',
            name: 'Team Performance',
            rating: getRating(teamScore),
            score: teamScore,
            explanation: getTeamExplanation(answers, teamScore),
            impact: getTeamImpact(answers)
        }
    ];

    const overallScore = Math.round(
        categories.reduce((sum, c) => sum + c.score, 0) / categories.length
    );

    const strengths = identifyStrengths(answers, categories);
    const challenges = identifyChallenges(answers, categories);
    const opportunities = identifyOpportunities(answers, categories);
    const priorities = identifyPriorities(answers, categories);
    const risks = identifyRisks(answers, categories);
    const readiness = assessReadiness(answers, categories);

    return {
        overallScore,
        overallStatus: getOverallStatus(overallScore),
        executiveSummary: generateExecutiveSummary(answers, categories, overallScore),
        healthCategories: categories,
        strengths,
        challenges,
        opportunities,
        priorities,
        risks,
        readiness,
        whatWeFound: generateWhatWeFound(answers, categories, strengths, challenges),
        completedAt: new Date().toISOString()
    };
}

// ============================================================
// CATEGORY SCORING
// ============================================================

function calculateInventoryScore(answers: Record<string, any>): number {
    let score = 50; // baseline

    // Stock questions from triage
    if (answers.hasExcessStock === 'no') score += 20;
    else if (answers.hasExcessStock === 'yes') score -= 20;
    else if (answers.hasExcessStock === 'not-sure') score -= 5;

    // Stock extent
    if (answers.stockExtent !== undefined) {
        if (answers.stockExtent < 20) score += 15;
        else if (answers.stockExtent < 50) score += 5;
        else if (answers.stockExtent < 80) score -= 10;
        else score -= 25;
    }

    // Stock impact
    if (answers.stockImpact === 'not-yet') score += 5;
    else if (answers.stockImpact === 'little') score -= 5;
    else if (answers.stockImpact === 'serious') score -= 20;

    // Stock value
    if (answers.stock_value_excess !== undefined) {
        if (answers.stock_value_excess < 5000) score += 10;
        else if (answers.stock_value_excess > 20000) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
}

function calculateOperationsScore(answers: Record<string, any>): number {
    let score = 50;

    if (answers.hasUnusedCapacity === 'no') score += 15;
    else if (answers.hasUnusedCapacity === 'yes') score -= 15;

    if (answers.hasSpareCapacity === 'no') score += 10;
    else if (answers.hasSpareCapacity === 'yes') score -= 10;

    if (answers.operationalChallenges === 'no') score += 10;
    else if (answers.operationalChallenges === 'yes') score -= 10;

    if (answers.processImprovements === 'yes') score += 5;
    else if (answers.processImprovements === 'no') score -= 5;

    if (answers.idle_staff_general !== undefined) {
        if (answers.idle_staff_general <= 1) score += 10;
        else if (answers.idle_staff_general >= 5) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
}

function calculateSalesScore(answers: Record<string, any>): number {
    let score = 50;

    if (answers.businessPerformance === 'good') score += 20;
    else if (answers.businessPerformance === 'declining') score -= 20;

    if (answers.salesTrend === 'increasing') score += 15;
    else if (answers.salesTrend === 'declining') score -= 15;

    if (answers.isProfitable === 'yes') score += 15;
    else if (answers.isProfitable === 'no') score -= 15;

    return Math.max(0, Math.min(100, score));
}

function calculateMarketingScore(answers: Record<string, any>): number {
    let score = 50;

    if (answers.activelyMarketing === 'yes') score += 15;
    else if (answers.activelyMarketing === 'no') score -= 15;

    if (answers.marketing_budget !== undefined) {
        if (answers.marketing_budget > 0) score += 10;
        else score -= 10;
    }

    if (answers.marketing_effectiveness !== undefined) {
        const eff = Number(answers.marketing_effectiveness);
        if (eff >= 4) score += 15;
        else if (eff <= 2) score -= 15;
    }

    const channels = answers.primary_marketing_channels;
    if (Array.isArray(channels) && channels.length >= 2) score += 10;
    else if (channels?.includes('none')) score -= 15;

    return Math.max(0, Math.min(100, score));
}

function calculateCustomerScore(answers: Record<string, any>): number {
    let score = 50;

    if (answers.customer_retention_rate === 'high') score += 20;
    else if (answers.customer_retention_rate === 'low') score -= 20;

    if (answers.customer_satisfaction !== undefined) {
        const sat = Number(answers.customer_satisfaction);
        if (sat >= 4) score += 15;
        else if (sat <= 2) score -= 15;
    }

    if (answers.loyalty_programme === 'yes-active') score += 15;
    else if (answers.loyalty_programme === 'no') score -= 10;

    if (answers.hasRepeatCustomers === 'yes') score += 10;
    else if (answers.hasRepeatCustomers === 'no') score -= 10;

    return Math.max(0, Math.min(100, score));
}

function calculateTechnologyScore(answers: Record<string, any>): number {
    let score = 50;

    const software = answers.business_software;
    if (Array.isArray(software)) {
        if (software.includes('none')) score -= 15;
        else if (software.length >= 3) score += 15;
    }

    if (answers.online_sales === 'yes-active') score += 15;
    else if (answers.online_sales === 'no') score -= 15;

    if (answers.automation_level !== undefined) {
        const auto = Number(answers.automation_level);
        if (auto >= 4) score += 15;
        else if (auto <= 2) score -= 10;
    }

    if (answers.data_management === 'dedicated-software') score += 10;
    else if (answers.data_management === 'paper') score -= 15;

    return Math.max(0, Math.min(100, score));
}

function calculateFinanceScore(answers: Record<string, any>): number {
    let score = 50;

    if (answers.monthly_turnover === 'under10k') score -= 5;
    else if (answers.monthly_turnover === '250k+') score += 15;

    if (answers.profit_margin === 'negative') score -= 25;
    else if (answers.profit_margin === '25+') score += 20;
    else if (answers.profit_margin === '15-25') score += 10;

    if (answers.cost_management !== undefined) {
        const cost = Number(answers.cost_management);
        if (cost >= 4) score += 10;
        else if (cost <= 2) score -= 10;
    }

    if (answers.financial_reporting === 'weekly') score += 10;
    else if (answers.financial_reporting === 'never') score -= 15;

    return Math.max(0, Math.min(100, score));
}

function calculateGrowthScore(answers: Record<string, any>): number {
    let score = 50;

    if (answers.planningGrowth === 'yes') score += 15;
    else if (answers.planningGrowth === 'no') score -= 10;

    if (answers.lookingForNewCustomers === 'yes' || answers.lookingForNewCustomers === 'always') score += 10;
    else if (answers.lookingForNewCustomers === 'no') score -= 10;

    if (answers.sellsOnline === 'yes-active') score += 10;
    else if (answers.sellsOnline === 'no') score -= 10;

    return Math.max(0, Math.min(100, score));
}

function calculateVisibilityScore(answers: Record<string, any>): number {
    let score = 50;

    if (answers.activelyMarketing === 'yes') score += 15;
    else if (answers.activelyMarketing === 'no') score -= 15;

    if (answers.knowsCustomerAcquisition === 'yes') score += 10;
    else if (answers.knowsCustomerAcquisition === 'no') score -= 10;

    if (answers.online_presence !== undefined) {
        const vis = Number(answers.online_presence);
        if (vis >= 4) score += 15;
        else if (vis <= 2) score -= 15;
    }

    if (answers.sellsOnline === 'yes-active') score += 10;
    else if (answers.sellsOnline === 'no') score -= 5;

    return Math.max(0, Math.min(100, score));
}

function calculateTeamScore(answers: Record<string, any>): number {
    let score = 50;

    if (answers.idle_staff_general !== undefined) {
        if (answers.idle_staff_general <= 1) score += 20;
        else if (answers.idle_staff_general >= 4) score -= 20;
    }

    if (answers.hasUnusedCapacity === 'no') score += 15;
    else if (answers.hasUnusedCapacity === 'yes') score -= 15;

    return Math.max(0, Math.min(100, score));
}

// ============================================================
// EXPLANATIONS
// ============================================================

function getInventoryExplanation(answers: Record<string, any>, score: number): string {
    if (score >= 70) return "Your inventory management appears well-structured with minimal excess stock concerns.";
    if (score >= 40) return "There are some inventory management opportunities that could improve cash flow and reduce storage costs.";
    return "Significant inventory challenges were identified. Excess or slow-moving stock may be impacting your cash flow and profitability.";
}

function getInventoryImpact(answers: Record<string, any>): string[] {
    const impacts: string[] = [];
    if (answers.hasExcessStock === 'yes') impacts.push("Reduced cash flow from tied-up capital");
    if (answers.stockImpact === 'serious') impacts.push("Significant storage cost pressure");
    if (answers.stock_value_excess > 10000) impacts.push("Substantial capital locked in unsold inventory");
    if (impacts.length === 0) impacts.push("Minimal inventory-related impact on business performance");
    return impacts;
}

function getOperationsExplanation(answers: Record<string, any>, score: number): string {
    if (score >= 70) return "Your operations appear efficient with good utilisation of available capacity.";
    if (score >= 40) return "There are operational inefficiencies that, if addressed, could improve output and reduce costs.";
    return "Significant operational challenges were identified. Unused capacity and process inefficiencies are likely affecting profitability.";
}

function getOperationsImpact(answers: Record<string, any>): string[] {
    const impacts: string[] = [];
    if (answers.hasUnusedCapacity === 'yes') impacts.push("Lost revenue from underutilised resources");
    if (answers.operationalChallenges === 'yes') impacts.push("Process inefficiencies reducing margins");
    if (answers.idle_staff_general > 2) impacts.push("Staff time not generating revenue");
    if (impacts.length === 0) impacts.push("Operations are running efficiently");
    return impacts;
}

function getSalesExplanation(answers: Record<string, any>, score: number): string {
    if (score >= 70) return "Your sales performance is strong with positive trends and healthy profitability.";
    if (score >= 40) return "Sales performance has room for improvement. Some factors may be limiting revenue growth.";
    return "Sales performance requires attention. Declining trends or profitability issues need to be addressed.";
}

function getSalesImpact(answers: Record<string, any>): string[] {
    const impacts: string[] = [];
    if (answers.salesTrend === 'declining') impacts.push("Revenue is trending downwards");
    if (answers.isProfitable === 'no') impacts.push("Business is not currently profitable");
    if (answers.businessPerformance === 'declining') impacts.push("Overall business performance is deteriorating");
    if (impacts.length === 0) impacts.push("Sales performance is supporting business growth");
    return impacts;
}

function getMarketingExplanation(answers: Record<string, any>, score: number): string {
    if (score >= 70) return "Your marketing efforts are effective with clear channels and good return on investment.";
    if (score >= 40) return "Marketing could be improved with more consistent effort and better channel utilisation.";
    return "Marketing requires significant attention. Limited or ineffective marketing is restricting customer acquisition.";
}

function getMarketingImpact(answers: Record<string, any>): string[] {
    const impacts: string[] = [];
    if (answers.activelyMarketing === 'no') impacts.push("Limited customer acquisition efforts");
    if (answers.marketing_budget === 0) impacts.push("No investment in marketing activities");
    if (answers.marketing_effectiveness <= 2) impacts.push("Current marketing is not generating results");
    if (impacts.length === 0) impacts.push("Marketing is effectively supporting business growth");
    return impacts;
}

function getCustomerExplanation(answers: Record<string, any>, score: number): string {
    if (score >= 70) return "Customer retention is strong with good satisfaction levels and repeat business.";
    if (score >= 40) return "Customer retention has opportunities for improvement. Some customers may not be returning.";
    return "Customer retention is a significant concern. Low repeat business is limiting revenue potential.";
}

function getCustomerImpact(answers: Record<string, any>): string[] {
    const impacts: string[] = [];
    if (answers.customer_retention_rate === 'low') impacts.push("High customer churn reducing lifetime value");
    if (answers.hasRepeatCustomers === 'no') impacts.push("Limited repeat business");
    if (answers.loyalty_programme === 'no') impacts.push("No structured retention programme");
    if (impacts.length === 0) impacts.push("Customer relationships are supporting sustainable growth");
    return impacts;
}

function getTechnologyExplanation(answers: Record<string, any>, score: number): string {
    if (score >= 70) return "Technology systems are well-utilised and supporting business operations effectively.";
    if (score >= 40) return "Technology could be better leveraged to improve efficiency and reduce manual work.";
    return "Technology gaps are limiting business efficiency. Manual processes may be consuming excessive time.";
}

function getTechnologyImpact(answers: Record<string, any>): string[] {
    const impacts: string[] = [];
    if (answers.business_software?.includes('none')) impacts.push("No business software in use");
    if (answers.online_sales === 'no') impacts.push("Missing online sales channel");
    if (answers.automation_level <= 2) impacts.push("High level of manual processes");
    if (impacts.length === 0) impacts.push("Technology is supporting operational efficiency");
    return impacts;
}

function getFinanceExplanation(answers: Record<string, any>, score: number): string {
    if (score >= 70) return "Financial management appears solid with good visibility and healthy margins.";
    if (score >= 40) return "Financial management could be improved with better reporting and cost control.";
    return "Financial management requires immediate attention. Margins or cash flow may be under pressure.";
}

function getFinanceImpact(answers: Record<string, any>): string[] {
    const impacts: string[] = [];
    if (answers.profit_margin === 'negative') impacts.push("Business is operating at a loss");
    if (answers.profit_margin === '0-5') impacts.push("Very thin profit margins");
    if (answers.financial_reporting === 'never') impacts.push("Limited financial visibility");
    if (impacts.length === 0) impacts.push("Financial position is supporting business sustainability");
    return impacts;
}

function getGrowthExplanation(answers: Record<string, any>, score: number): string {
    if (score >= 70) return "Business is positioned for growth with clear plans and active development efforts.";
    if (score >= 40) return "Growth potential exists but may require operational improvements first.";
    return "Growth readiness is limited. Foundational improvements may be needed before scaling.";
}

function getGrowthImpact(answers: Record<string, any>): string[] {
    const impacts: string[] = [];
    if (answers.planningGrowth === 'no') impacts.push("No active growth plans");
    if (answers.sellsOnline === 'no') impacts.push("Missing digital growth channel");
    if (answers.lookingForNewCustomers === 'no') impacts.push("Not actively seeking new customers");
    if (impacts.length === 0) impacts.push("Growth foundations are in place");
    return impacts;
}

function getVisibilityExplanation(answers: Record<string, any>, score: number): string {
    if (score >= 70) return "Business has strong market visibility with effective marketing and online presence.";
    if (score >= 40) return "Visibility could be improved to attract more customers and build brand awareness.";
    return "Limited market visibility is restricting customer acquisition and growth potential.";
}

function getVisibilityImpact(answers: Record<string, any>): string[] {
    const impacts: string[] = [];
    if (answers.activelyMarketing === 'no') impacts.push("Limited brand awareness efforts");
    if (answers.knowsCustomerAcquisition === 'no') impacts.push("Unclear how customers find the business");
    if (answers.sellsOnline === 'no') impacts.push("No online sales presence");
    if (impacts.length === 0) impacts.push("Visibility is supporting customer acquisition");
    return impacts;
}

function getTeamExplanation(answers: Record<string, any>, score: number): string {
    if (score >= 70) return "Team utilisation is strong with staff effectively engaged in productive work.";
    if (score >= 40) return "Team productivity has room for improvement. Some capacity may be underutilised.";
    return "Team performance requires attention. Significant idle time is affecting productivity.";
}

function getTeamImpact(answers: Record<string, any>): string[] {
    const impacts: string[] = [];
    if (answers.idle_staff_general > 3) impacts.push("Significant staff idle time");
    if (answers.hasUnusedCapacity === 'yes') impacts.push("Team capacity not fully utilised");
    if (impacts.length === 0) impacts.push("Team is performing effectively");
    return impacts;
}

// ============================================================
// STRENGTHS, CHALLENGES, OPPORTUNITIES
// ============================================================

function identifyStrengths(answers: Record<string, any>, categories: HealthCategory[]): BusinessStrength[] {
    const strengths: BusinessStrength[] = [];

    const excellentCategories = categories.filter(c => c.rating === 'excellent' || c.rating === 'good');
    excellentCategories.forEach(cat => {
        strengths.push({
            id: `strength-${cat.id}`,
            title: `Strong ${cat.name}`,
            description: cat.explanation,
            whyItMatters: `Maintaining strength in ${cat.name.toLowerCase()} provides a solid foundation for growth and competitiveness.`
        });
    });

    if (answers.isProfitable === 'yes') {
        strengths.push({
            id: 'strength-profitability',
            title: 'Profitable Business Model',
            description: 'Your business is currently generating profit.',
            whyItMatters: 'Profitability provides the resources needed to invest in growth and improvements.'
        });
    }

    if (answers.customer_retention_rate === 'high') {
        strengths.push({
            id: 'strength-retention',
            title: 'Strong Customer Retention',
            description: 'Customers are returning regularly.',
            whyItMatters: 'High retention reduces acquisition costs and increases lifetime customer value.'
        });
    }

    if (answers.salesTrend === 'increasing') {
        strengths.push({
            id: 'strength-growth',
            title: 'Positive Sales Growth',
            description: 'Revenue is trending upwards.',
            whyItMatters: 'Growing revenue indicates market demand and effective sales efforts.'
        });
    }

    return strengths.slice(0, 6);
}

function identifyChallenges(answers: Record<string, any>, categories: HealthCategory[]): BusinessChallenge[] {
    const challenges: BusinessChallenge[] = [];

    if (answers.hasExcessStock === 'yes') {
        challenges.push({
            id: 'challenge-excess-stock',
            title: 'Excess Inventory',
            description: 'Slow-moving stock is tying up capital and consuming storage space.',
            severity: answers.stockImpact === 'serious' ? 'high' : 'medium'
        });
    }

    if (answers.hasUnusedCapacity === 'yes') {
        challenges.push({
            id: 'challenge-unused-capacity',
            title: 'Unused Operational Capacity',
            description: 'Staff, equipment, or facilities are not being fully utilised.',
            severity: 'medium'
        });
    }

    if (answers.customer_retention_rate === 'low') {
        challenges.push({
            id: 'challenge-retention',
            title: 'Low Customer Retention',
            description: 'Most customers are not returning, increasing acquisition costs.',
            severity: 'high'
        });
    }

    if (answers.activelyMarketing === 'no') {
        challenges.push({
            id: 'challenge-marketing',
            title: 'Limited Marketing Activity',
            description: 'Inconsistent or absent marketing is restricting customer acquisition.',
            severity: 'medium'
        });
    }

    if (answers.business_software?.includes('none')) {
        challenges.push({
            id: 'challenge-technology',
            title: 'Technology Gaps',
            description: 'Lack of business software is limiting efficiency and data visibility.',
            severity: 'low'
        });
    }

    if (answers.profit_margin === 'negative' || answers.profit_margin === '0-5') {
        challenges.push({
            id: 'challenge-margins',
            title: 'Thin Profit Margins',
            description: 'Current margins may not sustain business operations long-term.',
            severity: 'high'
        });
    }

    return challenges.slice(0, 6);
}

function identifyOpportunities(answers: Record<string, any>, categories: HealthCategory[]): GrowthOpportunity[] {
    const opps: GrowthOpportunity[] = [];

    if (answers.hasExcessStock === 'yes') {
        opps.push({
            id: 'opp-stock',
            title: 'Inventory Optimisation',
            currentSituation: 'Excess stock is consuming capital and storage.',
            potentialOutcome: 'Freed working capital and reduced storage costs.',
            businessBenefit: 'Improved cash flow and healthier balance sheet.'
        });
    }

    if (answers.hasUnusedCapacity === 'yes') {
        opps.push({
            id: 'opp-capacity',
            title: 'Capacity Utilisation',
            currentSituation: 'Operational capacity is underutilised.',
            potentialOutcome: 'Increased output without proportional cost increase.',
            businessBenefit: 'Higher revenue with existing resources.'
        });
    }

    if (answers.loyalty_programme === 'no' || answers.loyalty_programme === 'no-planning') {
        opps.push({
            id: 'opp-loyalty',
            title: 'Customer Loyalty Programme',
            currentSituation: 'No structured retention programme exists.',
            potentialOutcome: 'Increased repeat business and customer lifetime value.',
            businessBenefit: 'More predictable revenue and lower acquisition costs.'
        });
    }

    if (answers.sellsOnline === 'no' || answers.sellsOnline === 'no-planning') {
        opps.push({
            id: 'opp-online',
            title: 'Online Sales Channel',
            currentSituation: 'Business is not selling online.',
            potentialOutcome: 'New revenue stream reaching wider audience.',
            businessBenefit: 'Reduced dependency on physical location.'
        });
    }

    if (answers.activelyMarketing === 'no') {
        opps.push({
            id: 'opp-marketing',
            title: 'Marketing Activation',
            currentSituation: 'Limited marketing activity.',
            potentialOutcome: 'Increased brand awareness and customer acquisition.',
            businessBenefit: 'Steady stream of new customers.'
        });
    }

    if (answers.data_management === 'paper' || answers.data_management === 'mixed') {
        opps.push({
            id: 'opp-digital',
            title: 'Digital Transformation',
            currentSituation: 'Business data is managed manually or inconsistently.',
            potentialOutcome: 'Centralised data and improved decision-making.',
            businessBenefit: 'Better insights and operational efficiency.'
        });
    }

    return opps.slice(0, 5);
}

function identifyPriorities(answers: Record<string, any>, categories: HealthCategory[]): PriorityItem[] {
    const priorities: PriorityItem[] = [];

    const criticalCategories = categories.filter(c => c.rating === 'critical' || c.rating === 'poor');
    criticalCategories.forEach(cat => {
        priorities.push({
            id: `priority-${cat.id}`,
            title: cat.name,
            description: cat.explanation,
            level: 'immediate'
        });
    });

    const averageCategories = categories.filter(c => c.rating === 'average');
    averageCategories.forEach(cat => {
        priorities.push({
            id: `priority-${cat.id}`,
            title: cat.name,
            description: cat.explanation,
            level: 'medium'
        });
    });

    if (answers.planningGrowth === 'yes') {
        priorities.push({
            id: 'priority-expansion',
            title: 'Business Expansion',
            description: 'Position business for sustainable growth.',
            level: 'long-term'
        });
    }

    return priorities.slice(0, 8);
}

function identifyRisks(answers: Record<string, any>, categories: HealthCategory[]): RiskItem[] {
    const risks: RiskItem[] = [];

    if (answers.profit_margin === 'negative') {
        risks.push({
            id: 'risk-cashflow',
            title: 'Cash Flow Pressure',
            description: 'Operating at a loss creates immediate financial risk.',
            severity: 'high',
            potentialImpact: 'Inability to meet obligations and sustain operations.',
            urgency: 'Immediate attention required'
        });
    }

    if (answers.customer_retention_rate === 'low') {
        risks.push({
            id: 'risk-churn',
            title: 'Customer Churn',
            description: 'High customer turnover increases acquisition costs.',
            severity: 'medium',
            potentialImpact: 'Declining revenue and unstable customer base.',
            urgency: 'Address within 3 months'
        });
    }

    if (answers.hasExcessStock === 'yes' && answers.stockImpact === 'serious') {
        risks.push({
            id: 'risk-stock',
            title: 'Inventory Obsolescence',
            description: 'Excess stock may become unsellable.',
            severity: 'medium',
            potentialImpact: 'Capital write-off and storage cost increase.',
            urgency: 'Address within 3 months'
        });
    }

    if (answers.business_software?.includes('none') && answers.data_management === 'paper') {
        risks.push({
            id: 'risk-data',
            title: 'Data Management Risk',
            description: 'Paper-based systems create data loss and inconsistency risks.',
            severity: 'low',
            potentialImpact: 'Poor decision-making from unreliable data.',
            urgency: 'Address within 6 months'
        });
    }

    return risks.slice(0, 4);
}

function assessReadiness(answers: Record<string, any>, categories: HealthCategory[]): BusinessDiagnosis['readiness'] {
    const avgScore = categories.reduce((sum, c) => sum + c.score, 0) / categories.length;

    if (avgScore >= 70) {
        return {
            status: 'ready-for-growth',
            explanation: 'Your business is in a strong position to pursue growth initiatives. Operational foundations are solid and ready for scaling.'
        };
    }

    if (avgScore >= 50) {
        return {
            status: 'needs-improvements',
            explanation: 'Your business has a good foundation but would benefit from targeted improvements before pursuing major growth initiatives.'
        };
    }

    if (answers.profit_margin === 'negative') {
        return {
            status: 'requires-stabilisation',
            explanation: 'Your business needs operational stabilisation before growth. Focus on improving profitability and cash flow first.'
        };
    }

    if (answers.sellsOnline === 'no' && answers.automation_level <= 2) {
        return {
            status: 'digital-ready',
            explanation: 'Your business is ready for digital transformation. Implementing technology improvements could significantly boost efficiency.'
        };
    }

    return {
        status: 'needs-improvements',
        explanation: 'Some operational improvements would strengthen your business position and prepare it for future growth.'
    };
}

// ============================================================
// NARRATIVES
// ============================================================

function generateExecutiveSummary(answers: Record<string, any>, categories: HealthCategory[], overallScore: number): string {
    const strengths = categories.filter(c => c.rating === 'excellent' || c.rating === 'good');
    const weaknesses = categories.filter(c => c.rating === 'poor' || c.rating === 'critical');

    let summary = "Our analysis indicates that ";

    if (overallScore >= 70) {
        summary += "your business is performing well overall. ";
    } else if (overallScore >= 40) {
        summary += "your business has a solid foundation but there are areas that need attention. ";
    } else {
        summary += "your business is facing significant challenges that require immediate focus. ";
    }

    if (strengths.length > 0) {
        summary += `Strong areas include ${strengths.map(s => s.name.toLowerCase()).join(', ')}. `;
    }

    if (weaknesses.length > 0) {
        summary += `Key challenges are in ${weaknesses.map(w => w.name.toLowerCase()).join(', ')}. `;
    }

    summary += "The following diagnosis provides a detailed breakdown of your business health across all major areas.";

    return summary;
}

function generateWhatWeFound(answers: Record<string, any>, categories: HealthCategory[], strengths: BusinessStrength[], challenges: BusinessChallenge[]): string {
    let narrative = "During your assessment we identified several areas where your business is performing well";

    if (strengths.length > 0) {
        narrative += `, particularly in ${strengths.slice(0, 3).map(s => s.title.toLowerCase()).join(', ')}`;
    }

    narrative += ". ";

    if (challenges.length > 0) {
        narrative += `We also identified several challenges that may be limiting growth, including ${challenges.slice(0, 3).map(c => c.title.toLowerCase()).join(', ')}. `;
    }

    narrative += "These findings form the basis for your Business Improvement Plan.";

    return narrative;
}

// ============================================================
// READINESS LABELS
// ============================================================

export function getReadinessLabel(status: ReadinessStatus): string {
    const labels: Record<ReadinessStatus, string> = {
        'ready-for-growth': 'Ready for Growth',
        'needs-improvements': 'Needs Operational Improvements',
        'requires-stabilisation': 'Requires Immediate Stabilisation',
        'digital-ready': 'Digital Transformation Ready',
        'expansion-ready': 'Expansion Ready'
    };
    return labels[status];
}
