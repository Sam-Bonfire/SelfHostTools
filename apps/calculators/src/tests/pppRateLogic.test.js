import { describe, expect, it } from 'vitest';

import { calculatePPPRate } from '../lib/pppRateLogic';

describe('pppRateLogic', () => {
  const base = {
    foreignHourly: 50,
    hoursPerWeek: 30,
    billableWeeks: 48,
    exchangeRate: 83,
    pppFactor: 3.5,
    platformFeeRate: 10,
    homeTaxRate: 20,
    localMonthlySalary: 100000
  };

  it('should convert a foreign rate into local take-home', () => {
    const result = calculatePPPRate(base);
    // 50*30*48 = 72000 foreign gross; -10% fee = 64800; -20% tax = 51840
    expect(result.foreignAnnual).toBe(72000);
    expect(result.platformFee).toBe(7200);
    expect(result.homeTax).toBe(12960);
    expect(result.netForeign).toBe(51840);
    expect(result.netLocal).toBe(51840 * 83);
    expect(result.netLocalMonthly).toBe(Math.round((51840 * 83) / 12));
  });

  it('should show PPP-equivalent purchasing power', () => {
    const result = calculatePPPRate(base);
    expect(result.pppEquivalentAnnual).toBe(Math.round((51840 * 83) / 3.5));
    expect(result.effectiveForeignHourly).toBeCloseTo(36, 1); // 51840 / 1440h
  });

  it('should express the contract as a multiple of a local salary', () => {
    const result = calculatePPPRate(base);
    // netLocal 4,302,720 vs local annual 1,200,000 -> 3.59x
    expect(result.salaryMultiple).toBeCloseTo(3.59, 1);
  });

  it('should handle zero input safely', () => {
    const result = calculatePPPRate({});
    expect(result.netLocal).toBe(0);
    expect(result.salaryMultiple).toBe(0);
    expect(result.effectiveForeignHourly).toBe(0);
  });
});
