/**
 * Shared A-vs-B comparison engine.
 * Every "which strategy wins?" question returns the same shape:
 * a winner, the margin, and a full ranking — no more bespoke verdict code.
 *
 * Tie convention: a margin strictly below `tolerance` is a tie;
 * exact ties break toward the earlier entry (stable sort).
 */

/**
 * @param {Array<{id: string, label?: string, value: number}>} entries
 * @param {{tolerance?: number}} options
 * @returns {{winnerId: string|null, winnerLabel: string|null, margin: number, marginPct: number, isTie: boolean, ranking: Array}}
 */
export function decideWinner(entries, { tolerance = 0 } = {}) {
  const clean = (entries || []).map((e) => ({
    id: e.id,
    label: e.label || e.id,
    value: Number(e.value) || 0
  }));
  const ranking = [...clean].sort((a, b) => b.value - a.value);
  const [top, second] = ranking;

  if (!top) {
    return { winnerId: null, winnerLabel: null, margin: 0, marginPct: 0, isTie: true, ranking };
  }

  const margin = top.value - (second ? second.value : 0);
  const isTie = Boolean(second) && margin < Math.max(0, tolerance);
  const base = Math.max(Math.abs(top.value), Math.abs(second?.value || 0), 1);

  return {
    winnerId: top.id,
    winnerLabel: top.label,
    margin,
    marginPct: margin / base,
    isTie,
    ranking
  };
}
