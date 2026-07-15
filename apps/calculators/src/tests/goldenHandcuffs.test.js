import { describe, expect, it } from 'vitest';

import {
  analyzeAlerts,
  calculateAnnualizedComp,
  calculateCostOfLeaving,
  calculateGrantValue,
  generateProjections
} from '../lib/goldenHandcuffsLogic';

describe('Golden Handcuffs Logic', () => {
  const sampleRSU = { type: 'RSU', count: 1000, price: 100, vestingYears: 4 }; // $100k total
  const sampleOption = { type: 'Option', count: 5000, price: 20, strike: 10, vestingYears: 4 }; // $50k spread ($10 * 5000)

  describe('calculateGrantValue', () => {
    it('calculates RSU value correctly', () => {
      expect(calculateGrantValue(sampleRSU)).toBe(100000);
    });

    it('calculates Option intrinsic value correctly', () => {
      expect(calculateGrantValue(sampleOption)).toBe(50000);
    });

    it('returns 0 for underwater options', () => {
      const underwater = { ...sampleOption, price: 5 };
      expect(calculateGrantValue(underwater)).toBe(0);
    });
  });

  describe('calculateAnnualizedComp', () => {
    const job = {
      baseSalary: 150000,
      bonus: 20000,
      equity: [sampleRSU, sampleOption] // Total Equity: $150k over 4 years -> $37.5k/yr
    };

    it('calculates total annual compensation correctly', () => {
      const result = calculateAnnualizedComp(job);
      expect(result.totalEquityValue).toBe(150000);
      expect(result.equityAnnualized).toBe(37500);
      expect(result.totalAnnualComp).toBe(150000 + 20000 + 37500); // 207500
      expect(result.hardCash).toBe(170000);
    });

    it('handles no equity', () => {
      const simpleJob = { baseSalary: 100000 };
      const result = calculateAnnualizedComp(simpleJob);
      expect(result.totalAnnualComp).toBe(100000);
      expect(result.equityAnnualized).toBe(0);
    });
  });

  describe('calculateCostOfLeaving', () => {
    const job = { equity: [sampleRSU] }; // $100k forfeited
    const liabilities = { clawbackAmount: 10000 };

    it('summates clawback and forfeited equity', () => {
      const result = calculateCostOfLeaving(liabilities, job);
      expect(result.totalCost).toBe(110000);
      expect(result.forfeitedEquity).toBe(100000);
    });
  });

  describe('generateProjections', () => {
    const currentJob = {
      baseSalary: 100000,
      equity: [{ type: 'RSU', count: 400, price: 100, vestingYears: 4 }] // $10k/yr equity -> $110k TC
    };

    const newJob = {
      baseSalary: 130000, // $130k TC (No equity)
      equity: []
    };

    const liabilities = { clawbackAmount: 0 };

    it('determines break-even correctly', () => {
      // Yr 1: Stay=110k, Leave=130k. Leave is ahead immediately.
      const result = generateProjections(currentJob, newJob, liabilities, 4);
      expect(result.breakEvenYear).toBe(1);
    });

    it('handles clawback delay', () => {
      // Clawback is 50k.
      // Yr 1: Stay=110k.      Leave=130k - 50k = 80k. (Stay wins)
      // Yr 2: Stay=220k.      Leave=80k + 130k = 210k. (Stay wins)
      // Yr 3: Stay=330k.      Leave=210k + 130k = 340k. (Leave wins)
      const result = generateProjections(currentJob, newJob, { clawbackAmount: 50000 }, 4);
      expect(result.breakEvenYear).toBe(3);
    });
  });

  describe('analyzeAlerts', () => {
    it('detects upcoming vests', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 5);
      const job = {
        equity: [
          {
            type: 'RSU',
            nextVestDate: soon.toISOString().split('T')[0]
          }
        ]
      };
      const alerts = analyzeAlerts(job);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('vesting_soon');
    });

    it('ignores far future vests', () => {
      const far = new Date();
      far.setDate(far.getDate() + 100);
      const job = {
        equity: [
          {
            type: 'RSU',
            nextVestDate: far.toISOString().split('T')[0]
          }
        ]
      };
      const alerts = analyzeAlerts(job);
      expect(alerts).toHaveLength(0);
    });
  });
});
