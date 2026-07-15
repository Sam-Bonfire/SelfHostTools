import { describe, expect, it } from 'vitest';

import { calculateRunwayData, generateSVGPath } from '../lib/runwayLandscape';

describe('Runway Horizon Math and Layouts', () => {
  it('should calculate finite runway accurately for positive net burn', () => {
    const result = calculateRunwayData(100000, 30000, 10000, 15000); // Net Burn = 40000 - 15000 = 25000
    expect(result.netBurn).toBe(25000);
    expect(result.runwayMonths).toBe(4);
    expect(result.isInfinite).toBe(false);
    expect(result.history[4].balance).toBe(0); // Dips to zero on month 4
  });

  it('should claim infinite runway correctly for positive net cashflow', () => {
    const result = calculateRunwayData(50000, 10000, 5000, 20000); // Net monthly cashflow is +5000 (net burn is -5000)
    expect(result.netBurn).toBe(-5000);
    expect(result.runwayMonths).toBe(Infinity);
    expect(result.isInfinite).toBe(true);
    expect(result.history[24].balance).toBeGreaterThan(50000); // Growing over time
  });

  it('should construct fully formed SVG path strings', () => {
    const data = calculateRunwayData(100000, 20000, 10000, 5000);
    const { linePath, fillPath, points } = generateSVGPath(data.history, 500, 300);

    expect(linePath).toContain('M');
    expect(linePath).toContain('C');
    expect(fillPath).toContain('L');
    expect(points.length).toBe(25); // 0 to 24 months = 25 points
  });
});
