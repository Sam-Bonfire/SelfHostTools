export const calculateLifeInsurance = ({
  monthlyExpense,
  yearsToReplace,
  inflationRate,
  investmentReturn,
  personalShare,
  liabilities,
  futureGoals, // Array of {amount, yearsAway}
  existingAssets,
  currentInsurance
}) => {
  // 1. Calculate Net Monthly Need (Family Need = Total - Personal Spending)
  const personalDeduction = (parseFloat(monthlyExpense) || 0) * ((parseFloat(personalShare) || 0) / 100);
  const familyMonthlyNeed = (parseFloat(monthlyExpense) || 0) - personalDeduction;

  // 2. Expense Replacement (Present Value of Annuity with Real Rate of Return)
  const r = (1 + (parseFloat(investmentReturn) || 0) / 100) / (1 + (parseFloat(inflationRate) || 0) / 100) - 1;
  const n = (parseFloat(yearsToReplace) || 0) * 12; // months
  const r_monthly = Math.pow(1 + r, 1 / 12) - 1; // monthly real rate

  // PV of Growing Annuity (immediate) approx via Real Rate Annuity
  // PV = PMT * [ (1 - (1+r)^-n) / r ] * (1+r) (for start of period)
  let expenseCover = 0;
  if (r_monthly === 0) {
    expenseCover = familyMonthlyNeed * n;
  } else {
    expenseCover = familyMonthlyNeed * ((1 - Math.pow(1 + r_monthly, -n)) / r_monthly) * (1 + r_monthly);
  }

  // 3. Goal Cover (Present Value - One-time costs)
  // Logic: Future Cost = Present Cost * (1+Inf)^Years.
  // PV Required = Future Cost / (1+Inv)^Years.
  let goalCover = 0;
  if (Array.isArray(futureGoals)) {
    futureGoals.forEach((g) => {
      const futureCost =
        (parseFloat(g.amount) || 0) *
        Math.pow(1 + (parseFloat(inflationRate) || 0) / 100, parseFloat(g.yearsAway) || 0);
      const pvRequired =
        futureCost / Math.pow(1 + (parseFloat(investmentReturn) || 0) / 100, parseFloat(g.yearsAway) || 0);
      goalCover += pvRequired;
    });
  }

  const totalRequired = Math.round(
    expenseCover + goalCover + (parseFloat(liabilities) || 0) - (parseFloat(existingAssets) || 0)
  );
  const gap = Math.max(0, totalRequired - (parseFloat(currentInsurance) || 0));

  return {
    expenseCover: Math.round(expenseCover),
    goalCover: Math.round(goalCover),
    totalRequired,
    gap,
    isAdequate: (parseFloat(currentInsurance) || 0) >= totalRequired,
    familyMonthlyNeed
  };
};

export const generateLifeInsuranceSchedule = ({
  expenseCover,
  familyMonthlyNeed,
  yearsToReplace,
  investmentReturn,
  inflationRate
}) => {
  const principal = parseFloat(expenseCover) || 0;
  let balance = principal;
  const schedule = [];
  let currentAnnualWithdrawal = (parseFloat(familyMonthlyNeed) || 0) * 12;

  for (let yr = 1; yr <= (parseFloat(yearsToReplace) || 0); yr++) {
    const startBalance = balance;
    // Drawdown
    // Assuming withdrawal at start or throughout?? Original code:
    // withdrawal first? "end: Math.max(0, balance + (balance * inv/100) - annual)"
    // Typically annual withdrawal happens over the year.
    // Original code logic: Balance + Interest - Withdrawal.

    // Check if reporting specific years
    if (yr === 1 || yr % 5 === 0 || yr == yearsToReplace) {
      // Just push to schedule
    }

    const interest = balance * ((parseFloat(investmentReturn) || 0) / 100);
    // Note: If withdrawal happens at start, interest is on (Balance - Withdrawal).
    // Original code: balance + interest - withdrawal. This implies withdrawal at end of year.
    // But expenseCover calculation used `(1+r_monthly)` implying start of period annuity?
    // It's an approximation. Let's stick to matching original Schedule generation logic.

    const endBalance = Math.max(0, balance + interest - currentAnnualWithdrawal);

    if (yr === 1 || yr % 5 === 0 || yr == yearsToReplace) {
      schedule.push({
        year: yr,
        start: Math.round(startBalance),
        withdrawal: Math.round(currentAnnualWithdrawal),
        end: Math.round(endBalance)
      });
    }

    balance = endBalance;
    currentAnnualWithdrawal = currentAnnualWithdrawal * (1 + (parseFloat(inflationRate) || 0) / 100);
    if (balance <= 0 && yr < yearsToReplace) {
      // If balance depleted check
      // Should we continue? Loop breaks in original code.
      break;
    }
  }
  return schedule;
};
