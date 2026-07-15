import { SEO } from '@packages/components';
import { resetPersistedState, usePersistedState } from '@packages/persistence';
import { CalculatorHeader, CalculatorLayout, Card, DownloadButtons, Footer, Input } from '@packages/styling';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GitFork, IndianRupee, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';

// ─────────────────────────────────────────────
// CONSTANTS & DEFAULTS
// ─────────────────────────────────────────────
const DEFAULT_SOURCES = [
  { id: 'src-1', label: 'Primary Salary', amount: 120000 },
  { id: 'src-2', label: 'Freelance Income', amount: 30000 }
];

const DEFAULT_DESTINATIONS = [
  { id: 'dst-1', label: 'Income Tax', amount: 25000, color: '#ef4444' },
  { id: 'dst-2', label: 'Rent / EMI', amount: 25000, color: '#f97316' },
  { id: 'dst-3', label: 'Groceries & Food', amount: 12000, color: '#eab308' },
  { id: 'dst-4', label: 'Subscriptions', amount: 3700, color: '#8b5cf6' },
  { id: 'dst-5', label: 'Investments', amount: 30000, color: '#22c55e' },
  { id: 'dst-6', label: 'Emergency Fund', amount: 15000, color: '#06b6d4' },
  { id: 'dst-7', label: 'Misc / Leisure', amount: 15000, color: '#ec4899' }
];

const PALETTE = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#6366f1'
];

// ─────────────────────────────────────────────
// SANKEY MATH
// ─────────────────────────────────────────────
const MIN_PATH_THICKNESS = 3; // px minimum to remain visible

/**
 * Logarithmic normalisation: maps value to a thickness in [minT, maxT]
 */
const logScale = (value, minVal, maxVal, minT, maxT) => {
  if (maxVal <= minVal || value <= 0) return minT;
  const logMin = Math.log1p(minVal);
  const logMax = Math.log1p(maxVal);
  const logVal = Math.log1p(value);
  const t = ((logVal - logMin) / (logMax - logMin)) * (maxT - minT) + minT;
  return Math.max(minT, Math.min(maxT, t));
};

/**
 * Build SVG path data for a cubic bezier Sankey ribbon
 */
