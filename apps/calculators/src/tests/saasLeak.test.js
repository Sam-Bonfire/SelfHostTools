import { describe, expect, it } from 'vitest';

import { calculateSaaSLeak } from '../lib/saasLeakLogic';

describe('SaaS Leak Calculator Logic', () => {
  it('should calculate basic individual SaaS leak correctly with 0% return', () => {
    const result = calculateSaaSLeak({
      calcMode: 'individual',
      monthlyInvestment: 50,
      expectedReturn: 0,
      hourlyWage: 50
    });

    expect(result.results.totalMonthlySpend).toBe(50);
    expect(result.results.annualSpend).toBe(600);
    expect(result.results.annualHoursRequired).toBe(12);
    expect(result.results.careerDaysRequired).toBe(1.5);

    // At 0% return, FV must equal principal
    expect(result.projections[10].principal).toBe(6000);
    expect(result.projections[10].futureValue).toBe(6000);
    expect(result.projections[10].compoundReturns).toBe(0);

    expect(result.projections[30].principal).toBe(18000);
    expect(result.projections[30].futureValue).toBe(18000);
  });

  it('should compound interest correctly over years with 12% expected return', () => {
    const result = calculateSaaSLeak({
      calcMode: 'individual',
      monthlyInvestment: 100,
      expectedReturn: 12, // 1% per month
      hourlyWage: 25
    });

    expect(result.results.totalMonthlySpend).toBe(100);
    expect(result.results.annualSpend).toBe(1200);
    expect(result.results.annualHoursRequired).toBe(48);
    expect(result.results.careerDaysRequired).toBe(6);

    // Principal for 10 years = 100 * 12 * 10 = 12000
    expect(result.projections[10].principal).toBe(12000);
    // FV should be significantly higher due to 12% compounding interest
    expect(result.projections[10].futureValue).toBeGreaterThan(12000);
    expect(result.projections[10].compoundReturns).toBeGreaterThan(0);

    // Year 1 schedule should match compound accumulation
    expect(result.schedule.length).toBe(30);
    expect(result.schedule[0].year).toBe(1);
    expect(result.schedule[0].principal).toBe(1200);
    expect(result.schedule[0].balance).toBeGreaterThan(1200);
  });

  it('should aggregate only active subscriptions in aggregate mode', () => {
    const result = calculateSaaSLeak({
      calcMode: 'aggregate',
      expectedReturn: 8,
      hourlyWage: 20,
      subscriptions: [
        { id: '1', name: 'Netflix', cost: 15, active: true },
        { id: '2', name: 'Spotify', cost: 10, active: true },
        { id: '3', name: 'Claude Pro', cost: 20, active: false } // Inactive
      ]
    });

    // 15 + 10 = 25
    expect(result.results.totalMonthlySpend).toBe(25);
    expect(result.results.annualSpend).toBe(300);
    expect(result.results.annualHoursRequired).toBe(15);
    expect(result.results.careerDaysRequired).toBe(1.88); // 15 / 8
  });

  it('should handle yearly billingPeriod by dividing by 12', () => {
    const result = calculateSaaSLeak({
      calcMode: 'aggregate',
      expectedReturn: 8,
      hourlyWage: 20,
      subscriptions: [
        { id: '1', name: 'AWS Yearly', cost: 120, active: true, billingPeriod: 'yearly' }, // 10/mo
        { id: '2', name: 'Spotify Monthly', cost: 10, active: true, billingPeriod: 'monthly' } // 10/mo
      ]
    });

    // 10 + 10 = 20
    expect(result.results.totalMonthlySpend).toBe(20);
    expect(result.results.annualSpend).toBe(240);
    expect(result.results.annualHoursRequired).toBe(12);
    expect(result.results.careerDaysRequired).toBe(1.5);
  });
});
