import { describe, expect, it } from 'vitest';

import { calculateTimeBuyBack } from '../lib/buyBackLogic';

describe('Time Buy-Back Delegate Calculator Logic', () => {
  it('calculates baseline freelance wage correctly', () => {
    const result = calculateTimeBuyBack({
      jobType: 'freelance',
      hourlyRate: 1000,
      hoursPerWeek: 30,
      vacationWeeks: 4,
      adminTimePercent: 20,
      isPresumptiveTax: false,
      freelanceTaxRate: 20,
      taskCost: 400,
      hoursSaved: 2,
      energyMultiplier: 1.0,
      reinvestmentType: 'leisure'
    });

    // 48 weeks * 30 hours = 1440 hours
    // Gross: 1440 * 1000 = 1,440,000
    // Tax: 1,440,000 * 20% = 288,000
    // Net: 1,152,000
    // True net hourly wage: 1,152,000 / 1440 = 800
    expect(result.baseline.annualGross).toBe(1440000);
    // Let's print or calculate: hpw = 30, rate = 1000, vac = 4. workingWeeks = 48.
    // 48 * 30 * 1000 = 1,440,000.
    // Let's check: in freelance calculations, rate is 1000, hpw = 30, vac = 4, workingWeeks = 48.
    // annualGross = workingWeeks * hpw * rate = 48 * 30 * 1000 = 1,440,000.
    // Yes! 1,440,000. Let's make sure the assertion is correct.
  });

  it('calculates presumptive tax 44ADA correctly', () => {
    const result = calculateTimeBuyBack({
      jobType: 'freelance',
      hourlyRate: 2000,
      hoursPerWeek: 20,
      vacationWeeks: 2,
      adminTimePercent: 10,
      isPresumptiveTax: true, // 50% deduction
      freelanceTaxRate: 30,
      taskCost: 500,
      hoursSaved: 1.5,
      energyMultiplier: 1.2,
      reinvestmentType: 'upskilling'
    });

    // workingWeeks = 50.
    // hpw = 20. rate = 2000.
    // annualGross = 50 * 20 * 2000 = 2,000,000.
    // Presumptive Taxable Income = 2,000,000 * 0.5 = 1,000,000.
    // Tax = 1,000,000 * 30% = 300,000.
    // Net = 2,000,000 - 300,000 = 1,700,000.
    // Total Hours = 50 * (20 / 0.9) = 1111.11 hours.
    // True net hourly wage = 1,700,000 / 1111.11 = 1530.
    expect(result.baseline.annualGross).toBe(2000000);
    expect(result.baseline.annualTax).toBe(300000);
    expect(result.baseline.annualNet).toBe(1700000);
    expect(result.baseline.trueNetHourlyWage).toBe(1530);

    // Delegation:
    // hoursSaved = 1.5. reinvestmentType = 'upskilling' -> 1.5 * net wage
    // reinvestmentValue = 1530 * 1.5 (hours) * 1.5 (upskill mult) = 3442.5.
    // cost = 500.
    // delegationGain = 3442.5 - 500 = 2942.5.
    expect(result.delegation.reinvestmentValue).toBe(3442.5);
    expect(result.delegation.delegationGain).toBe(2942.5);
    expect(result.delegation.isWorthIt).toBe(true);
  });

  it('calculates salaried baseline and delegation correctly', () => {
    const result = calculateTimeBuyBack({
      jobType: 'salaried',
      salariedGross: 1500000,
      salariedTaxRate: 20,
      salariedHoursPerWeek: 40,
      commuteHoursPerWeek: 5,
      unpaidOvertimeHours: 5,
      taskCost: 1500,
      hoursSaved: 3,
      energyMultiplier: 2.0,
      reinvestmentType: 'leisure'
    });

    // gross = 1,500,000
    // net = 1,200,000
    // weeklyCommitted = 40 + 5 + 5 = 50 hours
    // annualHours = 50 * 52 = 2600 hours
    // trueNetHourlyWage = 1,200,000 / 2600 = 461.54
    expect(result.baseline.trueNetHourlyWage).toBe(461.54);

    // socraticTimeValue = 461.54 * 2.0 = 923.08
    // reinvestmentValue (leisure) = socraticTimeValue * 3 = 2769.24
    // cost = 1500.
    // delegationGain = 2769.24 - 1500 = 1269.24
    expect(result.delegation.socraticTimeValue).toBe(923.08);
    expect(result.delegation.delegationGain).toBe(1269.23);
    expect(result.delegation.isWorthIt).toBe(true);
  });
});
