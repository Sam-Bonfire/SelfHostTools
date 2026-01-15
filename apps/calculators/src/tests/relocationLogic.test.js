
import { describe, it, expect } from 'vitest';
import { calculateNetIncome, calculateRelocationImpact } from '../lib/relocationLogic';

describe('Job Relocation Realist Logic', () => {

    describe('calculateNetIncome', () => {
        it('should calculate net income for low bracket (< 5L)', () => {
            const net = calculateNetIncome(400000); // 4L
            expect(net).toBe(400000 / 12); // No tax
        });

        it('should calculate net income for mid bracket (5-10L)', () => {
            const net = calculateNetIncome(800000); // 8L
            // Tax: (800000 - 500000) * 0.10 = 30000
            // Net: 770000 / 12 = 64166.67
            expect(Math.round(net)).toBe(64167);
        });

        it('should calculate net income for high bracket (> 15L)', () => {
            const net = calculateNetIncome(2000000); // 20L
            // Tax: 500000*0.1 + 500000*0.2 + 500000*0.3 = 50k + 100k + 150k = 300k
            // Net: 1700000 / 12 = 141666.67
            expect(Math.round(net)).toBe(141667);
        });
    });

    describe('calculateRelocationImpact', () => {
        it('should show negative impact when moving from free rent to expensive city', () => {
            const result = calculateRelocationImpact({
                currentSalary: 600000, // 6L/year
                currentRent: 0, // Living with parents
                currentExpenses: 10000,
                isLivingWithFamily: true,
                newSalary: 1000000, // 10L/year (40% raise!)
                newRent: 25000,
                newExpenses: 15000,
                movingCost: 50000,
                setupCost: 75000, // Deposit + Brokerage
                relocationBonus: 0,
                commuteTimeDelta: 30 // 30 mins more per day
            });

            // Current: ~50k net - 0 rent - 7k expenses (30% family support) = ~43k surplus
            // New: ~75k net - 25k rent - 15k expenses = ~35k surplus
            // Delta should be negative
            expect(result.analysis.monthlyDelta).toBeLessThan(0);
            expect(result.analysis.isProfitable).toBe(false);
        });

        it('should show positive impact for genuine upgrade', () => {
            const result = calculateRelocationImpact({
                currentSalary: 800000, // 8L
                currentRent: 15000,
                currentExpenses: 12000,
                isLivingWithFamily: false,
                newSalary: 1800000, // 18L (125% raise)
                newRent: 30000,
                newExpenses: 20000,
                movingCost: 40000,
                setupCost: 60000,
                relocationBonus: 50000,
                commuteTimeDelta: 0
            });

            // Current: ~64k net - 15k - 12k = ~37k surplus
            // New: ~105k net - 30k - 20k = ~55k surplus
            // Delta: ~18k positive
            expect(result.analysis.monthlyDelta).toBeGreaterThan(15000);
            expect(result.analysis.isProfitable).toBe(true);
        });

        it('should calculate sunk cost recovery correctly', () => {
            const result = calculateRelocationImpact({
                currentSalary: 600000,
                currentRent: 10000,
                currentExpenses: 10000,
                isLivingWithFamily: false,
                newSalary: 1200000,
                newRent: 20000,
                newExpenses: 15000,
                movingCost: 30000,
                setupCost: 60000,
                relocationBonus: 0,
                commuteTimeDelta: 0
            });

            // Friction: 90k
            // Monthly Delta: should be positive
            // Recovery: 90k / delta
            expect(result.analysis.totalFriction).toBe(90000);
            expect(result.analysis.recoveryMonths).toBeGreaterThan(0);
        });

        it('should account for commute tax', () => {
            const result = calculateRelocationImpact({
                currentSalary: 1000000,
                currentRent: 20000,
                currentExpenses: 15000,
                isLivingWithFamily: false,
                newSalary: 1500000,
                newRent: 25000,
                newExpenses: 18000,
                movingCost: 0,
                setupCost: 0,
                relocationBonus: 0,
                commuteTimeDelta: 60 // 1 hour more per day
            });

            // Commute cost should be deducted from adjusted surplus
            expect(result.analysis.commuteCost).toBeGreaterThan(0);
            expect(result.new.adjustedSurplus).toBeLessThan(result.new.surplus);
        });
    });

});
