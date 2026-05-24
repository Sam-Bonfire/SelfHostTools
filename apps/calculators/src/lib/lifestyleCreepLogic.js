export function calculateLifestyleCreep({
    monthlyIncome = 100000,
    monthlySavings = 20000,
    annualRaisePercent = 10,
    roiPercent = 12,
    inflationPercent = 6,
    raiseInvestedPercent = 50,
    years = 20
}) {
    const raiseRate = annualRaisePercent / 100;
    const roiRate = roiPercent / 100;
    const inflationRate = inflationPercent / 100;
    const userInvestRate = raiseInvestedPercent / 100;

    let currentIncome = monthlyIncome * 12;
    let baseSavings = monthlySavings * 12;
    
    // Arrays to hold year-by-year data for charting
    const schedule = [];
    
    // Running portfolio balances
    let balanceA = 0; // 100% Invested
    let balanceB = 0; // User % Invested
    let balanceC = 0; // 0% Invested

    // Cumulative contributions (just for info)
    let investedA = 0;
    let investedB = 0;
    let investedC = 0;

    for (let year = 1; year <= years; year++) {
        // At the start of the year, we have an income.
        // For Year 1, there is no raise yet, it's just the base.
        // Wait, does the raise happen at the end of year 1? Yes.
        // So Year 1 is just the base income and base savings.
        
        let raiseAmount = 0;
        if (year > 1) {
            const previousIncome = currentIncome;
            currentIncome = currentIncome * (1 + raiseRate);
            raiseAmount = currentIncome - previousIncome;
        }

        // The base savings should theoretically increase with inflation to maintain the same real saving rate?
        // Or do we assume they save the exact same nominal amount, and their expenses absorb inflation?
        // Let's assume standard behavior: their base lifestyle expenses increase by inflation.
        // Base expenses = Previous Income - Previous Savings?
        // Let's track Cumulative Raise instead.
        // Base Income = initial monthlyIncome * 12
        // Total Raise = currentIncome - Base Income
        
        const baseIncome = monthlyIncome * 12;
        const totalRaise = currentIncome - baseIncome;

        // Base savings should be adjusted. If income is 100k, savings 20k, expenses 80k.
        // Next year, expenses inflate by 6% to 84.8k.
        // So base savings = Income - 84.8k?
        // No, let's keep it simpler for the user to understand. 
        // "You keep saving your base ₹20k/mo. On top of that, you get a raise. What do you do with the raise?"
        // Scenario A: Invest 100% of the raise.
        // Scenario B: Invest X% of the raise.
        // Scenario C: Invest 0% of the raise.
        
        const savingsA = baseSavings + (totalRaise * 1.0);
        const savingsB = baseSavings + (totalRaise * userInvestRate);
        const savingsC = baseSavings + (totalRaise * 0.0);

        // Add to contributions
        investedA += savingsA;
        investedB += savingsB;
        investedC += savingsC;

        // Grow balances
        // Contributions are assumed to be made monthly, but for simplicity we can use annual compounding 
        // with contributions added at the end of the year, or middle of the year.
        // Standard compound interest: balance = balance * (1 + roi) + savings.
        // If savings are made evenly throughout the year, adding half a year of interest to the new savings is more accurate.
        
        balanceA = balanceA * (1 + roiRate) + savingsA * (1 + roiRate / 2);
        balanceB = balanceB * (1 + roiRate) + savingsB * (1 + roiRate / 2);
        balanceC = balanceC * (1 + roiRate) + savingsC * (1 + roiRate / 2);

        // Calculate Real Net Worth (Adjusted for inflation)
        const inflationDiscount = Math.pow(1 + inflationRate, year);
        const realBalanceA = balanceA / inflationDiscount;
        const realBalanceB = balanceB / inflationDiscount;
        const realBalanceC = balanceC / inflationDiscount;

        schedule.push({
            year,
            income: currentIncome,
            raiseAmount: totalRaise,
            
            // Scenario A (100%)
            savingsA,
            balanceA,
            realBalanceA,
            
            // Scenario B (User %)
            savingsB,
            balanceB,
            realBalanceB,
            
            // Scenario C (0%)
            savingsC,
            balanceC,
            realBalanceC
        });
    }

    const finalYear = schedule[schedule.length - 1];

    return {
        schedule,
        summary: {
            finalIncome: finalYear.income,
            
            // Scenario A
            totalInvestedA: investedA,
            finalBalanceA: finalYear.balanceA,
            finalRealBalanceA: finalYear.realBalanceA,
            
            // Scenario B
            totalInvestedB: investedB,
            finalBalanceB: finalYear.balanceB,
            finalRealBalanceB: finalYear.realBalanceB,
            
            // Scenario C
            totalInvestedC: investedC,
            finalBalanceC: finalYear.balanceC,
            finalRealBalanceC: finalYear.realBalanceC,

            // Insights
            costOfCreepNominal: finalYear.balanceA - finalYear.balanceB,
            costOfCreepReal: finalYear.realBalanceA - finalYear.realBalanceB,
            maxCreepCostNominal: finalYear.balanceA - finalYear.balanceC,
            maxCreepCostReal: finalYear.realBalanceA - finalYear.realBalanceC
        }
    };
}
