import { describe, expect, it } from 'vitest';

import { calculateLifestyleCreep } from '../lib/lifestyleCreepLogic';

describe('Lifestyle Creep Logic', () => {
  it('calculates scenarios correctly over 20 years', () => {
    const result = calculateLifestyleCreep({
      monthlyIncome: 100000,
      monthlySavings: 20000,
      annualRaisePercent: 10,
      roiPercent: 12,
      inflationPercent: 6,
      raiseInvestedPercent: 50,
      years: 20
    });

    expect(result.schedule.length).toBe(20);

    const firstYear = result.schedule[0];
    // Year 1: Base income, no raise yet.
    expect(firstYear.income).toBe(1200000);
    expect(firstYear.raiseAmount).toBe(0);
    expect(firstYear.savingsA).toBe(240000);
    expect(firstYear.savingsB).toBe(240000);
    expect(firstYear.savingsC).toBe(240000);

    const summary = result.summary;
    // Scenario A should have the highest balance
    expect(summary.finalBalanceA).toBeGreaterThan(summary.finalBalanceB);
    expect(summary.finalBalanceB).toBeGreaterThan(summary.finalBalanceC);

    // Real balances should be smaller than nominal
    expect(summary.finalRealBalanceA).toBeLessThan(summary.finalBalanceA);
  });

  it('handles 0% raise scenario', () => {
    const result = calculateLifestyleCreep({
      monthlyIncome: 50000,
      monthlySavings: 10000,
      annualRaisePercent: 0, // No raise
      roiPercent: 10,
      inflationPercent: 5,
      raiseInvestedPercent: 50,
      years: 10
    });

    const summary = result.summary;
    // If there's no raise, all scenarios should result in the exact same balance
    // because there is no "raise" to allocate differently.
    expect(summary.finalBalanceA).toBeCloseTo(summary.finalBalanceB, 2);
    expect(summary.finalBalanceB).toBeCloseTo(summary.finalBalanceC, 2);
  });
});
