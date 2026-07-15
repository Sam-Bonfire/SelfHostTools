/**
 * Runway Horizon Math and SVG Path Generators
 */

export function calculateRunwayData(cash, fixedExpenses, variableExpenses, income, lifeEvents = []) {
  const totalExpenses = fixedExpenses + variableExpenses;
  const netBurn = totalExpenses - income;

  // Generate monthly balances over a 24-month horizon
  const history = [];
  let tempCash = cash;
  let crashedAtMonth = null;

  for (let m = 0; m <= 24; m++) {
    const eventsThisMonth = lifeEvents.filter((e) => e.month === m);
    let eventImpact = 0;
    eventsThisMonth.forEach((e) => {
      eventImpact += e.amount;
    });

    tempCash += eventImpact;
    if (tempCash < 0) tempCash = 0;

    history.push({
      month: m,
      balance: Math.max(0, Math.round(tempCash)),
      events: eventsThisMonth
    });

    if (tempCash === 0 && crashedAtMonth === null) {
      crashedAtMonth = m;
    }

    if (netBurn > 0) {
      tempCash = tempCash - netBurn;
    } else {
      tempCash += Math.abs(netBurn);
    }
  }

  let runwayMonths;
  if (crashedAtMonth !== null) {
    runwayMonths = crashedAtMonth;
  } else {
    runwayMonths = netBurn <= 0 ? Infinity : Number((24 + tempCash / netBurn).toFixed(1));
  }

  return {
    runwayMonths,
    netBurn,
    history,
    isInfinite: netBurn <= 0 && crashedAtMonth === null
  };
}

/**
 * Generate a beautiful smooth SVG Bezier path for the landscape
 */
export function generateSVGPath(history, width, height) {
  if (history.length === 0) return '';

  const maxVal = Math.max(...history.map((h) => h.balance)) || 1;
  const len = history.length;

  // Margin and bounds for drawing inside canvas cleanly
  const paddingBottom = 40;
  const paddingTop = 40;
  const graphHeight = height - paddingBottom - paddingTop;

  const points = history.map((h, i) => {
    const x = (i / (len - 1)) * (width - 40) + 20;
    // height - bottom padding - (balance ratio * usable graph height)
    const y = height - paddingBottom - (h.balance / maxVal) * graphHeight;
    return { x, y };
  });

  // Create custom SVG path using cubic Beziers for smooth rolling hills
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];

    // Control points for smooth curve
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;

    path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  return {
    linePath: path,
    // Helper to fill color below the curve
    fillPath: `${path} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`,
    points
  };
}
