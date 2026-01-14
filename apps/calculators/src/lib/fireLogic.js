export const calculateFIRE = ({
    currentAge,
    retirementAge,
    currentMonthlyExpenses,
    currentSavings,
    monthlyInvestment,
    inflationRate,
    medicalInflation,
    preRetirementReturn,
    postRetirementReturn
}) => {
    const yearsToInvest = parseFloat(retirementAge || 0) - parseFloat(currentAge || 0);
    const monthsToInvest = yearsToInvest * 12;

    // 1. Calculate Expenses at Retirement
    // Assuming 20% of expenses are medical (subject to higher inflation)
    const medicalExpenseRatio = 0.20;
    const standardExpenses = (parseFloat(currentMonthlyExpenses) || 0) * (1 - medicalExpenseRatio);
    const medicalExpenses = (parseFloat(currentMonthlyExpenses) || 0) * medicalExpenseRatio;

    const futureStandardExpenses = standardExpenses * Math.pow(1 + ((parseFloat(inflationRate) || 0) / 100), yearsToInvest);
    const futureMedicalExpenses = medicalExpenses * Math.pow(1 + ((parseFloat(medicalInflation) || 0) / 100), yearsToInvest);
    const totalMonthlyExpenseAtRetirement = futureStandardExpenses + futureMedicalExpenses;

    // 2. Calculate Required Corpus (using 4% rule or SWR)
    // SWR = postRetirementReturn - inflation (Real rate of return)
    // For safety, let's use Real Rate + 1% buffer ?? No, code used formula:
    // realRate = ((1+post)/(1+inf)) - 1
    const realRate = ((1 + ((parseFloat(postRetirementReturn) || 0) / 100)) / (1 + ((parseFloat(inflationRate) || 0) / 100))) - 1;
    // Prevent division by zero or negative infinite corpus requirement. Use 2% as floor.
    // If realRate is NaN, default to 0.
    const effectiveRealRate = isNaN(realRate) ? 0 : realRate;
    const withdrawalRate = Math.max(0.02, effectiveRealRate); // Floor at 2%
    const requiredCorpus = (totalMonthlyExpenseAtRetirement * 12) / withdrawalRate;

    // 3. Project Savings
    const preRateMonthly = (parseFloat(preRetirementReturn) || 0) / 12 / 100;
    let projectedSavings = (parseFloat(currentSavings) || 0) * Math.pow(1 + preRateMonthly, monthsToInvest);

    // Monthly SIP growth
    const sipFutureValue = (parseFloat(monthlyInvestment) || 0) * ((Math.pow(1 + preRateMonthly, monthsToInvest) - 1) / preRateMonthly) * (1 + preRateMonthly);
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
        totalInvested += (sipAmount * 12);

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
