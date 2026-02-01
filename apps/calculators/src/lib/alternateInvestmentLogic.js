export const calculateAlternateROI = ({
    initialInvestment = 0,
    monthlyContribution = 0,
    years = 1,
    estReturnRate = 0, // Annual Nominal Return %
    inflationRate = 6, // %
    taxRate = 0, // % on Gains
    activeHoursPerWeek = 0,
    userHourlyRate = 0,
    benchmarkReturn = 12 // % Annual Return for comparision
}) => {
    const months = years * 12;
    const monthlyRate = estReturnRate / 100 / 12;
    const monthlyInflation = inflationRate / 100 / 12;

    let nominalValue = initialInvestment;
    let totalInvested = initialInvestment;
    let totalTimeCost = 0;

    // We track "Real Value" by discounting nominal value by inflation each step
    // OR we can calculate Nominal first, then adjust. 
    // Standard Approach: Calculate Nominal Final -> Deduct Taxes -> Adjust for Inflation -> Deduct Time Cost.

    for (let i = 0; i < months; i++) {
        // 1. Add Monthly Contribution
        nominalValue += monthlyContribution;
        totalInvested += monthlyContribution;

        // 2. Grow by Return Rate
        nominalValue *= (1 + monthlyRate);

        // 3. Track Time Cost (Sweat Equity)
        // 4.33 weeks per month approx
        const hoursThisMonth = activeHoursPerWeek * 4.33;
        totalTimeCost += (hoursThisMonth * userHourlyRate);
    }

    const grossProfit = nominalValue - totalInvested;

    // --- TAX CALCULATION ---
    // Simple view: Tax is paid on the Gains at the end
    const taxAmount = Math.max(0, grossProfit * (taxRate / 100));
    const postTaxValue = nominalValue - taxAmount;
    const postTaxProfit = postTaxValue - totalInvested;

    // --- INFLATION ADJUSTMENT (Real Value) ---
    // Formula: PresentValue = FutureValue / (1 + inflation)^years
    const realValue = postTaxValue / Math.pow(1 + (inflationRate / 100), years);
    const realProfit = realValue - totalInvested; // Note: TotalInvested isn't inflation adjusted here for simplicity, or we should strictly adjust purchasing power. 
    // Better Metric: "Real Purchasing Power Gained" = RealValue - InitialWealth_Adjusted? 
    // Let's stick to standard: Real Value of Portfolio relative to Today's money.

    // --- TIME COST ADJUSTMENT (The Reality Check) ---
    // Time Cost is already in "Labour Value". 
    // If I spent 100k of time to gain 50k of profit, my "Net Net" is -50k.
    // We treat Time Cost as an "Expense" deducted from the Real Profit.
    const netRealProfitAfterTime = realProfit - totalTimeCost;

    // --- ROIs ---
    const nominalROI = (grossProfit / totalInvested) * 100;
    const realROI = (realProfit / totalInvested) * 100;
    const truePassiveROI = (netRealProfitAfterTime / totalInvested) * 100;

    // Calculate total hours first
    const totalHours = activeHoursPerWeek * 52 * years;
    const effectiveHourlyWage = totalHours > 0 ? (realProfit / totalHours) : 0;

    // --- BENCHMARK COMPARISON (NIFTY 50 / Custom) ---
    // Use user-provided benchmark return or default to 12%
    const benchmarkMonthlyRate = benchmarkReturn / 100 / 12;
    let benchmarkNominal = initialInvestment;

    for (let i = 0; i < months; i++) {
        // Benchmark Calculation (Passive)
        benchmarkNominal += monthlyContribution;
        benchmarkNominal *= (1 + benchmarkMonthlyRate);
    }

    const benchmarkGrossProfit = benchmarkNominal - totalInvested;
    const benchmarkTax = Math.max(0, benchmarkGrossProfit * (taxRate / 100)); // Use user tax rate for fair comparison
    const benchmarkPostTax = benchmarkNominal - benchmarkTax;
    const benchmarkRealValue = benchmarkPostTax / Math.pow(1 + (inflationRate / 100), years);
    const benchmarkRealProfit = benchmarkRealValue - totalInvested;

    // Alpha = User's Net Real Profit (after Effort) - Benchmark's Real Profit (zero effort)
    const alpha = netRealProfitAfterTime - benchmarkRealProfit;

    // Passivity Score: 100% = 0 hours, 0% = 40+ hours/week
    const passivityScore = Math.max(0, 100 - (activeHoursPerWeek / 40 * 100));

    return {
        nominalValue,
        totalInvested,
        grossProfit,
        taxAmount,
        postTaxValue,
        realValue,
        totalTimeCost, // The "Sweat Equity"
        netRealProfitAfterTime, // The "True" Profit
        roi: {
            nominal: nominalROI,
            real: realROI,
            truePassive: truePassiveROI
        },
        effectiveHourlyWage,
        totalHours,
        benchmark: {
            nominalValue: benchmarkNominal,
            realValue: benchmarkRealValue,
            realProfit: benchmarkRealProfit,
            alpha: alpha,
            isBeatingMarket: alpha > 0
        },
        passivityScore
    };
};
