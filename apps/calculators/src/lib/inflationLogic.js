/**
 * Inflation Destroyer - Purchasing Power Decay Calculator Logic
 * 
 * Innovations vs existing tools:
 * 1. Real-world "basket of goods" translation (weeks of groceries, months of rent lost, etc.)
 * 2. Historical regime scenarios (1970s stagflation, 2000s India, 2020s post-covid, steady 2%)
 * 3. Year-by-year schedule for chart rendering
 * 4. Comparison of "Keep as Cash" vs "Invest to Beat Inflation" projections
 */

// Historical regime presets (average annual inflation rates)
export const HISTORICAL_REGIMES = [
  { id: 'custom',    label: 'Custom Rate',        rate: null,  desc: 'Enter your own inflation rate' },
  { id: 'stable2',   label: 'Stable (2%)',         rate: 2,     desc: 'Developed market target. US Fed, ECB long-run goal.' },
  { id: 'india_avg', label: 'India Average (6%)',   rate: 6,     desc: 'RBI\'s typical 4-6% CPI band. Used for INR financial planning.' },
  { id: 'postcovid', label: 'Post-Covid Era (8%)',  rate: 8,     desc: '2021-2023 global surge driven by supply shocks & stimulus.' },
  { id: 'stagflat',  label: '1970s Stagflation (12%)', rate: 12, desc: 'US/UK oil-shock era. Extreme erosion case study.' },
  { id: 'hyperinfl', label: 'Hyperinflation (25%)', rate: 25,   desc: 'Crisis-level inflation (Turkey 2021-22, Sri Lanka 2022).' },
];

// Real-world price anchors for translating erosion into tangible units (in INR)
export const BASKET_ITEMS = [
  { id: 'groceries',   label: 'Monthly Grocery Budget',    unitCost: 8000,  unit: 'months of groceries' },
  { id: 'petrol',      label: 'Petrol (1 litre)',          unitCost: 95,    unit: 'litres of petrol' },
  { id: 'restaurant',  label: 'Restaurant Meal for Two',   unitCost: 800,   unit: 'restaurant meals' },
  { id: 'rent',        label: 'Average City Rent/Month',   unitCost: 18000, unit: 'months of rent' },
  { id: 'flight',      label: 'Economy Flight (Domestic)', unitCost: 4500,  unit: 'domestic flights' },
  { id: 'movie',       label: 'Cinema Ticket',             unitCost: 300,   unit: 'cinema tickets' },
  { id: 'coffee',      label: 'Café Cappuccino',           unitCost: 200,   unit: 'cups of café coffee' },
];

export const calculateInflationDestroyer = ({
  principal = 100000,
  inflationRate = 6,         // Annual inflation % (can come from regime preset or custom)
  years = 10,
  investmentReturn = 12,    // Expected nominal return if invested (for comparison)
  investmentTaxRate = 10,   // LTCG / tax on returns
  selectedBasketId = 'groceries',
}) => {
  const P = parseFloat(principal) || 0;
  const i = (parseFloat(inflationRate) || 0) / 100;
  const r = (parseFloat(investmentReturn) || 0) / 100;
  const t = (parseFloat(years) || 0);
  const taxRate = (parseFloat(investmentTaxRate) || 0) / 100;

  // 1. Purchasing Power of P after t years at inflation rate i
  const finalPurchasingPower = P / Math.pow(1 + i, t);
  const erosionAmount = P - finalPurchasingPower;
  const erosionPercent = P > 0 ? (erosionAmount / P) * 100 : 0;

  // 2. Investment comparison: how much P grows if invested (after tax on gains)
  const grossInvestmentValue = P * Math.pow(1 + r, t);
  const investmentGains = grossInvestmentValue - P;
  const taxOnGains = investmentGains * taxRate;
  const netInvestmentValue = grossInvestmentValue - taxOnGains;
  // Real (inflation-adjusted) value of the net investment
  const realInvestmentValue = netInvestmentValue / Math.pow(1 + i, t);
  const investmentVsCashGap = realInvestmentValue - finalPurchasingPower;
  const isBeatingInflation = r * (1 - taxRate) > i;

  // 3. Basket of goods translation
  const basket = BASKET_ITEMS.find(b => b.id === selectedBasketId) || BASKET_ITEMS[0];
  const unitsToday = basket.unitCost > 0 ? P / basket.unitCost : 0;
  const unitsFuture = basket.unitCost > 0 ? finalPurchasingPower / basket.unitCost : 0;
  const unitsLost = unitsToday - unitsFuture;

  // 4. Year-by-year schedule
  const schedule = [];
  for (let y = 0; y <= t; y++) {
    const cashPP = P / Math.pow(1 + i, y);
    const grossInv = P * Math.pow(1 + r, y);
    const gains = grossInv - P;
    const netInv = grossInv - gains * taxRate;
    const realInv = netInv / Math.pow(1 + i, y);
    schedule.push({
      year: y,
      label: `Year ${y}`,
      cashPurchasingPower: Math.round(cashPP),
      grossInvestmentValue: Math.round(grossInv),
      netInvestmentValue: Math.round(netInv),
      realInvestmentValue: Math.round(realInv),
      erosionPercent: parseFloat(((P - cashPP) / P * 100).toFixed(1)),
    });
  }

  return {
    results: {
      principal: Math.round(P),
      finalPurchasingPower: Math.round(finalPurchasingPower),
      erosionAmount: Math.round(erosionAmount),
      erosionPercent: parseFloat(erosionPercent.toFixed(2)),
      grossInvestmentValue: Math.round(grossInvestmentValue),
      netInvestmentValue: Math.round(netInvestmentValue),
      realInvestmentValue: Math.round(realInvestmentValue),
      investmentVsCashGap: Math.round(investmentVsCashGap),
      isBeatingInflation,
    },
    basket: {
      id: selectedBasketId,
      label: basket.label,
      unit: basket.unit,
      unitsToday: parseFloat(unitsToday.toFixed(1)),
      unitsFuture: parseFloat(unitsFuture.toFixed(1)),
      unitsLost: parseFloat(unitsLost.toFixed(1)),
    },
    schedule,
  };
};
