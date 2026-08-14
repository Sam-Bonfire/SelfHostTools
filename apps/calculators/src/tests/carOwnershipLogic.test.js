import { describe, expect, it } from 'vitest';

import { calculateCarOwnership } from '../lib/carOwnershipLogic';

describe('Car Ownership Logic', () => {
  it('calculates true cost of ownership correctly in simple mode', () => {
    const result = calculateCarOwnership({
      isAdvanced: false,
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

    expect(result.financials.monthlyEMI).toBeCloseTo(16997.6, 1);
    expect(result.financials.totalDepreciation).toBeCloseTo(409510, 0);

    // Ops = (20000 + 10000 + 60000) * 5 = 450000
    expect(result.financials.totalOperationalCost).toBe(450000);

    // Interest = (16997.6 * 60) - 800000 = 219856
    expect(result.financials.totalInterest).toBeCloseTo(219858, 0);

    // TCO = 409510 + 219858 + 450000 = 1079368
    expect(result.summary.trueCostOfOwnership).toBeCloseTo(1079368, 0);
  });

  it('calculates true cost of ownership correctly in advanced mode', () => {
    const result = calculateCarOwnership({
      isAdvanced: true,
      carPrice: 1000000,
      downPayment: 1000000, // zero loan
      loanInterestRate: 0,
      loanTermYears: 5,
      ownershipYears: 5,
      annualDepreciationRate: 10,
      annualInsurance: 20000,
      // Advanced Params
      usageKMs: 1000,
      usageType: 'monthly',
      fuelEfficiency: 15,
      fuelPrice: 100,
      annualServicing: 10000,
      tireReplacementFund: 5000,
      monthlyCleaning: 500,
      annualFines: 1500,
      monthlyTolls: 500,
      monthlyParking: 1000,
      annualRepairs: 5000
    });

    expect(result.financials.monthlyEMI).toBe(0);
    expect(result.financials.totalInterest).toBe(0);

    // annual fuel = (12000 / 15) * 100 = 80000 => monthly = 6666.67
    expect(result.financials.computedMonthlyFuel).toBeCloseTo(6666.67, 1);

    // annual maintenance = 10000(s) + 5000(t) + 1500(f) + 5000(r) + (500 + 500 + 1000)*12(cleaning, tolls, parking)
    // = 21500 + 24000 = 45500
    expect(result.financials.computedAnnualMaintenance).toBe(45500);

    // Ops = (20000 + 45500 + 80000) * 5 = 727500
    expect(result.financials.totalOperationalCost).toBe(727500);

    // Marginal monthly = 6666.67 + (45500/12) = 10458.33
    // KMs per month = 1000
    // Running Cost per KM = 10458.33 / 1000 = 10.458
    expect(result.financials.runningCostPerKm).toBeCloseTo(10.46, 2);
  });
});
