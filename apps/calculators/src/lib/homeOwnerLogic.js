
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
 * @returns {Object} Sinking fund details including total monthly cost and item breakdown.
 */
export const calculateSinkingFund = (items) => {
    let totalMonthlySinkingFund = 0;
    const itemDetails = items.map(item => {
        const remainingYears = Math.max(0, item.lifespanYears - item.currentAgeYears);
        const remainingMonths = remainingYears * 12;

        let monthlyCost = 0;
        if (remainingMonths > 0) {
            monthlyCost = item.replacementCost / remainingMonths;
        } else {
            // If lifespan exceeded, assume immediate replacement needed (spread over 1 month? or treated as immediate liability)
            // For monthly recurring cost context, this is tricky. 
            // Let's assume a "Catch-up" mode where if it's dead, you should have saved it already.
            // But for forward looking "Cashflow", we might just show a high warning.
            // For the specific "Sinking Fund Cost" metric (saving for *future*), 
            // if it is 0 years left, the cost is effectively infinite or immediate. 
            // However, to keep the calculator usable, let's treat it as "Time to Bomb" = 0.
            // The PRD says: "CRITICAL. 0 years life. Budget $8k immediately."
            // So this doesn't add to the *monthly* sinking fund unless we assume a loan for it.
            // Let's explicitly separate "Immediate Cash Needed" vs "Monthly Saving for Future".
            // But to simplify the "Monthly Cost" metric, we probably shouldn't add a $8000/mo charge.
            // We will return a separate flag or value for "Immediate Liability".
            monthlyCost = 0;
        }

        totalMonthlySinkingFund += monthlyCost;

        return {
            ...item,
            remainingYears,
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
 * @param {number} propertyPrice - Total price of the property.
 * @param {number} downPayment - Down payment amount.
 * @param {number} interestRate - Annual mortgage interest rate (%).
 * @param {number} loanTermYears - Mortgage term in years.
 * @param {Array} auditItems - List of maintenance items.
 * @param {number} appreciationRate - Annual property appreciation rate (%).
 * @param {number} opportunityCostRate - Annual return rate on investing down payment (%).
 * @returns {Object} Detailed cost breakdown.
 */
export const calculateHomeOwnerRealism = ({
    propertyPrice,
    downPayment,
    interestRate,
    loanTermYears,
    auditItems,
    appreciationRate = 3,
    opportunityCostRate = 7
}) => {
    const loanAmount = propertyPrice - downPayment;
    const monthlyMortgage = calculateMortgage(loanAmount, interestRate, loanTermYears);

    // Opportunity Cost: What the down payment would earn if invested
    const monthlyOpportunityCost = (downPayment * (opportunityCostRate / 100)) / 12;

    const { totalMonthlySinkingFund, itemDetails, immediateLiability } = calculateSinkingFund(auditItems);

    // Total "Real" Monthly Cost
    const trueMonthlyCost = monthlyMortgage + totalMonthlySinkingFund + monthlyOpportunityCost;

    // Projected Equity (simplified) could be added here later

    return {
        financials: {
            loanAmount: Math.round(loanAmount),
            monthlyMortgage: Math.round(monthlyMortgage),
            monthlyOpportunityCost: Math.round(monthlyOpportunityCost),
            totalMonthlySinkingFund: Math.round(totalMonthlySinkingFund),
            trueMonthlyCost: Math.round(trueMonthlyCost),
            immediateLiability: Math.round(immediateLiability)
        },
        items: itemDetails
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
