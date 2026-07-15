import { describe, expect, it } from 'vitest';

import { calculateInflationDestroyer } from '../lib/inflationLogic';

describe('Inflation Destroyer - Purchasing Power Decay Logic', () => {
  it('calculates purchasing power correctly at 0% inflation (no erosion)', () => {
    const result = calculateInflationDestroyer({
      principal: 100000,
      inflationRate: 0,
      years: 10,
      investmentReturn: 10,
      investmentTaxRate: 10,
      selectedBasketId: 'groceries'
    });
    // At 0% inflation, purchasing power should equal the principal
    expect(result.results.finalPurchasingPower).toBe(100000);
    expect(result.results.erosionAmount).toBe(0);
    expect(result.results.erosionPercent).toBe(0);
  });

  it('calculates standard inflation erosion correctly (6% for 10 years)', () => {
    const result = calculateInflationDestroyer({
      principal: 100000,
      inflationRate: 6,
      years: 10,
      investmentReturn: 12,
      investmentTaxRate: 10,
      selectedBasketId: 'groceries'
    });
    // PP = 100000 / (1.06)^10 = 100000 / 1.79084... ≈ 55839
    expect(result.results.finalPurchasingPower).toBe(55839);
    expect(result.results.erosionAmount).toBe(44161);
    expect(result.results.erosionPercent).toBeCloseTo(44.16, 0);
  });

  it('calculates investment growth and real post-tax value correctly', () => {
    const result = calculateInflationDestroyer({
      principal: 100000,
      inflationRate: 6,
      years: 10,
      investmentReturn: 12,
      investmentTaxRate: 10,
      selectedBasketId: 'petrol'
    });
    // Gross Investment: 100000 * (1.12)^10 = 100000 * 3.10585 = 310585
    expect(result.results.grossInvestmentValue).toBe(310585);
    // Gains: 310585 - 100000 = 210585. Tax: 210585 * 0.10 = 21058. Net: 310585 - 21058 = 289527
    expect(result.results.netInvestmentValue).toBe(289526);
    // Real: 289527 / (1.06)^10 = 289527 / 1.79084 = 161671
    expect(result.results.realInvestmentValue).toBe(161670);
    expect(result.results.isBeatingInflation).toBe(true);
  });

  it('correctly translates erosion into basket units (groceries)', () => {
    const result = calculateInflationDestroyer({
      principal: 80000,
      inflationRate: 6,
      years: 10,
      investmentReturn: 12,
      investmentTaxRate: 10,
      selectedBasketId: 'groceries'
    });
    // Basket cost = 8000/month. Units today = 80000 / 8000 = 10
    expect(result.basket.unitsToday).toBe(10);
    // futureValue = 80000 / 1.79084 = 44671. Units future = 44671 / 8000 = 5.6
    expect(result.basket.unitsFuture).toBe(5.6);
    expect(result.basket.unitsLost).toBeCloseTo(4.4, 0);
  });

  it('schedule has correct number of years', () => {
    const result = calculateInflationDestroyer({
      principal: 50000,
      inflationRate: 8,
      years: 20,
      investmentReturn: 12,
      investmentTaxRate: 10,
      selectedBasketId: 'rent'
    });
    // Schedule should have years 0..20 = 21 entries
    expect(result.schedule.length).toBe(21);
    // Year 0 should have full purchasing power
    expect(result.schedule[0].cashPurchasingPower).toBe(50000);
  });
});
