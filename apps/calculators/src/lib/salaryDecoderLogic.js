import { calculateTaxBracketOptimization } from './taxBracketLogic';

/**
 * Salary Decoder: CTC -> in-hand take-home.
 * CTC components that never reach the paycheck (employer retirement,
 * health insurance) are split out, pre-tax contributions reduce taxable
 * income via the shared tax engine, and the remainder is taxed.
 */
export function calculateSalaryDecoding(inputs) {
  const {
    baseSalary = 0,
    annualBonus = 0,
    employerRetirement = 0,
    healthInsurance = 0,
    otherPerks = 0,
    preTaxContributions = 0,
    filingStatus = 'single',
    stateLocalTaxes = 0,
    mortgageInterest = 0,
    charitableContributions = 0,
    medicalExpenses = 0,
    otherItemized = 0
  } = inputs;

  const safe = (v) => Math.max(0, parseFloat(v) || 0);
  const base = safe(baseSalary);
  const bonus = safe(annualBonus);
  const empRetire = safe(employerRetirement);
  const health = safe(healthInsurance);
  const perks = safe(otherPerks);
  const preTax = safe(preTaxContributions);

  const ctc = base + bonus + empRetire + health + perks;
  const grossCash = base + bonus;
  // Pre-tax contributions come out of cash pay before tax is computed.
  const cappedPreTax = Math.min(preTax, grossCash);
  const grossForTax = Math.max(0, grossCash - cappedPreTax);

  const tax = calculateTaxBracketOptimization({
    grossIncome: grossForTax,
    filingStatus,
    stateLocalTaxes,
    mortgageInterest,
    charitableContributions,
    medicalExpenses,
    otherItemized
  });

  const inHandAnnual = Math.max(0, grossCash - cappedPreTax - tax.recommendedTax);
  const inHandMonthly = inHandAnnual / 12;
  const ctcEfficiency = ctc > 0 ? inHandAnnual / ctc : 0;
  const totalDeductions = ctc - inHandAnnual;

  return {
    ctc,
    grossCash,
    preTax: cappedPreTax,
    grossForTax,
    components: {
      base,
      bonus,
      employerRetirement: empRetire,
      healthInsurance: health,
      otherPerks: perks
    },
    tax,
    inHandAnnual: Math.round(inHandAnnual),
    inHandMonthly: Math.round(inHandMonthly),
    ctcEfficiency,
    totalDeductions: Math.round(totalDeductions)
  };
}
