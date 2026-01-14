export const calculateFreelanceIncome = ({
    hourlyRate,
    billableHours,
    vacationWeeks,
    adminTimePercent,
    taxRate,
    isPresumptiveTax,
    monthlyExpenses,
    targetMonthlyIncome,
    projectHours,
    projectBuffer,
    projectDirectCosts
}) => {
    const effectiveMonthsWorked = 12 - (parseFloat(vacationWeeks) || 0) / 4.33;
    const annualGross = (parseFloat(hourlyRate) || 0) * (parseFloat(billableHours) || 0) * effectiveMonthsWorked;
    const monthlyGrossAvg = annualGross / 12;

    const annualExpenses = monthlyExpenses * 12;

    let taxableIncome = 0;
    if (isPresumptiveTax) {
        taxableIncome = annualGross * 0.5;
    } else {
        taxableIncome = Math.max(0, annualGross - annualExpenses);
    }
    const annualTax = taxableIncome * ((parseFloat(taxRate) || 0) / 100);
    const monthlyTax = annualTax / 12;

    const annualNet = annualGross - annualExpenses - annualTax;
    const monthlyNet = annualNet / 12;

    const annualBillableHrs = (parseFloat(billableHours) || 0) * effectiveMonthsWorked;
    const totalAnnualHrs = annualBillableHrs / (1 - ((parseFloat(adminTimePercent) || 0) / 100));
    const realHourlyRate = totalAnnualHrs > 0 ? annualNet / totalAnnualHrs : 0;

    const targetAnnualNet = (parseFloat(targetMonthlyIncome) || 0) * 12;
    let requiredAnnualGross = 0;

    if (isPresumptiveTax) {
        const taxFactor = (parseFloat(taxRate) || 0) / 100 * 0.5;
        requiredAnnualGross = (targetAnnualNet + annualExpenses) / (1 - taxFactor);
    } else {
        const taxFactor = (parseFloat(taxRate) || 0) / 100;
        requiredAnnualGross = (targetAnnualNet / (1 - taxFactor)) + annualExpenses;
    }
    const requiredRate = annualBillableHrs > 0 ? requiredAnnualGross / annualBillableHrs : 0;

    const bufferMultiplier = 1 + ((parseFloat(projectBuffer) || 0) / 100);
    const estHours = parseFloat(projectHours) || 0;
    const costs = parseFloat(projectDirectCosts) || 0;

    const minProjectFee = (realHourlyRate * estHours * bufferMultiplier) + costs;
    const recProjectFee = (requiredRate * estHours * bufferMultiplier) + costs;

    return {
        grossMonthly: Math.round(monthlyGrossAvg),
        netTakeHome: Math.round(monthlyNet),
        realHourlyRate: Math.round(realHourlyRate),
        totalExpenses: Math.round(monthlyExpenses),
        effectiveTaxAmount: Math.round(monthlyTax),
        totalHoursWorked: Math.round(totalAnnualHrs / 12),
        requiredRate: Math.round(requiredRate),
        projectEstimates: {
            min: Math.round(minProjectFee),
            recommended: Math.round(recProjectFee)
        }
    };
};

export const calculateAdminTime = (breakdown, billableHours) => {
    const getMonthlyHours = (val, period) => {
        const v = parseFloat(val) || 0;
        if (period === 'day') return v * 20;
        if (period === 'week') return v * 4.33;
        return v;
    };

    const totalAdminHours =
        getMonthlyHours(breakdown.email.hours, breakdown.email.period) +
        getMonthlyHours(breakdown.sales.hours, breakdown.sales.period) +
        getMonthlyHours(breakdown.finance.hours, breakdown.finance.period) +
        getMonthlyHours(breakdown.learning.hours, breakdown.learning.period) +
        getMonthlyHours(breakdown.misc.hours, breakdown.misc.period);

    const totalWorkHours = (parseFloat(billableHours) || 0) + totalAdminHours;

    if (totalWorkHours > 0) {
        return Math.round((totalAdminHours / totalWorkHours) * 100);
    }

    return 0;
};
