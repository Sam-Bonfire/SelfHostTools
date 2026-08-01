import { describe, expect, it } from 'vitest';

import { calculateNodeLevels } from '../lib/skillTreeLogic';

describe('skillTreeLogic', () => {
  describe('calculateNodeLevels', () => {
    it('handles empty input', () => {
      const result = calculateNodeLevels([]);
      expect(result.maxLevel).toBe(0);
      expect(result.tiers.length).toBe(0);
    });

    it('calculates levels correctly for a valid acyclic graph', () => {
      const nodes = [
        { id: '1', prereqs: [] }, // Level 0
        { id: '2', prereqs: [] }, // Level 0
        { id: '3', prereqs: ['1', '2'] }, // Level 1
        { id: '4', prereqs: ['3'] } // Level 2
      ];

      const result = calculateNodeLevels(nodes);

      expect(result.maxLevel).toBe(2);
      expect(result.levels['1']).toBe(0);
      expect(result.levels['2']).toBe(0);
      expect(result.levels['3']).toBe(1);
      expect(result.levels['4']).toBe(2);

      expect(result.tiers.length).toBe(3);
      expect(result.tiers[0].length).toBe(2); // node 1, 2
      expect(result.tiers[1].length).toBe(1); // node 3
      expect(result.tiers[2].length).toBe(1); // node 4
    });

    it('ignores prerequisites that do not exist', () => {
      const nodes = [
        { id: '1', prereqs: ['ghost'] }, // Should act like Level 0
        { id: '2', prereqs: ['1'] } // Level 1
      ];

      const result = calculateNodeLevels(nodes);
      expect(result.maxLevel).toBe(1);
      expect(result.levels['1']).toBe(0);
      expect(result.levels['2']).toBe(1);
    });

    it('throws an error when a circular dependency is present', () => {
      const nodes = [
        { id: '1', prereqs: ['3'] },
        { id: '2', prereqs: ['1'] },
        { id: '3', prereqs: ['2'] } // Cycle: 1->2->3->1
      ];

      expect(() => {
        calculateNodeLevels(nodes);
      }).toThrow('Circular dependency detected in the skill tree.');
    });
  });
});
