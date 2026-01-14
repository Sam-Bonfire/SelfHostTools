import { describe, it, expect } from 'vitest';
import { calculateLifeInsurance } from '../lib/lifeInsuranceLogic';

describe('Life Insurance Calculator Logic', () => {

    it('should calculate basic HLV correctly', () => {
        const result = calculateLifeInsurance({
            monthlyExpense: 50000,
            yearsToReplace: 10,
            inflationRate: 0,
            investmentReturn: 0, // 0% growth/inflation
            personalShare: 0,
            liabilities: 0,
            futureGoals: [],
            existingAssets: 0,
            currentInsurance: 0
        });

        // 50k * 12 * 10 = 60 Lakhs
        expect(result.expenseCover).toBe(6000000);
        expect(result.totalRequired).toBe(6000000);
        expect(result.gap).toBe(6000000);
        expect(result.isAdequate).toBe(false);
    });

    it('should account for personal share deduction', () => {
        const result = calculateLifeInsurance({
            monthlyExpense: 10000,
            yearsToReplace: 1,
            inflationRate: 0,
            investmentReturn: 0,
            personalShare: 50, // 50% personal
            liabilities: 0,
            futureGoals: [],
            existingAssets: 0,
            currentInsurance: 0
        });

        // Family Need = 10k - 50% = 5k.
        // Annual = 60k
        expect(result.familyMonthlyNeed).toBe(5000);
        expect(result.expenseCover).toBe(60000);
    });

    it('should calculate goal cover (PV)', () => {
        const result = calculateLifeInsurance({
            monthlyExpense: 0,
            yearsToReplace: 0,
            inflationRate: 0,
            investmentReturn: 0,
            personalShare: 0,
            liabilities: 0,
            futureGoals: [{ amount: 100000, yearsAway: 10 }],
            existingAssets: 0,
            currentInsurance: 0
        });

        // PV of 100k goal in 10 yrs with 0% inf/return is 100k
        expect(result.goalCover).toBe(100000);
    });

    it('should calculate gap with existing assets and insurance', () => {
        const result = calculateLifeInsurance({
            monthlyExpense: 0,
            yearsToReplace: 0,
            inflationRate: 0,
            investmentReturn: 0,
            personalShare: 0,
            liabilities: 500000,
            futureGoals: [],
            existingAssets: 100000,
            currentInsurance: 200000
        });

        // Required: 500k
        // Net Required: 500k - 100k (assets) = 400k
        // Gap: 400k - 200k (insurance) = 200k

        expect(result.totalRequired).toBe(400000);
        expect(result.gap).toBe(200000);
    });

});
