import { describe, expect, it } from 'vitest';

import { calculateAmortization, generateAmortizationBars } from '../lib/amortizationArt';

describe('amortizationArt', () => {
  const base = { principal: 1000000, annualRate: 9, tenureYears: 20, extraMonthly: 0 };

  it('should compute EMI with the standard formula', () => {
    const result = calculateAmortization(base);
    // 1M @ 9% for 240 months -> ~8995
    expect(result.emi).toBeCloseTo(8995, -1);
    expect(result.monthsPaid).toBe(240);
    expect(result.schedule.length).toBe(20);
  });

  it('should keep principal + interest consistent with totals', () => {
    const result = calculateAmortization(base);
    const pSum = result.schedule.reduce((s, y) => s + y.principal, 0);
    const iSum = result.schedule.reduce((s, y) => s + y.interest, 0);
    expect(pSum).toBe(result.totalPrincipal);
    expect(iSum).toBe(result.totalInterest);
    expect(result.totalPrincipal).toBeGreaterThanOrEqual(999999);
    expect(result.schedule[19].balance).toBe(0);
  });

  it('should front-load interest: year 1 mostly interest', () => {
    const result = calculateAmortization(base);
    expect(result.schedule[0].interest).toBeGreaterThan(result.schedule[0].principal);
    const last = result.schedule[result.schedule.length - 1];
    expect(last.principal).toBeGreaterThan(last.interest);
  });

  it('should quantify extra-payment savings', () => {
    const plain = calculateAmortization(base);
    const extra = calculateAmortization({ ...base, extraMonthly: 5000 });
    expect(extra.monthsPaid).toBeLessThan(plain.monthsPaid);
    expect(extra.monthsSaved).toBe(plain.monthsPaid - extra.monthsPaid);
    expect(extra.interestSaved).toBeGreaterThan(0);
    expect(extra.interestSaved).toBe(plain.totalInterest - extra.totalInterest);
  });

  it('should handle zero interest as pure principal split', () => {
    const result = calculateAmortization({ principal: 120000, annualRate: 0, tenureYears: 1, extraMonthly: 0 });
    expect(result.emi).toBe(10000);
    expect(result.totalInterest).toBe(0);
    expect(result.schedule.length).toBe(1);
  });

  it('should build stacked-bar geometry', () => {
    const { schedule } = calculateAmortization({ ...base, tenureYears: 5 });
    const { bars, maxTotal } = generateAmortizationBars(schedule, 600, 300);
    expect(bars.length).toBe(5);
    expect(maxTotal).toBeGreaterThan(0);
    for (const b of bars) {
      expect(b.principalH + b.interestH).toBeCloseTo(b.totalH, 5);
    }
  });
});
