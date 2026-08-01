/**
 * Calculates the divergence between a flat habit and a compounding habit over time.
 * @param {number} weeklyRate - The percentage change per week (e.g., 1 for +1%, -1 for -1%)
 * @param {number} years - Number of years to simulate
 * @returns {Object} Data object containing history and max/min values
 */
export function calculateHabitDivergence(weeklyRate = 1, years = 10) {
  const weeks = years * 52;
  const rateMultiplier = 1 + weeklyRate / 100;

  const history = [];
  let currentValue = 1; // Baseline starting value

  for (let w = 0; w <= weeks; w++) {
    history.push({
      week: w,
      year: w / 52,
      flat: 1,
      compounded: currentValue
    });
    // Calculate for next week
    currentValue *= rateMultiplier;
  }

  const finalCompounded = history[history.length - 1].compounded;

  return {
    weeks,
    finalCompounded,
    multiplier: finalCompounded / 1, // How many times better/worse
    history
  };
}

/**
 * Generates SVG path strings for the flat line and compounded line.
 * @param {Array} history - The history array from calculateHabitDivergence
 * @param {number} width - SVG viewBox width
 * @param {number} height - SVG viewBox height
 * @param {number} padding - Padding from top/bottom to prevent clipping
 */
export function generateHabitSVGPaths(history, width = 800, height = 400, padding = 40) {
  if (!history || history.length === 0) {
    return { flatPath: '', compoundPath: '', points: [] };
  }

  const maxWeek = history[history.length - 1].week;

  // Find min and max values to scale the Y axis
  const values = history.map((h) => h.compounded).concat([1]); // include flat line
  const maxVal = Math.max(...values, 1.2); // At least 1.2 to give some headroom
  const minVal = 0; // Always anchor Y axis at 0 for visual grounding

  const scaleX = (x) => (x / maxWeek) * width;
  const scaleY = (y) => {
    // Inverse Y because SVG 0 is top
    const usableHeight = height - padding * 2;
    const ratio = (y - minVal) / (maxVal - minVal);
    return height - padding - ratio * usableHeight;
  };

  let flatPath = '';
  let compoundPath = '';
  let fillPath = '';
  const points = [];

  history.forEach((point, i) => {
    const x = scaleX(point.week);
    const yFlat = scaleY(point.flat);
    const yCompound = scaleY(point.compounded);

    points.push({ week: point.week, x, yFlat, yCompound, compounded: point.compounded });

    if (i === 0) {
      flatPath += `M ${x},${yFlat} `;
      compoundPath += `M ${x},${yCompound} `;
      fillPath += `M ${x},${yCompound} `;
    } else {
      flatPath += `L ${x},${yFlat} `;
      compoundPath += `L ${x},${yCompound} `;
      fillPath += `L ${x},${yCompound} `;
    }
  });

  // Close the fill path by drawing a line back along the flat path
  for (let i = history.length - 1; i >= 0; i--) {
    const pt = points[i];
    fillPath += `L ${pt.x},${pt.yFlat} `;
  }
  fillPath += 'Z';

  return { flatPath, compoundPath, fillPath, points, maxVal, minVal, scaleY };
}
