import { calculateGrantValue } from './goldenHandcuffsLogic';

/**
 * RSU Tax Drain: what a vesting grant actually pays you after tax.
 * RSUs (and exercised options) are taxed as ordinary income at vest:
 * federal + state marginal rates apply to the full spread, and most
 * people only ever see the net after sell-to-cover withholding.
 */
export function calculateRSUTaxDrain(inputs) {
  const {
    grantType = 'RSU',
    shareCount = 0,
    sharePrice = 0,
    strikePrice = 0,
    vestingYears = 4,
    federalRate = 32,
    stateRate = 5
  } = inputs;

  const safe = (v) => Math.max(0, parseFloat(v) || 0);
  const count = safe(shareCount);
  const price = safe(sharePrice);
  const years = Math.max(1, Math.floor(safe(vestingYears)) || 1);
  const combinedRate = Math.min(100, safe(federalRate) + safe(stateRate)) / 100;

  const grant = { type: grantType === 'Option' ? 'Option' : 'RSU', count, price, strike: safe(strikePrice) };
  const grossValue = calculateGrantValue(grant);
  const totalTax = grossValue * combinedRate;
  const netValue = grossValue - totalTax;
  const withholdingShares = price > 0 ? totalTax / price : 0;

  // Linear vest calendar: equal tranches per year.
  const schedule = [];
  for (let y = 1; y <= years; y++) {
    const trancheGross = grossValue / years;
    const trancheTax = trancheGross * combinedRate;
    schedule.push({
      label: `Year ${y}`,
      shares: Math.round((count / years) * 100) / 100,
      gross: Math.round(trancheGross),
      tax: Math.round(trancheTax),
      net: Math.round(trancheGross - trancheTax)
    });
  }

  return {
    grantType: grant.type,
    grossValue: Math.round(grossValue),
    totalTax: Math.round(totalTax),
    netValue: Math.round(netValue),
    effectiveTaxRate: combinedRate,
    sharesWithheld: Math.round(withholdingShares * 100) / 100,
    sharesKept: Math.round((count - withholdingShares) * 100) / 100,
    schedule
  };
}
