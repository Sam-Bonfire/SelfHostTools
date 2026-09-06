/**
 * Net-Worth Bridge: assets grow, debts shrink, one chart.
 * Links the two apps: optional import presets pull live numbers from
 * calculator localStorage (SIP + FIRE namespaces) with safe fallbacks.
 */

export function calculateNetWorthBridge(inputs) {
  const {
    startingAssets = 0,
    startingDebt = 0,
    monthlyInvest = 0,
    monthlyDebtPayment = 0,
    assetReturn = 12,
    debtRate = 10,
    years = 10
  } = inputs;

  const safe = (v) => Math.max(0, parseFloat(v) || 0);
  const horizon = Math.max(1, Math.min(40, Math.floor(safe(years)) || 1));
  const rA = safe(assetReturn) / 12 / 100;
  const rD = safe(debtRate) / 12 / 100;

  let assets = safe(startingAssets);
  let debt = safe(startingDebt);
  const history = [{ year: 0, assets: Math.round(assets), debt: Math.round(debt), netWorth: Math.round(assets - debt) }];

  let debtFreeYear = debt <= 0 ? 0 : null;
  let crossoverYear = assets - debt > 0 ? 0 : null;

  for (let y = 1; y <= horizon; y++) {
    for (let m = 0; m < 12; m++) {
      assets = assets * (1 + rA) + safe(monthlyInvest);
      if (debt > 0) {
        debt = debt * (1 + rD) - safe(monthlyDebtPayment);
        if (debt < 0) debt = 0;
      }
    }
    const netWorth = assets - debt;
    if (debtFreeYear === null && debt <= 0) debtFreeYear = y;
    if (crossoverYear === null && netWorth > 0) crossoverYear = y;
    history.push({ year: y, assets: Math.round(assets), debt: Math.round(debt), netWorth: Math.round(netWorth) });
  }

  const final = history[history.length - 1];
  return { history, finalNetWorth: final.netWorth, finalAssets: final.assets, finalDebt: final.debt, debtFreeYear, crossoverYear };
}

/**
 * Totally honest import: reads calculator namespaces from a storage-like
 * object ({ getItem }). Returns nulls when nothing usable is stored.
 */
export function extractBridgeInputs(storage) {
  const read = (namespace) => {
    try {
      const raw = storage.getItem(`sh_${namespace}_master`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.data?.[parsed?.activeProfile || 'Default'] || null;
    } catch {
      return null;
    }
  };
  const num = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  const sip = read('SIPCalculator');
  const fire = read('FIRECalculator');

  return {
    monthlyInvest: num(sip?.monthlyInvestment) ?? num(fire?.monthlyInvestment),
    startingAssets: num(fire?.currentSavings),
    assetReturn: num(sip?.expectedReturn) ?? num(fire?.preRetirementReturn)
  };
}

/** Minimal SVG area paths for the assets/debt/net-worth series. */
export function generateBridgePaths(history, width, height) {
  if (!history || history.length === 0) return { assetsPath: '', debtPath: '', points: [] };
  const maxVal = Math.max(1, ...history.map((h) => Math.max(h.assets, h.debt)));
  const pad = 30;
  const points = history.map((h, i) => {
    const x = history.length === 1 ? pad : pad + (i / (history.length - 1)) * (width - pad * 2);
    return {
      x,
      assetsY: height - pad - (h.assets / maxVal) * (height - pad * 2),
      debtY: height - pad - (h.debt / maxVal) * (height - pad * 2)
    };
  });
  const line = (key) => `M ${points.map((p) => `${p.x} ${p[key]}`).join(' L ')}`;
  return {
    assetsPath: line('assetsY'),
    debtPath: line('debtY'),
    points
  };
}
