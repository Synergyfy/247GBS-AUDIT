import { BusinessDiagnosis } from "./diagnosis";
import { SolutionPlan, RecommendationCard, ImplementationPhase, BudgetSelection, TimeframeSelection } from "@/data/solutions";
import { getSolutionById, MCOM_SOLUTIONS } from "@/data/solutions-catalog";

function mapSeverity(severity: string): 'high' | 'medium' | 'low' {
  if (severity === 'high' || severity === 'critical') return 'high';
  if (severity === 'medium') return 'medium';
  return 'low';
}

export function generateSolutionPlan(
  diagnosis: BusinessDiagnosis,
  budget: BudgetSelection,
  timeframe: TimeframeSelection,
  sectorId: string
): SolutionPlan {
  const recommendations: RecommendationCard[] = [];
  const issueSolutionMap: { issue: string; solution: string }[] = [];

  // --- Map challenges to solutions ---
  for (const challenge of diagnosis.challenges) {
    let solutionId: string | undefined;

    if (challenge.id === 'challenge-excess-stock') solutionId = 'excess-stock-programme';
    else if (challenge.id === 'challenge-unused-capacity') solutionId = 'spare-capacity-programme';
    else if (challenge.id === 'challenge-retention') solutionId = 'rewards-loyalty';
    else if (challenge.id === 'challenge-marketing') solutionId = 'marketing-automation';
    else if (challenge.id === 'challenge-technology') solutionId = 'digital-transformation';
    else if (challenge.id === 'challenge-margins') solutionId = 'cash-flow-management';

    const solution = solutionId ? getSolutionById(solutionId) : undefined;
    if (!solution) continue;

    const severity = challenge.severity;
    let priority: RecommendationCard['implementationPriority'] = 'medium';
    if (severity === 'high') priority = 'high';
    else if (severity === 'low') priority = 'future';

    let phase: 1 | 2 | 3 = 2;
    if (priority === 'high') phase = 1;
    else if (priority === 'future') phase = 3;

    recommendations.push({
      id: `rec-${solution.id}`,
      businessIssue: challenge.title,
      severity: severity.charAt(0).toUpperCase() + severity.slice(1),
      evidence: challenge.description,
      businessImpact: getImpactForChallenge(challenge.id),
      recommendedSolution: solution.solutionName,
      solutionId: solution.id,
      whyThisSolution: solution.whyThisSolution,
      expectedOutcomes: solution.expectedOutcomes,
      implementationPriority: priority,
      estimatedTimeline: solution.estimatedTimeline,
      estimatedInvestment: getBudgetAdjustedInvestment(solution.estimatedInvestment, budget.budgetRange),
      expectedBusinessImpact: solution.businessImpact,
      phase
    });

    issueSolutionMap.push({ issue: challenge.title, solution: solution.solutionName });
  }

  // --- Map opportunities to solutions ---
  for (const opp of diagnosis.opportunities) {
    let solutionId: string | undefined;

    if (opp.id === 'opp-stock') solutionId = 'excess-stock-programme';
    else if (opp.id === 'opp-capacity') solutionId = 'spare-capacity-programme';
    else if (opp.id === 'opp-loyalty') solutionId = 'rewards-loyalty';
    else if (opp.id === 'opp-online') solutionId = 'mcom-mall';
    else if (opp.id === 'opp-marketing') solutionId = 'marketing-automation';
    else if (opp.id === 'opp-digital') solutionId = 'digital-transformation';

    const solution = solutionId ? getSolutionById(solutionId) : undefined;
    if (!solution) continue;

    const alreadyExists = recommendations.some(r => r.solutionId === solution.id);
    if (alreadyExists) continue;

    recommendations.push({
      id: `rec-${solution.id}`,
      businessIssue: opp.title,
      severity: 'Medium',
      evidence: opp.currentSituation,
      businessImpact: [opp.potentialOutcome, opp.businessBenefit],
      recommendedSolution: solution.solutionName,
      solutionId: solution.id,
      whyThisSolution: solution.whyThisSolution,
      expectedOutcomes: solution.expectedOutcomes,
      implementationPriority: 'medium',
      estimatedTimeline: solution.estimatedTimeline,
      estimatedInvestment: getBudgetAdjustedInvestment(solution.estimatedInvestment, budget.budgetRange),
      expectedBusinessImpact: solution.businessImpact,
      phase: 2
    });

    issueSolutionMap.push({ issue: opp.title, solution: solution.solutionName });
  }

  // --- Add growth/expansion solutions based on priorities ---
  const hasGrowthPriority = diagnosis.priorities.some(p => p.id === 'priority-expansion');
  if (hasGrowthPriority) {
    const expansionSol = getSolutionById('international-expansion');
    if (expansionSol && !recommendations.some(r => r.solutionId === 'international-expansion')) {
      recommendations.push({
        id: 'rec-international-expansion',
        businessIssue: 'Business Expansion Opportunity',
        severity: 'Low',
        evidence: 'Your business has expressed readiness for growth and expansion.',
        businessImpact: ['New market access', 'Revenue diversification'],
        recommendedSolution: expansionSol.solutionName,
        solutionId: expansionSol.id,
        whyThisSolution: expansionSol.whyThisSolution,
        expectedOutcomes: expansionSol.expectedOutcomes,
        implementationPriority: 'future',
        estimatedTimeline: expansionSol.estimatedTimeline,
        estimatedInvestment: getBudgetAdjustedInvestment(expansionSol.estimatedInvestment, budget.budgetRange),
        expectedBusinessImpact: expansionSol.businessImpact,
        phase: 3
      });
      issueSolutionMap.push({ issue: 'Business Expansion', solution: expansionSol.solutionName });
    }
  }

  // --- Add account manager if multiple solutions or high severity ---
  const highSeverityCount = diagnosis.challenges.filter(c => c.severity === 'high').length;
  const accMgr = getSolutionById('account-manager');
  if (accMgr && (recommendations.length >= 3 || highSeverityCount >= 2) && !recommendations.some(r => r.solutionId === 'account-manager')) {
    recommendations.push({
      id: 'rec-account-manager',
      businessIssue: 'Implementation Support Needed',
      severity: 'Medium',
      evidence: `Your improvement plan includes ${recommendations.length} recommendations that require coordinated execution.`,
      businessImpact: ['Faster implementation', 'Reduced management burden'],
      recommendedSolution: accMgr.solutionName,
      solutionId: accMgr.id,
      whyThisSolution: accMgr.whyThisSolution,
      expectedOutcomes: accMgr.expectedOutcomes,
      implementationPriority: 'medium',
      estimatedTimeline: accMgr.estimatedTimeline,
      estimatedInvestment: getBudgetAdjustedInvestment(accMgr.estimatedInvestment, budget.budgetRange),
      expectedBusinessImpact: accMgr.businessImpact,
      phase: 1
    });
    issueSolutionMap.push({ issue: 'Implementation Coordination', solution: accMgr.solutionName });
  }

  // --- Build phases ---
  const phases: ImplementationPhase[] = [
    {
      phaseNumber: 1,
      title: "Immediate Priorities",
      objectives: [
        "Address urgent challenges that impact cash flow and operations",
        "Implement quick wins with measurable short-term impact",
        "Stabilise core business operations"
      ],
      problemsAddressed: recommendations
        .filter(r => r.phase === 1)
        .map(r => r.businessIssue),
      estimatedDuration: "0-60 Days",
      expectedOutcome: "Stabilised operations, improved cash flow, and resolved critical issues that were holding the business back.",
      prerequisites: "Management commitment and resource allocation for implementation."
    },
    {
      phaseNumber: 2,
      title: "Business Growth",
      objectives: [
        "Build on the stabilised foundation to drive revenue growth",
        "Strengthen customer acquisition and retention",
        "Improve marketing effectiveness and digital presence"
      ],
      problemsAddressed: recommendations
        .filter(r => r.phase === 2)
        .map(r => r.businessIssue),
      estimatedDuration: "30-90 Days",
      expectedOutcome: "Increased revenue, improved customer retention, and stronger market position.",
      prerequisites: "Phase 1 priorities addressed and operational stability achieved."
    },
    {
      phaseNumber: 3,
      title: "Future Expansion",
      objectives: [
        "Position the business for long-term growth and scalability",
        "Explore new markets, channels, and revenue streams",
        "Implement advanced systems and capabilities"
      ],
      problemsAddressed: recommendations
        .filter(r => r.phase === 3)
        .map(r => r.businessIssue),
      estimatedDuration: "90 Days - 12 Months",
      expectedOutcome: "Sustainable growth trajectory with diversified revenue and scalable operations.",
      prerequisites: "Phases 1 and 2 completed with stable growth foundation established."
    }
  ];

  const highCount = recommendations.filter(r => r.implementationPriority === 'high').length;
  const mediumCount = recommendations.filter(r => r.implementationPriority === 'medium').length;
  const futureCount = recommendations.filter(r => r.implementationPriority === 'future').length;

  const totalTimeline = estimateOverallTimeline(timeframe.timeToResults, recommendations.length);

  const expectedOutcomes = [
    recommendations.some(r => r.solutionId === 'excess-stock-programme') && "Improved inventory efficiency and working capital",
    recommendations.some(r => r.solutionId === 'spare-capacity-programme') && "Better utilisation of existing resources and capacity",
    recommendations.some(r => r.solutionId === 'rewards-loyalty') && "Enhanced customer retention and repeat business",
    recommendations.some(r => r.solutionId === 'mcom-mall') && "Increased online visibility and digital sales channel",
    recommendations.some(r => r.solutionId === 'marketing-automation') && "Consistent marketing driving customer acquisition",
    recommendations.some(r => r.solutionId === 'digital-transformation') && "Streamlined operations through digital tools",
    recommendations.some(r => r.solutionId === 'cash-flow-management') && "Improved financial stability and profitability",
    recommendations.some(r => r.solutionId === 'gbs-expo') && "Greater brand exposure and industry connections"
  ].filter(Boolean) as string[];

  return {
    diagnosisId: `diagnosis-${Date.now()}`,
    createdAt: new Date().toISOString(),
    budget,
    timeframe,
    recommendations,
    phases,
    summary: {
      highPriority: highCount,
      mediumPriority: mediumCount,
      futureGrowth: futureCount,
      estimatedOverallTimeline: totalTimeline
    },
    expectedBusinessOutcomes: expectedOutcomes,
    mcomServiceMapping: issueSolutionMap
  };
}

