/**
 * Amortization Art: every EMI split into principal vs interest, year by year.
 * Extra payments shorten the loan; the schedule reports exactly how much
 * interest they kill.
 */

export function calculateAmortization(inputs) {
  const {
    principal = 0,
    annualRate = 0,
    tenureYears = 0,
    extraMonthly = 0
  } = inputs;

  const safe = (v) => Math.max(0, parseFloat(v) || 0);
  const P = safe(principal);
  const r = safe(annualRate) / 12 / 100;
  const n = Math.max(1, Math.floor(safe(tenureYears) * 12));
  const extra = safe(extraMonthly);

  const emi = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;

  const build = (extraAmt) => {
    const schedule = [];
    let balance = P;
    let yearPrincipal = 0;
    let yearInterest = 0;
    let monthsPaid = 0;

    for (let m = 1; m <= n && balance > 0.01; m++) {
      const interest = balance * r;
      let principalPaid = Math.min(balance, emi - interest + extraAmt);
      balance -= principalPaid;
      yearPrincipal += principalPaid;
      yearInterest += interest;
      monthsPaid = m;

      if (m % 12 === 0 || m === n || balance <= 0.01) {
        schedule.push({
          label: `Year ${Math.ceil(m / 12)}`,
          principal: Math.round(yearPrincipal),
          interest: Math.round(yearInterest),
          balance: Math.round(Math.max(0, balance))
        });
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }

    // Totals derive from the rounded schedule so displayed numbers always add up.
    const schedPrincipal = schedule.reduce((s, y) => s + y.principal, 0);
    const schedInterest = schedule.reduce((s, y) => s + y.interest, 0);
    return { schedule, monthsPaid, schedPrincipal, schedInterest };
  };

  const { schedule, monthsPaid, schedPrincipal, schedInterest } = build(extra);
  // Baseline without extra payments, for the savings comparison.
  const baseInterest = build(0).schedInterest;

  return {
    emi: Math.round(emi * 100) / 100,
    schedule,
    monthsPaid,
    totalInterest: schedInterest,
    totalPrincipal: schedPrincipal,
    totalPaid: schedInterest + schedPrincipal,
    interestSaved: Math.max(0, baseInterest - schedInterest),
    monthsSaved: n - monthsPaid
  };
}

/** Stacked-bar geometry: principal + interest share per year. */
export function generateAmortizationBars(schedule, width, height) {
  if (!schedule || schedule.length === 0) return { bars: [], maxTotal: 0 };
  const maxTotal = Math.max(1, ...schedule.map((s) => s.principal + s.interest));
  const pad = 30;
  const slot = (width - pad * 2) / schedule.length;
  const barW = Math.min(48, slot * 0.6);
  const bars = schedule.map((s, i) => {
    const total = s.principal + s.interest;
    const h = (total / maxTotal) * (height - pad * 2);
    const principalH = total > 0 ? (s.principal / total) * h : 0;
    return {
      x: pad + slot * i + (slot - barW) / 2,
      width: barW,
      totalH: h,
      principalH,
      interestH: h - principalH,
      baseY: height - pad
    };
  });
  return { bars, maxTotal };
}
