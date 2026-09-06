import { describe, expect, it } from 'vitest';

import { calculateNetWorthBridge, extractBridgeInputs, generateBridgePaths } from '../lib/netWorthBridge';

describe('netWorthBridge', () => {
  it('should grow assets and shrink debt over the horizon', () => {
    const result = calculateNetWorthBridge({
      startingAssets: 100000,
      startingDebt: 500000,
      monthlyInvest: 20000,
      monthlyDebtPayment: 30000,
      assetReturn: 12,
      debtRate: 10,
      years: 10
    });

    expect(result.history.length).toBe(11);
    expect(result.history[0]).toEqual({ year: 0, assets: 100000, debt: 500000, netWorth: -400000 });
    expect(result.finalAssets).toBeGreaterThan(100000);
    expect(result.finalDebt).toBeLessThan(500000);
    expect(result.finalNetWorth).toBe(result.finalAssets - result.finalDebt);
  });

  it('should detect the debt-free and crossover years', () => {
    const result = calculateNetWorthBridge({
      startingAssets: 0,
      startingDebt: 100000,
      monthlyInvest: 10000,
      monthlyDebtPayment: 20000,
      assetReturn: 0,
      debtRate: 0,
      years: 10
    });

    // 100k debt at 20k/mo -> cleared during year 1
    expect(result.debtFreeYear).toBe(1);
    // Net worth turns positive once assets outrun remaining debt
    expect(result.crossoverYear).toBe(1);
  });

  it('should report nulls when debt never clears', () => {
    const result = calculateNetWorthBridge({
      startingAssets: 0,
      startingDebt: 1000000,
      monthlyInvest: 0,
      monthlyDebtPayment: 100,
      assetReturn: 0,
      debtRate: 12,
      years: 5
    });

    expect(result.debtFreeYear).toBe(null);
    expect(result.crossoverYear).toBe(null);
  });
});

describe('extractBridgeInputs', () => {
  const storage = (map) => ({ getItem: (k) => map[k] || null });

  it('should pull live numbers from calculator namespaces', () => {
    const store = storage({
      sh_SIPCalculator_master: JSON.stringify({
        activeProfile: 'Default',
        data: { Default: { monthlyInvestment: 15000, expectedReturn: 12 } }
      }),
      sh_FIRECalculator_master: JSON.stringify({
        activeProfile: 'Default',
        data: { Default: { currentSavings: 2000000, monthlyInvestment: 50000 } }
      })
    });

    const result = extractBridgeInputs(store);
    expect(result.monthlyInvest).toBe(15000); // SIP wins over FIRE
    expect(result.startingAssets).toBe(2000000);
    expect(result.assetReturn).toBe(12);
  });

  it('should fall back to FIRE when SIP is absent and nulls when empty', () => {
    const fireOnly = storage({
      sh_FIRECalculator_master: JSON.stringify({
        activeProfile: 'Default',
        data: { Default: { monthlyInvestment: 25000 } }
      })
    });
    expect(extractBridgeInputs(fireOnly).monthlyInvest).toBe(25000);

    expect(extractBridgeInputs(storage({}))).toEqual({
      monthlyInvest: null,
      startingAssets: null,
      assetReturn: null
    });
  });

  it('should survive corrupt storage', () => {
    const bad = storage({ sh_SIPCalculator_master: '{not json' });
    expect(extractBridgeInputs(bad).monthlyInvest).toBe(null);
  });
});

describe('generateBridgePaths', () => {
  it('should build SVG paths for both series', () => {
    const { history } = calculateNetWorthBridge({
      startingAssets: 50000,
      startingDebt: 200000,
      monthlyInvest: 10000,
      monthlyDebtPayment: 15000,
      years: 5
    });
    const { assetsPath, debtPath, points } = generateBridgePaths(history, 600, 300);
    expect(assetsPath.startsWith('M')).toBe(true);
    expect(debtPath.startsWith('M')).toBe(true);
    expect(points.length).toBe(6);
  });
});
