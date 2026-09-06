import { decideWinner } from '@packages/compare';
import { describe, expect, it } from 'vitest';

describe('decideWinner (shared comparison engine)', () => {
  it('should pick the higher value and report margin', () => {
    const result = decideWinner([
      { id: 'Buy', value: 5000000 },
      { id: 'Rent', value: 4200000 }
    ]);

    expect(result.winnerId).toBe('Buy');
    expect(result.winnerLabel).toBe('Buy');
    expect(result.margin).toBe(800000);
    expect(result.marginPct).toBeCloseTo(0.16, 5);
    expect(result.isTie).toBe(false);
    expect(result.ranking.map((r) => r.id)).toEqual(['Buy', 'Rent']);
  });

  it('should call a tie below tolerance', () => {
    const result = decideWinner(
      [
        { id: 'Payoff', value: 100050 },
        { id: 'Invest', value: 100000 }
      ],
      { tolerance: 100 }
    );

    expect(result.isTie).toBe(true);
    expect(result.margin).toBe(50);
  });

  it('should not tie at exactly the tolerance boundary', () => {
    const result = decideWinner(
      [
        { id: 'Payoff', value: 100100 },
        { id: 'Invest', value: 100000 }
      ],
      { tolerance: 100 }
    );

    expect(result.isTie).toBe(false);
    expect(result.winnerId).toBe('Payoff');
  });

  it('should handle empty entries safely', () => {
    const result = decideWinner([]);
    expect(result.winnerId).toBe(null);
    expect(result.isTie).toBe(true);
  });
});
