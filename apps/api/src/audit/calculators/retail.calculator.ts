import { BaseCalculator, CalculationResult } from './base.calculator';

export class RetailCalculator extends BaseCalculator {
  calculate(answers: Record<string, any>): CalculationResult {
    // 1. Capacity Drain Calculation (Retail: In-store and Supply Chain Efficiency)
    const capacityQuestions = [
      { id: 'retail-store-idle-trigger-01', weight: 1.5, max: 100 }, // Staff idle time (peak hours)
      { id: 'retail-logistics-delay-trigger-01', weight: 1.2, max: 50 },  // Supply chain delay hours (avg/week)
      { id: 'retail-floor-unused-deep-01', weight: 1.0, max: 100 },    // Non-revenue floor space %
    ];

    const capacityDrainPct = this.calculateWeightedScore(answers, capacityQuestions);

    // 2. Excess Stock and Shrinkage Impact
    // Logic: Shrinkage Value + (Excess Stock Value * Carry Cost %)
    const shrinkageValue = Number(answers['retail-inventory-shrink-deep-01'] || 0); // Monthly loss
    const excessStockValue = Number(answers['retail-inventory-excess-deep-01'] || 0); // Capital tied up
    const carryCostPct = 0.25; // Standard retail carrying cost (25% p.a.)

    // Annualized Stock Impact
    const annualShrinkage = shrinkageValue * 12;
    const annualCarryCost = excessStockValue * carryCostPct;
    const totalStockImpact = Math.round(annualShrinkage + annualCarryCost);

    // 3. Recovery Potential
    // Retail Efficiency Factor: 0.15 (Operational optimization recovery)
    // Baseline Revenue (Placeholder if not in answers): 10,000/week (Avg Retail unit)
    const weeklyRecovery = (capacityDrainPct / 100) * 10000 * 0.15;
    const annualRecovery = Math.round(weeklyRecovery * 52);

    return {
      capacityDrainPct: Math.round(capacityDrainPct),
      totalStockImpact,
      annualRecovery,
      impactScore: Math.round((capacityDrainPct + Math.min(totalStockImpact / 5000, 100)) / 2),
    };
  }
}
