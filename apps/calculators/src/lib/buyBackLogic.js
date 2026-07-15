/**
 * Time Buy-Back Delegate Calculator Logic
 */
export const calculateTimeBuyBack = ({
  jobType = 'freelance', // 'freelance' or 'salaried'

  // Freelance Specifics
  hourlyRate = 1000,
  hoursPerWeek = 30,
  vacationWeeks = 4,
  adminTimePercent = 20,
  isPresumptiveTax = false, // 44ADA 50% deduction
  freelanceTaxRate = 20,

  // Salaried Specifics
  salariedGross = 1200000, // Annual gross salary
  salariedTaxRate = 20,
  salariedHoursPerWeek = 40,
  commuteHoursPerWeek = 5,
  unpaidOvertimeHours = 5,

  // Delegation Task Specifics
  taskCost = 500, // Cost to outsource the task
  hoursSaved = 2, // Hours saved by outsourcing
  energyMultiplier = 1.5, // Psychological Surcharge: 1.0x to 3.0x
  reinvestmentType = 'leisure' // 'leisure', 'upskilling', 'work'
}) => {
  let annualGross = 0;
  let annualNet = 0;
  let annualTax = 0;
  let totalAnnualHours = 0;
  let trueNetHourlyWage = 0;

  // 1. Calculate Baseline Net Income and True Hours
  if (jobType === 'freelance') {
    const rate = parseFloat(hourlyRate) || 0;
    const hpw = parseFloat(hoursPerWeek) || 0;
    const vac = parseFloat(vacationWeeks) || 0;
    const admin = parseFloat(adminTimePercent) || 0;
    const taxR = parseFloat(freelanceTaxRate) || 0;

    const workingWeeks = Math.max(0, 52 - vac);
    annualGross = workingWeeks * hpw * rate;

    const taxableIncome = isPresumptiveTax ? annualGross * 0.5 : annualGross;
    annualTax = taxableIncome * (taxR / 100);
    annualNet = annualGross - annualTax;

    // Total hours freelancer actually spends working (including unbilled admin time)
    const activeHoursPerWeek = hpw / (1 - admin / 100);
    const activeHours = workingWeeks * activeHoursPerWeek;
    totalAnnualHours = activeHours;

    // True net wage is what they take home per total active hour worked
    trueNetHourlyWage = totalAnnualHours > 0 ? annualNet / totalAnnualHours : 0;
  } else {
    const gross = parseFloat(salariedGross) || 0;
    const taxR = parseFloat(salariedTaxRate) || 0;
    const hpw = parseFloat(salariedHoursPerWeek) || 0;
    const commute = parseFloat(commuteHoursPerWeek) || 0;
    const ot = parseFloat(unpaidOvertimeHours) || 0;

    annualGross = gross;
    annualTax = gross * (taxR / 100);
    annualNet = gross - annualTax;

    // Total committed hours: official work hours + commute + overtime
    const weeklyCommitted = hpw + commute + ot;
    totalAnnualHours = weeklyCommitted * 52;
    trueNetHourlyWage = totalAnnualHours > 0 ? annualNet / totalAnnualHours : 0;
  }

  // 2. Task Delegation Analysis
  const cost = parseFloat(taskCost) || 0;
  const hours = parseFloat(hoursSaved) || 0;
  const mult = parseFloat(energyMultiplier) || 1.0;

  // Psychological Surcharged value of time
  const socraticTimeValue = trueNetHourlyWage * mult;

  let reinvestmentValue = 0;
  if (reinvestmentType === 'work') {
    // Earn at true net hourly wage
    reinvestmentValue = trueNetHourlyWage * hours;
  } else if (reinvestmentType === 'upskilling') {
    // Upskilling has a future multiplier (e.g. 1.5x of net rate)
    reinvestmentValue = trueNetHourlyWage * hours * 1.5;
  } else {
    // Leisure is valued at socratic surcharged value
    reinvestmentValue = socraticTimeValue * hours;
  }

  // Delegation Gain/Loss
  // Net Gain = Value of Reinvested/Surcharged Saved Hours - Cost of Outsource
  const delegationGain = reinvestmentValue - cost;
  const breakEvenCostPerHour = hours > 0 ? reinvestmentValue / hours : 0;

  return {
    baseline: {
      annualGross: Math.round(annualGross),
      annualTax: Math.round(annualTax),
      annualNet: Math.round(annualNet),
      totalAnnualHours: Math.round(totalAnnualHours),
      trueNetHourlyWage: parseFloat(trueNetHourlyWage.toFixed(2))
    },
    delegation: {
      socraticTimeValue: parseFloat(socraticTimeValue.toFixed(2)),
      reinvestmentValue: parseFloat(reinvestmentValue.toFixed(2)),
      delegationGain: parseFloat(delegationGain.toFixed(2)),
      breakEvenCostPerHour: parseFloat(breakEvenCostPerHour.toFixed(2)),
      isWorthIt: delegationGain > 0
    }
  };
};
