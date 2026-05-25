import { describe, it, expect } from 'vitest';
import { calculateEmergencyFund } from '../lib/emergencyFundLogic.js';

describe('calculateEmergencyFund', () => {
  it('calculates 6 month duration correctly', () => {
    const result = calculateEmergencyFund({
      coreExpenses: 3000,
      discretionaryExpenses: 1000,
      discretionaryRetention: 50,
      expenseVolatility: 500,
      jobSearchDuration: 6,
      healthDeductible: 2000,
      propertyDeductible: 1000
    });

    expect(result.monthlyBurnRate).toBe(4000);
    expect(result.incomeShockBuffer).toBe(24000);
    expect(result.lumpSumBuffer).toBe(3000);
    expect(result.totalFund).toBe(27000);

    expect(result.tiers.tier1Cash).toBe(4000);
    expect(result.tiers.tier2Bank).toBe(11000);
    expect(result.tiers.tier3Investments).toBe(12000);
  });
});
