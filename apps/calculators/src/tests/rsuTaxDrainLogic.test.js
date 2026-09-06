import { describe, expect, it } from 'vitest';

import { calculateRSUTaxDrain } from '../lib/rsuTaxDrainLogic';

describe('rsuTaxDrainLogic', () => {
  it('should tax the full RSU value at the combined marginal rate', () => {
    const result = calculateRSUTaxDrain({
      grantType: 'RSU',
      shareCount: 1000,
      sharePrice: 100,
      vestingYears: 4,
      federalRate: 32,
      stateRate: 5
    });

    expect(result.grossValue).toBe(100000);
    expect(result.totalTax).toBe(37000);
    expect(result.netValue).toBe(63000);
    expect(result.effectiveTaxRate).toBeCloseTo(0.37, 5);
  });

  it('should value options on spread only and floor underwater grants at zero', () => {
    const inMoney = calculateRSUTaxDrain({
      grantType: 'Option',
      shareCount: 1000,
      sharePrice: 100,
      strikePrice: 60,
      vestingYears: 4,
      federalRate: 30,
      stateRate: 0
    });
    expect(inMoney.grossValue).toBe(40000);
    expect(inMoney.totalTax).toBe(12000);

    const underwater = calculateRSUTaxDrain({
      grantType: 'Option',
      shareCount: 1000,
      sharePrice: 40,
      strikePrice: 60,
      vestingYears: 4,
      federalRate: 30,
      stateRate: 0
    });
    expect(underwater.grossValue).toBe(0);
    expect(underwater.netValue).toBe(0);
  });

  it('should build a linear vest schedule that sums to the totals', () => {
    const result = calculateRSUTaxDrain({
      grantType: 'RSU',
      shareCount: 1000,
      sharePrice: 100,
      vestingYears: 4,
      federalRate: 32,
      stateRate: 5
    });

    expect(result.schedule.length).toBe(4);
    const grossSum = result.schedule.reduce((s, t) => s + t.gross, 0);
    const netSum = result.schedule.reduce((s, t) => s + t.net, 0);
    expect(grossSum).toBe(result.grossValue);
    expect(netSum).toBe(result.netValue);
  });

  it('should compute sell-to-cover share counts', () => {
    const result = calculateRSUTaxDrain({
      grantType: 'RSU',
      shareCount: 1000,
      sharePrice: 100,
      vestingYears: 4,
      federalRate: 32,
      stateRate: 5
    });

    // 37000 tax / 100 price = 370 shares withheld
    expect(result.sharesWithheld).toBe(370);
    expect(result.sharesKept).toBe(630);
  });

  it('should handle zero input safely', () => {
    const result = calculateRSUTaxDrain({});
    expect(result.grossValue).toBe(0);
    expect(result.netValue).toBe(0);
    expect(result.schedule.length).toBe(4);
  });
});
