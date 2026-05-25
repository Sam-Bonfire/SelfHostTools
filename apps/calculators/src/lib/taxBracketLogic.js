export const TAX_BRACKETS_2024 = {
  single: [
    { rate: 0.10, upTo: 11600 },
    { rate: 0.12, upTo: 47150 },
    { rate: 0.22, upTo: 100525 },
    { rate: 0.24, upTo: 191950 },
    { rate: 0.32, upTo: 243725 },
    { rate: 0.35, upTo: 609350 },
    { rate: 0.37, upTo: Infinity }
  ],
  married: [
    { rate: 0.10, upTo: 23200 },
    { rate: 0.12, upTo: 94300 },
    { rate: 0.22, upTo: 201050 },
    { rate: 0.24, upTo: 383900 },
    { rate: 0.32, upTo: 487450 },
    { rate: 0.35, upTo: 731200 },
    { rate: 0.37, upTo: Infinity }
  ],
  hoh: [
    { rate: 0.10, upTo: 16550 },
    { rate: 0.12, upTo: 63100 },
    { rate: 0.22, upTo: 100500 },
    { rate: 0.24, upTo: 191950 },
    { rate: 0.32, upTo: 243700 },
    { rate: 0.35, upTo: 609350 },
    { rate: 0.37, upTo: Infinity }
  ]
};

export const STANDARD_DEDUCTIONS_2024 = {
  single: 14600,
  married: 29200,
  hoh: 21900
};

export function calculateTaxes(taxableIncome, filingStatus) {
  const brackets = TAX_BRACKETS_2024[filingStatus] || TAX_BRACKETS_2024.single;
  
  let remainingIncome = Math.max(0, taxableIncome);
  let totalTax = 0;
  let previousLimit = 0;
  let marginalTaxRate = 0;
  const bracketBreakdown = [];

  for (const bracket of brackets) {
    const bracketSize = bracket.upTo - previousLimit;
    const incomeInBracket = Math.min(remainingIncome, bracketSize);

    if (incomeInBracket > 0) {
      const taxForBracket = incomeInBracket * bracket.rate;
      totalTax += taxForBracket;
      marginalTaxRate = bracket.rate;
      
      bracketBreakdown.push({
        rate: bracket.rate,
        income: incomeInBracket,
        tax: taxForBracket,
        start: previousLimit,
        end: bracket.upTo === Infinity ? null : bracket.upTo
      });
    }

    remainingIncome -= incomeInBracket;
    previousLimit = bracket.upTo;

    if (remainingIncome <= 0) break;
  }

  if (bracketBreakdown.length === 0) {
    bracketBreakdown.push({
      rate: brackets[0].rate,
      income: 0,
      tax: 0,
      start: 0,
      end: brackets[0].upTo
    });
  }

  const effectiveTaxRate = taxableIncome > 0 ? totalTax / taxableIncome : 0;

  return {
    totalTax,
    effectiveTaxRate,
    marginalTaxRate,
    bracketBreakdown
  };
}

export function calculateTaxBracketOptimization(inputs) {
  const {
    grossIncome = 0,
    filingStatus = 'single',
    stateLocalTaxes = 0,
    mortgageInterest = 0,
    charitableContributions = 0,
    medicalExpenses = 0,
    otherItemized = 0
  } = inputs;

  const safeGrossIncome = Math.max(0, grossIncome);

  const standardDeduction = STANDARD_DEDUCTIONS_2024[filingStatus] || STANDARD_DEDUCTIONS_2024.single;
  const allowedSALT = Math.min(stateLocalTaxes, 10000);
  const medicalFloor = safeGrossIncome * 0.075;
  const allowedMedical = Math.max(0, medicalExpenses - medicalFloor);
  const totalItemized = allowedSALT + mortgageInterest + charitableContributions + allowedMedical + otherItemized;

  const appliedDeduction = Math.max(standardDeduction, totalItemized);
  const bestStrategy = totalItemized > standardDeduction ? 'itemized' : 'standard';

  const taxableStandard = Math.max(0, safeGrossIncome - standardDeduction);
  const taxUnderStandard = calculateTaxes(taxableStandard, filingStatus);
  const effectiveRateGrossStandard = safeGrossIncome > 0 ? taxUnderStandard.totalTax / safeGrossIncome : 0;

  const taxableItemized = Math.max(0, safeGrossIncome - totalItemized);
  const taxUnderItemized = calculateTaxes(taxableItemized, filingStatus);
  const effectiveRateGrossItemized = safeGrossIncome > 0 ? taxUnderItemized.totalTax / safeGrossIncome : 0;

  let taxSavings = 0;
  let recommendedTax = 0;
  let recommendedTaxable = 0;
  let recommendedEffectiveRate = 0;
  let recommendedBreakdown = [];

  if (bestStrategy === 'itemized') {
    taxSavings = taxUnderStandard.totalTax - taxUnderItemized.totalTax;
    recommendedTax = taxUnderItemized.totalTax;
    recommendedTaxable = taxableItemized;
    recommendedEffectiveRate = effectiveRateGrossItemized;
    recommendedBreakdown = taxUnderItemized.bracketBreakdown;
  } else {
    taxSavings = taxUnderItemized.totalTax - taxUnderStandard.totalTax;
    recommendedTax = taxUnderStandard.totalTax;
    recommendedTaxable = taxableStandard;
    recommendedEffectiveRate = effectiveRateGrossStandard;
    recommendedBreakdown = taxUnderStandard.bracketBreakdown;
  }

  return {
    grossIncome: safeGrossIncome,
    filingStatus,
    standardDeduction,
    itemizedDetails: {
      allowedSALT,
      mortgageInterest,
      charitableContributions,
      medicalFloor,
      allowedMedical,
      otherItemized,
      totalItemized
    },
    bestStrategy,
    appliedDeduction,
    taxSavings: Math.max(0, taxSavings),
    recommendedTax,
    recommendedTaxable,
    recommendedEffectiveRate,
    recommendedBreakdown,
    comparisons: {
      standard: {
        taxableIncome: taxableStandard,
        totalTax: taxUnderStandard.totalTax,
        effectiveRateGross: effectiveRateGrossStandard
      },
      itemized: {
        taxableIncome: taxableItemized,
        totalTax: taxUnderItemized.totalTax,
        effectiveRateGross: effectiveRateGrossItemized
      }
    }
  };
}
