/**
 * Shared base: expenses at retirement + required corpus via real withdrawal rate.
 * Extracted so Coast/Barista modes reuse the exact same math as classic FIRE.
 */
export const computeFIREBase = ({
  currentAge,
  retirementAge,
  currentMonthlyExpenses,
  inflationRate,
  medicalInflation,
  postRetirementReturn,
  lifestyleInflation = 0
}) => {
  const yearsToInvest = parseFloat(retirementAge || 0) - parseFloat(currentAge || 0);

  const medicalExpenseRatio = 0.2;
  const totalInflation = (parseFloat(inflationRate) || 0) + (parseFloat(lifestyleInflation) || 0);
  const standardExpenses = (parseFloat(currentMonthlyExpenses) || 0) * (1 - medicalExpenseRatio);
  const medicalExpenses = (parseFloat(currentMonthlyExpenses) || 0) * medicalExpenseRatio;

  const futureStandardExpenses = standardExpenses * Math.pow(1 + totalInflation / 100, yearsToInvest);
  const futureMedicalExpenses =
    medicalExpenses * Math.pow(1 + (parseFloat(medicalInflation) || 0) / 100, yearsToInvest);
  const totalMonthlyExpenseAtRetirement = futureStandardExpenses + futureMedicalExpenses;

  const realRate =
    (1 + (parseFloat(postRetirementReturn) || 0) / 100) / (1 + (parseFloat(inflationRate) || 0) / 100) - 1;
  const effectiveRealRate = isNaN(realRate) ? 0 : realRate;
  const withdrawalRate = Math.max(0.02, effectiveRealRate); // Floor at 2%
  const requiredCorpus = (totalMonthlyExpenseAtRetirement * 12) / withdrawalRate;

  return { yearsToInvest, totalMonthlyExpenseAtRetirement, withdrawalRate, requiredCorpus };
};

export const calculateFIRE = ({
  currentAge,
  retirementAge,
  currentMonthlyExpenses,
  currentSavings,
  monthlyInvestment,
  inflationRate,
  medicalInflation,
  preRetirementReturn,
  postRetirementReturn,
  lifestyleInflation = 0
}) => {
  const { yearsToInvest, totalMonthlyExpenseAtRetirement, withdrawalRate, requiredCorpus } = computeFIREBase({
    currentAge,
    retirementAge,
    currentMonthlyExpenses,
    inflationRate,
    medicalInflation,
    postRetirementReturn,
    lifestyleInflation
  });
  const monthsToInvest = yearsToInvest * 12;

  // 3. Project Savings
  const preRateMonthly = (parseFloat(preRetirementReturn) || 0) / 12 / 100;
  let projectedSavings = (parseFloat(currentSavings) || 0) * Math.pow(1 + preRateMonthly, monthsToInvest);

  // Monthly SIP growth
  const sipFutureValue =
    (parseFloat(monthlyInvestment) || 0) *
    ((Math.pow(1 + preRateMonthly, monthsToInvest) - 1) / preRateMonthly) *
    (1 + preRateMonthly);
  projectedSavings += sipFutureValue;

  // 4. Calculate Supportable Income with Current Savings
  const supportableMonthlyIncome = (projectedSavings * withdrawalRate) / 12;

  // 5. Calculate Required SIP to hit Target
  const growthFactor = Math.pow(1 + preRateMonthly, monthsToInvest);
  const existingAssetsFV = (parseFloat(currentSavings) || 0) * growthFactor;
  const sipTargetGap = Math.max(0, requiredCorpus - existingAssetsFV);

  let totalSIPRequired = 0;
  if (monthsToInvest > 0 && sipTargetGap > 0) {
    const numerator = sipTargetGap * preRateMonthly;
    const denominator = (1 + preRateMonthly) * (growthFactor - 1);
    totalSIPRequired = numerator / denominator;
  }

  // Generate Schedule
  const schedule = [];
  const years = yearsToInvest;
  let currentBalance = parseFloat(currentSavings) || 0;
  let totalInvested = parseFloat(currentSavings) || 0;

  for (let i = 1; i <= years; i++) {
    const months = 12;
    const openingBalance = currentBalance;
    const sipAmount = parseFloat(monthlyInvestment) || 0;

    // FV of SIP for this year
    const sipFV = sipAmount * ((Math.pow(1 + preRateMonthly, months) - 1) / preRateMonthly) * (1 + preRateMonthly);

    // Growth on existing corpus
    const corpusGrowth = openingBalance * (Math.pow(1 + preRateMonthly, months) - 1);

    currentBalance = openingBalance + corpusGrowth + sipFV;
    totalInvested += sipAmount * 12;

    schedule.push({
      label: `Age ${parseInt(currentAge) + i}`,
      principal: Math.round(totalInvested),
      interest: Math.round(currentBalance - totalInvested),
      balance: Math.round(currentBalance)
    });
  }

  return {
    results: {
      requiredCorpus: Math.round(requiredCorpus),
      estimatedCorpusAtRetirement: Math.round(projectedSavings),
      shortfall: Math.round(Math.max(0, requiredCorpus - projectedSavings)),
      canRetire: projectedSavings >= requiredCorpus,
      yearsToFIRE: yearsToInvest,
      monthlyExpensesAtRetirement: Math.round(totalMonthlyExpenseAtRetirement),
      supportableMonthlyIncome: Math.round(supportableMonthlyIncome),
      totalSIPRequired: Math.round(totalSIPRequired),
      extraSIPNeeded: Math.round(Math.max(0, totalSIPRequired - (parseFloat(monthlyInvestment) || 0)))
    },
    schedule
  };
};

