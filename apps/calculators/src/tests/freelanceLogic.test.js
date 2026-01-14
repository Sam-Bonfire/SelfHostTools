import { describe, it, expect } from 'vitest';
import { calculateFreelanceIncome, calculateAdminTime } from '../lib/freelanceLogic';

describe('Freelance Income Calculator Logic', () => {

    it('should calculate basic net income correctly (Standard Tax)', () => {
        const result = calculateFreelanceIncome({
            hourlyRate: 1000,
            billableHours: 100, // 100k gross
            vacationWeeks: 0, // No vacation for simple math
            adminTimePercent: 0,
            taxRate: 20,
            isPresumptiveTax: false,
            monthlyExpenses: 10000, // 10k exp
            targetMonthlyIncome: 0,
            projectHours: 0,
            projectBuffer: 0,
            projectDirectCosts: 0
        });

        // Annual Gross: 1000 * 100 * 12 = 1,200,000
        // Annual Exp: 10,000 * 12 = 120,000
        // Taxable: 1,080,000
        // Tax: 20% of 1.08M = 216,000
        // Net: 1.2M - 120k - 216k = 864,000
        // Monthly Net: 72,000

        expect(result.grossMonthly).toBe(100000); // 1.2M / 12
        expect(result.netTakeHome).toBe(72000);
        expect(result.totalExpenses).toBe(10000);
        expect(result.effectiveTaxAmount).toBe(18000); // 216k / 12
    });

    it('should calculate net income with 44ADA Presumptive Tax', () => {
        const result = calculateFreelanceIncome({
            hourlyRate: 1000,
            billableHours: 100,
            vacationWeeks: 0,
            adminTimePercent: 0,
            taxRate: 20,
            isPresumptiveTax: true, // Enabled
            monthlyExpenses: 10000,
            targetMonthlyIncome: 0,
            projectHours: 0,
            projectBuffer: 0,
            projectDirectCosts: 0
        });

        // Annual Gross: 1.2M
        // Taxable (50%): 600,000
        // Tax (20%): 120,000
        // Net: 1.2M - 120k (Exp) - 120k (Tax) = 960,000
        // Monthly Net: 80,000

        expect(result.netTakeHome).toBe(80000);
        expect(result.effectiveTaxAmount).toBe(10000); // 120k / 12
    });

    it('should account for vacation weeks reducing effective income', () => {
        const result = calculateFreelanceIncome({
            hourlyRate: 1000,
            billableHours: 100,
            vacationWeeks: 4.33, // 1 month off
            adminTimePercent: 0,
            taxRate: 0, // Simplify
            isPresumptiveTax: false,
            monthlyExpenses: 0,
            targetMonthlyIncome: 0,
            projectHours: 0,
            projectBuffer: 0,
            projectDirectCosts: 0
        });

        // Effective Months: 12 - 1 = 11
        // Annual Gross: 1000 * 100 * 11 = 1,100,000
        // Monthly Gross Avg: 1.1M / 12 = 91,667

        expect(result.grossMonthly).toBe(91667);
    });

    it('should correctly sum admin time from breakdown', () => {
        const breakdown = {
            email: { hours: 1, period: 'day' }, // 20 hrs/mo
            sales: { hours: 5, period: 'week' }, // 21.65 hrs/mo
            finance: { hours: 4, period: 'month' }, // 4 hrs/mo
            learning: { hours: 0, period: 'week' },
            misc: { hours: 0, period: 'week' }
        };
        // Total Admin: 20 + 21.65 + 4 = 45.65
        // Billable: 100
        // Total Work: 145.65
        // % = 45.65 / 145.65 = 31.3%

        const percent = calculateAdminTime(breakdown, 100);
        expect(percent).toBe(31);
    });

});
