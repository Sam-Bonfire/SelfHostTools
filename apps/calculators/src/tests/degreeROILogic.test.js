import { describe, it, expect } from 'vitest';
import { calculateDegreeROI } from '../lib/degreeROILogic';

describe('calculateDegreeROI', () => {
    it('should calculate break-even for a standard high-ROI degree', () => {
        const result = calculateDegreeROI({
            tuitionPerYear: 20000,
            livingExpensesPerYear: 10000,
            durationYears: 4,
            costInflation: 0, // Simplify
            grantsTotal: 0,
            loanInterestRate: 5,
            loanTermYears: 10,
            startingSalaryDegree: 60000, // High starting
            salaryGrowthDegree: 5,
            startingSalaryAlt: 30000, // Low Alternative
            salaryGrowthAlt: 3,
            taxRate: 20,
            investmentReturn: 0, // Simplify
            generalInflation: 0
        });

        // Expect degree debt to exist
        expect(result.results.totalDebtAtGrad).toBeGreaterThan(0);
        // (20k + 10k) * 4 approx 120k plus interest -> around 130k?.

        // Expect break even to exist (Degree 60k is much better than 30k)
        expect(result.results.breakEvenYear).toBeDefined();
        expect(result.results.finalDegreeNW).toBeGreaterThan(result.results.finalAltNW);
    });

    it('should show no break-even for a bad degree', () => {
        const result = calculateDegreeROI({
            tuitionPerYear: 50000, // Expensive
            livingExpensesPerYear: 15000,
            durationYears: 4,
            costInflation: 0,
            grantsTotal: 0,
            loanInterestRate: 7,
            loanTermYears: 10,
            startingSalaryDegree: 35000, // Low starting
            salaryGrowthDegree: 3,
            startingSalaryAlt: 30000, // Similar Alt
            salaryGrowthAlt: 3,
            taxRate: 20,
            investmentReturn: 5,
            generalInflation: 2
        });

        // Degree debt huge (~260k+), Income similar. Should never catch up in 20 years.
        // unless growth rate is massively different (implied same here).

        // Note: With 5% investment return, the Alt path saves 30k/yr * 4 years early on, growing fast.
        // Degree path starts with -260k debt.
        expect(result.results.breakEvenYear).toBeNull();
        expect(result.results.finalAltNW).toBeGreaterThan(result.results.finalDegreeNW);
    });

    it('should calculate slave ratio correctly', () => {
        const result = calculateDegreeROI({
            tuitionPerYear: 10000,
            livingExpensesPerYear: 0,
            durationYears: 4,
            startingSalaryDegree: 60000,
            loanInterestRate: 0, // Simplify PMT
            loanTermYears: 10,
            grantsTotal: 0,
            startingSalaryAlt: 20000,
            generalInflation: 0 // Prevent salary inflation for clean math
        });

        // Debt = 40,000. 10 years. PMT = 4000/yr.
        // Monthly PMT = 333.33
        // Net Income = 60k * 0.8 = 48k. Monthly = 4000.
        // Ratio = 333 / 4000 = 8.33%

        expect(result.results.slaveRatio).toBeGreaterThan(8);
        expect(result.results.slaveRatio).toBeLessThan(9);
    });
});
