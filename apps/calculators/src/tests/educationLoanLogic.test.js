import { describe, expect, it } from 'vitest';

import { calculateEducationLoan } from '../lib/educationLoanLogic';

describe('Education Loan Calculator Logic', () => {
  it('should calculate simple mode loan correctly', () => {
    const result = calculateEducationLoan({
      interestRate: 12, // 1% pm
      repaymentTenure: 1, // 12 months
      loanAmount: 100000,
      courseDuration: 0,
      isAdvanced: false,
      courseEndDate: null,
      disbursements: [],
      gracePeriod: 0,
      gracePayment: 0,
      graceLumpsum: 0,
      capitalizeInterest: true,
      extraPayment: 0
    });

    // P = 100k, r = 1% pm, n = 12
    // EMI = 100000 * 0.01 * (1.01)^12 / ((1.01)^12 - 1)
    // 1.01^12 = 1.1268
    // EMI = 1000 * 1.1268 / 0.1268 = 1126.8 / 0.1268 = 8884.87

    expect(result.results.monthlyEMI).toBeCloseTo(8885, -1);
    expect(result.schedule.length).toBe(1); // 1 year
  });

  it('should calculate moratorium interest capitalization', () => {
    const result = calculateEducationLoan({
      interestRate: 12,
      repaymentTenure: 1,
      loanAmount: 100000,
      courseDuration: 12, // 1 year course
      isAdvanced: false,
      courseEndDate: null,
      disbursements: [],
      gracePeriod: 0,
      gracePayment: 0,
      graceLumpsum: 0,
      capitalizeInterest: true, // Capitalize
      extraPayment: 0
    });

    // Moratorium 12 months.
    // Interest accrued = 100k * 1% * 12 = 12000.
    // Effective Principal = 112000.

    expect(result.results.effectivePrincipal).toBe(112000);
  });

  it('should handle annual schedule generation', () => {
    const result = calculateEducationLoan({
      interestRate: 10,
      repaymentTenure: 10,
      loanAmount: 1000000,
      courseDuration: 0,
      isAdvanced: false,
      courseEndDate: null,
      disbursements: [],
      gracePeriod: 0,
      gracePayment: 0,
      graceLumpsum: 0,
      capitalizeInterest: true,
      extraPayment: 0
    });

    // 10 years tenure implies schedule should have entries for 10/11 years depending on start date overlap
    expect(result.schedule.length).toBeGreaterThanOrEqual(10);
  });
});
