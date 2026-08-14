export function calculateCarOwnership({
  isAdvanced = false,
  carPrice = 1500000,
  downPayment = 300000,
  loanInterestRate = 9.0,
  loanTermYears = 5,
  ownershipYears = 7,
  expectedResaleValue = 600000,
  annualInsurance = 35000,

  // Simple Mode
  annualMaintenance = 15000,
  monthlyFuel = 8000,
  averageRideshareCost = 400,

  // Advanced Mode
  usageKMs = 800,
  usageType = 'monthly',
  fuelEfficiency = 15,
  fuelPrice = 100,
  annualServicing = 10000,
  tireReplacementFund = 5000,
  monthlyCleaning = 500,
  annualFines = 1500,
  monthlyTolls = 500,
  monthlyParking = 1000,
  annualRepairs = 5000
}) {
  // 1. Loan EMI Calculation
  const principal = Math.max(0, carPrice - downPayment);
  let monthlyEMI = 0;
  let totalInterest = 0;

  if (principal > 0 && loanInterestRate > 0) {
    const r = loanInterestRate / 12 / 100;
    const n = loanTermYears * 12;
    monthlyEMI = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    totalInterest = monthlyEMI * n - principal;
  } else if (principal > 0) {
    monthlyEMI = principal / (loanTermYears * 12);
  }

  // 2. Depreciation
  const finalCarValue = Math.min(carPrice, expectedResaleValue);
  const totalDepreciation = carPrice - finalCarValue;

  // 3. Operational Costs Over Ownership Period
  const actualMonthsPaid = Math.min(loanTermYears * 12, ownershipYears * 12);
  const totalLoanPaymentsMade = actualMonthsPaid * monthlyEMI;

  let computedAnnualMaintenance = 0;
  let computedMonthlyFuel = 0;

  const annualKMs = usageType === 'monthly' ? usageKMs * 12 : usageKMs;
  const monthlyKMs = annualKMs / 12;

  if (isAdvanced) {
    computedAnnualMaintenance =
      annualServicing +
      tireReplacementFund +
      annualFines +
      annualRepairs +
      (monthlyCleaning + monthlyTolls + monthlyParking) * 12;
    const fuelCostPerYear = (annualKMs / fuelEfficiency) * fuelPrice;
    computedMonthlyFuel = fuelCostPerYear / 12;
  } else {
    computedAnnualMaintenance = annualMaintenance;
    computedMonthlyFuel = monthlyFuel;
  }

  const totalInsurance = annualInsurance * ownershipYears;
  const totalMaintenance = computedAnnualMaintenance * ownershipYears;
  const totalFuel = computedMonthlyFuel * 12 * ownershipYears;

  const totalOperationalCost = totalInsurance + totalMaintenance + totalFuel;

  // 4. True Cost of Ownership (TCO)
  const totalInterestPaidDuringOwnership = (totalInterest / (loanTermYears * 12)) * actualMonthsPaid;
  const exactInterest = loanTermYears <= ownershipYears ? totalInterest : totalInterestPaidDuringOwnership;

  const trueCostOfOwnership = totalDepreciation + exactInterest + totalOperationalCost;

  // 5. Monthly Equivalents
  const trueMonthlyCost = trueCostOfOwnership / (ownershipYears * 12);
  const basicMonthlyCashFlow = monthlyEMI + annualInsurance / 12 + computedAnnualMaintenance / 12 + computedMonthlyFuel;

  // 6. Per KM Analysis (The Reality Check)
  // Marginal running cost (Fuel + Tolls + Parking + Wear & Tear).
  // EMI, Insurance, Depreciation are excluded as they are fixed/sunk costs.
  let runningCostPerKm = 0;
  let trueCostPerKm = 0;

  if (monthlyKMs > 0) {
    const marginalMonthlyCost = computedMonthlyFuel + computedAnnualMaintenance / 12;
    runningCostPerKm = marginalMonthlyCost / monthlyKMs;
    trueCostPerKm = trueMonthlyCost / monthlyKMs;
  }

  // 7. Rideshare Reality
  const rideshareTripsPerMonth = averageRideshareCost > 0 ? Math.floor(trueMonthlyCost / averageRideshareCost) : 0;
  const rideshareTripsPerWeek = Math.floor(rideshareTripsPerMonth / 4.33);

  return {
    financials: {
      monthlyEMI,
      basicMonthlyCashFlow,
      trueMonthlyCost,
      finalCarValue,
      totalDepreciation,
      totalInterest: exactInterest,
      totalOperationalCost,
      runningCostPerKm,
      trueCostPerKm,
      computedMonthlyFuel,
      computedAnnualMaintenance
    },
    comparisons: {
      rideshareTripsPerMonth,
      rideshareTripsPerWeek
    },
    summary: {
      trueCostOfOwnership
    }
  };
}
