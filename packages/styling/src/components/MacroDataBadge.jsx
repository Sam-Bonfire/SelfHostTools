import { formatMacroFreshness } from '@packages/macro-data';

/**
 * One-line provenance note for calculator footers:
 * where the default assumptions came from and when they were refreshed.
 */
const MacroDataBadge = () => (
  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mt-2">📊 {formatMacroFreshness()}</p>
);

export default MacroDataBadge;
