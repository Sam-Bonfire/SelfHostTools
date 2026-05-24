export function calculateSoloFounderRunway({
    mrr = 50000,
    averageRevenuePerUser = 1000,
    churnRatePercent = 5,
    stripeFeePercent = 2.9,
    stripeFixedFee = 25,
    serverCosts = 2000,
    toolCosts = 3000,
    taxRatePercent = 10,
    dayJobSalary = 100000,
    weeklyHoursDedicated = 20
}) {
    // 1. Basic conversions
    const customers = mrr / averageRevenuePerUser;
    
    // 2. Churn calculation
    const monthlyChurnedRevenue = mrr * (churnRatePercent / 100);
    const retainedRevenue = mrr - monthlyChurnedRevenue;

    // 3. Payment Gateway Fees (Stripe)
    // Applied to the retained revenue, assuming fees are taken on successful charges
    const stripeVariableFee = retainedRevenue * (stripeFeePercent / 100);
    // Fixed fee per transaction
    const retainedCustomers = customers * (1 - (churnRatePercent / 100));
    const stripeFixedFeeTotal = retainedCustomers * stripeFixedFee;
    
    const totalStripeFees = stripeVariableFee + stripeFixedFeeTotal;

    // 4. Gross Profit (Revenue - Payment Fees - Infrastructure)
    const totalOverhead = serverCosts + toolCosts;
    const grossProfit = retainedRevenue - totalStripeFees - totalOverhead;

    // 5. Net Profit (After Taxes)
    let netProfit = 0;
    let taxes = 0;
    if (grossProfit > 0) {
        taxes = grossProfit * (taxRatePercent / 100);
        netProfit = grossProfit - taxes;
    }

    // 6. Break-Even Calculations
    // How much MRR do we need just to cover Stripe fees + Overhead?
    // Let overhead = O
    // Target MRR = O / (1 - Churn - StripeVariable% - (StripeFixed / ARPU))
    // We ignore tax for break-even since tax is 0 at break-even.
    
    const marginPerUserPercent = 1 - (churnRatePercent / 100) - (stripeFeePercent / 100) - (stripeFixedFee / averageRevenuePerUser);
    
    let breakEvenMRR = 0;
    if (marginPerUserPercent > 0) {
        breakEvenMRR = totalOverhead / marginPerUserPercent;
    } else {
        breakEvenMRR = Infinity; // Business model is fundamentally unprofitable
    }

    // 7. Freedom Calculations (Replace Day Job)
    // We need Net Profit = Day Job Salary
    // Net Profit = (Target MRR * marginPerUserPercent - totalOverhead) * (1 - taxRate)
    // Day Job / (1 - taxRate) = Target MRR * margin - Overhead
    // Target MRR = ((Day Job / (1 - taxRate)) + Overhead) / margin
    
    let freedomMRR = 0;
    if (marginPerUserPercent > 0 && taxRatePercent < 100) {
        const requiredGrossProfit = dayJobSalary / (1 - (taxRatePercent / 100));
        freedomMRR = (requiredGrossProfit + totalOverhead) / marginPerUserPercent;
    } else {
        freedomMRR = Infinity;
    }

    // 8. Net-to-Hour Ratio
    // If you work X hours a week on this, how much are you making per hour?
    const monthlyHours = weeklyHoursDedicated * 4.33; // Average weeks per month
    const trueHourlyRate = netProfit / monthlyHours;

    return {
        financials: {
            retainedRevenue,
            monthlyChurnedRevenue,
            totalStripeFees,
            totalOverhead,
            grossProfit,
            taxes,
            netProfit
        },
        milestones: {
            breakEvenMRR,
            freedomMRR,
            isProfitable: netProfit > 0,
            hasReachedFreedom: netProfit >= dayJobSalary
        },
        metrics: {
            trueHourlyRate,
            customersNeededForFreedom: freedomMRR > 0 && freedomMRR !== Infinity ? Math.ceil(freedomMRR / averageRevenuePerUser) : 0,
            marginPerUserPercent: marginPerUserPercent * 100
        }
    };
}
