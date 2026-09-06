/**
 * PPP Rate Card: quote a foreign client, live on local costs.
 * Converts a foreign hourly rate into local take-home, then divides by a
 * PPP cost factor to show what the money "feels like" abroad — plus how
 * many local salaries one contract is worth.
 */
export function calculatePPPRate(inputs) {
  const {
    foreignHourly = 0,
    hoursPerWeek = 0,
    billableWeeks = 48,
    exchangeRate = 83,
    pppFactor = 3.5,
    platformFeeRate = 0,
    homeTaxRate = 20,
    localMonthlySalary = 0
  } = inputs;

  const safe = (v) => Math.max(0, parseFloat(v) || 0);
  const rate = safe(foreignHourly);
  const hrs = safe(hoursPerWeek);
  const weeks = safe(billableWeeks);
  const fx = safe(exchangeRate) || 1;
  const ppp = safe(pppFactor) || 1;

  const foreignAnnual = rate * hrs * weeks;
  const platformFee = foreignAnnual * (safe(platformFeeRate) / 100);
  const afterFees = Math.max(0, foreignAnnual - platformFee);
  const homeTax = afterFees * (safe(homeTaxRate) / 100);
  const netForeign = Math.max(0, afterFees - homeTax);

  const netLocal = netForeign * fx;
  const netLocalMonthly = netLocal / 12;
  // PPP-equivalent: local money buys ppp-times more at home, so it
  // "feels like" netLocal/ppp spent abroad.
  const pppEquivalentAnnual = netLocal / ppp;
  const effectiveForeignHourly = hrs * weeks > 0 ? netForeign / (hrs * weeks) : 0;

  const localAnnual = safe(localMonthlySalary) * 12;
  const salaryMultiple = localAnnual > 0 ? netLocal / localAnnual : 0;

  return {
    foreignAnnual: Math.round(foreignAnnual),
    platformFee: Math.round(platformFee),
    homeTax: Math.round(homeTax),
    netForeign: Math.round(netForeign),
    netLocal: Math.round(netLocal),
    netLocalMonthly: Math.round(netLocalMonthly),
    pppEquivalentAnnual: Math.round(pppEquivalentAnnual),
    effectiveForeignHourly: Math.round(effectiveForeignHourly * 100) / 100,
    salaryMultiple: Math.round(salaryMultiple * 100) / 100
  };
}
