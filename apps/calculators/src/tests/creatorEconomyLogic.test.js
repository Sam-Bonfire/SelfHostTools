import { describe, expect, it } from 'vitest';

import { calculateCreatorEconomy } from '../lib/creatorEconomyLogic';

describe('creatorEconomyLogic', () => {
  it('calculates metrics correctly for default values', () => {
    const result = calculateCreatorEconomy({
      desiredIncome: 5000,
      audienceSize: 10000,
      reachRate: 30,
      clickThroughRate: 3,
      postsPerMonth: 4
    });

    expect(result.activeAudience).toBe(3000);
    expect(result.estimatedClicks).toBe(300);
    expect(result.revenueNeededPerPost).toBe(1250);

    expect(result.requiredCPM).toBeCloseTo(416.67, 1);
    expect(result.requiredCPC).toBeCloseTo(4.17, 1);

    expect(result.realityCheck.isRealistic).toBe(false);
    expect(result.realityCheck.gap).toBeGreaterThan(0);
  });

  it('calculates metrics correctly for highly realistic values', () => {
    const result = calculateCreatorEconomy({
      desiredIncome: 1000,
      audienceSize: 50000,
      reachRate: 20,
      clickThroughRate: 2,
      postsPerMonth: 2
    });

    expect(result.activeAudience).toBe(10000);
    expect(result.revenueNeededPerPost).toBe(500);

    expect(result.requiredCPM).toBe(50);
    expect(result.realityCheck.isRealistic).toBe(true);
    expect(result.realityCheck.gap).toBe(0);

    expect(result.tiers[0].cpm).toBe(25);
    expect(result.tiers[0].flatRate).toBe(250);
    expect(result.tiers[0].monthlyRevenue).toBe(500);
  });

  it('handles zero audience to avoid divide by zero', () => {
    const result = calculateCreatorEconomy({
      desiredIncome: 1000,
      audienceSize: 0,
      reachRate: 0,
      clickThroughRate: 0,
      postsPerMonth: 1
    });

    expect(result.activeAudience).toBe(0);
    expect(result.requiredCPM).toBe(1000000);
    expect(result.requiredCPC).toBe(1000);
    expect(result.realityCheck.isRealistic).toBe(false);
  });
});
