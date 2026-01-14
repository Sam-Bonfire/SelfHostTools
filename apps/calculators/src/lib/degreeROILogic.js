export const calculateDegreeROI = ({
    // Costs
    tuitionPerYear,
    livingExpensesPerYear,
    durationYears, // usually 4
    costInflation, // usually 5%

    // Funding
    grantsTotal, // Free money per year? Or total? Let's assume per year for simplicity or total spread out. Let's say Total for now, or per year inputs. The PRD says "Grants/Scholarships". I'll treat it as Annual.
    // actually, let's treat grants as Annual for consistency with tuition.

    // Loan details
    loanInterestRate, // 7%
    loanTermYears, // 10 or 20

    // Career - Degree
    startingSalaryDegree,
    salaryGrowthDegree, // Aggressive

    // Career - Alternative
    startingSalaryAlt,
    salaryGrowthAlt, // Flat

    // Common
    taxRate = 20, // %
    investmentReturn = 7, // % (Opportunity cost of savings)
    generalInflation = 5 // %
}) => {

    const yearsToProject = 20;
    const schedule = [];

    // Initial State
    let degreeDebt = 0;
    let degreeNetWorth = 0;
    let altNetWorth = 0; // Starts at 0

    const yearlyRateDegree = (Number(salaryGrowthDegree) || 0) / 100;
    const yearlyRateAlt = (Number(salaryGrowthAlt) || 0) / 100;
    const invRate = (Number(investmentReturn) || 0) / 100;
    const loanRate = (Number(loanInterestRate) || 0) / 100;
    const inflRate = (Number(generalInflation) || 0) / 100;
    const tuitionInflRate = (Number(costInflation) || 0) / 100;
    const tax = (Number(taxRate) || 0) / 100;

    let currentTuition = Number(tuitionPerYear) || 0;
    let currentLiving = Number(livingExpensesPerYear) || 0;
    let currentSalaryDegree = Number(startingSalaryDegree) || 0;
    let currentSalaryAlt = Number(startingSalaryAlt) || 0;

    const annualGrants = Number(grantsTotal) || 0; // Treating as annual

    // Phase 1: The Degree Years (0 to durationYears)
    // We strictly simulate year by year.

    for (let year = 1; year <= yearsToProject; year++) {
        let degreeCashFlow = 0;
        let altCashFlow = 0;

        // --- ALTERNATIVE PATH ---
        // Earnings immediately
        const altGross = currentSalaryAlt;
        const altNetIncome = altGross * (1 - tax);
        // Living expenses apply to everyone? 
        // PRD says "Indirect Costs: Rent, Food". 
        // If you act as a student, you pay rent. If you work, you pay rent.
        // So we subtract living expenses from BOTH to find "Savings Capacity".
        // However, often students live cheaper or with parents. 
        // But for fair comparison, we subtract the SAME living expenses (inflated) from Alt path, 
        // UNLESS implied otherwise. PRD says "Opportunity Cost: Calculate what user would have earned".
        // Usually Opportunity Cost = Income. Living expenses are wash if they are same.
        // But let's subtract them to show "Net Worth".
        altCashFlow = altNetIncome - currentLiving;

        // Update Alt Net Worth (Savings grow by investment return)
        altNetWorth = (altNetWorth * (1 + invRate)) + altCashFlow;


        // --- DEGREE PATH ---
        if (year <= durationYears) {
            // Still in school
            const cost = currentTuition + currentLiving;
            const fundingParams = annualGrants;
            const needed = Math.max(0, cost - fundingParams);

            // Assume rest is Loan
            // Interest accrues on existing debt + new debt
            // Simple approximation: New debt taken at start of year, interest for full year.
            degreeDebt = (degreeDebt + needed) * (1 + loanRate);

            // Net worth accounts for debt. Assets are 0 (assuming all cash used).
            // Actually, if grants > cost, you save? Unlikely.
            degreeNetWorth = -degreeDebt;

            // Prepare comparison variables for next year
            currentTuition *= (1 + tuitionInflRate);
            // Salary doesn't start yet, but we shouldn't inflate the "Start Salary" input 
            // unless the user meant "Start Salary in Today's terms".
            // Usually "Start Salary" input is "What I expect to earn at grad".
            // Let's keep Start Salary constant until they start working? 
            // Or inflate it? Realistically, entry wages rise with inflation.
            // Let's inflate it so Year 5 start salary > Year 1 input.
            currentSalaryDegree *= (1 + inflRate);

        } else {
            // Graduated!

            // 1. Loan Repayment
            // Calculate PMT if not set
            // Standard amortization formula: A = P * r * (1+r)^n / ((1+r)^n - 1)
            const n = Number(loanTermYears) || 10;
            // Remaining term decreases? No, term starts at graduation.
            // We calculate fixed yearly payment at start of year 5 (graduation).
            const repaymentYearly = (degreeDebt > 0)
                ? degreeDebt * ((loanRate * Math.pow(1 + loanRate, n)) / (Math.pow(1 + loanRate, n) - 1))
                : 0;

            // Check if loan is paid off?
            // Logic: if year - durationYears > n, no payment.
            let payment = 0;
            if ((year - durationYears) <= n && degreeDebt > 0) {
                payment = repaymentYearly;

                // Update Remaining Debt
                // Interest component
                const interestPayment = degreeDebt * loanRate;
                const principalPayment = payment - interestPayment;
                degreeDebt -= principalPayment;
                if (degreeDebt < 0) degreeDebt = 0; // Floating point safety
            } else {
                degreeDebt = 0;
            }

            // 2. Earnings
            const degreeGross = currentSalaryDegree;
            const degreeNetIncome = degreeGross * (1 - tax);

            // 3. Cash Flow
            degreeCashFlow = degreeNetIncome - currentLiving - payment;

            // 4. Net Worth
            // Old accumulated Savings grow + New Savings - Current Debt
            // (degreeNetWorth + degreeDebt) is the "Assets" part
            let assets = (degreeNetWorth + (degreeDebt > 0 ? degreeDebt : 0)); // recover asset value from net worth
            // Fix: logic error. `degreeNetWorth` is (Assets - Debt).
            // So Assets = degreeNetWorth + Debt.
            // Wait, previous year degreeNetWorth was negative debt. So Assets was 0.
            // Let's track Assets separately.
            // Re-write loop state slightly above loop for clarity.

        }

        // Adjust Living for next year
        currentLiving *= (1 + inflRate);

        // Adjust Salaries
        if (year > durationYears) currentSalaryDegree *= (1 + yearlyRateDegree);
        currentSalaryAlt *= (1 + yearlyRateAlt);


        schedule.push({
            year,
            label: `Year ${year}`,
            degreeNetWorth: Math.round(degreeNetWorth),
            altNetWorth: Math.round(altNetWorth),
            degreeDebt: Math.round(degreeDebt),
            degreeIncome: Math.round(year > durationYears ? currentSalaryDegree : 0),
            altIncome: Math.round(currentSalaryAlt)
        });
    }

    // RE-CALCULATION WITH SEPARATE ASSET TRACKING FOR CLEARNESS
    // My inline logic for NW was getting messy. Let's do it clean.

    const cleanSchedule = [];
    currentTuition = Number(tuitionPerYear) || 0;
    currentLiving = Number(livingExpensesPerYear) || 0;
    // Reset inflation on inputs
    currentSalaryDegree = Number(startingSalaryDegree) || 0;
    // Inflate start salary to grad year?
    // If user says "Starting Salary is 50k", they usually mean "In today's dollars".
    // So by year 5, it should be 50k * (1+inf)^4.
    for (let i = 0; i < durationYears; i++) currentSalaryDegree *= (1 + inflRate);

    currentSalaryAlt = Number(startingSalaryAlt) || 0;
    let degreeAssets = 0;
    degreeDebt = 0;
    altNetWorth = 0; // Assets only, assuming no debt for alt

    let repaymentAmount = 0;

    for (let year = 1; year <= yearsToProject; year++) {

        // --- ALT ---
        const altGross = currentSalaryAlt;
        const altNet = altGross * (1 - tax);
        const altSave = altNet - currentLiving;
        altNetWorth = (altNetWorth * (1 + invRate)) + altSave;

        // --- DEGREE ---
        let degreeSave = 0;
        let yearlyDebtPayment = 0;

        if (year <= durationYears) {
            const cost = currentTuition + currentLiving;
            const needed = Math.max(0, cost - annualGrants);
            // Add to debt
            degreeDebt = (degreeDebt + needed) * (1 + loanRate); // Interest accrues
            // No savings
        } else {
            // First year of freedom? Calculate fixed PMT once.
            if (repaymentAmount === 0 && degreeDebt > 0) {
                const n = Number(loanTermYears) || 10;
                if (loanRate > 0) {
                    repaymentAmount = degreeDebt * ((loanRate * Math.pow(1 + loanRate, n)) / (Math.pow(1 + loanRate, n) - 1));
                } else {
                    repaymentAmount = degreeDebt / n;
                }
            }

            // Pay Debt
            if (degreeDebt > 0) {
                yearlyDebtPayment = repaymentAmount;
                const interest = degreeDebt * loanRate;
                const principal = yearlyDebtPayment - interest;

                // If last payment is partial
                if (principal > degreeDebt) {
                    yearlyDebtPayment = degreeDebt + interest;
                    degreeDebt = 0;
                } else {
                    degreeDebt -= principal;
                }
            }

            // Earn
            const degreeGross = currentSalaryDegree;
            const degreeNet = degreeGross * (1 - tax);
            degreeSave = degreeNet - currentLiving - yearlyDebtPayment;

            // Assets grow
            degreeAssets = (degreeAssets * (1 + invRate)) + degreeSave;
        }

        // Update Globals for next loop
        currentTuition *= (1 + tuitionInflRate);
        currentLiving *= (1 + inflRate);
        currentSalaryAlt *= (1 + yearlyRateAlt);

        // Only grow degree salary if working
        if (year > durationYears) currentSalaryDegree *= (1 + yearlyRateDegree);

        cleanSchedule.push({
            year,
            degreeNetWorth: Math.round(degreeAssets - degreeDebt),
            altNetWorth: Math.round(altNetWorth),
            degreeDebt: Math.round(degreeDebt),
            degreeIncome: Math.round(year > durationYears ? currentSalaryDegree : 0),
            altIncome: Math.round(currentSalaryAlt)
        });
    }

    // Metrics
    const finalDegreeNW = cleanSchedule[cleanSchedule.length - 1].degreeNetWorth;
    const finalAltNW = cleanSchedule[cleanSchedule.length - 1].altNetWorth;

    // Break even?
    // Find first year where degreeNW > altNW
    let breakEvenYear = null;
    // Only check after start working
    for (let i = durationYears; i < cleanSchedule.length; i++) {
        if (cleanSchedule[i].degreeNetWorth > cleanSchedule[i].altNetWorth) {
            breakEvenYear = cleanSchedule[i].year;
            break;
        }
    }

    const breakEvenAge = (Number(durationYears) + 18) + (breakEvenYear ? (breakEvenYear - durationYears) : 0); // Crude approx

    // Slave Ratio (Monthly Payment / Monthly Net)
    // Use first year of work values
    let slaveRatio = 0;
    if (repaymentAmount > 0) {
        // Approximate first working year net
        // We need the values used in year (durationYears + 1)
        // Re-calculate simply or grab from schedule if exposed?
        // Let's check schedule inputs roughly.
        // Actually, repaymentAmount is fixed. currentSalaryDegree at year (durationYears+1).
        // Let's use the object from schedule
        const firstWorkYear = cleanSchedule[durationYears]; // Index is durationYears (e.g. index 4 for Year 5)
        if (firstWorkYear) {
            const monthlyNet = (firstWorkYear.degreeIncome * (1 - tax)) / 12;
            const monthlyPmt = repaymentAmount / 12;
            slaveRatio = monthlyNet > 0 ? (monthlyPmt / monthlyNet) * 100 : 0;
        }
    }

    return {
        results: {
            breakEvenYear: breakEvenYear,
            finalDegreeNW,
            finalAltNW,
            slaveRatio: Math.round(slaveRatio * 100) / 100, // 2 decimals
            totalDebtAtGrad: Math.round(cleanSchedule[durationYears - 1]?.degreeDebt || 0)
        },
        schedule: cleanSchedule
    };
};
