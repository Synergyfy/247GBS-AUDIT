import { BaseCalculator, CalculationResult } from './base.calculator';

export class HospitalityCalculator extends BaseCalculator {
  calculate(answers: Record<string, any>): CalculationResult {
    // 1. Capacity Drain Calculation (Hospitality Specific)
    // We look for specific hospitality questions IDs from the frontend data
    const capacityQuestions = [
      { id: 'hosp-dining-capacity-trigger-01', weight: 1.5, max: 100 }, // Empty tables %
      { id: 'hosp-dining-capacity-trigger-02', weight: 1.2, max: 50 },  // Idle staff hours (approx max 50)
      { id: 'hosp-dining-capacity-deep-01', weight: 1.8, max: 100 },    // Private room unused %
    ];

    const capacityDrainPct = this.calculateWeightedScore(answers, capacityQuestions);

    // 2. Excess Stock Impact Calculation
    // Logic: Waste Value + (Stock Value * Waste %)
    const wasteValue = Number(answers['hosp-dining-stock-deep-01'] || 0);
    const expirePct = Number(answers['hosp-dining-stock-trigger-01'] || 0);
    // Assuming a baseline monthly stock purchase if not provided directly, 
    // but usually we want specific answers.
    // Let's use the 'stock_value_excess' general question as a fallback or base.
    const baseStockValue = Number(answers['stock_value_excess'] || 0);

    // Annualized Waste Impact
    const annualWaste = (wasteValue * 12) + (baseStockValue * (expirePct / 100) * 12);
    const totalStockImpact = Math.round(annualWaste);

    // 3. Recovery Potential
    // Hospitality Efficiency Factor: 0.20 (Conservative recovery rate)
    // Baseline Revenue (Placeholder if not in answers): 5000/week
    const weeklyRecovery = (capacityDrainPct / 100) * 5000 * 0.20;
    const annualRecovery = Math.round(weeklyRecovery * 52);

    return {
      capacityDrainPct: Math.round(capacityDrainPct),
      totalStockImpact,
      annualRecovery,
      impactScore: Math.round((capacityDrainPct + Math.min(totalStockImpact / 1000, 100)) / 2),
    };
  }
}
