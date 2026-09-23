export interface CalculationResult {
  capacityDrainPct: number;
  totalStockImpact: number;
  annualRecovery: number;
  impactScore: number;
}

export abstract class BaseCalculator {
  abstract calculate(answers: Record<string, any>): CalculationResult;

  protected calculateWeightedScore(
    answers: Record<string, any>,
    questions: { id: string; weight: number; max: number }[]
  ): number {
    let total = 0;
    let maxTotal = 0;

    questions.forEach((q) => {
      const val = answers[q.id] || 0;
      total += val * q.weight;
      maxTotal += q.max * q.weight;
    });

    return maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  }
}
