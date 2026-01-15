
/**
 * Calculates the monthly mortgage payment.
 * @param {number} principal - Loan amount (Property Price - Down Payment).
 * @param {number} rate - Annual interest rate in percentage.
 * @param {number} years - Loan tenure in years.
 * @returns {number} Monthly mortgage payment.
 */
export const calculateMortgage = (principal, rate, years) => {
    if (principal <= 0 || rate <= 0 || years <= 0) return 0;

    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;

    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
};

/**
 * Calculates the sinking fund requirements for a list of items.
 * @param {Array} items - List of items with { name, replacementCost, lifespanYears, currentAgeYears }.
 * @param {number} inflationRate - Annual maintenance inflation rate.
 * @returns {Object} Sinking fund details including total monthly cost and item breakdown.
 */
export const calculateSinkingFund = (items, inflationRate = 5) => {
    let totalMonthlySinkingFund = 0;
    const itemDetails = items.map(item => {
        const remainingYears = Math.max(0, item.lifespanYears - item.currentAgeYears);
        const remainingMonths = remainingYears * 12;

        // Inflate the replacement cost based on when it will occur
        const inflatedCost = item.replacementCost * Math.pow(1 + (inflationRate / 100), remainingYears);

        let monthlyCost = 0;
        if (remainingMonths > 0) {
            monthlyCost = inflatedCost / remainingMonths;
        }

        totalMonthlySinkingFund += monthlyCost;

        return {
            ...item,
            remainingYears,
            inflatedCost,
            monthlyCost
        };
    });

    return {
        totalMonthlySinkingFund,
        itemDetails,
        immediateLiability: items.filter(i => i.currentAgeYears >= i.lifespanYears).reduce((acc, i) => acc + i.replacementCost, 0)
    };
};

/**
 * Calculates the comprehensive cost of home ownership.
 */
export const calculateHomeOwnerRealism = ({
    propertyPrice,
    downPayment,
    interestRate,
    loanTermYears,
    auditItems,
    appreciationRate = 3,
    opportunityCostRate = 7,
    maintenanceInflation = 5
}) => {
    const loanAmount = propertyPrice - downPayment;
    const monthlyMortgage = calculateMortgage(loanAmount, interestRate, loanTermYears);

    // Opportunity Cost: What the down payment would earn if invested
    const monthlyOpportunityCost = (downPayment * (opportunityCostRate / 100)) / 12;

    const { totalMonthlySinkingFund, itemDetails, immediateLiability } = calculateSinkingFund(auditItems, maintenanceInflation);

    // Total "Real" Monthly Cost
    const trueMonthlyCost = monthlyMortgage + totalMonthlySinkingFund + monthlyOpportunityCost;

    // Projected Equity & Wealth Schedule
    const schedule = [];
    const monthlyRate = interestRate / 100 / 12;
    const months = loanTermYears * 12;
    let currentLoanBalance = loanAmount;
    let totalSinkingFundSaved = 0;
    let alternativeInvestedDP = downPayment;

    for (let m = 1; m <= months; m++) {
        const interestPaid = currentLoanBalance * monthlyRate;
        const principalPaid = monthlyMortgage - interestPaid;
        currentLoanBalance = Math.max(0, currentLoanBalance - principalPaid);

        totalSinkingFundSaved += totalMonthlySinkingFund;
        alternativeInvestedDP *= (1 + (opportunityCostRate / 100 / 12));

        if (m % 12 === 0) {
            const year = m / 12;
            const currentPropertyValue = propertyPrice * Math.pow(1 + (appreciationRate / 100), year);
            const homeEquity = currentPropertyValue - currentLoanBalance;

            schedule.push({
                year,
                label: `Year ${year}`,
                propertyValue: Math.round(currentPropertyValue),
                loanBalance: Math.round(currentLoanBalance),
                homeEquity: Math.round(homeEquity), // Asset - Liability
                sinkingFundAccrued: Math.round(totalSinkingFundSaved),
                opportunityCostWealth: Math.round(alternativeInvestedDP), // What you'd have if you didn't buy
                balance: Math.round(homeEquity) // Using balance for standard schedule display
            });
        }
    }

    return {
        financials: {
            loanAmount: Math.round(loanAmount),
            monthlyMortgage: Math.round(monthlyMortgage),
            monthlyOpportunityCost: Math.round(monthlyOpportunityCost),
            totalMonthlySinkingFund: Math.round(totalMonthlySinkingFund),
            trueMonthlyCost: Math.round(trueMonthlyCost),
            immediateLiability: Math.round(immediateLiability),
            finalEquity: schedule[schedule.length - 1]?.homeEquity || 0,
            finalOppCost: schedule[schedule.length - 1]?.opportunityCostWealth || 0
        },
        items: itemDetails,
        schedule
    };
};

/**
 * Generates data for the "Timeline of Doom" (Explosion list).
 * @param {Array} items - Processed items from calculateSinkingFund (must have remainingYears).
 * @param {number} yearsToProject - How many years to look ahead.
 * @returns {Array} Timeline events.
 */
export const generateTimelineEvents = (items, yearsToProject = 15) => {
    const events = [];

    items.forEach(item => {
        // First failure
        let yearOfFailure = item.remainingYears;

        // If it's already dead, it fails at year 0
        if (yearOfFailure <= 0) {
            events.push({
                year: 0,
                item: item.name,
                cost: item.replacementCost,
                type: 'immediate'
            });
            // Assumed replaced immediately, so next failure is after full lifespan
            yearOfFailure = item.lifespanYears;
        }

        while (yearOfFailure <= yearsToProject) {
            events.push({
                year: Math.floor(yearOfFailure), // Floor to nearest year for bucket
                item: item.name,
                cost: item.replacementCost,
                type: 'future'
            });
            yearOfFailure += item.lifespanYears;
        }
    });

    return events.sort((a, b) => a.year - b.year);
};