const buildPath = (x0, y0, t0, x1, y1, t1) => {
  const mid = (x0 + x1) / 2;
  // Upper and lower edges of the ribbon
  const top = `M ${x0} ${y0 - t0 / 2} C ${mid} ${y0 - t0 / 2}, ${mid} ${y1 - t1 / 2}, ${x1} ${y1 - t1 / 2}`;
  const bottom = `L ${x1} ${y1 + t1 / 2} C ${mid} ${y1 + t1 / 2}, ${mid} ${y0 + t0 / 2}, ${x0} ${y0 + t0 / 2} Z`;
  return `${top} ${bottom}`;
};

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────
function NodeRow({ item, onChange, onDelete, prefix, showDelete }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <div
        className="w-3 h-3 rounded-full border border-black flex-shrink-0"
        style={{ background: item.color || '#000' }}
      />
      <input
        type="text"
        value={item.label}
        onChange={(e) => onChange(item.id, 'label', e.target.value)}
        className="flex-1 text-xs font-bold border-none outline-none bg-transparent min-w-0"
        aria-label={`${prefix} label`}
      />
      <div className="w-28 flex-shrink-0">
        <Input
          type="number"
          icon={IndianRupee}
          value={item.amount}
          onChange={(e) => onChange(item.id, 'amount', Number(e.target.value))}
          className="!py-1 font-mono text-xs"
          aria-label={`${prefix} amount`}
        />
      </div>
      {showDelete && (
        <button
          onClick={() => onDelete(item.id)}
          className="p-1 text-red-500 hover:bg-red-50 border border-transparent hover:border-black transition-all"
          aria-label="Delete node"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function SankeyFlowchart() {
  const [sources, setSources] = usePersistedState('SankeyFlowchart', 'sources', DEFAULT_SOURCES);
  const [destinations, setDestinations] = usePersistedState('SankeyFlowchart', 'destinations', DEFAULT_DESTINATIONS);
  const svgRef = useRef(null);
  const chartContainerRef = useRef(null);

  // Derived totals
  const totalIn = useMemo(() => sources.reduce((s, n) => s + (n.amount || 0), 0), [sources]);
  const totalOut = useMemo(() => destinations.reduce((s, n) => s + (n.amount || 0), 0), [destinations]);
  const unallocated = totalIn - totalOut;

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // ── Node CRUD ──────────────────────────────
  const updateSource = useCallback((id, field, val) => {
    setSources((prev) => prev.map((n) => (n.id === id ? { ...n, [field]: val } : n)));
  }, []);

  const addSource = () => {
    setSources((prev) => [...prev, { id: `src-${Date.now()}`, label: 'New Income', amount: 10000 }]);
  };

  const deleteSource = (id) => {
    setSources((prev) => (prev.length > 1 ? prev.filter((n) => n.id !== id) : prev));
  };

  const updateDest = useCallback((id, field, val) => {
    setDestinations((prev) => prev.map((n) => (n.id === id ? { ...n, [field]: val } : n)));
  }, []);

  const addDest = () => {
    const color = PALETTE[destinations.length % PALETTE.length];
    setDestinations((prev) => [...prev, { id: `dst-${Date.now()}`, label: 'New Category', amount: 5000, color }]);
  };

  const deleteDest = (id) => {
    setDestinations((prev) => (prev.length > 1 ? prev.filter((n) => n.id !== id) : prev));
  };

  // ── SVG Layout ────────────────────────────
  const SVG_W = 700;
  const SVG_H = 500;
  const NODE_W = 18;
  const LEFT_X = NODE_W / 2 + 10;
  const RIGHT_X = SVG_W - NODE_W / 2 - 10;
  const PADDING = 20;
  const usableH = SVG_H - PADDING * 2;
  const MIN_NODE_H = 8;

  // ── Proportional Node Heights ────────────
  // Each node's height = proportional to its amount relative to the column total
  const srcNodeHeights = useMemo(() => {
    const N = sources.length;
    if (N === 0) return [];
    const minGap = 10;
    const gapsH = (N - 1) * minGap;
    const availH = usableH - gapsH;
    // Use proportional heights based on amount
    const total = sources.reduce((s, n) => s + Math.max(1, n.amount || 0), 0);
    return sources.map((s) => Math.max(MIN_NODE_H, (Math.max(1, s.amount || 0) / total) * availH));
  }, [sources, usableH]);

  const dstNodeHeights = useMemo(() => {
    const N = destinations.length;
    if (N === 0) return [];
    const minGap = 10;
    const gapsH = (N - 1) * minGap;
    const availH = usableH - gapsH;
    const total = destinations.reduce((s, n) => s + Math.max(1, n.amount || 0), 0);
    return destinations.map((d) => Math.max(MIN_NODE_H, (Math.max(1, d.amount || 0) / total) * availH));
  }, [destinations, usableH]);

  // Vertical top-Y positions for each node
  const srcNodeTops = useMemo(() => {
    const N = srcNodeHeights.length;
    const totalH = srcNodeHeights.reduce((s, h) => s + h, 0);
    const gap = N > 1 ? (usableH - totalH) / (N - 1) : 0;
    const tops = [];
    let y = PADDING;
    srcNodeHeights.forEach((h, i) => {
      tops.push(y);
      y += h + (i < N - 1 ? gap : 0);
    });
    return tops;
  }, [srcNodeHeights, usableH]);

  const dstNodeTops = useMemo(() => {
    const N = dstNodeHeights.length;
    const totalH = dstNodeHeights.reduce((s, h) => s + h, 0);
    const gap = N > 1 ? (usableH - totalH) / (N - 1) : 0;
    const tops = [];
    let y = PADDING;
    dstNodeHeights.forEach((h, i) => {
      tops.push(y);
      y += h + (i < N - 1 ? gap : 0);
    });
    return tops;
  }, [dstNodeHeights, usableH]);

  // ── Ribbon layout: stacked proportional flow ────
  // Each source distributes its total proportionally to each destination
  // Ribbons are stacked vertically along each node's height
  const ribbons = useMemo(() => {
    if (sources.length === 0 || destinations.length === 0 || totalIn <= 0 || totalOut <= 0) return [];

    // Running offset tracker per source and destination
    const srcOffsets = sources.map(() => 0); // cumulative ribbon height used per source
    const dstOffsets = destinations.map(() => 0); // cumulative ribbon height used per dest

    const result = [];

    // Iterate: for each destination, for each source, compute the flow
    destinations.forEach((dst, di) => {
      const dstShare = (dst.amount || 0) / totalOut; // this destination's share of all allocated money

      sources.forEach((src, si) => {
        // Each source contributes proportionally to each destination
        // Flow = source's contribution to this destination = src.amount * (dst.amount / totalOut)
        const flowAmount = (src.amount || 0) * dstShare;
        if (flowAmount <= 0) return;

        // Ribbon height on source side = proportion of this flow to total source
        const srcH = srcNodeHeights[si] * (flowAmount / Math.max(1, src.amount || 0));
        // Ribbon height on dest side = proportion of this flow to total dest
        const dstH = dstNodeHeights[di] * (flowAmount / Math.max(1, dst.amount || 0));

        const ribbonSrcTopY = srcNodeTops[si] + srcOffsets[si];
        const ribbonDstTopY = dstNodeTops[di] + dstOffsets[di];

        srcOffsets[si] += srcH;
        dstOffsets[di] += dstH;

        result.push({
          key: `${src.id}-${dst.id}`,
          srcTopY: ribbonSrcTopY,
          srcH,
          dstTopY: ribbonDstTopY,
          dstH,
          color: dst.color || '#888',
          srcLabel: src.label,
          dstLabel: dst.label,
          amount: flowAmount
        });
      });
    });

    return result;
  }, [sources, destinations, totalIn, totalOut, srcNodeHeights, dstNodeHeights, srcNodeTops, dstNodeTops]);

  // Build a Bezier ribbon path from source slot to destination slot
  const buildRibbonPath = (srcTopY, srcH, dstTopY, dstH) => {
    const x0 = LEFT_X + NODE_W / 2;
    const x1 = RIGHT_X - NODE_W / 2;
    const mid = (x0 + x1) / 2;
    const st = srcTopY;
    const sb = srcTopY + srcH;
    const dt = dstTopY;
    const db = dstTopY + dstH;
    return `M ${x0} ${st} C ${mid} ${st}, ${mid} ${dt}, ${x1} ${dt} L ${x1} ${db} C ${mid} ${db}, ${mid} ${sb}, ${x0} ${sb} Z`;
  };

  // ── PDF Export ───────────────────────────
  const handleDownloadPDF = async () => {
    const el = chartContainerRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight() - 20));
    pdf.save('capital_flow_sankey.pdf');
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="Capital Allocation Flow — Sankey Visualizer"
        description="Visualize your income allocation using an interactive Sankey diagram. See exactly where your money flows."
        keywords="sankey diagram, capital flow, income allocation, budget visualizer"
        canonical={`${import.meta.env.VITE_SITE_URL}/capital-flow`}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="SankeyFlowchart"
            icon={GitFork}
            title="Capital Allocation Flow"

            onReset={() => {
              resetPersistedState('SankeyFlowchart');
            }}
          />
        </div>

        <div className="lg:col-span-12" ref={chartContainerRef}>
          <div className="space-y-6">
            {/* Status Bar */}
            <div
              className={`p-3 border-4 border-black flex flex-wrap gap-4 items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${Math.abs(unallocated) < 10 ? 'bg-green-100' : unallocated > 0 ? 'bg-yellow-100' : 'bg-red-100'}`}
            >
              <div className="flex gap-6">
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-500">Total Income In</p>
                  <p className="text-lg font-black text-green-700">{formatCurrency(totalIn)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-500">Total Allocated Out</p>
                  <p className="text-lg font-black text-red-600">{formatCurrency(totalOut)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-500">Unallocated</p>
                  <p
                    className={`text-lg font-black ${Math.abs(unallocated) < 10 ? 'text-green-700' : unallocated > 0 ? 'text-yellow-700' : 'text-red-700'}`}
                  >
                    {unallocated >= 0 ? '+' : ''}
                    {formatCurrency(unallocated)}
                  </p>
                </div>
              </div>
              <p className="text-[9px] font-black uppercase text-gray-600">
                {Math.abs(unallocated) < 10
                  ? '✅ Fully allocated'
                  : unallocated > 0
                    ? '⚠️ Surplus — assign it to savings or investments!'
                    : '🚨 Overspent! Reduce allocations.'}
              </p>
            </div>

            {/* Main Layout: Inputs + Sankey Diagram */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: Source Nodes */}
              <div className="lg:col-span-3 space-y-4">
                <Card title="Income Sources" icon={IndianRupee} headerColor="bg-green-100">
                  <div className="space-y-2">
                    {sources.map((src) => (
                      <NodeRow
                        key={src.id}
                        item={src}
                        onChange={updateSource}
                        onDelete={deleteSource}
                        prefix="Source"
                        showDelete={sources.length > 1}
                      />
                    ))}
                  </div>
                  <button
                    onClick={addSource}
                    className="mt-3 w-full py-2 border-2 border-dashed border-black text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-green-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Source
                  </button>
                </Card>

                {/* Action Buttons */}
                <div className="pt-2">
                  <DownloadButtons onDownloadPDF={handleDownloadPDF} />
                </div>
              </div>

              {/* CENTRE: Sankey SVG */}
              <div className="lg:col-span-6">
                <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-gray-50 overflow-hidden">
                  <div className="bg-black p-3 border-b-4 border-black text-white font-black uppercase text-xs tracking-wider flex justify-between items-center">
                    <span>Income → Allocation Flow</span>
                  </div>
                  <svg
                    ref={svgRef}
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    width="100%"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ background: '#fafafa' }}
                  >
                    {/* Ribbons FIRST (rendered behind nodes for text legibility) */}
                    {ribbons.map((r) => (
                      <path
                        key={r.key}
                        d={buildRibbonPath(r.srcTopY, r.srcH, r.dstTopY, r.dstH)}
                        fill={r.color}
                        opacity={0.5}
                        style={{ transition: 'd 0.4s ease' }}
                      >
                        <title>
                          {r.srcLabel} → {r.dstLabel}: ₹{Math.round(r.amount).toLocaleString('en-IN')}
                        </title>
                      </path>
                    ))}

                    {/* Source nodes (rendered ON TOP of ribbons) */}
                    {sources.map((src, i) => {
                      const h = srcNodeHeights[i];
                      const topY = srcNodeTops[i];
                      const midY = topY + h / 2;
                      const pct = totalIn > 0 ? ((src.amount / totalIn) * 100).toFixed(0) : 0;
                      return (
                        <g key={src.id}>
                          <rect x={LEFT_X - NODE_W / 2} y={topY} width={NODE_W} height={h} fill="#1a1a1a" />
                          <text
                            x={LEFT_X + NODE_W / 2 + 4}
                            y={midY - 2}
                            fontSize="9"
                            fontWeight="bold"
                            fill="#111"
                            fontFamily="Outfit, sans-serif"
                          >
                            {src.label}
                          </text>
                          <text
                            x={LEFT_X + NODE_W / 2 + 4}
                            y={midY + 9}
                            fontSize="8"
                            fill="#555"
                            fontFamily="Outfit, sans-serif"
                          >
                            ₹{(src.amount || 0).toLocaleString('en-IN')} ({pct}%)
                          </text>
                        </g>
                      );
                    })}

                    {/* Destination nodes (rendered ON TOP of ribbons) */}
                    {destinations.map((dst, i) => {
                      const h = dstNodeHeights[i];
                      const topY = dstNodeTops[i];
                      const midY = topY + h / 2;
                      const pct = totalIn > 0 ? ((dst.amount / totalIn) * 100).toFixed(0) : 0;
                      return (
                        <g key={dst.id}>
                          <rect
                            x={RIGHT_X - NODE_W / 2}
                            y={topY}
                            width={NODE_W}
                            height={h}
                            fill={dst.color || '#333'}
                          />
                          <text
                            x={RIGHT_X - NODE_W / 2 - 4}
                            y={midY - 2}
                            fontSize="9"
                            fontWeight="bold"
                            fill="#111"
                            textAnchor="end"
                            fontFamily="Outfit, sans-serif"
                          >
                            {dst.label}
                          </text>
                          <text
                            x={RIGHT_X - NODE_W / 2 - 4}
                            y={midY + 9}
                            fontSize="8"
                            fill="#555"
                            textAnchor="end"
                            fontFamily="Outfit, sans-serif"
                          >
                            ₹{(dst.amount || 0).toLocaleString('en-IN')} ({pct}%)
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* RIGHT: Destination Nodes */}
              <div className="lg:col-span-3 space-y-4">
                <Card title="Allocation Buckets" icon={GitFork} headerColor="bg-red-100">
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {destinations.map((dst) => (
                      <NodeRow
                        key={dst.id}
                        item={dst}
                        onChange={updateDest}
                        onDelete={deleteDest}
                        prefix="Destination"
                        showDelete={destinations.length > 1}
                      />
                    ))}
                  </div>
                  <button
                    onClick={addDest}
                    className="mt-3 w-full py-2 border-2 border-dashed border-black text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </Card>
              </div>
            </div>

            {/* Legend */}
            <Card title="Allocation Breakdown">
              <div className="flex flex-wrap gap-3">
                {destinations.map((dst) => {
                  const pct = totalIn > 0 ? ((dst.amount / totalIn) * 100).toFixed(1) : 0;
                  return (
                    <div key={dst.id} className="flex items-center gap-2 border border-gray-200 px-2 py-1 bg-gray-50">
                      <div className="w-3 h-3 border border-black" style={{ background: dst.color }} />
                      <span className="text-[10px] font-bold uppercase">{dst.label}</span>
                      <span className="text-[10px] font-mono font-black">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> This capital flow map reveals structural leaks.
          <br className="md:hidden" />
          True financial discipline isn't about increasing the left side (income), it's about purposefully directing
          every unit of flow on the right side.
        </p>
      </Footer>
    </div>
  );
}
