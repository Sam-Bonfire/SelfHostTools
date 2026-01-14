export const calculateBuyVsRent = ({
    propertyValue,
    downPayment,
    interestRate,
    loanTenure,
    propertyAppreciation,
    maintenanceCost,
    monthlyRent,
    rentInflation,
    investDifference,
    equityReturn,
    taxBenefit
}) => {
    const months = (parseFloat(loanTenure) || 0) * 12;
    const ratePerMonth = (parseFloat(interestRate) || 0) / 12 / 100;
    const loanAmount = (parseFloat(propertyValue) || 0) - (parseFloat(downPayment) || 0);

    // 1. Calculate EMI
    let emi = 0;
    if (loanAmount > 0 && months > 0 && ratePerMonth > 0) {
        emi = (loanAmount * ratePerMonth * Math.pow(1 + ratePerMonth, months)) / (Math.pow(1 + ratePerMonth, months) - 1);
    } else if (loanAmount > 0 && months > 0 && ratePerMonth === 0) {
        emi = loanAmount / months;
    }

    // 2. BUYING SIMULATION
    let buyBalance = loanAmount;
    let buyOutflow = parseFloat(downPayment) || 0;
    let currentPropertyValue = parseFloat(propertyValue) || 0;

    // 3. RENTING SIMULATION
    let rentOutflow = 0;
    let currentRent = parseFloat(monthlyRent) || 0;
    let investmentBalance = parseFloat(downPayment) || 0; // Start rent investment with downpayment amount
    const equityMonthlyRate = (parseFloat(equityReturn) || 0) / 12 / 100;

    const schedule = [];

    for (let m = 1; m <= months; m++) {
        // --- BUYING LOGIC ---
        const interest = buyBalance * ratePerMonth;
        const principal = emi - interest;
        buyBalance -= principal;
        if (buyBalance < 0) buyBalance = 0;
        buyOutflow += emi;

        // Yearly maintenance and appreciation & Tax Benefit
        if (m % 12 === 0) {
            buyOutflow += (currentPropertyValue * ((parseFloat(maintenanceCost) || 0) / 100)); // Annual maintenance
            currentPropertyValue *= (1 + ((parseFloat(propertyAppreciation) || 0) / 100));

            if (taxBenefit) {
                // Simplified tax benefit: Assume user saves 30% slab on max 2L interest
                // Approx annual interest = interest from last month * 12 is rough. 
                // Better: sum interest over year? ORIGINAL CODE USED: interest * 12. Maintaining original logic.
                const annualInterest = interest * 12;
                const benefit = Math.min(annualInterest, 200000) * 0.30;
                buyOutflow -= benefit;
            }
        }

        // --- RENTING LOGIC ---
        rentOutflow += currentRent;

        // Invest Difference Logic
        if (investDifference) {
            const difference = emi - currentRent;
            // If EMI > Rent, we invest the difference. 
            // If Rent > EMI, we might withdraw? ORIGINAL CODE: adds difference. 
            // If difference is negative (Rent > EMI), it reduces investmentBalance (simulating paying extra rent from corpus).
            investmentBalance += difference;

            // Growth
            investmentBalance *= (1 + equityMonthlyRate);
        } else {
            // Only grow the downpayment
            investmentBalance *= (1 + equityMonthlyRate);
        }

        if (m % 12 === 0) {
            currentRent *= (1 + ((parseFloat(rentInflation) || 0) / 100));
            schedule.push({
                label: `Year ${m / 12}`,
                buyWealth: Math.round(currentPropertyValue - Math.max(0, buyBalance)),
                rentWealth: Math.round(investmentBalance),
                buyOutflow: Math.round(buyOutflow),
                rentOutflow: Math.round(rentOutflow)
            });
        }
    }

    const buyNetWealth = currentPropertyValue - Math.max(0, buyBalance);
    const rentNetWealth = investmentBalance;

    return {
        buyNetWealth: Math.round(buyNetWealth),
        rentNetWealth: Math.round(rentNetWealth),
        monthlyEMI: Math.round(emi),
        buyTotalOutflow: Math.round(buyOutflow),
        rentTotalOutflow: Math.round(rentOutflow),
        winner: buyNetWealth > rentNetWealth ? 'Buy' : 'Rent',
        schedule
    };
};