/**
 * Coast FIRE: the savings number at which you can stop contributing and
 * still hit the full corpus by retirement age on growth alone.
 */
export const calculateCoastFIRE = (params) => {
  const { currentAge, currentSavings, preRetirementReturn } = params;
  const { yearsToInvest, requiredCorpus } = computeFIREBase(params);

  const r = (parseFloat(preRetirementReturn) || 0) / 100;
  const savings = Math.max(0, parseFloat(currentSavings) || 0);

  const coastTarget = r > 0 ? requiredCorpus / Math.pow(1 + r, Math.max(0, yearsToInvest)) : requiredCorpus;
  const isCoasted = savings >= coastTarget;

  // Years until current savings alone grow into the full corpus.
  let yearsToCoast = 0;
  if (!isCoasted && savings > 0 && r > 0) {
    yearsToCoast = Math.log(requiredCorpus / savings) / Math.log(1 + r);
  } else if (!isCoasted) {
    yearsToCoast = Infinity; // No growth: never coasts without contributions
  }
  const coastAge =
    yearsToCoast === Infinity ? null : Math.round(((parseFloat(currentAge) || 0) + yearsToCoast) * 10) / 10;

  return {
    requiredCorpus: Math.round(requiredCorpus),
    coastTarget: Math.round(coastTarget),
    currentSavings: Math.round(savings),
    isCoasted,
    gap: Math.round(Math.max(0, coastTarget - savings)),
    coastAge
  };
};

/**
 * Barista FIRE: part-time income covers part of retirement expenses,
 * shrinking the required corpus.
 */
export const calculateBaristaFIRE = (params) => {
  const { partTimeAnnualIncome = 0 } = params;
  const { totalMonthlyExpenseAtRetirement, withdrawalRate, requiredCorpus } = computeFIREBase(params);

  const annualExpense = totalMonthlyExpenseAtRetirement * 12;
  const partTime = Math.max(0, parseFloat(partTimeAnnualIncome) || 0);
  const coveredAnnual = Math.max(0, annualExpense - partTime);
  const baristaCorpus = coveredAnnual / withdrawalRate;
  const corpusReduction = requiredCorpus - baristaCorpus;

  return {
    classicCorpus: Math.round(requiredCorpus),
    baristaCorpus: Math.round(baristaCorpus),
    corpusReduction: Math.round(corpusReduction),
    partTimeAnnual: Math.round(partTime),
    coverageRatio: annualExpense > 0 ? Math.min(1, partTime / annualExpense) : 0
  };
};
