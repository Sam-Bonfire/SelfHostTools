import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { calculateLines, debounce, getRelativePos } from '../lib/funnelLogic.js';

describe('funnelLogic', () => {
  describe('getRelativePos', () => {
    it('returns {x:0, y:0} if element has no offsets', () => {
      const el = { offsetLeft: 0, offsetTop: 0, offsetParent: null };
      expect(getRelativePos(el, null)).toEqual({ x: 0, y: 0 });
    });

    it('accumulates offsets until canvasEl is reached', () => {
      const canvasEl = { id: 'canvas' };
      const parent1 = { offsetLeft: 10, offsetTop: 10, offsetParent: canvasEl };
      const el = { offsetLeft: 5, offsetTop: 5, offsetParent: parent1 };

      expect(getRelativePos(el, canvasEl)).toEqual({ x: 15, y: 15 });
    });

    it('accumulates offsets until parent is null if canvasEl is not matched', () => {
      const parent1 = { offsetLeft: 10, offsetTop: 10, offsetParent: null };
      const el = { offsetLeft: 5, offsetTop: 5, offsetParent: parent1 };

      expect(getRelativePos(el, null)).toEqual({ x: 15, y: 15 });
    });
  });

  describe('calculateLines', () => {
    let canvasRef;
    let nodeRefs;
    let nodes;
    let stages;
    let nodesByStage;

    beforeEach(() => {
      canvasRef = { current: { id: 'canvas' } };
      nodeRefs = { current: {} };
      stages = ['Stage1', 'Stage2', 'Stage3', 'Stage4'];
      nodesByStage = {
        Stage1: [{ id: 'n1' }],
        Stage2: [{ id: 'n2' }],
        Stage3: [{ id: 'n3' }],
        Stage4: [{ id: 'n4' }]
      };
      nodes = [
        { id: 'n1', stage: 'Stage1', targets: ['n2'] },
        { id: 'n2', stage: 'Stage2', targets: ['n3'] },
        { id: 'n3', stage: 'Stage3', targets: ['n4'] },
        { id: 'n4', stage: 'Stage4', targets: [] }
      ];
    });

    it('returns empty array if canvasRef.current is null', () => {
      expect(calculateLines({ canvasRef: { current: null } })).toEqual([]);
    });

    it('skips source node if its ref is missing', () => {
      nodes[0].targets = []; // no targets for simplicity
      expect(calculateLines({ nodes, stages, nodesByStage, nodeRefs, canvasRef })).toEqual([]);
    });

    it('skips target if target ref or node is missing', () => {
      nodeRefs.current['n1'] = { offsetLeft: 10, offsetTop: 10, offsetWidth: 20, offsetHeight: 20, offsetParent: null };
      expect(calculateLines({ nodes, stages, nodesByStage, nodeRefs, canvasRef })).toEqual([]);
    });

    it('creates standard bezier curve for adjacent stages', () => {
      nodeRefs.current['n1'] = { offsetLeft: 10, offsetTop: 10, offsetWidth: 20, offsetHeight: 20, offsetParent: null };
      nodeRefs.current['n2'] = { offsetLeft: 50, offsetTop: 50, offsetWidth: 20, offsetHeight: 20, offsetParent: null };

      const lines = calculateLines({ nodes, stages, nodesByStage, nodeRefs, canvasRef });
      expect(lines).toHaveLength(1);
      expect(lines[0].id).toBe('n1-n2');
      expect(lines[0].d).toContain('C '); // cubic bezier
    });

    it('handles orthogonal routing (targetStageIndex - sourceStageIndex > 1) with minX !== Infinity, going right (goLeft=false), dir1=1, dir2=1', () => {
      // n1 to n3 (Stage1 to Stage3)
      nodes[0].targets = ['n3'];
      nodeRefs.current['n1'] = { offsetLeft: 10, offsetTop: 10, offsetWidth: 20, offsetHeight: 20, offsetParent: null };
      // n2 is intermediate
      nodeRefs.current['n2'] = { offsetLeft: 30, offsetTop: 50, offsetWidth: 20, offsetHeight: 20, offsetParent: null };
      nodeRefs.current['n3'] = {
        offsetLeft: 100,
        offsetTop: 100,
        offsetWidth: 20,
        offsetHeight: 20,
        offsetParent: null
      };

      const lines = calculateLines({ nodes, stages, nodesByStage, nodeRefs, canvasRef });
      const line = lines.find((l) => l.id === 'n1-n3');
      expect(line).toBeDefined();
      expect(line.d).toContain('Q '); // quadratic bezier
    });

    it('handles orthogonal routing going left (goLeft=true) with various R values', () => {
      nodes[0].targets = ['n3'];
      // R = R1 = R2 = Math.min(12, Math.abs(...) / 2)
      // dir1 = -1, dir2 = -1 (channelX < startX, endX < channelX)
      nodeRefs.current['n1'] = {
        offsetLeft: 100,
        offsetTop: 10,
        offsetWidth: 20,
        offsetHeight: 20,
        offsetParent: null
      };
      nodeRefs.current['n2'] = { offsetLeft: 60, offsetTop: 50, offsetWidth: 20, offsetHeight: 20, offsetParent: null };
      nodeRefs.current['n3'] = {
        offsetLeft: 10,
        offsetTop: 100,
        offsetWidth: 20,
        offsetHeight: 20,
        offsetParent: null
      };

      const lines = calculateLines({ nodes, stages, nodesByStage, nodeRefs, canvasRef });
      const line = lines.find((l) => l.id === 'n1-n3');
      expect(line).toBeDefined();
      expect(line.d).toContain('Q ');
    });

    it('handles orthogonal routing where minX remains Infinity (intermediate nodes have no refs)', () => {
      nodes[0].targets = ['n3'];
      nodeRefs.current['n1'] = { offsetLeft: 10, offsetTop: 10, offsetWidth: 20, offsetHeight: 20, offsetParent: null };
      // n2 has no ref
      nodeRefs.current['n3'] = {
        offsetLeft: 100,
        offsetTop: 100,
        offsetWidth: 20,
        offsetHeight: 20,
        offsetParent: null
      };

      const lines = calculateLines({ nodes, stages, nodesByStage, nodeRefs, canvasRef });
      expect(lines).toHaveLength(1);
      expect(lines[0].d).toContain('C '); // minX === Infinity => falls back to standard bezier
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce the function call', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      expect(func).not.toBeCalled();

      vi.advanceTimersByTime(50);
      expect(func).not.toBeCalled();

      vi.advanceTimersByTime(50);
      expect(func).toBeCalledTimes(1);
    });

    it('should pass arguments to the debounced function', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc('test', 123);
      vi.advanceTimersByTime(100);

      expect(func).toBeCalledWith('test', 123);
    });
  });
});
