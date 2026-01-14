import { describe, it, expect } from 'vitest';
import { calculateBuyVsRent } from '../lib/homeLoanRentLogic';

describe('Buy vs Rent Calculator Logic', () => {

    it('should calculate straightforward buy scenario', () => {
        const result = calculateBuyVsRent({
            propertyValue: 5000000,
            downPayment: 1000000, // 20%
            interestRate: 8.5,
            loanTenure: 1, // 1 year for simple check
            propertyAppreciation: 0,
            maintenanceCost: 0,
            monthlyRent: 0,
            rentInflation: 0,
            investDifference: false,
            equityReturn: 0,
            taxBenefit: false
        });

        // Loan: 40L. Rate 8.5%. 12 months.
        // EMI roughly: 40L * 8.5%/12 / (1-(1+r)^-12)
        // PMT(0.085/12, 12, -4000000) approx 348,873

        expect(result.monthlyEMI).toBeGreaterThan(348000);
        expect(result.monthlyEMI).toBeLessThan(349000);
        expect(result.buyNetWealth).toBe(5000000); // 1 year later, loan paid off. Value same (0 appreciation).
    });

    it('should calculate rent scenario (investing down payment)', () => {
        const result = calculateBuyVsRent({
            propertyValue: 5000000,
            downPayment: 1000000,
            interestRate: 10,
            loanTenure: 1,
            propertyAppreciation: 0, // Buying yields 50L net wealth
            maintenanceCost: 0,
            monthlyRent: 10000,
            rentInflation: 0,
            investDifference: false, // Don't invest EMI difference, just DP
            equityReturn: 12, // 1% pm
            taxBenefit: false
        });

        // Rent Logic:
        // Investments start at 1M (DP).
        // Grow 1% pm for 12 months.
        // 1M * (1.01)^12 approx 1.1268M

        expect(result.rentNetWealth).toBeGreaterThan(1120000);
    });

    it('should handle investment of difference (EMI vs Rent)', () => {
        const result = calculateBuyVsRent({
            propertyValue: 1000000, // Small loan
            downPayment: 0,
            interestRate: 0, // No interest, simple EMI
            loanTenure: 1, // 12 months. EMI = 1M/12 = 83333
            propertyAppreciation: 0,
            maintenanceCost: 0,
            monthlyRent: 33333, // Diff = 50000
            rentInflation: 0,
            investDifference: true,
            equityReturn: 0, // No growth
            taxBenefit: false
        });

        // Diff = 50k. Invested 12 times. Total 600k.
        // DP = 0.
        // Rent Wealth = 600k.

        // Invest balance adds difference each month. 
        // 1: 50k
        // 2: 100k
        // ...
        // 12: 600k

        expect(result.rentNetWealth).toBeCloseTo(600000, -2);
    });

    it('should determine winner correctly', () => {
        const result = calculateBuyVsRent({
            propertyValue: 10000000,
            downPayment: 2000000,
            interestRate: 8,
            loanTenure: 10,
            propertyAppreciation: 10, // High appreciation -> Buy wins
            maintenanceCost: 1,
            monthlyRent: 20000,
            rentInflation: 5,
            investDifference: true,
            equityReturn: 10, // Similar equity return
            taxBenefit: false
        });

        expect(result.winner).toBe('Buy');
    });

});
