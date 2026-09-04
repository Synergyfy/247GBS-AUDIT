import { BaseCalculator, CalculationResult } from './base.calculator';

export class ManufacturingCalculator extends BaseCalculator {
  calculate(answers: Record<string, any>): CalculationResult {
    // 1. Capacity Drain Calculation (Manufacturing: OEE & Throughput)
    const capacityQuestions = [
      { id: 'mfg-machine-downtime-trigger-01', weight: 2.0, max: 100 }, // Machine downtime % per shift
      { id: 'mfg-scrap-rate-trigger-01', weight: 1.5, max: 20 },      // Defect/Scrap rate %
      { id: 'mfg-idle-operator-deep-01', weight: 1.0, max: 100 },     // Operator idle time due to starvation %
    ];

    const capacityDrainPct = this.calculateWeightedScore(answers, capacityQuestions);

    // 2. Resource/Stock Impact (Manufacturing: Energy & Waste)
    // Logic: Scrap Value + (Excess WIP Value * Holding Cost %) + Energy Leakage
    const scrapValueMonth = Number(answers['mfg-scrap-value-deep-01'] || 0);
    const wipExcessValue = Number(answers['mfg-wip-excess-deep-01'] || 0);
    const energyLeakage = Number(answers['mfg-energy-waste-deep-01'] || 0); // Monthly energy loss from idle machines
    
    // Annualized Impact
    const annualScrapRaw = scrapValueMonth * 12;
    const annualWIPCost = wipExcessValue * 0.15; // 15% holding cost for WIP
    const annualEnergyWaste = energyLeakage * 12;

    const totalStockImpact = Math.round(annualScrapRaw + annualWIPCost + annualEnergyWaste);

    // 3. Recovery Potential
    // Manufacturing Efficiency Factor: 0.30 (High impact from lean-six-sigma optimizations)
    // Baseline Revenue (Placeholder if not in answers): 50,000/week (Medium sized factory)
    const weeklyRecovery = (capacityDrainPct / 100) * 50000 * 0.30;
    const annualRecovery = Math.round(weeklyRecovery * 52);

    return {
      capacityDrainPct: Math.round(capacityDrainPct),
      totalStockImpact,
      annualRecovery,
      impactScore: Math.round((capacityDrainPct + Math.min(totalStockImpact / 50000, 100)) / 2),
    };
  }
}
