export const calculateTrueHourlyWage = ({
  annualGrossSalary,
  annualBonus,
  taxRate,
  workingDaysPerWeek,
  vacationWeeksPerYear,
  standardHoursPerWeek,
  commuteOneWayMinutes,
  groomingMinutesDaily,
  decompressionMinutesDaily,
  commuteDailyCost,
  monthlyConvenienceRen,
  monthlyHealthren,
  unpaidOvertimeHoursPerWeek
}) => {
  // 1. Defaults & Parsing
  const gross = parseFloat(annualGrossSalary) || 0;
  const bonus = parseFloat(annualBonus) || 0;
  const tax = parseFloat(taxRate) || 0;
  const daysPerWeek = parseFloat(workingDaysPerWeek) || 5;
  const vacationWeeks = parseFloat(vacationWeeksPerYear) || 0;
  const standardHours = parseFloat(standardHoursPerWeek) || 40;

  // Time Leaks (Daily/Weekly inputs)
  const commuteMins = parseFloat(commuteOneWayMinutes) || 0;
  const groomingMins = parseFloat(groomingMinutesDaily) || 0;
  const decompressionMins = parseFloat(decompressionMinutesDaily) || 0;
  const unpaidOvertime = parseFloat(unpaidOvertimeHoursPerWeek) || 0;

  // Money Leaks
  const commuteCost = parseFloat(commuteDailyCost) || 0;
  const convenienceCost = parseFloat(monthlyConvenienceRen) || 0;
  const healthCost = parseFloat(monthlyHealthren) || 0;

  // 2. Constants
  const workingWeeks = 52 - vacationWeeks;
  const workingDays = workingWeeks * daysPerWeek;

  // 3. Financial Calculations
  const totalAnnualGross = gross + bonus;
  const annualTaxAmount = totalAnnualGross * (tax / 100);
  const annualNetIncome = totalAnnualGross - annualTaxAmount;

  // Money Leaks Annualized
  const annualCommuteCost = commuteCost * workingDays;
  const annualConvenienceCost = convenienceCost * 12; // Assuming you pay convenience costs even on vacation? Or just working months? Usually year round habits.
  const annualHealthCost = healthCost * 12;
  const totalMoneyLeaks = annualCommuteCost + annualConvenienceCost + annualHealthCost;

  const effectiveAnnualNet = annualNetIncome - totalMoneyLeaks;

  // 4. Time Calculations
  const standardAnnualHours = standardHours * workingWeeks;

  // Time Leaks Annualized
  // Commute is there and back (x2)
  const dailyCommuteHours = (commuteMins * 2) / 60;
  const annualCommuteHours = dailyCommuteHours * workingDays;

  const dailyGroomingHours = groomingMins / 60;
  const annualGroomingHours = dailyGroomingHours * workingDays;

  const dailyDecompressionHours = decompressionMins / 60;
  const annualDecompressionHours = dailyDecompressionHours * workingDays;

  const annualUnpaidOvertimeHours = unpaidOvertime * workingWeeks;

  const totalTimeLeaksHours =
    annualCommuteHours + annualGroomingHours + annualDecompressionHours + annualUnpaidOvertimeHours;
  const totalHoursCommitted = standardAnnualHours + totalTimeLeaksHours;

  // 5. Rates
  const nominalHourlyRate = standardAnnualHours > 0 ? totalAnnualGross / standardAnnualHours : 0;
  const trueHourlyRate = totalHoursCommitted > 0 ? effectiveAnnualNet / totalHoursCommitted : 0;

  return {
    financials: {
      annualGross: Math.round(totalAnnualGross),
      annualTax: Math.round(annualTaxAmount),
      annualNet: Math.round(annualNetIncome),
      totalMoneyLeaks: Math.round(totalMoneyLeaks),
      effectiveNet: Math.round(effectiveAnnualNet)
    },
    time: {
      standardHours: Math.round(standardAnnualHours),
      totalTimeLeaks: Math.round(totalTimeLeaksHours),
      totalHours: Math.round(totalHoursCommitted)
    },
    rates: {
      nominalHourly: parseFloat(nominalHourlyRate.toFixed(2)),
      trueHourly: parseFloat(trueHourlyRate.toFixed(2))
    },
    leaks: {
      // Breakdown for visualization
      commuteCost: Math.round(annualCommuteCost),
      convenienceCost: Math.round(annualConvenienceCost),
      healthCost: Math.round(annualHealthCost),
      commuteHours: Math.round(annualCommuteHours),
      groomingHours: Math.round(annualGroomingHours),
      decompressionHours: Math.round(annualDecompressionHours),
      unpaidOvertimeHours: Math.round(annualUnpaidOvertimeHours)
    }
  };
};
