export const calculateEducationLoan = ({
    interestRate,
    repaymentTenure,
    loanAmount,
    courseDuration,
    isAdvanced,
    courseEndDate,
    disbursements, // Array of { date, amount }
    gracePeriod,
    gracePayment,
    graceLumpsum,
    capitalizeInterest,
    extraPayment
}) => {
    // 1. Common Constants
    const ratePerMonth = (parseFloat(interestRate) || 0) / 12 / 100;
    const ratePerDay = (parseFloat(interestRate) || 0) / 365 / 100;
    const originalTenureMonths = (parseFloat(repaymentTenure) || 0) * 12;
    const extra = parseFloat(extraPayment) || 0;
    const gPay = parseFloat(gracePayment) || 0;
    const gLumpsum = parseFloat(graceLumpsum) || 0;

    let P = 0;
    let accumulatedInterest = 0;
    let totalPaidSoFar = 0;
    let repaymentStartDate = new Date();
    let calculatedMoratoriumMonths = 0;

    // --- PHASE 1: Moratorium / Pre-Repayment Logic ---

    if (isAdvanced) {
        // --- ADVANCED MODE (Real Dates) ---
        const cEnd = new Date(courseEndDate);
        const rStart = new Date(cEnd);
        rStart.setMonth(rStart.getMonth() + parseInt(gracePeriod || 0));
        repaymentStartDate = rStart;

        let totalDisbursed = 0;
        const sortedDisbursements = (disbursements || []).map(d => ({ ...d, date: new Date(d.date) })).sort((a, b) => a.date - b.date);

        // A. Calculate Gross Accrued Interest (without payments)
        sortedDisbursements.forEach(d => {
            const dDate = d.date;
            const amount = parseFloat(d.amount);
            if (amount && dDate < rStart) {
                totalDisbursed += amount;
                const diffTime = Math.abs(rStart - dDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const interest = amount * ratePerDay * diffDays;
                accumulatedInterest += interest;
            }
        });
        P = totalDisbursed;

        // B. Apply Grace Payments
        const totalGracePayments = (gPay * parseInt(gracePeriod || 0)) + gLumpsum;
        totalPaidSoFar += totalGracePayments;

        if (totalGracePayments > 0) {
            if (totalGracePayments >= accumulatedInterest) {
                const remainder = totalGracePayments - accumulatedInterest;
                accumulatedInterest = 0;
                P -= remainder; // Reduce principal
            } else {
                accumulatedInterest -= totalGracePayments;
            }
        }

        const firstDate = sortedDisbursements.length > 0 ? sortedDisbursements[0].date : new Date();
        const diffTimeTotal = Math.abs(rStart - firstDate);
        // Rough calc of moratorium months for display
        calculatedMoratoriumMonths = Math.ceil(diffTimeTotal / (1000 * 60 * 60 * 24 * 30.417)); // Use avg month

    } else {
        // --- SIMPLE MODE (Standard Formula) ---
        P = parseFloat(loanAmount) || 0;
        const cMonths = parseFloat(courseDuration) || 0;
        const gMonths = parseFloat(gracePeriod) || 0;
        calculatedMoratoriumMonths = cMonths + gMonths;

        let currentPrincipal = P;

        // A. Course Duration Interest
        const courseInterest = currentPrincipal * ratePerMonth * cMonths;
        if (capitalizeInterest) accumulatedInterest += courseInterest;
        else totalPaidSoFar += courseInterest;

        // B. Grace Period Logic
        // Apply lumpsum at the start of grace period for calculation
        currentPrincipal -= gLumpsum;
        totalPaidSoFar += gLumpsum;

        for (let i = 0; i < gMonths; i++) {
            const monthlyInt = currentPrincipal * ratePerMonth;
            accumulatedInterest += monthlyInt;

            let pay = gPay;
            totalPaidSoFar += pay;

            if (pay >= accumulatedInterest) {
                const remainder = pay - accumulatedInterest;
                accumulatedInterest = 0;
                currentPrincipal -= remainder;
            } else {
                accumulatedInterest -= pay;
            }
        }
        P = currentPrincipal;

        const now = new Date();
        repaymentStartDate = new Date(now.setMonth(now.getMonth() + calculatedMoratoriumMonths));
    }

    if (P <= 0) P = 0;

    // --- C. Capitalization Event ---
    let effectivePrincipal = P;
    if (capitalizeInterest) {
        effectivePrincipal += accumulatedInterest;
        accumulatedInterest = 0;
    } else {
        totalPaidSoFar += accumulatedInterest;
    }

    // --- PHASE 2: Repayment Simulation ---
    let emi = 0;
    if (effectivePrincipal > 0 && originalTenureMonths > 0) {
        emi = (effectivePrincipal * ratePerMonth * Math.pow(1 + ratePerMonth, originalTenureMonths)) /
            (Math.pow(1 + ratePerMonth, originalTenureMonths) - 1);
    }

    let balance = effectivePrincipal;
    let monthsElapsed = 0;
    let totalPaidDuringRepayment = 0;
    const newSchedule = [];

    let scheduleDate = new Date(repaymentStartDate);
    let yearlyInterest = 0;
    let yearlyPrincipal = 0;
    let currentScheduleYear = isAdvanced ? scheduleDate.getFullYear() : 1;

    if (balance > 0) {
        while (balance > 1 && monthsElapsed < 1200) {
            monthsElapsed++;
            scheduleDate.setMonth(scheduleDate.getMonth() + 1);
            const interestForMonth = balance * ratePerMonth;
            let actualPayment = emi + extra;
            if (actualPayment > balance + interestForMonth) {
                actualPayment = balance + interestForMonth;
            }
            const principalForMonth = actualPayment - interestForMonth;
            balance -= principalForMonth;
            if (balance < 0) balance = 0;
            totalPaidDuringRepayment += actualPayment;
            yearlyInterest += interestForMonth;
            yearlyPrincipal += principalForMonth;

            const entryYear = isAdvanced ? scheduleDate.getFullYear() : Math.ceil(monthsElapsed / 12);
            if (entryYear !== currentScheduleYear || balance <= 0.1) {
                newSchedule.push({
                    year: currentScheduleYear,
                    label: isAdvanced ? `${currentScheduleYear}` : `Year ${currentScheduleYear}`,
                    principal: yearlyPrincipal,
                    interest: yearlyInterest,
                    balance: balance
                });
                yearlyInterest = 0;
                yearlyPrincipal = 0;
                currentScheduleYear = entryYear;
            }
        }
        // Flush remaining
        if (yearlyPrincipal > 0 || yearlyInterest > 0) {
            // Check if already pushed for this year/balance?
            // The original code loop logic: pushes when year changes OR balance <=0.1.
            // If loop exits because balance < 1, but we haven't changed year, we might have leftover in yearly vars?
            // Yes, so we push it.
            // But wait, if balance <= 0.1 triggered the push inside loop, then yearly vars are reset.
            // So this check is for: "loop exited due to max months but balance still there" OR "loop exited, last push happened, but maybe new year started?"
            // Actually if balance <= 0.1, we pushed.
            // Logic match:
            // Inside loop: if (changeYear || done) { push; reset; }
            // So if done, we pushed. If not done (months limit), we might have data.
            // But typically 'balance > 1' loop condition means we exit when paid off.
            // Let's stick to original logic:
            /*
             if (yearlyPrincipal > 0 || yearlyInterest > 0) {
               push...
             }
            */
            // However, checking duplication: if the last iteration pushed (balance<=0.1), yearlyPrincipal is 0. So no dupe.
            // If loop exited because of valid payment, it pushed.
        }
        // Original code had this block OUTSIDE loop.
        if (yearlyPrincipal > 0 || yearlyInterest > 0) {
            newSchedule.push({
                year: currentScheduleYear,
                label: isAdvanced ? `${currentScheduleYear}` : `Year ${currentScheduleYear}`,
                principal: yearlyPrincipal,
                interest: yearlyInterest,
                balance: balance
            });
        }
    }

    // --- PHASE 3: Totals ---
    const finalTotalPayable = totalPaidSoFar + totalPaidDuringRepayment;
    const originalDisbursed = isAdvanced
        ? (disbursements || []).reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
        : (parseFloat(loanAmount) || 0);

    const finalTotalInterest = Math.max(0, finalTotalPayable - originalDisbursed);

    let baselineTotal = 0;
    if (capitalizeInterest) {
        const pWithInt = originalDisbursed + (originalDisbursed * ratePerMonth * calculatedMoratoriumMonths);
        const e = (pWithInt * ratePerMonth * Math.pow(1 + ratePerMonth, originalTenureMonths)) / (Math.pow(1 + ratePerMonth, originalTenureMonths) - 1);
        baselineTotal = e * originalTenureMonths;
    } else {
        const e = (originalDisbursed * ratePerMonth * Math.pow(1 + ratePerMonth, originalTenureMonths)) / (Math.pow(1 + ratePerMonth, originalTenureMonths) - 1);
        baselineTotal = (e * originalTenureMonths) + (originalDisbursed * ratePerMonth * calculatedMoratoriumMonths);
    }

    const moneySaved = Math.max(0, baselineTotal - finalTotalPayable);
    const timeSaved = Math.max(0, originalTenureMonths - monthsElapsed);

    return {
        results: {
            monthlyEMI: emi,
            totalInterest: finalTotalInterest,
            totalAmount: finalTotalPayable,
            moratoriumInterest: accumulatedInterest,
            effectivePrincipal: effectivePrincipal,
            savings: moneySaved,
            timeSavedMonths: timeSaved,
            newTenureMonths: monthsElapsed,
            totalMoratorium: calculatedMoratoriumMonths,
            repaymentStartDate: repaymentStartDate
        },
        schedule: newSchedule
    };
};
