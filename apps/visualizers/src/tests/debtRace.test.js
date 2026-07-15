import { describe, expect, it } from 'vitest';

import { calculateDebtRace } from '../lib/debtRaceLogic';

describe('Debt Repayment Race Mathematical Schedules', () => {
  const testDebts = [
    { id: '1', name: 'Credit Card A', balance: 5000, interestRate: 24, minPayment: 150 },
    { id: '2', name: 'Student Loan B', balance: 20000, interestRate: 8, minPayment: 250 },
    { id: '3', name: 'Car Loan C', balance: 10000, interestRate: 12, minPayment: 200 }
  ];

  it('should successfully calculate repayment schedule under sufficient budget', () => {
    const result = calculateDebtRace(testDebts, 1500); // 1500 is well above 150+250+200 = 600 min
    expect(result.error).toBe(false);
    expect(result.minPaymentsSum).toBe(600);

    expect(result.snowball.months).toBeGreaterThan(0);
    expect(result.avalanche.months).toBeGreaterThan(0);

    // Avalanche should mathematically have less or equal interest paid than Snowball
    expect(result.avalanche.totalInterestPaid).toBeLessThanOrEqual(result.snowball.totalInterestPaid);
  });

  it('should correctly fail if monthly budget is less than sum of minimum payments', () => {
    const result = calculateDebtRace(testDebts, 500); // minimums sum is 600
    expect(result.error).toBe(true);
    expect(result.minPaymentsSum).toBe(600);
  });

  it('should completely clear all balances to zero at the end of schedule history', () => {
    const result = calculateDebtRace(testDebts, 2000);

    const finalSnowballBalance = result.snowball.history[result.snowball.history.length - 1].totalRemaining;
    const finalAvalancheBalance = result.avalanche.history[result.avalanche.history.length - 1].totalRemaining;

    expect(finalSnowballBalance).toBe(0);
    expect(finalAvalancheBalance).toBe(0);
  });
});
