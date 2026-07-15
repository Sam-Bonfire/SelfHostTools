import { describe, expect, it } from 'vitest';

import { calculateInvestVsLoan } from '../lib/investVsLoanLogic';

describe('calculateInvestVsLoan', () => {
  // Simple Case: High Interest Debt (20%) vs Low Return (5%)
  // Payoff should WIN.
  it('should favor Paying Off High Interest Debt', () => {
    const result = calculateInvestVsLoan({
      loans: [{ id: 1, principal: 10000, rate: 20, minPayment: 100 }],
      surplus: 500,
      investmentReturn: 5,
      investmentTaxRate: 0,
      userTaxBracket: 0,
      maxYears: 2
    });

    // Payoff strategy should end up with higher Net Worth (less negative or more positive)
    const payoffNW = result.results.payoffStrategy.finalNetWorth;
    const investNW = result.results.investStrategy.finalNetWorth;

    expect(payoffNW).toBeGreaterThan(investNW);
    expect(result.results.winner).toBe('Payoff');
  });

  // Simple Case: Low Interest Debt (2%) vs High Return (10%)
  // Invest should WIN.
  it('should favor Investing when Return > Debt Rate', () => {
    const result = calculateInvestVsLoan({
      loans: [{ id: 1, principal: 10000, rate: 2, minPayment: 100 }],
      surplus: 500,
      investmentReturn: 10,
      investmentTaxRate: 0,
      userTaxBracket: 0,
      maxYears: 2
    });

    expect(result.results.investStrategy.finalNetWorth).toBeGreaterThan(result.results.payoffStrategy.finalNetWorth);
    expect(result.results.winner).toBe('Invest');
  });

  // Tax Deduction Case
  // Loan 10% (Tax Ded -> 5% if 50% bracket)
  // Invest 8%
  // Invest (8%) > Effect Loan (5%) -> Invest Wins.
  it('should account for Tax Deductibility', () => {
    const result = calculateInvestVsLoan({
      loans: [{ id: 1, principal: 10000, rate: 10, minPayment: 100, isTaxDeductible: true }],
      surplus: 500,
      investmentReturn: 8,
      investmentTaxRate: 0,
      userTaxBracket: 50, // Massive bracket to make it obvious
      maxYears: 2
    });

    expect(result.results.investStrategy.finalNetWorth).toBeGreaterThan(result.results.payoffStrategy.finalNetWorth);
    expect(result.results.winner).toBe('Invest');
  });
});
