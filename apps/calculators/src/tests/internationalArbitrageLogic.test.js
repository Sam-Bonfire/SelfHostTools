import { describe, it, expect } from 'vitest';
import { calculateArbitrage } from '../lib/internationalArbitrageLogic';

describe('internationalArbitrageLogic', () => {
  it('should calculate identical savings when both countries are the same', () => {
    const inputs = {
      grossIncome: 100000,
      sourceTaxRate: 20,
      sourceExpenses: 50000,
      
      platformFeeRate: 0,
      transfersPerYear: 0,
      transferFeeFixed: 0,
      forexSpreadRate: 0,
      exchangeRate: 1,
      
      targetTaxRate: 20,
      targetExpenses: 50000
    };
    
    const result = calculateArbitrage(inputs);
    
    expect(result.source.savings).toBe(30000);
    expect(result.target.savingsConverted).toBe(30000);
    expect(result.comparison.savingsDifference).toBe(0);
    expect(result.comparison.savingsIncreasePercent).toBe(0);
    expect(result.comparison.monthsToReachSourceAnnual).toBe(12);
  });

  it('should correctly apply platform, transfer, and forex fees', () => {
    const inputs = {
      grossIncome: 100000,
      sourceTaxRate: 20,
      sourceExpenses: 50000,
      
      platformFeeRate: 5,     // 5,000
      transfersPerYear: 12,
      transferFeeFixed: 50,   // 600
      forexSpreadRate: 2,     // 2% of (95000 - 600) = 1888
      exchangeRate: 1.5,
      
      targetTaxRate: 10,
      targetExpenses: 45000   // in target currency (equivalent to 30,000 source)
    };
    
    const result = calculateArbitrage(inputs);
    
    expect(result.target.platformFee).toBe(5000);
    expect(result.target.transferFee).toBe(600);
    
    const expectedAmountBeforeForex = 100000 - 5000 - 600; // 94400
    const expectedForex = expectedAmountBeforeForex * 0.02; // 1888
    
    expect(result.target.forexFee).toBe(expectedForex);
    
    const amountToConvert = 94400 - 1888; // 92512
    const expectedGrossLocal = amountToConvert * 1.5; // 138768
    
    expect(result.target.grossIncomeLocal).toBe(expectedGrossLocal);
    
    const taxAmountLocal = expectedGrossLocal * 0.10; // 13876.8
    const netLocal = expectedGrossLocal - taxAmountLocal; // 124891.2
    const savingsLocal = netLocal - 45000; // 79891.2
    const savingsConverted = savingsLocal / 1.5; // 53260.8
    
    expect(result.target.savingsLocal).toBeCloseTo(79891.2, 2);
    expect(result.target.savingsConverted).toBeCloseTo(53260.8, 2);
  });
});
