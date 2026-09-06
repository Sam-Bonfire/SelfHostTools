import { SEO } from '@packages/components';
import { resetPersistedState, usePersistedState } from '@packages/persistence';
import {
  CalculatorHeader,
  CalculatorLayout,
  Card,
  Footer,
  Input,
  MetricDisplay,
  ResultsAnalysis
} from '@packages/styling';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, PiggyBank, Scale, TrendingUp, Upload } from 'lucide-react';
import React, { useMemo } from 'react';

import { calculateNetWorthBridge, extractBridgeInputs, generateBridgePaths } from '../lib/netWorthBridge';

export default function NetWorthBridge() {
  const [startingAssets, setStartingAssets] = usePersistedState('NetWorthBridge', 'startingAssets', 500000);
  const [startingDebt, setStartingDebt] = usePersistedState('NetWorthBridge', 'startingDebt', 1000000);
  const [monthlyInvest, setMonthlyInvest] = usePersistedState('NetWorthBridge', 'monthlyInvest', 20000);
  const [monthlyDebtPayment, setMonthlyDebtPayment] = usePersistedState(
    'NetWorthBridge',
    'monthlyDebtPayment',
    30000
  );
  const [assetReturn, setAssetReturn] = usePersistedState('NetWorthBridge', 'assetReturn', 12);
  const [debtRate, setDebtRate] = usePersistedState('NetWorthBridge', 'debtRate', 10);
  const [years, setYears] = usePersistedState('NetWorthBridge', 'years', 10);
  const [imported, setImported] = usePersistedState('NetWorthBridge', 'imported', false);

  const resultsRef = React.useRef(null);

  const bridge = useMemo(
    () =>
      calculateNetWorthBridge({
        startingAssets: Number(startingAssets),
        startingDebt: Number(startingDebt),
        monthlyInvest: Number(monthlyInvest),
        monthlyDebtPayment: Number(monthlyDebtPayment),
        assetReturn: Number(assetReturn),
        debtRate: Number(debtRate),
        years: Number(years)
      }),
    [startingAssets, startingDebt, monthlyInvest, monthlyDebtPayment, assetReturn, debtRate, years]
  );

  const paths = useMemo(() => generateBridgePaths(bridge.history, 600, 300), [bridge.history]);

  const handleImport = () => {
    const found = extractBridgeInputs(window.localStorage);
    if (found.monthlyInvest !== null) setMonthlyInvest(found.monthlyInvest);
    if (found.startingAssets !== null) setStartingAssets(found.startingAssets);
    if (found.assetReturn !== null) setAssetReturn(found.assetReturn);
    setImported(true);
  };

  const handleDownloadPDF = async () => {
    const el = resultsRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save('net_worth_bridge_report.pdf');
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
      <SEO
        title="Net-Worth Bridge Visualizer"
        description="Watch assets grow and debts shrink on one chart. Import live numbers from your SIP and FIRE calculators."
        keywords="net worth chart, assets vs debt, wealth visualizer, debt free journey"
        canonical={`${import.meta.env.VITE_SITE_URL}/net-worth-bridge`}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            title="Net-Worth Bridge"
            subtitle="Assets climb. Debts fall. The gap is your freedom."
            icon={Scale}
            onReset={() => {
              resetPersistedState('NetWorthBridge');
            }}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card title="Today's Position" icon={<PiggyBank className="w-5 h-5" />}>
            <div className="space-y-4">
              <Input
                id="startingAssets"
                label="Starting Assets"
                type="number"
                value={startingAssets}
                onChange={(v) => setStartingAssets(v)}
                prefix="₹"
                tooltip="Everything you own that grows: investments, savings."
              />
              <Input
                id="startingDebt"
                label="Starting Debt"
                type="number"
                value={startingDebt}
                onChange={(v) => setStartingDebt(v)}
                prefix="₹"
                tooltip="Everything you owe: loans, cards."
              />
              <Input
                id="monthlyInvest"
                label="Monthly Invest"
                type="number"
                value={monthlyInvest}
                onChange={(v) => setMonthlyInvest(v)}
                prefix="₹"
                tooltip="Fresh money into assets every month."
              />
              <Input
                id="monthlyDebtPayment"
                label="Monthly Debt Payment"
                type="number"
                value={monthlyDebtPayment}
                onChange={(v) => setMonthlyDebtPayment(v)}
                prefix="₹"
                tooltip="Total monthly outflow toward debt."
              />
              <Input
                id="assetReturn"
                label="Asset Return (%/yr)"
                type="number"
                value={assetReturn}
                onChange={(v) => setAssetReturn(v)}
                tooltip="Expected annual growth on assets."
              />
              <Input
                id="debtRate"
                label="Debt Rate (%/yr)"
                type="number"
                value={debtRate}
                onChange={(v) => setDebtRate(v)}
                tooltip="Weighted average interest on your debt."
              />
              <Input
                id="years"
                label="Horizon (Years)"
                type="number"
                value={years}
                onChange={(v) => setYears(v)}
                tooltip="Projection window, 1 to 40 years."
              />
            </div>
          </Card>

          <Card title="Calculator Bridge" icon={<Upload className="w-5 h-5" />}>
            <p className="text-xs font-bold text-gray-600 mb-3">
              Pull your live SIP monthly amount, FIRE corpus, and return assumptions straight from the calculators app.
            </p>
            <button
              onClick={handleImport}
              className="w-full py-2 text-xs font-black border-4 border-black uppercase bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              Import from calculators
            </button>
            {imported && (
              <p className="text-[10px] font-black uppercase mt-2 text-green-700">
                Imported — tune freely, your calculators are untouched.
              </p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6" ref={resultsRef}>
          <Card title="The Bridge" icon={<TrendingUp className="w-5 h-5" />}>
            <div aria-live="polite" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 border-4 border-black bg-green-300">
                <MetricDisplay title="Net Worth (End)" value={formatCurrency(bridge.finalNetWorth)} />
              </div>
              <div className="p-6 border-4 border-black bg-gray-100">
                <MetricDisplay
                  title="Debt-Free Year"
                  value={bridge.debtFreeYear === null ? 'Beyond horizon' : `Year ${bridge.debtFreeYear}`}
                />
              </div>
              <div className="p-6 border-4 border-black bg-yellow-300">
                <MetricDisplay
                  title="Positive Wealth"
                  value={bridge.crossoverYear === null ? 'Beyond horizon' : `Year ${bridge.crossoverYear}`}
                  subtitle="First year net worth turns positive"
                />
              </div>
            </div>

            <ResultsAnalysis title="Assets vs Debt" aria-live="polite">
              <div className="flex gap-4 mb-2 text-[10px] font-black uppercase">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-2 bg-green-600" /> Assets
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-2 bg-red-500" /> Debt
                </span>
              </div>
              <svg viewBox="0 0 600 300" className="w-full border-4 border-black bg-white" role="img" aria-label="Assets versus debt over time">
                <path d={paths.assetsPath} fill="none" stroke="#16a34a" strokeWidth="4" />
                <path d={paths.debtPath} fill="none" stroke="#ef4444" strokeWidth="4" />
                {paths.points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.assetsY} r="4" fill="#16a34a" stroke="#000" strokeWidth="1" />
                    <circle cx={p.x} cy={p.debtY} r="4" fill="#ef4444" stroke="#000" strokeWidth="1" />
                  </g>
                ))}
              </svg>
              <div className="flex justify-between items-center bg-black text-white p-4 mt-6 border-4 border-black">
                <span className="font-bold text-xl">Final Net Worth</span>
                <span className="font-black text-2xl">{formatCurrency(bridge.finalNetWorth)}</span>
              </div>
            </ResultsAnalysis>

            <button
              onClick={handleDownloadPDF}
              className="mt-6 w-full md:w-auto flex items-center justify-center gap-2 py-2 px-6 text-xs font-black border-4 border-black uppercase bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </Card>
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Two levers, one chart:</strong> every extra rupee either grows assets or kills debt interest. The
          bridge shows which lever moves your freedom date most.
        </p>
      </Footer>
    </div>
  );
}
