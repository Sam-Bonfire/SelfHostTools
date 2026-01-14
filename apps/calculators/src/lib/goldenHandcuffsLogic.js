
/**
 * Golden Handcuffs Logic
 * 
 * Core calculations for comparing Current Job (with unvested equity/clawbacks)
 * vs New Job (with fresh equity).
 */

/**
 * Calculates the liquid value of an equity grant.
 * @param {Object} grant - { type: 'RSU'|'Option', count, price, strike }
 * @returns {number} - The total liquid value (current).
 */
export const calculateGrantValue = (grant) => {
    const { type, count, price, strike = 0 } = grant;

    if (type === 'RSU') {
        return count * price;
    }

    if (type === 'Option') {
        // Intrinsic value only (Current - Strike). If underwater, value is 0.
        const spread = Math.max(0, price - strike);
        return count * spread;
    }

    return 0;
};

/**
 * Calculates the total annualized compensation for a role.
 * 
 * Formula: Base + Bonus + (Total Unvested Equity Value / Max Vesting Years)
 * 
 * We use "Max Vesting Years" because typically equity grants overlap or are treated 
 * as a total bucket over a horizon. If strict frequency is provided, we could match exact cashflows,
 * but for "True Annual Comp", averaging the "unvested bucket" over its remaining life is the standard heuristic.
 * 
 * @param {Object} job - { baseSalary, bonus, equity: [] }
 * @returns {Object} - { totalAnnualComp, equityAnnualized, hardCash }
 */
export const calculateAnnualizedComp = (job) => {
    const { baseSalary = 0, bonus = 0, equity = [] } = job;

    let totalEquityValue = 0;
    let maxYears = 0;

    equity.forEach(grant => {
        const value = calculateGrantValue(grant);
        totalEquityValue += value;
        if (grant.vestingYears > maxYears) {
            maxYears = grant.vestingYears;
        }
    });

    // Avoid division by zero
    const annualizedEquity = maxYears > 0 ? (totalEquityValue / maxYears) : 0;

    return {
        totalAnnualComp: baseSalary + bonus + annualizedEquity,
        equityAnnualized: annualizedEquity,
        hardCash: baseSalary + bonus,
        totalEquityValue,
        maxVestingYears: maxYears
    };
};

/**
 * Calculates the immediate cost of leaving (The "Freedom Tax").
 * 
 * @param {Object} liabilities - { clawbackAmount }
 * @param {Object} currentJob - The current job object (to calc forfeited equity)
 * @returns {Object} - { totalCost, clawback, forfeitedEquity }
 */
export const calculateCostOfLeaving = (liabilities, currentJob) => {
    const { clawbackAmount = 0 } = liabilities;

    let forfeitedEquity = 0;
    if (currentJob.equity) {
        currentJob.equity.forEach(grant => {
            forfeitedEquity += calculateGrantValue(grant);
        });
    }

    return {
        totalCost: clawbackAmount + forfeitedEquity,
        clawback: clawbackAmount,
        forfeitedEquity
    };
};

/**
 * Generates a simplistic cumulative cashflow projection.
 * 
 * @param {Object} currentJob 
 * @param {Object} newJob 
 * @param {Object} liabilities 
 * @param {number} years - Number of years to project (e.g. 4)
 * @returns {Object} - { currentData: [], newData: [], breakEvenYear: ?number }
 */
export const generateProjections = (currentJob, newJob, liabilities, years = 4) => {
    const currentStats = calculateAnnualizedComp(currentJob);
    const newStats = calculateAnnualizedComp(newJob);
    const { clawback } = calculateCostOfLeaving(liabilities, currentJob);

    const currentData = [];
    const newData = [];

    let currentCumulative = 0;
    let newCumulative = -clawback; // Start in the hole if you leave

    let breakEvenYear = null;

    for (let i = 1; i <= years; i++) {
        // Current Job Accumulation
        // Simplification: Assume linear vesting for the projection line
        currentCumulative += currentStats.totalAnnualComp;

        // New Job Accumulation
        newCumulative += newStats.totalAnnualComp;

        currentData.push(Math.round(currentCumulative));
        newData.push(Math.round(newCumulative));

        if (breakEvenYear === null && newCumulative >= currentCumulative) {
            breakEvenYear = i; // Rough "Year X" break-even
        }
    }

    return {
        currentData,
        newData,
        breakEvenYear // null if never catches up in window
    };
};

/**
 * Analyze Alerts (e.g., upcoming vests)
 * checks if any equity grant has a nextVestDate within 'weeks' threshold
 */
export const analyzeAlerts = (currentJob, weeksThreshold = 4) => {
    const alerts = [];
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + (weeksThreshold * 7));

    if (currentJob.equity) {
        currentJob.equity.forEach(grant => {
            if (grant.nextVestDate) {
                const vestDate = new Date(grant.nextVestDate);
                if (vestDate > now && vestDate <= thresholdDate) {
                    // Logic to estimate vest amount (simplistic: Total / (Years * Freq))
                    // For now, let's just warn generic
                    alerts.push({
                        type: 'vesting_soon',
                        date: grant.nextVestDate,
                        message: `Warning: You have a vest coming up on ${grant.nextVestDate}. waiting might contain significant value.`
                    });
                }
            }
        });
    }

    return alerts;
};
