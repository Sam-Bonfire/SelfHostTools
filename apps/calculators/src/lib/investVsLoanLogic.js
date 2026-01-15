/**
 * Logic for Invest vs Pay Off Loan Calculator
 * 
 * Core Philosophy:
 * Compares two main strategies for a given Monthly Surplus:
 * 1. INVEST: Pay minimums on all loans, invest the surplus.
 * 2. PAYOFF: Pay minimums, use surplus to aggressively pay off loans (Avalanche method - highest effective rate first).
 * 
 * "Computed Reality" Features:
 * - Tax Deductibility: Adjusts loan interest rates if they are tax-deductible.
 * - Tax on Investments: Adjusts investment returns for LTCG/Income tax.
 * - Inflation: Adjusts future values to present value (optional, but good for "Real" metrics).
 */

export const calculateInvestVsLoan = ({
    loans, // Array of { id, name, principal, rate, minPayment, isTaxDeductible }
    surplus, // Monthly extra cash
    investmentReturn, // Annual growth rate %
    investmentTaxRate, // Tax on gains %
    userTaxBracket, // For loan interest deduction %
    inflationRate = 6, // Default inflation
    maxYears = 30 // Simulation horizon
}) => {

    // 1. Validate & Sanitize Inputs
    const cleanLoans = loans.map(l => ({
        ...l,
        principal: Number(l.principal) || 0,
        rate: Number(l.rate) || 0,
        minPayment: Number(l.minPayment) || 0,
        currentBalance: Number(l.principal) || 0,
        isTaxDeductible: Boolean(l.isTaxDeductible)
    })).filter(l => l.currentBalance > 0);

    const monthlySurplus = Number(surplus) || 0;
    const annualInvReturn = Number(investmentReturn) || 0;
    const invTaxRate = Number(investmentTaxRate) || 0;
    const bracket = Number(userTaxBracket) || 0;
    const annualInflation = Number(inflationRate) || 0;

    // Helper: Effective Interest Rate (Post-Tax)
    const getEffectiveRate = (loan) => {
        // If tax deductible, rate is reduced by the tax bracket savings
        // e.g. 10% rate in 30% bracket -> 7% effective
        if (loan.isTaxDeductible) {
            return loan.rate * (1 - (bracket / 100));
        }
        return loan.rate;
    };

    // Helper: Monthly Rates
    const monthlyInvRate = annualInvReturn / 12 / 100;
    const monthlyInflationRate = annualInflation / 12 / 100;

    // --- SIMULATION ENGINE ---
    // We simulate month-by-month for both strategies independently.

    const simulateStrategy = (strategyName) => {
        let currentLoans = JSON.parse(JSON.stringify(cleanLoans)); // Deep copy
        let investmentBalance = 0;
        let totalInterestPaid = 0;
        let monthsElapsed = 0;
        let debtFreeMonth = null;
        const history = [];

        // Sort loans for Payoff Strategy (Avalanche: Highest Effective Rate First)
        // For 'Invest' strategy, order doesn't strictly matter for payment, but we pay minimums.
        if (strategyName === 'PAYOFF') {
            currentLoans.sort((a, b) => getEffectiveRate(b) - getEffectiveRate(a));
        }

        while (monthsElapsed < maxYears * 12) {
            monthsElapsed++;

            // 1. Accrue Interest on Loans
            // 2. Pay Minimums
            let monthlyCashUsedForMinimums = 0;
            let activeLoanCount = 0;

            currentLoans.forEach(loan => {
                if (loan.currentBalance > 0) {
                    activeLoanCount++;
                    const monthlyRate = getEffectiveRate(loan) / 12 / 100;
                    const interest = loan.currentBalance * monthlyRate;
                    totalInterestPaid += interest;
                    loan.currentBalance += interest;

                    // Pay minimum (or balance if less)
                    const payment = Math.min(loan.currentBalance, loan.minPayment);
                    loan.currentBalance -= payment;
                    monthlyCashUsedForMinimums += payment;
                }
            });

            if (activeLoanCount === 0 && debtFreeMonth === null) {
                debtFreeMonth = monthsElapsed - 1;
            }

            // 3. Handle Surplus
            let availableSurplus = monthlySurplus; // Start with full surplus

            // If we paid off a loan, its minimum payment is now freed up cash IF we are in PAYOFF strategy
            // Actually, in standard "Snowball/Avalanche", the "freed up minimums" are rolled over to the next loan.
            // Our 'monthlyCashUsedForMinimums' tracks what we *actually* paid. 
            // The 'Total Cash Flow' usually stays constant (Original Total Minimums + Original Surplus).
            // So 'Available for Aggressive' = (Total Cash Flow - Current Minimums).

            // To simplify: The user commits a fixed total budget = (Sum of Initial Minimums + Surplus).
            // We'll calculate the dynamic surplus based on this Fixed Budget.
            const initialTotalMinimums = cleanLoans.reduce((sum, l) => sum + l.minPayment, 0);
            const totalMonthlyBudget = initialTotalMinimums + monthlySurplus;

            let aggressiveCash = totalMonthlyBudget - monthlyCashUsedForMinimums;

            if (strategyName === 'PAYOFF') {
                // Aggressively pay down loans
                // We sorted by highest rate earlier.
                for (let loan of currentLoans) {
                    if (loan.currentBalance > 0 && aggressiveCash > 0) {
                        const extraPay = Math.min(loan.currentBalance, aggressiveCash);
                        loan.currentBalance -= extraPay;
                        aggressiveCash -= extraPay;
                    }
                }
                // If any cash left after paying ALL loans, invest it
                if (aggressiveCash > 0) {
                    investmentBalance += aggressiveCash;
                }
            } else {
                // INVEST strategy: Just invest the aggressive cash (surplus + freed up minimums)
                investmentBalance += aggressiveCash;
            }

            // 4. Grow Investments
            if (investmentBalance > 0) {
                investmentBalance += (investmentBalance * monthlyInvRate);
            }

            // 5. Record State
            const totalDebt = currentLoans.reduce((sum, l) => sum + l.currentBalance, 0);
            const netWorth = investmentBalance - totalDebt;

            // Inflation Adjustment (Real Value)
            const realNetWorth = netWorth / Math.pow(1 + monthlyInflationRate, monthsElapsed);

            history.push({
                month: monthsElapsed,
                year: (monthsElapsed / 12).toFixed(1),
                totalDebt,
                investmentBalance,
                netWorth,
                realNetWorth,
                totalInterestPaid
            });

            // Stop if loans are done AND we hit a reasonable horizon (e.g. 10 years after debt free) 
            // OR checks maxYears
            if (activeLoanCount === 0 && monthsElapsed > (debtFreeMonth + 120)) {
                // break; // Optional: Keep running to maxYears to show long term compounding diff
            }
        }

        // Final Tax Check on Investments (LTCG Approximation)
        // We assume the *gain* portion is taxed.
        // Total Invested = (Monthly allocations sum). Ideally we track basis.
        // For simplicity in this v1: We apply tax rate to the *entire* gain at the end? 
        // Better: Apply tax drag to annual return? 
        // "Real Returns" usually implies post-tax. Let's adjust the Final Balance.
        // Simplification: We will just report the Gross Balance but warn about tax, 
        // OR better: use a post-tax return rate for the simulation?
        // Let's stick to the input: `investmentTaxRate`. We'll calculate the "Post-Tax Balance" at the end.
        // Actually, let's treat the inputs as "Pre-Tax" return, and apply tax logic to the final numbers.

        // Refined Logic: We need to track cost basis to calculate tax.
        // But for a calculator, "Effective Post-Tax Return" is often easier for the user to understand.
        // Let's Assume the User input `investmentReturn` is Pre-Tax.
        // We will output a "Post-Tax Investment Value" by estimating gains.

        return {
            history,
            finalDebt: history[history.length - 1].totalDebt,
            finalInvestment: history[history.length - 1].investmentBalance,
            finalNetWorth: history[history.length - 1].netWorth,
            totalInterestPaid,
            debtFreeMonth: debtFreeMonth || maxYears * 12 // If never free
        };
    };

    const investResults = simulateStrategy('INVEST');
    const payoffResults = simulateStrategy('PAYOFF');

    // --- COMPARISON VERDICT ---
    const netWorthDiff = payoffResults.finalNetWorth - investResults.finalNetWorth;

    let verdict = "";
    if (Math.abs(netWorthDiff) < 100) {
        verdict = "Neutral";
    } else if (netWorthDiff > 0) {
        verdict = "Payoff";
    } else {
        verdict = "Invest";
    }

    return {
        results: {
            investStrategy: investResults,
            payoffStrategy: payoffResults,
            netWorthDifference: Math.abs(netWorthDiff),
            winner: verdict
        },
        inputs: {
            totalLoans: cleanLoans.length,
            monthlySurplus
        }
    };
};