function getImpactForChallenge(challengeId: string): string[] {
  const impacts: Record<string, string[]> = {
    'challenge-excess-stock': ["Reduced cash flow", "Higher storage costs", "Lower profitability"],
    'challenge-unused-capacity': ["Wasted operational resources", "Lower revenue potential", "Higher per-unit costs"],
    'challenge-retention': ["Higher customer acquisition costs", "Unstable revenue base", "Brand weakness"],
    'challenge-marketing': ["Limited customer pipeline", "Dependence on repeat customers", "Slow growth"],
    'challenge-technology': ["Manual processes waste time", "Poor data visibility", "Inconsistent operations"],
    'challenge-margins': ["Financial vulnerability", "Limited growth investment", "Sustainability concerns"]
  };
  return impacts[challengeId] || ["Operational inefficiency", "Reduced profitability"];
}

function getBudgetAdjustedInvestment(baseInvestment: string, budgetRange: string): string {
  const budgetLabels: Record<string, string> = {
    'under-500': 'Under £500',
    '500-2000': '£500-£2,000',
    '2000-5000': '£2,000-£5,000',
    '5000-10000': '£5,000-£10,000',
    '10000-plus': '£10,000+'
  };
  return `From ${budgetLabels[budgetRange] || baseInvestment}`;
}

function estimateOverallTimeline(timeToResults: string, recCount: number): string {
  if (timeToResults === 'immediately' || timeToResults === 'within-30') return '2-3 Months';
  if (timeToResults === 'within-60' || timeToResults === 'within-90') return '3-6 Months';
  if (timeToResults === 'within-6-months') return '6-12 Months';
  return '12+ Months';
}

export function generateBusinessInfo(answers: Record<string, any>) {
  return {
    businessName: answers.businessName || 'Your Business',
    sector: answers.sector || '',
    auditType: answers.auditType === 'LONG_FORM' ? 'Long Business Audit' : 'Short Business Audit',
    completedBy: answers.completedBy || '',
    completedAt: answers.completedAt || new Date().toISOString()
  };
}
