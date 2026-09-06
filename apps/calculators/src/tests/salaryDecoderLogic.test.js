import { describe, expect, it } from 'vitest';

import { calculateSalaryDecoding } from '../lib/salaryDecoderLogic';

describe('salaryDecoderLogic', () => {
  it('should split CTC into cash and non-cash components', () => {
    const result = calculateSalaryDecoding({
      baseSalary: 80000,
      annualBonus: 10000,
      employerRetirement: 5000,
      healthInsurance: 3000,
      otherPerks: 2000,
      preTaxContributions: 0,
      filingStatus: 'single'
    });

    expect(result.ctc).toBe(100000);
    expect(result.grossCash).toBe(90000);
    expect(result.components.base).toBe(80000);
    expect(result.components.employerRetirement).toBe(5000);
  });

  it('should reduce taxable income by pre-tax contributions', () => {
    const without = calculateSalaryDecoding({ baseSalary: 80000, filingStatus: 'single' });
    const withPreTax = calculateSalaryDecoding({
      baseSalary: 80000,
      preTaxContributions: 10000,
      filingStatus: 'single'
    });

    expect(withPreTax.grossForTax).toBe(70000);
    expect(withPreTax.tax.recommendedTax).toBeLessThan(without.tax.recommendedTax);
  });

  it('should compute in-hand pay and CTC efficiency', () => {
    const result = calculateSalaryDecoding({
      baseSalary: 80000,
      annualBonus: 10000,
      employerRetirement: 5000,
      healthInsurance: 3000,
      otherPerks: 2000,
      preTaxContributions: 0,
      filingStatus: 'single'
    });

    // grossCash 90000 - tax; standard deduction 14600 -> taxable 75400
    // 10% on 11600 = 1160; 12% on 35550 = 4266; 22% on 28250 = 6215 -> 11641
    expect(result.tax.recommendedTax).toBe(11641);
    expect(result.inHandAnnual).toBe(90000 - 11641);
    expect(result.inHandMonthly).toBe(Math.round((90000 - 11641) / 12));
    expect(result.ctcEfficiency).toBeCloseTo((90000 - 11641) / 100000, 5);
    expect(result.totalDeductions).toBe(100000 - (90000 - 11641));
  });

  it('should cap pre-tax contributions at gross cash pay', () => {
    const result = calculateSalaryDecoding({
      baseSalary: 50000,
      preTaxContributions: 999999,
      filingStatus: 'single'
    });

    expect(result.preTax).toBe(50000);
    expect(result.grossForTax).toBe(0);
    expect(result.tax.recommendedTax).toBe(0);
    expect(result.inHandAnnual).toBe(0);
  });

  it('should handle zero income safely', () => {
    const result = calculateSalaryDecoding({});

    expect(result.ctc).toBe(0);
    expect(result.inHandAnnual).toBe(0);
    expect(result.inHandMonthly).toBe(0);
    expect(result.ctcEfficiency).toBe(0);
  });
});
