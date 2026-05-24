import { describe, it, expect } from 'vitest';
import { calculateCarOwnership } from '../lib/carOwnershipLogic';

describe('Car Ownership Logic', () => {
    it('calculates true cost of ownership correctly', () => {
        const result = calculateCarOwnership({
            carPrice: 1000000,
            downPayment: 200000,
            loanInterestRate: 10.0,
            loanTermYears: 5,
            ownershipYears: 5,
            annualDepreciationRate: 10,
            annualInsurance: 20000,
            annualMaintenance: 10000,
            monthlyFuel: 5000,
            averageRideshareCost: 500
        });

        // Principal = 800000
        // r = 0.10 / 12 = 0.008333
        // n = 60
        // EMI = 16997.6
        expect(result.financials.monthlyEMI).toBeCloseTo(16997.6, 1);
        
        // Depreciation = 1000000 - (1000000 * 0.9^5) = 1000000 - 590490 = 409510
        expect(result.financials.totalDepreciation).toBeCloseTo(409510, 0);

        // Insurance = 100000, Maint = 50000, Fuel = 300000 -> Ops = 450000
        expect(result.financials.totalOperationalCost).toBe(450000);

        // Interest = (16997.6 * 60) - 800000 = 219856
        expect(result.financials.totalInterest).toBeCloseTo(219858, 0);

        // TCO = 409510 + 219858 + 450000 = 1079368
        expect(result.summary.trueCostOfOwnership).toBeCloseTo(1079368, 0);

        // True Monthly Cost = 1079366 / 60 = 17989
        expect(result.financials.trueMonthlyCost).toBeCloseTo(17989, 0);

        // Rideshare trips per month = 17989 / 500 = 35.9 -> 35
        expect(result.comparisons.rideshareTripsPerMonth).toBe(35);
    });

    it('handles zero loan correctly', () => {
        const result = calculateCarOwnership({
            carPrice: 500000,
            downPayment: 500000, // Full cash payment
            loanInterestRate: 10.0,
            loanTermYears: 5,
            ownershipYears: 5,
            annualDepreciationRate: 15,
            annualInsurance: 10000,
            annualMaintenance: 5000,
            monthlyFuel: 2000,
            averageRideshareCost: 300
        });

        expect(result.financials.monthlyEMI).toBe(0);
        expect(result.financials.totalInterest).toBe(0);
    });
});
