const formatCurrency = (val, isPDF = false) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);

  if (isPDF) {
    return formatted.replace(/[^\x20-\x7E]/g, '').trim();
  }
  return formatted;
};

export const downloadPDF = async (data) => {
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;

  const { inputs, results, schedule } = data;
  const doc = new jsPDF();

  // --- Metadata ---
  doc.setProperties({
    title: 'Financial Calculator Report',
    subject: 'Report generated from Calculators Hub',
    author: 'Calculators Hub',
    keywords: 'finance, calculator, report, sip, loan',
    creator: 'Calculators Hub'
  });

  // --- Title ---
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('Financial Calculator Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

  // --- Section 1: Inputs & Results Summary ---
  let yPos = 40;
  let summaryData = [];

  // Detect context based on input keys
  if (inputs.currentAge !== undefined) {
    // FIRE CALCULATOR
    summaryData = [
      ['Current Age', `${inputs.currentAge} Years`],
      ['Retirement Age', `${inputs.retirementAge} Years`],
      ['Current Monthly Expenses', `INR ${formatCurrency(inputs.currentMonthlyExpenses, true)}`],
      ['Current Corpus', `INR ${formatCurrency(inputs.currentSavings, true)}`],
      ['Monthly SIP', `INR ${formatCurrency(inputs.monthlyInvestment, true)}`],
      ['Inflation (Std/Med)', `${inputs.inflationRate}% / ${inputs.medicalInflation}%`],
      ['Returns (Pre/Post)', `${inputs.preRetirementReturn}% / ${inputs.postRetirementReturn}%`],
      ['Required Corpus', `INR ${formatCurrency(results.requiredCorpus, true)}`],
      ['Estimated Corpus', `INR ${formatCurrency(results.estimatedCorpusAtRetirement, true)}`],
      ['Shortfall', `INR ${formatCurrency(results.shortfall, true)}`],
      ['Status', results.canRetire ? 'ON TRACK' : 'WORK IN PROGRESS']
    ];
  } else if (inputs.monthlyExpense !== undefined) {
    // LIFE INSURANCE CALCULATOR
    summaryData = [
      ['Monthly Expenses', `INR ${formatCurrency(inputs.monthlyExpense, true)}`],
      ['Years to Replace', `${inputs.yearsToReplace} Years`],
      ['Inflation Rate', `${inputs.inflationRate}%`],
      ['Liabilities', `INR ${formatCurrency(inputs.liabilities, true)}`],
      ['Existing Assets', `INR ${formatCurrency(inputs.existingAssets, true)}`],
      ['Current Insurance', `INR ${formatCurrency(inputs.currentInsurance, true)}`],
      ['Total Required Cover', `INR ${formatCurrency(results.totalRequired, true)}`],
      ['Income Protection Needed', `INR ${formatCurrency(results.expenseCover, true)}`],
      ['Goals & Liabilities', `INR ${formatCurrency(results.goalCover + (parseFloat(inputs.liabilities) || 0), true)}`],
      ['Gap', `INR ${formatCurrency(results.gap, true)}`],
      ['Status', results.isAdequate ? 'ADEQUATE' : 'UNDER-INSURED']
    ];
  } else if (inputs.hourlyRate !== undefined) {
    // FREELANCE CALCULATOR
    summaryData = [
      ['Billed Hourly Rate', `INR ${formatCurrency(inputs.hourlyRate, true)}`],
      ['Billable Hours/Month', inputs.billableHours],
      ['Unpaid Vacation (Weeks/Yr)', inputs.vacationWeeks],
      ['Admin Time', `${inputs.adminTimePercent}%`],
      ['Tax Rate', `${inputs.taxRate}% ${inputs.isPresumptiveTax ? '(44ADA)' : ''}`],
      ['Total Monthly Expenses', `INR ${formatCurrency(results.totalExpenses, true)}`],
      ['Estimated Monthly Tax', `INR ${formatCurrency(results.effectiveTaxAmount, true)}`],
      ['Gross Monthly Income', `INR ${formatCurrency(results.grossMonthly, true)}`],
      ['Net Take-Home Pay', `INR ${formatCurrency(results.netTakeHome, true)}`],
      ['Real Hourly Rate', `INR ${formatCurrency(results.realHourlyRate, true)}`]
    ];
  } else if (inputs.appreciationRate !== undefined && inputs.maintenanceInflation !== undefined) {
    // HOME OWNER REALIST
    summaryData = [
      ['Property Price', `INR ${formatCurrency(inputs.propertyPrice, true)}`],
      ['Down Payment', `INR ${formatCurrency(inputs.downPayment, true)}`],
      ['Mortgage Rate', `${inputs.interestRate}%`],
      ['Loan Tenure', `${inputs.loanTermYears} Years`],
      ['Monthly Mortgage', `INR ${formatCurrency(results.financials.monthlyMortgage, true)}`],
      ['Sinking Fund /mo', `INR ${formatCurrency(results.financials.totalMonthlySinkingFund, true)}`],
      ['Opportunity Cost /mo', `INR ${formatCurrency(results.financials.monthlyOpportunityCost, true)}`],
      ['TRUE Monthly Cost', `INR ${formatCurrency(results.financials.trueMonthlyCost, true)}`],
      ['Immediate Liability', `INR ${formatCurrency(results.financials.immediateLiability, true)}`],
      ['Final Property Equity', `INR ${formatCurrency(results.financials.finalEquity, true)}`]
    ];
  } else if (inputs.monthlyRent !== undefined && inputs.propertyPrice !== undefined) {
    // BUY VS RENT
    summaryData = [
      ['Property Price', `INR ${formatCurrency(inputs.propertyPrice, true)}`],
      ['Interest Rate', `${inputs.interestRate}%`],
      ['Monthly Rent', `INR ${formatCurrency(inputs.monthlyRent, true)}`],
      ['Rent Inflation', `${inputs.rentInflation}%`],
      ['Tenure', `${inputs.tenure} Years`],
      ['Buy Wealth (Net)', `INR ${formatCurrency(results.buyNetWealth, true)}`],
      ['Rent Wealth (Net)', `INR ${formatCurrency(results.rentNetWealth, true)}`],
      ['Winner', results.winner.toUpperCase()],
      ['Wealth Difference', `INR ${formatCurrency(Math.abs(results.buyNetWealth - results.rentNetWealth), true)}`]
    ];
  } else if (inputs.estReturnRate !== undefined && inputs.initialInvestment !== undefined) {
    // ALTERNATE INVESTMENT (Active vs Passive)
    summaryData = [
      ['Initial Investment', `INR ${formatCurrency(inputs.initialInvestment, true)}`],
      ['Monthly Contribution', `INR ${formatCurrency(inputs.monthlyContribution, true)}`],
      ['Time Horizon', `${inputs.years} Years`],
      ['Exp. Return', `${inputs.estReturnRate}%`],
      ['Inflation', `${inputs.inflationRate}%`],
      ['Tax Rate', `${inputs.taxRate}%`],
      ['Active Investment?', inputs.isActiveInvestment ? 'YES' : 'NO'],
      ['Weekly Active Hours', inputs.isActiveInvestment ? inputs.activeHoursPerWeek : '0'],
      ['Hourly Value', inputs.isActiveInvestment ? `INR ${formatCurrency(inputs.userHourlyRate, true)}` : 'N/A'],
      ['Nominal Value', `INR ${formatCurrency(results.nominalValue, true)}`],
      ['Real Value (After Tax/Inf)', `INR ${formatCurrency(results.realValue, true)}`],
      ['Time Cost', `INR ${formatCurrency(results.totalTimeCost, true)}`],
      ['TRUE Profit (After Time)', `INR ${formatCurrency(results.netRealProfitAfterTime, true)}`],
      ['Real ROI', `${results.roi.truePassive.toFixed(2)}%`],
      ['Benchmark (NIFTY 50)', `INR ${formatCurrency(results.benchmark.realValue, true)}`],
      ['Verdict', results.benchmark.isBeatingMarket ? 'BEAT MARKET' : 'UNDERPERFORMED'],
      ['Alpha (Excess Return)', `INR ${formatCurrency(results.benchmark.alpha, true)}`]
    ];
  } else if (inputs.currentBaseSalary !== undefined) {
    // GOLDEN HANDCUFFS
    summaryData = [
      ['Current Base Salary', `INR ${formatCurrency(inputs.currentBaseSalary, true)}`],
      ['Current Bonus', `INR ${formatCurrency(inputs.currentBonus, true)}`],
      ['Current Annual Equity', `INR ${formatCurrency(inputs.currentAnnualEquity, true)}`],
      ['Total Comp (Current)', `INR ${formatCurrency(inputs.currentTotalComp, true)}`],
      ['New Base Salary', `INR ${formatCurrency(inputs.newBaseSalary, true)}`],
      ['New Bonus', `INR ${formatCurrency(inputs.newBonus, true)}`],
      ['New Annual Equity', `INR ${formatCurrency(inputs.newAnnualEquity, true)}`],
      ['Total Comp (New)', `INR ${formatCurrency(inputs.newTotalComp, true)}`],
      ['The Freedom Tax (Exit Cost)', `INR ${formatCurrency(results.freedomTax, true)}`],
      ['Break Even Year', results.breakEvenYear ? `Year ${results.breakEvenYear}` : 'Never in 4 years'],
      ['Verdict', results.isNewJobBetter ? 'SWITCH (Financially)' : 'STAY (Financially)']
    ];
  } else if (inputs.annualGrossSalary !== undefined) {
    // TRUE HOURLY WAGE CALCULATOR
    summaryData = [
      ['Annual Gross Salary', `INR ${formatCurrency(inputs.annualGrossSalary, true)}`],
      ['Tax Rate', `${inputs.taxRate}%`],
      ['Standard Hours/Week', inputs.standardHoursPerWeek],
      ['Commute (One Way)', `${inputs.commuteOneWayMinutes} mins`],
      ['Daily Commute Cost', `INR ${formatCurrency(inputs.commuteDailyCost, true)}`],
      ['Monthly Convenience', `INR ${formatCurrency(inputs.monthlyConvenienceRen, true)}`],
      ['Monthly Health', `INR ${formatCurrency(inputs.monthlyHealthren, true)}`],
      ['Annual Tax', `INR ${formatCurrency(results.annualTax, true)}`],
      ['Annual Net Income', `INR ${formatCurrency(results.annualNet, true)}`],
      ['Effective Net Income', `INR ${formatCurrency(results.effectiveNet, true)}`],
      ['Total Work Hours', `${results.totalHours} hrs`],
      ['Nominal Hourly Rate', `INR ${formatCurrency(results.nominalHourly, true)}`],
      ['True Hourly Rate', `INR ${formatCurrency(results.trueHourly, true)}`]
    ];
  } else if (inputs.loanAmount !== undefined) {
    // LOAN or SIP
    if (inputs.repaymentTenure !== undefined && inputs.stepUp === undefined) {
      // EDUCATION LOAN
      summaryData = [
        ['Loan Amount', `INR ${formatCurrency(inputs.loanAmount, true)}`],
        ['Interest Rate', `${inputs.interestRate}%`],
        ['Tenure', `${inputs.repaymentTenure} Years`],
        ['Moratorium', `${results.totalMoratorium} Months`],
        ['Monthly EMI', `INR ${formatCurrency(results.monthlyEMI, true)}`],
        ['Total Interest', `INR ${formatCurrency(results.totalInterest, true)}`],
        ['Total Payable', `INR ${formatCurrency(results.totalAmount, true)}`]
      ];
    } else {
      // SIP CALCULATOR
      summaryData = [
        ['Monthly Investment', `INR ${formatCurrency(inputs.loanAmount, true)}`],
        ['Return Rate', `${inputs.interestRate}%`],
        ['Period', `${inputs.repaymentTenure} Years`],
        ['Annual Step-Up', `${inputs.stepUp}%`],
        ['Total Invested', `INR ${formatCurrency(results.monthlyEMI, true)}`],
        ['Wealth Gained', `INR ${formatCurrency(results.totalInterest, true)}`],
        ['Maturity Value', `INR ${formatCurrency(results.totalAmount, true)}`]
      ];
    }
  } else if (inputs.tuitionPerYear !== undefined) {
    // DEGREE ROI CALCULATOR
    summaryData = [
      ['Tuition / Yr', `INR ${formatCurrency(inputs.tuitionPerYear, true)}`],
      ['Living Expenses / Yr', `INR ${formatCurrency(inputs.livingExpensesPerYear, true)}`],
      ['Degree Duration', `${inputs.durationYears} Years`],
      ['Grant Total / Yr', `INR ${formatCurrency(inputs.grantsTotal, true)}`],
      ['Starting Salary (Degree)', `INR ${formatCurrency(inputs.startingSalaryDegree, true)}`],
      ['Salary Growth (Degree)', `${inputs.salaryGrowthDegree}%`],
      ['Starting Salary (Alt)', `INR ${formatCurrency(inputs.startingSalaryAlt, true)}`],
      ['Salary Growth (Alt)', `${inputs.salaryGrowthAlt}%`],
      [
        'Break-Even Year (Age)',
        results.breakEvenYear
          ? `${18 + parseInt(inputs.durationYears) + (results.breakEvenYear - parseInt(inputs.durationYears))}`
          : 'NEVER'
      ],
      ['Slave Ratio', `${results.slaveRatio}%`],
      ['Final Net Worth (Degree)', `INR ${formatCurrency(results.finalDegreeNW, true)}`],
      ['Final Net Worth (Alt)', `INR ${formatCurrency(results.finalAltNW, true)}`]
    ];
  } else if (inputs.activityLevel !== undefined) {
    // TDEE CALCULATOR
    summaryData = [
      ['Gender', inputs.gender],
      ['Age', inputs.age],
      ['Weight', `${inputs.weight} ${inputs.weightUnit}`],
      ['Height', inputs.heightUnit === 'cm' ? `${inputs.height} cm` : `${inputs.height.ft}' ${inputs.height.in}"`],
      ['Activity Level', inputs.activityLevel],
      ['Body Fat %', inputs.useBodyFat ? `${inputs.bodyFat}%` : 'N/A'],
      ['Formula Used', inputs.useBodyFat ? 'Katch-McArdle' : 'Mifflin-St Jeor'],
      ['BMR', `${results.bmr} kcal`],
      ['Maintenance (TDEE)', `${results.maintenance} kcal`],
      ['Fat Loss Target', `${results.weightLoss} kcal`],
      ['Bulking Target', `${results.bulking} kcal`],
      ['Goal Weight', inputs.goalWeight ? `${inputs.goalWeight} ${inputs.weightUnit}` : 'N/A'],
      ['Weeks to Goal', results.weeksToGoal > 0 ? results.weeksToGoal : 'N/A']
    ];
  } else if (inputs.loans !== undefined) {
    // INVEST VS LOAN
    const loansDesc = inputs.loans.map((l) => `${l.name} (${l.rate}%)`).join(', ');
    summaryData = [
      ['Monthly Surplus', `INR ${formatCurrency(inputs.surplus, true)}`],
      ['Invest Return', `${inputs.investmentReturn}%`],
      ['Invest Tax', `${inputs.investmentTaxRate}%`],
      ['Income Tax Bracket', `${inputs.userTaxBracket}%`],
      ['Loans', loansDesc],
      ['Recommendation', results.results.winner === 'Payoff' ? 'PAY OFF DEBT' : 'INVEST'],
      ['Net Worth Diff', `INR ${formatCurrency(results.results.netWorthDifference, true)}`],
      ['Invest Strategy Final', `INR ${formatCurrency(results.results.investStrategy.finalNetWorth, true)}`],
      ['Payoff Strategy Final', `INR ${formatCurrency(results.results.payoffStrategy.finalNetWorth, true)}`]
    ];
  } else if (inputs.coreExpenses !== undefined) {
    // EMERGENCY FUND
    summaryData = [
      ['Core Living Expenses', `INR ${formatCurrency(inputs.coreExpenses, true)}`],
      ['Discretionary Expenses', `INR ${formatCurrency(inputs.discretionaryExpenses, true)}`],
      ['Keep Discretionary %', `${inputs.discretionaryRetention}%`],
      ['Expense Volatility Buffer', `INR ${formatCurrency(inputs.expenseVolatility, true)}`],
      ['Job Search Duration', `${inputs.jobSearchDuration} Months`],
      ['Max Health Deductible', `INR ${formatCurrency(inputs.healthDeductible, true)}`],
      ['Max Property/Car Deductible', `INR ${formatCurrency(inputs.propertyDeductible, true)}`],
      ['Monthly Burn Rate', `INR ${formatCurrency(results.monthlyBurnRate, true)}`],
      ['Total Fund Needed', `INR ${formatCurrency(results.totalFund, true)}`],
      ['Tier 1: Immediate Cash', `INR ${formatCurrency(results.tiers.tier1Cash, true)}`],
      ['Tier 2: Bank HYSA', `INR ${formatCurrency(results.tiers.tier2Bank, true)}`],
      ['Tier 3: Investments', `INR ${formatCurrency(results.tiers.tier3Investments, true)}`]
    ];
  } else if (inputs.desiredIncome !== undefined && inputs.postsPerMonth !== undefined) {
    // CREATOR ECONOMY
    summaryData = [
      ['Desired Monthly Income', `INR ${formatCurrency(inputs.desiredIncome, true)}`],
      ['Sponsored Posts/Month', inputs.postsPerMonth],
      ['Total Audience Size', inputs.audienceSize.toLocaleString()],
      ['Average Reach/Open Rate', `${inputs.reachRate}%`],
      ['Click-Through Rate', `${inputs.clickThroughRate}%`],
      ['Active Audience', results.activeAudience.toLocaleString()],
      ['Target Revenue / Post', `INR ${formatCurrency(results.revenueNeededPerPost, true)}`],
      ['Required CPM', `INR ${formatCurrency(results.requiredCPM, true)}`],
      ['Required CPC', `INR ${formatCurrency(results.requiredCPC, true)}`],
      ['Reality Check', results.realityCheck.message]
    ];
  }

  autoTable(doc, {
    startY: yPos,
    head: [['Parameter', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // --- Section 2: Schedule ---
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Projection Schedule', 14, yPos);

  let tableHeader = [['Period', 'Principal/Invested', 'Interest/Returns', 'Balance/Value']];
  let tableBody = [];

  if (inputs.loans !== undefined) {
    // Custom Invest vs Loan Schedule
    tableHeader = [['Year', 'Invest Strategy NW', 'Payoff Strategy NW', 'Difference']];
    tableBody = schedule.map((row) => [
      row.label,
      formatCurrency(row.investNW, true),
      formatCurrency(row.payoffNW, true),
      formatCurrency(row.diff, true)
    ]);
  } else {
    // Standard Schedule
    tableBody = schedule.map((row) => [
      row.label,
      formatCurrency(row.principal, true),
      formatCurrency(row.interest, true),
      formatCurrency(row.balance, true)
    ]);
  }

  autoTable(doc, {
    startY: yPos + 5,
    head: tableHeader,
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [255, 222, 89], textColor: [0, 0, 0] },
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  doc.save('Calculator_Report.pdf');
};

export const downloadExcel = async (data) => {
  const XLSX = await import('xlsx');

  // Simplified for brevity, reusing PDF logic separation
  const { inputs, results, schedule } = data;

  let summaryRows = [];
  if (inputs.currentAge !== undefined) {
    // FIRE
    summaryRows = [
      ['Current Age', inputs.currentAge],
      ['Retirement Age', inputs.retirementAge],
      ['Current Monthly Expenses', inputs.currentMonthlyExpenses],
      ['Current Corpus', inputs.currentSavings],
      ['Monthly SIP', inputs.monthlyInvestment],
      ['Inflation Rate (%)', inputs.inflationRate],
      ['Medical Inflation (%)', inputs.medicalInflation],
      ['Pre-Retirement Return (%)', inputs.preRetirementReturn],
      ['Post-Retirement Return (%)', inputs.postRetirementReturn],
      ['Required Corpus', results.requiredCorpus],
      ['Estimated Corpus', results.estimatedCorpusAtRetirement],
      ['Shortfall', results.shortfall],
      ['Status', results.canRetire ? 'ON TRACK' : 'WORK IN PROGRESS']
    ];
  } else if (inputs.estReturnRate !== undefined && inputs.initialInvestment !== undefined) {
    // ALTERNATE INVESTMENT (Active vs Passive)
    summaryRows = [
      ['Initial Investment', inputs.initialInvestment],
      ['Monthly Contribution', inputs.monthlyContribution],
      ['Time Horizon', inputs.years],
      ['Exp. Return (%)', inputs.estReturnRate],
      ['Inflation (%)', inputs.inflationRate],
      ['Tax Rate (%)', inputs.taxRate],
      ['Active Investment?', inputs.isActiveInvestment ? 'YES' : 'NO'],
      ['Weekly Active Hours', inputs.isActiveInvestment ? inputs.activeHoursPerWeek : '0'],
      ['Hourly Value', inputs.userHourlyRate],
      ['Nominal Value', results.nominalValue],
      ['Real Value (After Tax/Inf)', results.realValue],
      ['Time Cost', results.totalTimeCost],
      ['TRUE Profit', results.netRealProfitAfterTime],
      ['Real ROI (%)', results.roi.truePassive],
      ['Benchmark (NIFTY 50)', results.benchmark.realValue],
      ['Verdict', results.benchmark.isBeatingMarket ? 'BEAT MARKET' : 'UNDERPERFORMED'],
      ['Alpha', results.benchmark.alpha]
    ];
  } else if (inputs.monthlyExpense !== undefined) {
    // LIFE INSURANCE
    summaryRows = [
      ['Monthly Expenses', inputs.monthlyExpense],
      ['Years to Replace', inputs.yearsToReplace],
      ['Inflation Rate (%)', inputs.inflationRate],
      ['Liabilities', inputs.liabilities],
      ['Existing Assets', inputs.existingAssets],
      ['Current Insurance', inputs.currentInsurance],
      ['Total Required Cover', results.totalRequired],
      ['Income Protection Needed', results.expenseCover],
      ['Goals & Liabilities', results.goalCover + (parseFloat(inputs.liabilities) || 0)],
      ['Gap', results.gap],
      ['Status', results.isAdequate ? 'ADEQUATE' : 'UNDER-INSURED']
    ];
  } else if (inputs.stepUp !== undefined) {
    // SIP
    summaryRows = [
      ['Monthly Investment', inputs.loanAmount],
      ['Return Rate (%)', inputs.interestRate],
      ['Period (Years)', inputs.repaymentTenure],
      ['Step Up (%)', inputs.stepUp],
      ['Total Invested', results.monthlyEMI],
      ['Wealth Gained', results.totalInterest],
      ['Maturity Value', results.totalAmount]
    ];
  } else if (inputs.hourlyRate !== undefined) {
    // FREELANCE
    summaryRows = [
      ['Billed Hourly Rate', inputs.hourlyRate],
      ['Billable Hours/Month', inputs.billableHours],
      ['Unpaid Vacation (Weeks/Yr)', inputs.vacationWeeks],
      ['Admin Time (%)', inputs.adminTimePercent],
      ['Tax Rate (%)', inputs.taxRate],
      ['Calculated using 44ADA?', inputs.isPresumptiveTax ? 'Yes' : 'No'],
      ['Total Monthly Expenses', results.totalExpenses],
      ['Estimated Monthly Tax', results.effectiveTaxAmount],
      ['Gross Monthly Income', results.grossMonthly],
      ['Net Take-Home Pay', results.netTakeHome],
      ['Real Hourly Rate', results.realHourlyRate]
    ];
  } else if (inputs.appreciationRate !== undefined && inputs.maintenanceInflation !== undefined) {
    // HOME OWNER REALIST
    summaryRows = [
      ['Property Price', inputs.propertyPrice],
      ['Down Payment', inputs.downPayment],
      ['Mortgage Rate (%)', inputs.interestRate],
      ['Loan Tenure (Years)', inputs.loanTermYears],
      ['Monthly Mortgage', results.financials.monthlyMortgage],
      ['Sinking Fund /mo', results.financials.totalMonthlySinkingFund],
      ['Opportunity Cost /mo', results.financials.monthlyOpportunityCost],
      ['TRUE Monthly Cost', results.financials.trueMonthlyCost],
      ['Immediate Liability', results.financials.immediateLiability],
      ['Final Property Equity', results.financials.finalEquity]
    ];
  } else if (inputs.monthlyRent !== undefined && inputs.propertyPrice !== undefined) {
    // BUY VS RENT
    summaryRows = [
      ['Property Price', inputs.propertyPrice],
      ['Interest Rate (%)', inputs.interestRate],
      ['Monthly Rent', inputs.monthlyRent],
      ['Rent Inflation (%)', inputs.rentInflation],
      ['Tenure (Years)', inputs.tenure],
      ['Buy Wealth (Net)', results.buyNetWealth],
      ['Rent Wealth (Net)', results.rentNetWealth],
      ['Winner', results.winner],
      ['Wealth Difference', Math.abs(results.buyNetWealth - results.rentNetWealth)]
    ];
  } else if (inputs.currentBaseSalary !== undefined) {
    // GOLDEN HANDCUFFS
    summaryRows = [
      ['Current Base Salary', inputs.currentBaseSalary],
      ['Current Bonus', inputs.currentBonus],
      ['Current Annual Equity', inputs.currentAnnualEquity],
      ['Total Comp (Current)', inputs.currentTotalComp],
      ['New Base Salary', inputs.newBaseSalary],
      ['New Bonus', inputs.newBonus],
      ['New Annual Equity', inputs.newAnnualEquity],
      ['Total Comp (New)', inputs.newTotalComp],
      ['The Freedom Tax (Exit Cost)', results.freedomTax],
      ['Break Even Year', results.breakEvenYear || 'Never'],
      ['Verdict', results.isNewJobBetter ? 'SWITCH' : 'STAY']
    ];
  } else if (inputs.annualGrossSalary !== undefined) {
    // TRUE HOURLY WAGE
    summaryRows = [
      ['Annual Gross Salary', inputs.annualGrossSalary],
      ['Tax Rate (%)', inputs.taxRate],
      ['Standard Hours/Week', inputs.standardHoursPerWeek],
      ['Commute One Way (mins)', inputs.commuteOneWayMinutes],
      ['Daily Commute Cost', inputs.commuteDailyCost],
      ['Monthly Convenience', inputs.monthlyConvenienceRen],
      ['Monthly Health', inputs.monthlyHealthren],
      ['Annual Tax', results.annualTax],
      ['Annual Net Income', results.annualNet],
      ['Effective Net Income', results.effectiveNet],
      ['Total Work Hours', results.totalHours],
      ['Nominal Hourly Rate', results.nominalHourly],
      ['True Hourly Rate', results.trueHourly]
    ];
  } else if (inputs.tuitionPerYear !== undefined) {
    // DEGREE ROI
    summaryRows = [
      ['Tuition / Yr', inputs.tuitionPerYear],
      ['Living Expenses / Yr', inputs.livingExpensesPerYear],
      ['Degree Duration', inputs.durationYears],
      ['Grant Total / Yr', inputs.grantsTotal],
      ['Starting Salary (Degree)', inputs.startingSalaryDegree],
      ['Salary Growth (Degree)', inputs.salaryGrowthDegree],
      ['Starting Salary (Alt)', inputs.startingSalaryAlt],
      ['Salary Growth (Alt)', inputs.salaryGrowthAlt],
      [
        'Break-Even Age',
        results.breakEvenYear
          ? 18 + parseInt(inputs.durationYears) + (results.breakEvenYear - parseInt(inputs.durationYears))
          : 'NEVER'
      ],
      ['Slave Ratio (%)', results.slaveRatio],
      ['Final Net Worth (Degree)', results.finalDegreeNW],
      ['Final Net Worth (Alt)', results.finalAltNW]
    ];
  } else if (inputs.activityLevel !== undefined) {
    // TDEE CALCULATOR
    summaryRows = [
      ['Gender', inputs.gender],
      ['Age', inputs.age],
      ['Weight', `${inputs.weight} ${inputs.weightUnit}`],
      ['Height', inputs.heightUnit === 'cm' ? `${inputs.height} cm` : `${inputs.height.ft}' ${inputs.height.in}"`],
      ['Activity Level', inputs.activityLevel],
      ['Body Fat %', inputs.useBodyFat ? inputs.bodyFat : 'N/A'],
      ['Formula Used', inputs.useBodyFat ? 'Katch-McArdle' : 'Mifflin-St Jeor'],
      ['BMR (kcal)', results.bmr],
      ['Maintenance (kcal)', results.maintenance],
      ['Fat Loss Target (kcal)', results.weightLoss],
      ['Bulking Target (kcal)', results.bulking],
      ['Goal Weight', inputs.goalWeight || 'N/A'],
      ['Weeks to Goal', results.weeksToGoal || 'N/A']
    ];
  } else if (inputs.loans !== undefined) {
    // INVEST VS LOAN
    const loansDesc = inputs.loans.map((l) => `${l.name} (${l.rate}%)`).join(', ');
    summaryRows = [
      ['Monthly Surplus', inputs.surplus],
      ['Invest Return (%)', inputs.investmentReturn],
      ['Invest Tax (%)', inputs.investmentTaxRate],
      ['Income Tax Bracket (%)', inputs.userTaxBracket],
      ['Loans', loansDesc],
      ['Recommendation', results.results.winner === 'Payoff' ? 'PAY OFF DEBT' : 'INVEST'],
      ['Net Worth Diff', results.results.netWorthDifference],
      ['Invest Strategy Final', results.results.investStrategy.finalNetWorth],
      ['Payoff Strategy Final', results.results.payoffStrategy.finalNetWorth]
    ];
  } else if (inputs.coreExpenses !== undefined) {
    // EMERGENCY FUND
    summaryRows = [
      ['Core Living Expenses', inputs.coreExpenses],
      ['Discretionary Expenses', inputs.discretionaryExpenses],
      ['Keep Discretionary %', inputs.discretionaryRetention],
      ['Expense Volatility Buffer', inputs.expenseVolatility],
      ['Job Search Duration (Months)', inputs.jobSearchDuration],
      ['Max Health Deductible', inputs.healthDeductible],
      ['Max Property/Car Deductible', inputs.propertyDeductible],
      ['Monthly Burn Rate', results.monthlyBurnRate],
      ['Total Fund Needed', results.totalFund],
      ['Tier 1: Immediate Cash', results.tiers.tier1Cash],
      ['Tier 2: Bank HYSA', results.tiers.tier2Bank],
      ['Tier 3: Investments', results.tiers.tier3Investments]
    ];
  } else if (inputs.desiredIncome !== undefined && inputs.postsPerMonth !== undefined) {
    // CREATOR ECONOMY
    summaryRows = [
      ['Desired Monthly Income', inputs.desiredIncome],
      ['Sponsored Posts/Month', inputs.postsPerMonth],
      ['Total Audience Size', inputs.audienceSize],
      ['Average Reach/Open Rate (%)', inputs.reachRate],
      ['Click-Through Rate (%)', inputs.clickThroughRate],
      ['Active Audience', results.activeAudience],
      ['Target Revenue / Post', results.revenueNeededPerPost],
      ['Required CPM', results.requiredCPM],
      ['Required CPC', results.requiredCPC],
      ['Reality Check', results.realityCheck.message]
    ];
  } else {
    // LOAN or SIP
    if (inputs.repaymentTenure !== undefined && inputs.stepUp === undefined) {
      // EDUCATION LOAN
      summaryRows = [
        ['Loan Amount', inputs.loanAmount],
        ['Interest Rate (%)', inputs.interestRate],
        ['Tenure (Years)', inputs.repaymentTenure],
        ['Monthly EMI', results.monthlyEMI],
        ['Total Interest', results.totalInterest],
        ['Total Payable', results.totalAmount]
      ];
    } else {
      // SIP
      summaryRows = [
        ['Monthly Investment', inputs.loanAmount],
        ['Return Rate (%)', inputs.interestRate],
        ['Period (Years)', inputs.repaymentTenure],
        ['Step Up (%)', inputs.stepUp],
        ['Total Invested', results.monthlyEMI],
        ['Wealth Gained', results.totalInterest],
        ['Maturity Value', results.totalAmount]
      ];
    }
  }

  const wsSummary = XLSX.utils.aoa_to_sheet([['REPORT SUMMARY'], ...summaryRows]);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];

  let scheduleHeader = ['Period', 'Principal/Invested', 'Interest/Returns', 'Balance/Value'];
  let scheduleRows = [];

  if (inputs.loans !== undefined) {
    scheduleHeader = ['Year', 'Invest Strategy NW', 'Payoff Strategy NW', 'Difference'];
    scheduleRows = schedule ? schedule.map((row) => [row.label, row.investNW, row.payoffNW, row.diff]) : [];
  } else {
    scheduleRows = schedule ? schedule.map((row) => [row.label, row.principal, row.interest, row.balance]) : [];
  }

  const wsSchedule = XLSX.utils.aoa_to_sheet([scheduleHeader, ...scheduleRows]);
  wsSchedule['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
  XLSX.utils.book_append_sheet(wb, wsSchedule, 'Schedule');

  XLSX.writeFile(wb, 'Calculator_Report.xlsx');
};
