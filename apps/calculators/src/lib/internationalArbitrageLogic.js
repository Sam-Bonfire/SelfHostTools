export function calculateArbitrage(inputs) {
  const {
    grossIncome = 0,
    sourceTaxRate = 0,
    sourceExpenses = 0,
    
    platformFeeRate = 0,
    transfersPerYear = 12,
    transferFeeFixed = 0,
    forexSpreadRate = 0,
    exchangeRate = 1,
    
    targetTaxRate = 0,
    targetExpenses = 0
  } = inputs;

  // SOURCE COUNTRY CALCS
  const sourceTaxAmount = grossIncome * (sourceTaxRate / 100);
  const sourceNetIncome = grossIncome - sourceTaxAmount;
  const sourceSavings = sourceNetIncome - sourceExpenses;
  const sourceSavingsRate = grossIncome > 0 ? (sourceSavings / grossIncome) * 100 : 0;

  // TARGET COUNTRY CALCS
  const platformFee = grossIncome * (platformFeeRate / 100);
  const incomePostPlatform = grossIncome - platformFee;
  
  const totalFixedTransferFees = transferFeeFixed * transfersPerYear;
  
  const amountBeforeForex = Math.max(0, incomePostPlatform - totalFixedTransferFees);
  const forexFee = amountBeforeForex * (forexSpreadRate / 100);
  const amountToConvert = amountBeforeForex - forexFee;
  
  const targetGrossIncomeLocal = amountToConvert * exchangeRate;
  const targetTaxAmountLocal = targetGrossIncomeLocal * (targetTaxRate / 100);
  const targetNetIncomeLocal = targetGrossIncomeLocal - targetTaxAmountLocal;
  
  const targetSavingsLocal = targetNetIncomeLocal - targetExpenses;
  const targetSavingsConverted = exchangeRate > 0 ? targetSavingsLocal / exchangeRate : 0;

  // Effective Source Currency metrics in Target
  const targetGrossIncomeConverted = exchangeRate > 0 ? targetGrossIncomeLocal / exchangeRate : 0;
  const targetTaxAmountConverted = exchangeRate > 0 ? targetTaxAmountLocal / exchangeRate : 0;
  const targetNetIncomeConverted = exchangeRate > 0 ? targetNetIncomeLocal / exchangeRate : 0;
  const targetExpensesConverted = exchangeRate > 0 ? targetExpenses / exchangeRate : 0;
  
  const targetSavingsRate = targetGrossIncomeLocal > 0 ? (targetSavingsLocal / targetGrossIncomeLocal) * 100 : 0;

  // COMPARISON
  const savingsDifference = targetSavingsConverted - sourceSavings;
  const savingsIncreasePercent = sourceSavings > 0 
    ? (savingsDifference / sourceSavings) * 100 
    : (savingsDifference > 0 ? Infinity : 0);

  // Velocity (Months to save what used to take a year)
  let monthsToReachSourceAnnual = 0;
  if (sourceSavings > 0 && targetSavingsConverted > 0) {
    monthsToReachSourceAnnual = sourceSavings / (targetSavingsConverted / 12);
  } else if (sourceSavings <= 0 && targetSavingsConverted > 0) {
    monthsToReachSourceAnnual = 0; // Instant
  }

  // Monthly breakdown
  const monthlySourceSavings = sourceSavings / 12;
  const monthlyTargetSavingsLocal = targetSavingsLocal / 12;
  const monthlyTargetSavingsConverted = targetSavingsConverted / 12;

  return {
    source: {
      grossIncome,
      taxAmount: sourceTaxAmount,
      netIncome: sourceNetIncome,
      expenses: sourceExpenses,
      savings: sourceSavings,
      savingsRate: sourceSavingsRate,
      monthlySavings: monthlySourceSavings
    },
    target: {
      platformFee,
      transferFee: totalFixedTransferFees,
      forexFee,
      totalFeesConverted: platformFee + totalFixedTransferFees + forexFee,
      
      grossIncomeLocal: targetGrossIncomeLocal,
      taxAmountLocal: targetTaxAmountLocal,
      netIncomeLocal: targetNetIncomeLocal,
      expensesLocal: targetExpenses,
      savingsLocal: targetSavingsLocal,
      monthlySavingsLocal: monthlyTargetSavingsLocal,
      
      grossIncomeConverted: targetGrossIncomeConverted,
      taxAmountConverted: targetTaxAmountConverted,
      netIncomeConverted: targetNetIncomeConverted,
      expensesConverted: targetExpensesConverted,
      savingsConverted: targetSavingsConverted,
      monthlySavingsConverted: monthlyTargetSavingsConverted,
      savingsRate: targetSavingsRate
    },
    comparison: {
      savingsDifference,
      savingsIncreasePercent,
      monthsToReachSourceAnnual
    }
  };
}
