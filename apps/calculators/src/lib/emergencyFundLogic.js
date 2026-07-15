export function calculateEmergencyFund(inputs) {
  const {
    coreExpenses = 0,
    discretionaryExpenses = 0,
    discretionaryRetention = 0,
    expenseVolatility = 0,
    jobSearchDuration = 6,
    healthDeductible = 0,
    propertyDeductible = 0
  } = inputs;

  const monthlyBurnRate = coreExpenses + discretionaryExpenses * (discretionaryRetention / 100) + expenseVolatility;
  const incomeShockBuffer = monthlyBurnRate * jobSearchDuration;
  const lumpSumBuffer = healthDeductible + propertyDeductible;

  const totalFund = incomeShockBuffer + lumpSumBuffer;

  const tier1Cash = Math.min(1, jobSearchDuration) * monthlyBurnRate;
  const tier2Bank = Math.min(2, Math.max(0, jobSearchDuration - 1)) * monthlyBurnRate + lumpSumBuffer;
  const tier3Investments = Math.max(0, jobSearchDuration - 3) * monthlyBurnRate;

  return {
    monthlyBurnRate,
    incomeShockBuffer,
    lumpSumBuffer,
    totalFund,
    tiers: {
      tier1Cash,
      tier2Bank,
      tier3Investments
    }
  };
}
