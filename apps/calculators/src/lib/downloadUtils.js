const formatCurrency = (val, isPDF = false) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);

  if (isPDF) {
    return formatted.replace(/[^\x00-\x7F]/g, '').trim();
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

  const tableBody = schedule.map(row => [
    row.label,
    formatCurrency(row.principal, true),
    formatCurrency(row.interest, true),
    formatCurrency(row.balance, true)
  ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Period', 'Principal/Invested', 'Interest/Returns', 'Balance/Value']],
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
  } else {
    // LOAN
    summaryRows = [
      ['Loan Amount', inputs.loanAmount],
      ['Interest Rate (%)', inputs.interestRate],
      ['Tenure (Years)', inputs.repaymentTenure],
      ['Monthly EMI', results.monthlyEMI],
      ['Total Interest', results.totalInterest],
      ['Total Payable', results.totalAmount]
    ];
  }

  const wsSummary = XLSX.utils.aoa_to_sheet([['REPORT SUMMARY'], ...summaryRows]);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];

  const scheduleHeader = ['Period', 'Principal/Invested', 'Interest/Returns', 'Balance/Value'];
  const scheduleRows = schedule.map(row => [
    row.label,
    row.principal,
    row.interest,
    row.balance
  ]);

  const wsSchedule = XLSX.utils.aoa_to_sheet([scheduleHeader, ...scheduleRows]);
  wsSchedule['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
  XLSX.utils.book_append_sheet(wb, wsSchedule, 'Schedule');

  XLSX.writeFile(wb, 'Calculator_Report.xlsx');
};
