import { describe, expect, it } from 'vitest';

import { calculateAlternateROI } from '../lib/alternateInvestmentLogic';

describe('calculateAlternateROI', () => {
  it('should calculate basic nominal growth correctly (Passive, No Tax/Inflation)', () => {
    const result = calculateAlternateROI({
      initialInvestment: 100000,
      monthlyContribution: 0,
      years: 1,
      estReturnRate: 10,
      inflationRate: 0,
      taxRate: 0,
      activeHoursPerWeek: 0,
      userHourlyRate: 0
    });

    // 100k + 10% = 110k approx (compounding monthly slightly higher)
    expect(result.nominalValue).toBeGreaterThan(110000);
    expect(result.nominalValue).toBeLessThan(111000);
    expect(result.totalTimeCost).toBe(0);
  });

  it('should deduct time cost correctly', () => {
    const result = calculateAlternateROI({
      initialInvestment: 100000,
      monthlyContribution: 0,
      years: 1,
      estReturnRate: 0, // No growth
      inflationRate: 0,
      taxRate: 0,
      activeHoursPerWeek: 10,
      userHourlyRate: 100
    });

    // 10 hours * 4.33 weeks/mo * 12 months * 100 = 51960
    const expectedCost = 10 * 4.33 * 12 * 100;
    expect(result.totalTimeCost).toBeCloseTo(expectedCost, 1);
    expect(result.netRealProfitAfterTime).toBeCloseTo(-expectedCost, 1); // Loss because no profit but time spent
    expect(result.roi.truePassive).toBeLessThan(0);
  });

  it('should adjust for tax', () => {
    const result = calculateAlternateROI({
      initialInvestment: 100000,
      monthlyContribution: 0,
      years: 1,
      estReturnRate: 50, // Huge gain to see tax
      inflationRate: 0,
      taxRate: 20
    });

    const grossProfit = result.grossProfit;
    const tax = result.taxAmount;
    expect(tax).toBeCloseTo(grossProfit * 0.2, 0);
  });

  it('should adjust for inflation', () => {
    const result = calculateAlternateROI({
      initialInvestment: 100000,
      monthlyContribution: 0,
      years: 10,
      estReturnRate: 10,
      inflationRate: 10, // Returns match inflation
      taxRate: 0
    });

    // Nominal 10 Years @ 10% monthly compounding: 100k * (1.00833)^120 = ~270,704
    // Inflation 10 Years @ 10% annual: 1.1^10 = 2.5937
    // Real Value ~ 270,704 / 2.5937 = ~104,369
    expect(result.realValue).toBeGreaterThan(104000);
    expect(result.realValue).toBeLessThan(105000);
    expect(result.roi.real).toBeGreaterThan(0);
  });
});
