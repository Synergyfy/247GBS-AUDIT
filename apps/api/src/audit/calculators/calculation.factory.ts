import { BaseCalculator, CalculationResult } from './base.calculator';
import { HospitalityCalculator } from './hospitality.calculator';
import { RetailCalculator } from './retail.calculator';
import { ProfessionalServicesCalculator } from './professional-services.calculator';
import { ManufacturingCalculator } from './manufacturing.calculator';

class DefaultCalculator extends BaseCalculator {
  calculate(answers: Record<string, any>): CalculationResult {
    // Basic fallback logic
    const capacityDrainPct = 0;
    const totalStockImpact = 0;
    const annualRecovery = 0;
    return {
      capacityDrainPct,
      totalStockImpact,
      annualRecovery,
      impactScore: 0
    };
  }
}

export class CalculationFactory {
  private static calculators: Record<string, BaseCalculator> = {
    'hospitality-food': new HospitalityCalculator(),
    'retail-wholesale': new RetailCalculator(),
    'professional-services': new ProfessionalServicesCalculator(),
    'manufacturing': new ManufacturingCalculator(),
    // Add other sectors here: 'energy': new EnergyCalculator(), etc.
  };

  static getCalculator(sectorId: string): BaseCalculator {
    return this.calculators[sectorId] || new DefaultCalculator();
  }
}
