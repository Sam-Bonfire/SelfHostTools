/**
 * Debt Repayment Race Calculator Amortization Logic
 */

export function calculateDebtRace(debts, totalMonthlyBudget) {
    const minPaymentsSum = debts.reduce((sum, d) => sum + Number(d.minPayment), 0);
    if (totalMonthlyBudget < minPaymentsSum) {
        return {
            error: true,
            message: `Your monthly budget (₹${totalMonthlyBudget}) is less than the sum of minimum payments (₹${minPaymentsSum}). You must pay at least the minimums!`,
            minPaymentsSum
        };
    }

    const snowballAmortization = amortizeDebts(debts, totalMonthlyBudget, 'snowball');
    const avalancheAmortization = amortizeDebts(debts, totalMonthlyBudget, 'avalanche');

    return {
        error: false,
        snowball: snowballAmortization,
        avalanche: avalancheAmortization,
        minPaymentsSum
    };
}

function amortizeDebts(initialDebts, monthlyBudget, strategy) {
    // Clone debts to avoid mutating references
    let debts = initialDebts.map(d => ({
        ...d,
        balance: Number(d.balance),
        originalBalance: Number(d.balance),
        interestRate: Number(d.interestRate) / 100,
        minPayment: Number(d.minPayment)
    }));

    const monthlyHistory = [];
    let totalInterestPaid = 0;
    let months = 0;

    // Track original starting total
    const startingTotalBalance = debts.reduce((sum, d) => sum + d.balance, 0);

    // Run monthly simulation loop (cap at 600 months = 50 years to prevent infinite loop)
    while (debts.some(d => d.balance > 0) && months < 600) {
        months++;
        let interestThisMonth = 0;

        // 1. Accrue monthly interest on each active debt
        debts = debts.map(d => {
            if (d.balance <= 0) return d;
            const interest = d.balance * (d.interestRate / 12);
            interestThisMonth += interest;
            return {
                ...d,
                balance: d.balance + interest
            };
        });

        totalInterestPaid += interestThisMonth;

        // 2. Pay minimum payments
        let remainingBudget = monthlyBudget;
        let activeDebtsCount = 0;

        // Pay minimums or balances, whichever is less
        debts = debts.map(d => {
            if (d.balance <= 0) return d;
            activeDebtsCount++;
            const payment = Math.min(d.balance, d.minPayment);
            remainingBudget -= payment;
            return {
                ...d,
                balance: d.balance - payment
            };
        });

        // 3. Apply snowflake / excess budget based on strategy sorting
        while (remainingBudget > 0) {
            const activeDebts = debts.filter(d => d.balance > 0);
            if (activeDebts.length === 0) break; // All debts paid off!
            
            if (strategy === 'snowball') {
                // Snowball: Smallest balance first
                activeDebts.sort((a, b) => a.balance - b.balance);
            } else {
                // Avalanche: Highest interest rate first
                activeDebts.sort((a, b) => b.interestRate - a.interestRate);
            }

            const targetDebtId = activeDebts[0].id;
            const targetDebt = debts.find(d => d.id === targetDebtId);
            const extraPayment = Math.min(targetDebt.balance, remainingBudget);
            
            remainingBudget -= extraPayment;
            
            debts = debts.map(d => {
                if (d.id !== targetDebtId) return d;
                return {
                    ...d,
                    balance: d.balance - extraPayment
                };
            });
        }

        const currentTotalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
        
        monthlyHistory.push({
            month: months,
            totalRemaining: Math.round(currentTotalBalance),
            interestPaid: Math.round(interestThisMonth),
            cumulativeInterest: Math.round(totalInterestPaid),
            progressPercent: Number(((1 - currentTotalBalance / startingTotalBalance) * 100).toFixed(1)),
            debtBalances: debts.map(d => ({ id: d.id, name: d.name, originalBalance: d.originalBalance, balance: Math.max(0, Math.round(d.balance)) }))
        });
    }

    return {
        months,
        totalInterestPaid: Math.round(totalInterestPaid),
        history: monthlyHistory
    };
}
