import { describe, expect, it } from 'vitest';

import { calculateHabitDivergence, generateHabitSVGPaths } from '../lib/habitCompounderLogic';

describe('habitCompounderLogic', () => {
  describe('calculateHabitDivergence', () => {
    it('calculates 1% growth over 1 year (52 weeks) correctly', () => {
      const data = calculateHabitDivergence(1, 1);
      expect(data.weeks).toBe(52);
      expect(data.history.length).toBe(53); // Week 0 to 52

      // 1.01 ^ 52 = 1.67768...
      expect(data.finalCompounded).toBeCloseTo(1.678, 3);
      expect(data.multiplier).toBeCloseTo(1.678, 3);

      expect(data.history[0].flat).toBe(1);
      expect(data.history[0].compounded).toBe(1);
    });

    it('calculates 1% decay over 1 year (52 weeks) correctly', () => {
      const data = calculateHabitDivergence(-1, 1);
      // 0.99 ^ 52 = 0.593...
      expect(data.finalCompounded).toBeCloseTo(0.593, 3);
      expect(data.multiplier).toBeCloseTo(0.593, 3);
    });

    it('calculates 0% growth over 1 year (52 weeks) correctly', () => {
      const data = calculateHabitDivergence(0, 1);
      expect(data.finalCompounded).toBe(1);
      expect(data.multiplier).toBe(1);
      expect(data.history[52].flat).toBe(1);
      expect(data.history[52].compounded).toBe(1);
    });
  });

  describe('generateHabitSVGPaths', () => {
    it('handles empty history gracefully', () => {
      const result = generateHabitSVGPaths([]);
      expect(result.flatPath).toBe('');
      expect(result.compoundPath).toBe('');
      expect(result.points).toEqual([]);
    });

    it('generates valid SVG paths for 10 years at 1%', () => {
      const data = calculateHabitDivergence(1, 10);
      const result = generateHabitSVGPaths(data.history, 800, 400, 0); // 0 padding for easier math

      expect(result.points.length).toBe(521); // 10 * 52 + 1
      expect(result.flatPath).toMatch(/^M 0,\d+(\.\d+)? L.*$/);
      expect(result.compoundPath).toMatch(/^M 0,\d+(\.\d+)? L.*$/);
      expect(result.fillPath).toMatch(/^M 0,\d+(\.\d+)? L.* Z$/);

      // Start points should be identical in x and y (since both start at 1)
      const p0 = result.points[0];
      expect(p0.x).toBe(0);
      expect(p0.yFlat).toBe(p0.yCompound);

      // End point X should be width (800)
      const pEnd = result.points[520];
      expect(pEnd.x).toBe(800);
      // Compounded Y should be higher up on the screen (lower Y value in SVG)
      expect(pEnd.yCompound).toBeLessThan(pEnd.yFlat);
    });
  });
});
