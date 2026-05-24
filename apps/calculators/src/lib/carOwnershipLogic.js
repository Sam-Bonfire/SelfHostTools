export function calculateCarOwnership({
    carPrice = 1500000,
    downPayment = 300000,
    loanInterestRate = 9.0,
    loanTermYears = 5,
    ownershipYears = 7,
    annualDepreciationRate = 12,
    annualInsurance = 35000,
    annualMaintenance = 15000,
    monthlyFuel = 8000,
    averageRideshareCost = 400
}) {
    // 1. Loan EMI Calculation
    const principal = Math.max(0, carPrice - downPayment);
    let monthlyEMI = 0;
    let totalInterest = 0;
    
    if (principal > 0 && loanInterestRate > 0) {
        const r = loanInterestRate / 12 / 100;
        const n = loanTermYears * 12;
        monthlyEMI = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        totalInterest = (monthlyEMI * n) - principal;
    } else if (principal > 0) {
        monthlyEMI = principal / (loanTermYears * 12);
    }

    // 2. Depreciation
    // V = P * (1 - r)^t
    const finalCarValue = carPrice * Math.pow(1 - (annualDepreciationRate / 100), ownershipYears);
    const totalDepreciation = carPrice - finalCarValue;

    // 3. Operational Costs Over Ownership Period
    // If loan is paid off before ownership ends, EMI stops, but for True Cost we just sum the total paid.
    const actualMonthsPaid = Math.min(loanTermYears * 12, ownershipYears * 12);
    const totalLoanPaymentsMade = actualMonthsPaid * monthlyEMI; 
    
    // Total cash out of pocket for the car itself
    const totalCarCashPaid = downPayment + totalLoanPaymentsMade;

    const totalInsurance = annualInsurance * ownershipYears;
    const totalMaintenance = annualMaintenance * ownershipYears;
    const totalFuel = monthlyFuel * 12 * ownershipYears;
    
    const totalOperationalCost = totalInsurance + totalMaintenance + totalFuel;

    // 4. True Cost of Ownership (TCO)
    // TCO = Total Cash Paid for Car + Total Operational Cost - Value of Car at End
    // Alternatively: TCO = Down Payment + Total EMI Paid + Total Ops - Final Value
    // We assume if loan > ownership years, you have to pay the remaining principal.
    // For simplicity, let's assume they hold the car until the loan is paid off or they pay it off when selling.
    // TCO = Depreciation + Total Interest + Total Operational Cost
    const totalInterestPaidDuringOwnership = (totalInterest / (loanTermYears * 12)) * actualMonthsPaid; // Rough estimate if sold early
    const exactInterest = loanTermYears <= ownershipYears ? totalInterest : totalInterestPaidDuringOwnership;
    
    const trueCostOfOwnership = totalDepreciation + exactInterest + totalOperationalCost;
    
    // 5. Monthly Equivalents
    const trueMonthlyCost = trueCostOfOwnership / (ownershipYears * 12);
    const basicMonthlyCashFlow = monthlyEMI + (annualInsurance / 12) + (annualMaintenance / 12) + monthlyFuel;

    // 6. Rideshare Reality
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
            totalOperationalCost
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
