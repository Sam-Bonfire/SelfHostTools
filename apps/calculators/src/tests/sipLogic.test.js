import { describe, expect, it } from 'vitest';

import { calculateSIPReality } from '../lib/sipLogic';

describe('SIP Calculator Logic', () => {
  it('should calculate basic SIP returns correctly', () => {
    const result = calculateSIPReality({
      calcMode: 'investment',
      monthlyInvestment: 10000,
      targetCorpus: 0,
      expectedReturn: 12, // 1% per month
      timePeriod: 1, // 12 months
      isStepUp: false,
      stepUpPercentage: 0,
      useInflation: false,
      inflationRate: 0,
      useFees: false,
      expenseRatio: 0,
      useTax: false,
      assetMix: { equity: 0, debt: 0, gold: 0 },
      taxRates: { equity: 0, debt: 0, gold: 0 }
    });

    // 10k * 12 = 120k invested
    // Returns approx: Using FV of annuity due formula type logic inside loop
    // Approx 1.26L - 1.28L range

    expect(result.results.totalInvested).toBe(120000);
    expect(result.results.maturityValue).toBeGreaterThan(120000);
    expect(result.schedule.length).toBe(1); // 1 year
  });

  it('should calculate Goal Mode (Required SIP)', () => {
    const result = calculateSIPReality({
      calcMode: 'goal',
      monthlyInvestment: 0,
      targetCorpus: 130000, // Slightly more than 1 yr of 10k
      expectedReturn: 0, // 0% return for simplicity
      timePeriod: 1,
      isStepUp: false,
      stepUpPercentage: 0,
      useInflation: false,
      inflationRate: 0,
      useFees: false,
      expenseRatio: 0,
      useTax: false,
      assetMix: { equity: 0, debt: 0, gold: 0 },
      taxRates: { equity: 0, debt: 0, gold: 0 }
    });

    // To reach 130k in 1 year with 0% interest, we need 130k/12 = 10,833
    expect(result.results.requiredSIP).toBeCloseTo(10833, -1);
  });

  it('should handle Step-Up SIP', () => {
    const result = calculateSIPReality({
      calcMode: 'investment',
      monthlyInvestment: 10000,
      expectedReturn: 0,
      timePeriod: 2, // 2 years
      isStepUp: true,
      stepUpPercentage: 10
    });

    // Year 1: 10k * 12 = 120k
    // Year 2: 11k * 12 = 132k
    // Total: 252k
    expect(result.results.totalInvested).toBe(252000);
  });
});
