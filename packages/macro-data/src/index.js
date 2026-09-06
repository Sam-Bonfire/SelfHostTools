import macroData from '../data/latest.json';

export { macroData };

export const macroMeta = {
  lastUpdated: macroData?.metadata?.lastUpdated || null,
  sources: macroData?.metadata?.sources || []
};

export function formatMacroFreshness() {
  if (!macroMeta.lastUpdated) return 'Macro defaults source unknown';
  const date = new Date(macroMeta.lastUpdated);
  const formatted = Number.isNaN(date.getTime())
    ? macroMeta.lastUpdated
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const sourceLabels = macroMeta.sources.map((s) => s.label).join(' · ');
  return `Default assumptions: ${sourceLabels} · refreshed ${formatted}`.trim();
}
