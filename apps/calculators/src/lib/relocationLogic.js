/**
 * Logic for Job Relocation Realist Calculator
 */

/**
 * Calculates net monthly income after tax (Simplified estimation)
 * @param {number} annualGross 
 * @param {string} location (Optional for future tax scaling)
 */
export const calculateNetIncome = (annualGross) => {
    // Simplified tax logic: 
    // < 5L: 0%
    // 5-10L: 10%
    // 10-15L: 20%
    // > 15L: 30%
    // This is a placeholder for actual regional tax logic if needed later
    let tax = 0;
    const income = annualGross;

    if (income > 1500000) {
        tax += (income - 1500000) * 0.30;
        tax += 500000 * 0.20;
        tax += 500000 * 0.10;
    } else if (income > 1000000) {
        tax += (income - 1000000) * 0.20;
        tax += 500000 * 0.10;
    } else if (income > 500000) {
        tax += (income - 500000) * 0.10;
    }

    return (income - tax) / 12;
};

/**
 * Main relocation analysis logic
 */
export const calculateRelocationImpact = ({
    currentSalary, // Annual Gross
    currentRent,
    currentExpenses, // Can be total OR breakdown will be summed
    currentExpenseBreakdown = null, // Optional detailed breakdown
    isLivingWithFamily, // Support multiplier
    newSalary, // Annual Gross
    newRent,
    newExpenses, // Can be total OR breakdown will be summed
    newExpenseBreakdown = null, // Optional detailed breakdown
    relocationBonus = 0,
    movingCost = 0,
    setupCost = 0,
    frictionBreakdown = null, // Optional detailed friction costs
    commuteTimeDelta = 0, // Minutes per day extra (+) or less (-)
    currentCommuteMode = 'walk',
    currentCommuteCost = 0,
    newCommuteMode = 'public',
    newCommuteCost = 0
}) => {
    const currentMonthlyNet = calculateNetIncome(currentSalary);
    const newMonthlyNet = calculateNetIncome(newSalary);

    // Use breakdown if provided, otherwise use total
    const finalCurrentExpenses = currentExpenseBreakdown
        ? Object.values(currentExpenseBreakdown).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
        : currentExpenses;

    const finalNewExpenses = newExpenseBreakdown
        ? Object.values(newExpenseBreakdown).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
        : newExpenses;

    // Support multiplier impact: Living with family typically saves ~30% on groceries/utils/maintenance
    const familySupportSavings = isLivingWithFamily ? (finalCurrentExpenses * 0.3) : 0;
    const adjustedCurrentExpenses = finalCurrentExpenses - familySupportSavings;

    const currentSurplus = currentMonthlyNet - currentRent - adjustedCurrentExpenses - currentCommuteCost;
    const newSurplus = newMonthlyNet - newRent - finalNewExpenses - newCommuteCost;

    const monthlySurplusDelta = newSurplus - currentSurplus;

    // Calculate total friction (use breakdown if provided)
    let totalFriction = movingCost + setupCost - relocationBonus;
    if (frictionBreakdown) {
        totalFriction = Object.values(frictionBreakdown).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) - relocationBonus;
    }

    // Sunk Cost Recovery: How many months to pay back the move
    let recoveryMonths = 0;
    if (monthlySurplusDelta > 0 && totalFriction > 0) {
        recoveryMonths = totalFriction / monthlySurplusDelta;
    }

    // Commute Tax: Value of time (using new hourly rate equivalent)
    const newHourlyRate = (newMonthlyNet / 160); // 160 hours monthly average
    const monthlyCommuteTax = (commuteTimeDelta * 22 / 60) * newHourlyRate; // 22 working days

    const adjustedNewSurplus = newSurplus - monthlyCommuteTax;

    return {
        current: {
            monthlyNet: Math.round(currentMonthlyNet),
            surplus: Math.round(currentSurplus),
            expenses: Math.round(adjustedCurrentExpenses),
            totalExpenses: Math.round(finalCurrentExpenses),
            commuteCost: Math.round(currentCommuteCost)
        },
        new: {
            monthlyNet: Math.round(newMonthlyNet),
            surplus: Math.round(newSurplus),
            adjustedSurplus: Math.round(adjustedNewSurplus),
            expenses: Math.round(finalNewExpenses),
            commuteCost: Math.round(newCommuteCost)
        },
        analysis: {
            monthlyDelta: Math.round(monthlySurplusDelta),
            annualDelta: Math.round(monthlySurplusDelta * 12),
            totalFriction: Math.round(totalFriction),
            recoveryMonths: recoveryMonths > 0 ? parseFloat(recoveryMonths.toFixed(1)) : 0,
            commuteCost: Math.round(monthlyCommuteTax),
            isProfitable: monthlySurplusDelta > 0
        }
    };
};

