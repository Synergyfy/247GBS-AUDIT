import { BaseCalculator, CalculationResult } from './base.calculator';

export class ProfessionalServicesCalculator extends BaseCalculator {
  calculate(answers: Record<string, any>): CalculationResult {
    // 1. Capacity Drain Calculation (Professional Services: Billable Efficiency)
    const capacityQuestions = [
      { id: 'ps-billable-idle-trigger-01', weight: 2.0, max: 100 }, // % of non-billable hours for senior staff
      { id: 'ps-admin-overhead-trigger-01', weight: 1.0, max: 50 },  // Weekly hours spent on manual admin (per person)
      { id: 'ps-project-delay-deep-01', weight: 1.5, max: 100 },    // % of projects missing deadlines
    ];

    const capacityDrainPct = this.calculateWeightedScore(answers, capacityQuestions);

    // 2. "Stock" Impact (Professional Services: Human Capital & Resource Waste)
    // Logic: Recruitment Cost + (Staff Turnover % * Avg Salary)
    const recruitingWaste = Number(answers['ps-resource-leak-deep-01'] || 0); // Annual training/recruiting loss
    const billableLeakValue = Number(answers['ps-revenue-leak-deep-01'] || 0); // Monthly unbilled but worked value
    
    // Annualized Impact
    const annualResourceWaste = recruitingWaste + (billableLeakValue * 12);
    const totalStockImpact = Math.round(annualResourceWaste);

    // 3. Recovery Potential
    // Services Efficiency Factor: 0.25 (High recovery potential in billable optimization)
    // Baseline Revenue (Placeholder if not in answers): 25,000/week (Medium sized agency)
    const weeklyRecovery = (capacityDrainPct / 100) * 25000 * 0.25;
    const annualRecovery = Math.round(weeklyRecovery * 52);

    return {
      capacityDrainPct: Math.round(capacityDrainPct),
      totalStockImpact,
      annualRecovery,
      impactScore: Math.round((capacityDrainPct + Math.min(totalStockImpact / 10000, 100)) / 2),
    };
  }
}
