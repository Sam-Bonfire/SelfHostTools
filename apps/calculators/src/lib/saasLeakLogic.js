/**
 * SaaS Subscription Leak - Opportunity Cost Logic
 *
 * Enhanced with:
 * - Category breakdown analysis
 * - Usage frequency → cost-per-use
 * - Dead weight detection (expensive + rarely used)
 * - Value score per subscription
 */

export const SUBSCRIPTION_CATEGORIES = [
  { id: 'entertainment', label: 'Entertainment', color: '#7c3aed' },
  { id: 'productivity', label: 'Productivity', color: '#2563eb' },
  { id: 'dev_tools', label: 'Dev Tools', color: '#059669' },
  { id: 'ai_tools', label: 'AI Tools', color: '#d97706' },
  { id: 'health', label: 'Health & Fitness', color: '#db2777' },
  { id: 'education', label: 'Education', color: '#0891b2' },
  { id: 'cloud', label: 'Cloud & Storage', color: '#4f46e5' },
  { id: 'other', label: 'Other', color: '#6b7280' },
];

export const USAGE_FREQUENCIES = [
  { id: 'daily', label: 'Daily', usesPerMonth: 30, score: 10 },
  { id: 'weekly', label: 'Weekly', usesPerMonth: 4.3, score: 7 },
  { id: 'monthly', label: 'Monthly', usesPerMonth: 1, score: 4 },
  { id: 'rarely', label: 'Rarely', usesPerMonth: 0.25, score: 1 },
];

// Dead weight threshold: low usage + more than this monthly cost
const DEAD_WEIGHT_COST_THRESHOLD = 200;

export const calculateSaaSLeak = ({
  calcMode = 'aggregate',
  monthlyInvestment = 0,
  expectedReturn = 12,
  hourlyWage = 0,
  subscriptions = [],
}) => {
  const r = (parseFloat(expectedReturn) || 0) / 100;
  const wage = parseFloat(hourlyWage) || 0;

  // --- Core Monthly Spend ---
  let totalMonthlySpend = 0;
  if (calcMode === 'individual') {
    totalMonthlySpend = parseFloat(monthlyInvestment) || 0;
  } else {
    // Sum only active subscriptions
    totalMonthlySpend = subscriptions
      .filter(s => s.active)
      .reduce((sum, s) => {
        const cost = parseFloat(s.cost) || 0;
        const subMonthly = s.billingPeriod === 'yearly' ? cost / 12 : cost;
        return sum + subMonthly;
      }, 0);
  }

  const annualSpend = totalMonthlySpend * 12;

  // --- Work Equivalence ---
  const annualHoursRequired = wage > 0 ? Math.round((annualSpend / wage) * 10) / 10 : 0;
  const careerDaysRequired = Math.round((annualHoursRequired / 8) * 100) / 100;

  // --- Compound Projections ---
  const buildProjection = (years) => {
    const principal = totalMonthlySpend * 12 * years;
    const futureValue = r > 0
      ? totalMonthlySpend * ((Math.pow(1 + r / 12, years * 12) - 1) / (r / 12))
      : principal;
    return {
      years,
      principal: Math.round(principal),
      futureValue: Math.round(futureValue),
      compoundReturns: Math.round(futureValue - principal),
    };
  };

  const projections = {
    10: buildProjection(10),
    20: buildProjection(20),
    30: buildProjection(30),
  };

  // --- Year-by-Year Schedule ---
  const schedule = Array.from({ length: 30 }, (_, index) => {
    const y = index + 1;
    const principal = totalMonthlySpend * 12 * y;
    const futureValue = r > 0
      ? totalMonthlySpend * ((Math.pow(1 + r / 12, y * 12) - 1) / (r / 12))
      : principal;
    const interest = futureValue - principal;
    return {
      year: y,
      label: `Year ${y}`,
      principal: Math.round(principal),
      interest: Math.round(Math.max(0, interest)),
      balance: Math.round(futureValue),
    };
  });

  // --- Per-Subscription Metrics (category / usage) ---
  const perSubMetrics = {};
  subscriptions.filter(s => s.active).forEach(sub => {
    const freq = USAGE_FREQUENCIES.find(f => f.id === sub.usageFrequency) || USAGE_FREQUENCIES[2]; // default monthly
    const cost = parseFloat(sub.cost) || 0;
    const subMonthly = sub.billingPeriod === 'yearly' ? cost / 12 : cost;
    const costPerUse = freq.usesPerMonth > 0
      ? Math.round((subMonthly / freq.usesPerMonth) * 10) / 10
      : subMonthly;
    const isDeadWeight = freq.id === 'rarely' && subMonthly >= DEAD_WEIGHT_COST_THRESHOLD;
    perSubMetrics[sub.id] = { costPerUse, valueScore: freq.score, isDeadWeight };
  });

  const deadWeightItems = subscriptions.filter(
    s => s.active && perSubMetrics[s.id]?.isDeadWeight
  );

  // --- Category Breakdown ---
  const categoryBreakdown = SUBSCRIPTION_CATEGORIES
    .map(cat => {
      const catSubs = subscriptions.filter(s => s.active && s.category === cat.id);
      const total = catSubs.reduce((sum, s) => {
        const cost = parseFloat(s.cost) || 0;
        return sum + (s.billingPeriod === 'yearly' ? cost / 12 : cost);
      }, 0);
      return {
        ...cat,
        totalMonthly: Math.round(total),
        totalAnnual: Math.round(total * 12),
        count: catSubs.length,
        percent: totalMonthlySpend > 0 ? Math.round((total / totalMonthlySpend) * 100) : 0,
      };
    })
    .filter(cat => cat.count > 0)
    .sort((a, b) => b.totalMonthly - a.totalMonthly);

  return {
    results: {
      totalMonthlySpend: Math.round(totalMonthlySpend),
      annualSpend: Math.round(annualSpend),
      annualHoursRequired,
      careerDaysRequired,
    },
    projections,
    schedule,
    categoryBreakdown,
    deadWeightItems,
    perSubMetrics,
  };
};
