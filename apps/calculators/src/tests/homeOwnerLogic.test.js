import { describe, expect, it } from 'vitest';

import {
  calculateHomeOwnerRealism,
  calculateMortgage,
  calculateSinkingFund,
  generateTimelineEvents
} from '../lib/homeOwnerLogic';

describe('Home Owner Realist Logic', () => {
  describe('calculateMortgage', () => {
    it('should calculate standard mortgage correctly', () => {
      // $100,000 at 5% for 30 years
      const payment = calculateMortgage(100000, 5, 30);
      expect(Math.round(payment)).toBe(537);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateMortgage(0, 5, 30)).toBe(0);
    });
  });

  describe('calculateSinkingFund', () => {
    it('should calculate monthly saving for future repairs', () => {
      const items = [{ name: 'Roof', replacementCost: 12000, lifespanYears: 20, currentAgeYears: 15 }];
      // Remaining: 5 years (60 months)
      // Monthly: 12000 / 60 = 200

      const result = calculateSinkingFund(items, 0);
      expect(Math.round(result.totalMonthlySinkingFund)).toBe(200);
      expect(result.itemDetails[0].remainingYears).toBe(5);
    });

    it('should calculate monthly saving with inflation', () => {
      const items = [{ name: 'Roof', replacementCost: 10000, lifespanYears: 10, currentAgeYears: 0 }];
      // Remaining: 10 years (120 months)
      // Inflation: 10% (for easy math)
      // Inflated Cost: 10000 * (1.1)^10 ≈ 25937.42
      // Monthly: 25937.42 / 120 ≈ 216.14

      const result = calculateSinkingFund(items, 10);
      expect(Math.round(result.totalMonthlySinkingFund)).toBe(216);
    });

    it('should handle expired items as immediate liability, not monthly cost', () => {
      const items = [{ name: 'Dead HVAC', replacementCost: 8000, lifespanYears: 15, currentAgeYears: 20 }];
      // Remaining: 0 (actually -5)
      // Monthly Cost: 0 (It's too late to save)
      // Immediate Liability: 8000

      const result = calculateSinkingFund(items, 0);
      expect(result.totalMonthlySinkingFund).toBe(0);
      expect(result.immediateLiability).toBe(8000);
    });
  });

  describe('calculateHomeOwnerRealism', () => {
    it('should integrate all costs into True Monthly Cost', () => {
      const inputs = {
        propertyPrice: 400000,
        downPayment: 80000, // 20%
        interestRate: 6,
        loanTermYears: 30,
        auditItems: [
          { name: 'Roof', replacementCost: 12000, lifespanYears: 20, currentAgeYears: 15 } // $200/mo
        ],
        appreciationRate: 3,
        opportunityCostRate: 6, // 6% on 80k = 4800/yr = 400/mo
        maintenanceInflation: 0
      };

      // Loan: 320,000
      // Mortgage (est): ~1918.56

      const result = calculateHomeOwnerRealism(inputs);

      expect(result.financials.loanAmount).toBe(320000);
      expect(result.financials.monthlyOpportunityCost).toBe(400);
      expect(result.financials.totalMonthlySinkingFund).toBe(200);

      // 1919 (Mortgage) + 400 (Opp) + 200 (Sinking) = ~2519
      expect(result.financials.trueMonthlyCost).toBeGreaterThan(2510);
      expect(result.financials.trueMonthlyCost).toBeLessThan(2530);
    });
  });

  describe('generateTimelineEvents', () => {
    it('should predict future failures', () => {
      const items = [{ name: 'Heater', replacementCost: 5000, lifespanYears: 10, currentAgeYears: 8 }];
      // Remaining: 2 years.
      // Fails at Year 2.
      // Next failure at Year 12 (2 + 10).

      const itemDetails = calculateSinkingFund(items, 0).itemDetails;
      const events = generateTimelineEvents(itemDetails, 15);

      expect(events).toHaveLength(2);
      expect(events[0].year).toBe(2);
      expect(events[1].year).toBe(12);
    });

    it('should handle immediate failures', () => {
      const items = [{ name: 'Dead Thing', replacementCost: 1000, lifespanYears: 5, currentAgeYears: 10 }];
      // Immediate fail at Year 0.
      // Next fail at Year 5.
      // Next fail at Year 10.
      // Next fail at Year 15.

      const itemDetails = calculateSinkingFund(items, 0).itemDetails;
      const events = generateTimelineEvents(itemDetails, 15);

      expect(events[0].year).toBe(0);
      expect(events[0].type).toBe('immediate');
      expect(events[1].year).toBe(5);
    });
  });
});
