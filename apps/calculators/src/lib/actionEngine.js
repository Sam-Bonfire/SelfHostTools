import { macroData } from '@packages/macro-data';

export const generateActions = (calculatorId, inputs, results) => {
    const actions = [];
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    switch (calculatorId) {
        case 'FIRECalculator': {
            const savingsRate = ((inputs.monthlyInvestment || 0) / (inputs.currentMonthlyExpenses || 1)) * 100;
            if (savingsRate < 20) {
                actions.push({
                    title: 'The Savings Rate Multiplier',
                    description: `You're investing ${savingsRate.toFixed(1)}% of expenses. Bumping this to 30% by cutting high-fat expenses (like recurring subscriptions) will drastically slash your years to FIRE.`
                });
            }
            const realReturn = (inputs.postRetirementReturn || 0) - (inputs.inflationRate || 0);
            if (realReturn < 1) {
                actions.push({
                    title: 'The Real Return Trap',
                    description: `Your post-retirement real return is dangerously low (${realReturn.toFixed(1)}%). Inflation will erode your corpus. Consider holding 30-40% equity even in retirement to outpace inflation.`
                });
            }
            if (results.shortfall > 0) {
                actions.push({
                    title: 'The Power of One More Year',
                    description: `You have a shortfall of ${formatCurrency(results.shortfall)}. Delaying retirement by just 1-2 years allows your portfolio to compound longer while reducing the years you need to fund.`
                });
            } else if (actions.length < 3) {
                 actions.push({
                    title: 'Fat FIRE Territory',
                    description: `You are projected to exceed your required corpus. Consider allocating the excess to a 'Dream Fund' or retiring earlier than planned.`
                });
            }
            break;
        }

        case 'FreelanceIncomeCalculator': {
            if (inputs.unpaidWeeks < 4) {
                actions.push({
                    title: 'The Burnout Tax',
                    description: `You only budgeted ${inputs.unpaidWeeks} weeks off. Freelancing without breaks leads to burnout. Price in 4-6 weeks of vacation into your hourly rate to ensure longevity.`
                });
            }
            if (inputs.adminTimePercent > 15) {
                actions.push({
                    title: 'Automate or Outsource Admin',
                    description: `You lose ${inputs.adminTimePercent}% of your week to unbillable tasks. Spend ₹2k/month on invoicing software or a virtual assistant to buy back your billable time.`
                });
            }
            if (results.grossMonthly > 150000 && !inputs.isPresumptiveTax) {
                actions.push({
                    title: 'Section 44ADA Arbitrage',
                    description: `Your income is high. If your actual business expenses are low, Section 44ADA (declaring 50% income) could legally save you lakhs in taxes. Consult a CA immediately.`
                });
            }
            if (actions.length < 3) {
                actions.push({
                    title: 'Decouple Time from Income',
                    description: 'You are trading hours for rupees. Start packaging your services into fixed-price projects or retainers to break the hourly ceiling.'
                });
            }
            break;
        }

        case 'SIPCalculator': {
            if (inputs.annualStepUp < macroData.inflation.general) {
                actions.push({
                    title: 'The Stealth Tax of Inflation',
                    description: `Your step-up (${inputs.annualStepUp}%) is lower than average inflation (${macroData.inflation.general}%). You are technically investing less each year in real terms. Raise your step-up to at least ${macroData.inflation.general}%.`
                });
            }
            if (inputs.years < 12) {
                actions.push({
                    title: 'The Compounding Tipping Point',
                    description: `Compounding magic usually starts after year 10. Extending your SIP horizon by just 3 more years will disproportionately explode your wealth curve.`
                });
            }
            if (inputs.expectedReturn < 10) {
                 actions.push({
                    title: 'Optimize Asset Allocation',
                    description: `Your expected return of ${inputs.expectedReturn}% suggests a conservative portfolio. Shifting slightly more toward equity index funds could comfortably add 2-3% annualized returns over a decade.`
                });
            }
            break;
        }

        case 'HomeLoanRentCalculator': {
            const downpaymentOpportunity = inputs.downPayment * Math.pow(1.12, inputs.loanTenure); // 12% equity return
            actions.push({
                title: 'Downpayment Opportunity Cost',
                description: `Locking ₹${inputs.downPayment.toLocaleString()} into a downpayment means sacrificing potential equity returns. If invested at 12%, it could grow to ${formatCurrency(downpaymentOpportunity)} over your tenure.`
            });
            if (inputs.investDifference === false || inputs.investDifference === 'false' || !inputs.investDifference) {
                actions.push({
                    title: 'The Renter\'s Discipline Rule',
                    description: `Renting only makes financial sense if you strictly invest the difference between your rent and the EMI. Set up an automated SIP today for this exact amount.`
                });
            }
            if (inputs.loanTenure > 15) {
                actions.push({
                    title: 'The 5% Prepayment Magic',
                    description: `Your tenure is ${inputs.loanTenure} years. Pre-paying just 5% of your principal extra every year (from bonuses) will drastically compress your timeline and destroy the interest burden.`
                });
            }
            break;
        }
    }

    // Always ensure we return max 3 actions so the UI doesn't get cluttered.
    return actions.slice(0, 3);
};
