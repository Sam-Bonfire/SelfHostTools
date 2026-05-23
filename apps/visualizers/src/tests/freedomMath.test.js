import { describe, it, expect } from 'vitest';
import { calculateFreedomIndex, polarToCartesian, generateDonutWedge } from '../lib/freedomMath';

describe('Freedom Clock Math Calculations', () => {
    it('should compute exact freedom index percentages', () => {
        expect(calculateFreedomIndex(6)).toBe(25.0);
        expect(calculateFreedomIndex(12)).toBe(50.0);
        expect(calculateFreedomIndex(3)).toBe(12.5);
    });

    it('should map angular coordinate degrees to 2D space Cartesian offset points', () => {
        const center = { x: 100, y: 100 };
        // 90 degrees represents pointing directly right in unit circle, but rotated -90 in our polar system to point up
        const coord = polarToCartesian(center.x, center.y, 50, 90);
        expect(coord.x).toBeCloseTo(150, 2);
        expect(coord.y).toBeCloseTo(100, 2);
    });

    it('should construct fully completed SVG donut segment paths', () => {
        const path = generateDonutWedge(100, 100, 40, 80, 0, 180);
        expect(path).toContain('M');
        expect(path).toContain('A');
        expect(path).toContain('L');
        expect(path).toContain('Z');
    });
});
