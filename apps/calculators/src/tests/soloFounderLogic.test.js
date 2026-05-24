import { describe, it, expect } from 'vitest';
import { calculateSoloFounderRunway } from '../lib/soloFounderLogic';

describe('Solo Founder Logic', () => {
    it('calculates standard profitability correctly', () => {
        const result = calculateSoloFounderRunway({
            mrr: 100000,
            averageRevenuePerUser: 1000, // 100 users
            churnRatePercent: 5, // 5k churned, 95k retained
            stripeFeePercent: 2.0, // 2% of 95k = 1900
            stripeFixedFee: 0, // Ignore fixed for simple math
            serverCosts: 5000,
            toolCosts: 5000, // Overhead = 10000
            taxRatePercent: 10,
            dayJobSalary: 50000,
            weeklyHoursDedicated: 10
        });

        // Retained = 95000
        // Stripe = 1900
        // Overhead = 10000
        // Gross Profit = 95000 - 1900 - 10000 = 83100
        // Tax = 8310
        // Net Profit = 74790

        expect(result.financials.grossProfit).toBe(83100);
        expect(result.financials.netProfit).toBe(74790);
        expect(result.milestones.isProfitable).toBe(true);
        expect(result.milestones.hasReachedFreedom).toBe(true); // 74790 > 50000
    });

    it('calculates break-even MRR correctly', () => {
        const result = calculateSoloFounderRunway({
            mrr: 0,
            averageRevenuePerUser: 1000,
            churnRatePercent: 0,
            stripeFeePercent: 5,
            stripeFixedFee: 0,
            serverCosts: 9500,
            toolCosts: 0,
            taxRatePercent: 0,
            dayJobSalary: 100000,
            weeklyHoursDedicated: 10
        });

        // Margin per user = 1 - 0.05 = 0.95
        // BreakEven = 9500 / 0.95 = 10000
        expect(result.milestones.breakEvenMRR).toBe(10000);
    });

    it('handles unprofitable unit economics (Infinity)', () => {
        const result = calculateSoloFounderRunway({
            mrr: 1000,
            averageRevenuePerUser: 100,
            churnRatePercent: 10,
            stripeFeePercent: 5,
            stripeFixedFee: 90, // 90 fixed fee on a 100 ARPU! Margin will be negative.
            serverCosts: 100,
            toolCosts: 0,
            taxRatePercent: 0,
            dayJobSalary: 100000,
            weeklyHoursDedicated: 10
        });

        // Margin = 1 - 0.10 - 0.05 - (90/100) = 1 - 0.15 - 0.90 = -0.05
        expect(result.milestones.breakEvenMRR).toBe(Infinity);
        expect(result.milestones.freedomMRR).toBe(Infinity);
    });
});
