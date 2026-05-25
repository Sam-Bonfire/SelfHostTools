import { describe, it, expect } from 'vitest';
import { calculateTaxBracketOptimization } from '../lib/taxBracketLogic';

describe('taxBracketLogic', () => {
  it('should calculate standard deduction correctly for single', () => {
    const result = calculateTaxBracketOptimization({
      grossIncome: 50000,
      filingStatus: 'single',
      stateLocalTaxes: 0,
      mortgageInterest: 0,
      charitableContributions: 0,
      medicalExpenses: 0,
      otherItemized: 0
    });
    
    expect(result.grossIncome).toBe(50000);
    expect(result.bestStrategy).toBe('standard');
    expect(result.appliedDeduction).toBe(14600);
    expect(result.recommendedTaxable).toBe(35400);
    // Tax on 35400 for single (2024):
    // 10% on 11600 = 1160
    // 12% on (35400 - 11600) = 2856
    // Total = 4016
    expect(result.recommendedTax).toBe(4016);
  });

  it('should recommend itemized when itemized is higher than standard', () => {
    const result = calculateTaxBracketOptimization({
      grossIncome: 100000,
      filingStatus: 'single',
      stateLocalTaxes: 12000, // Capped at 10000
      mortgageInterest: 6000,
      charitableContributions: 2000,
      medicalExpenses: 0,
      otherItemized: 0
    });

    expect(result.itemizedDetails.allowedSALT).toBe(10000);
    expect(result.itemizedDetails.totalItemized).toBe(18000); // 10k + 6k + 2k
    expect(result.bestStrategy).toBe('itemized');
    expect(result.appliedDeduction).toBe(18000);
    
    // Taxable = 100000 - 18000 = 82000
    // Standard was 14600. Taxable standard = 85400
    expect(result.taxSavings > 0).toBe(true);
  });

  it('should correctly apply the 7.5% medical floor', () => {
    const result = calculateTaxBracketOptimization({
      grossIncome: 100000, // floor is 7500
      filingStatus: 'single',
      medicalExpenses: 10000,
      stateLocalTaxes: 0,
      mortgageInterest: 0,
      charitableContributions: 0,
      otherItemized: 0
    });

    expect(result.itemizedDetails.medicalFloor).toBe(7500);
    expect(result.itemizedDetails.allowedMedical).toBe(2500); // 10000 - 7500
    expect(result.itemizedDetails.totalItemized).toBe(2500);
    expect(result.bestStrategy).toBe('standard'); // 2500 < 14600
  });

  it('should handle zero gross income safely', () => {
    const result = calculateTaxBracketOptimization({
      grossIncome: 0,
      filingStatus: 'single'
    });

    expect(result.recommendedTax).toBe(0);
    expect(result.recommendedTaxable).toBe(0);
    expect(result.bestStrategy).toBe('standard');
    expect(result.appliedDeduction).toBe(14600);
    expect(result.recommendedEffectiveRate).toBe(0);
  });
});
