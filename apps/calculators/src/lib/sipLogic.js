export const calculateSIPReality = ({
  calcMode,
  monthlyInvestment,
  targetCorpus,
  expectedReturn,
  timePeriod,
  isStepUp,
  stepUpPercentage,
  useInflation,
  inflationRate,
  useFees,
  expenseRatio,
  useTax,
  assetMix,
  taxRates
}) => {
  const isGoalMode = calcMode === 'goal';
  const ratePerMonth =
    (useFees ? (parseFloat(expectedReturn) || 0) - (parseFloat(expenseRatio) || 0) : parseFloat(expectedReturn) || 0) /
    12 /
    100;
  const months = (parseFloat(timePeriod) || 0) * 12;
  const stepUp = isStepUp ? (parseFloat(stepUpPercentage) || 0) / 100 : 0;

  let startMonthlySIP = isGoalMode ? 1000 : parseFloat(monthlyInvestment) || 0; // If goal mode, we'll scale this later

  const runSimulation = (startingSIP) => {
    let currentInv = startingSIP;
    let balance = 0;
    let invested = 0;
    let simSchedule = [];
    let yearlyInv = 0;
    let yearlyInt = 0;

    for (let m = 1; m <= months; m++) {
      balance += currentInv;
      invested += currentInv;
      yearlyInv += currentInv;
      const interest = balance * ratePerMonth;
      balance += interest;
      yearlyInt += interest;

      if (m % 12 === 0) {
        simSchedule.push({
          label: `Year ${m / 12}`,
          principal: yearlyInv,
          interest: yearlyInt,
          balance: balance,
          totalInvested: invested
        });
        yearlyInv = 0;
        yearlyInt = 0;
        if (stepUp > 0) currentInv = currentInv * (1 + stepUp);
      }
    }
    return { balance, invested, simSchedule };
  };

  let sim = runSimulation(startMonthlySIP);

  if (isGoalMode) {
    // Find required SIP by scaling: Required = (Target / SimBalance) * SimStartSIP
    const multiplier = (parseFloat(targetCorpus) || 0) / sim.balance;
    startMonthlySIP = startMonthlySIP * multiplier;
    // Re-run with the correct starting SIP
    sim = runSimulation(startMonthlySIP);
  }

  const maturityValue = sim.balance;
  const totalInvested = sim.invested;
  const totalReturns = maturityValue - totalInvested;

  // --- Reality Deductions ---
  let theoreticalBalance = 0;
  if (useFees && expenseRatio > 0) {
    let tempInv = startMonthlySIP;
    const pureRate = (parseFloat(expectedReturn) || 0) / 12 / 100;
    for (let m = 1; m <= months; m++) {
      theoreticalBalance += tempInv;
      theoreticalBalance += theoreticalBalance * pureRate;
      if (m % 12 === 0 && isStepUp) tempInv = tempInv * (1 + stepUp);
    }
  }
  const wealthLostToFees = useFees ? theoreticalBalance - maturityValue : 0;

  let taxAmount = 0;
  if (useTax) {
    const equityReturns = totalReturns * (assetMix.equity / 100);
    const debtReturns = totalReturns * (assetMix.debt / 100);
    const goldReturns = totalReturns * (assetMix.gold / 100);
    const equityTax = Math.max(0, equityReturns - 100000) * (taxRates.equity / 100);
    const debtTax = debtReturns * (taxRates.debt / 100);
    const goldTax = goldReturns * (taxRates.gold / 100);
    taxAmount = equityTax + debtTax + goldTax;
  }
  const postTaxValue = maturityValue - taxAmount;

  const realValue = useInflation
    ? postTaxValue / Math.pow(1 + (parseFloat(inflationRate) || 0) / 100, parseFloat(timePeriod) || 0)
    : postTaxValue;

  const inflationLoss = postTaxValue - realValue;

  return {
    results: {
      totalInvested: Math.round(totalInvested),
      totalReturns: Math.round(totalReturns),
      maturityValue: Math.round(maturityValue),
      realValue: Math.round(realValue),
      postTaxValue: Math.round(postTaxValue),
      wealthLostToFees: Math.round(wealthLostToFees),
      taxAmount: Math.round(taxAmount),
      inflationLoss: Math.round(inflationLoss),
      requiredSIP: Math.round(startMonthlySIP)
    },
    schedule: sim.simSchedule
  };
};
