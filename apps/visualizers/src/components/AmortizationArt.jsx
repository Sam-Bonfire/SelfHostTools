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
import { BarChart3, Download, Landmark } from 'lucide-react';
import React, { useMemo } from 'react';

import { calculateAmortization, generateAmortizationBars } from '../lib/amortizationArt';

export default function AmortizationArt() {
  const [principal, setPrincipal] = usePersistedState('AmortizationArt', 'principal', 5000000);
  const [annualRate, setAnnualRate] = usePersistedState('AmortizationArt', 'annualRate', 9);
  const [tenureYears, setTenureYears] = usePersistedState('AmortizationArt', 'tenureYears', 20);
  const [extraMonthly, setExtraMonthly] = usePersistedState('AmortizationArt', 'extraMonthly', 5000);

  const resultsRef = React.useRef(null);

  const amort = useMemo(
    () =>
      calculateAmortization({
        principal: Number(principal),
        annualRate: Number(annualRate),
        tenureYears: Number(tenureYears),
        extraMonthly: Number(extraMonthly)
      }),
    [principal, annualRate, tenureYears, extraMonthly]
  );

  const { bars } = useMemo(() => generateAmortizationBars(amort.schedule, 600, 300), [amort.schedule]);

  const handleDownloadPDF = async () => {
    const el = resultsRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save('amortization_art_report.pdf');
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
      <SEO
        title="Amortization Art Visualizer"
        description="Watch every EMI split into principal vs interest year by year. See exactly how much extra payments save."
        keywords="amortization chart, emi split, principal vs interest, loan payoff visualizer"
        canonical={`${import.meta.env.VITE_SITE_URL}/amortization-art`}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            title="Amortization Art"
            subtitle="Early EMIs feed the bank. Later EMIs feed you."
            icon={BarChart3}
            onReset={() => {
              resetPersistedState('AmortizationArt');
            }}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card title="The Loan" icon={<Landmark className="w-5 h-5" />}>
            <div className="space-y-4">
              <Input
                id="principal"
                label="Loan Amount"
                type="number"
                value={principal}
                onChange={(v) => setPrincipal(v)}
                prefix="₹"
                tooltip="Original borrowed amount."
              />
              <Input
                id="annualRate"
                label="Interest Rate (%/yr)"
                type="number"
                value={annualRate}
                onChange={(v) => setAnnualRate(v)}
                tooltip="Nominal annual rate."
              />
              <Input
                id="tenureYears"
                label="Tenure (Years)"
                type="number"
                value={tenureYears}
                onChange={(v) => setTenureYears(v)}
                tooltip="Original repayment period."
              />
              <Input
                id="extraMonthly"
                label="Extra / Month"
                type="number"
                value={extraMonthly}
                onChange={(v) => setExtraMonthly(v)}
                prefix="₹"
                tooltip="Additional principal payment every month."
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6" ref={resultsRef}>
          <Card title="EMI Autopsy" icon={<BarChart3 className="w-5 h-5" />}>
            <div aria-live="polite" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 border-4 border-black bg-yellow-300">
                <MetricDisplay
                  title="Monthly EMI"
                  value={formatCurrency(amort.emi)}
                  subtitle={`Paid over ${amort.monthsPaid} months`}
                />
              </div>
              <div className="p-6 border-4 border-black bg-red-200">
                <MetricDisplay title="Lifetime Interest" value={formatCurrency(amort.totalInterest)} />
              </div>
              <div className="p-6 border-4 border-black bg-green-300">
                <MetricDisplay
                  title="Extra-Payment Wins"
                  value={formatCurrency(amort.interestSaved)}
                  subtitle={`${amort.monthsSaved} months freed`}
                />
              </div>
            </div>

            <ResultsAnalysis title="Principal vs Interest, Year by Year" aria-live="polite">
              <div className="flex gap-4 mb-2 text-[10px] font-black uppercase">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-2 bg-green-600" /> Principal
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-2 bg-red-500" /> Interest
                </span>
              </div>
              <svg viewBox="0 0 600 300" className="w-full border-4 border-black bg-white" role="img" aria-label="Yearly principal versus interest bars">
                {bars.map((b, i) => (
                  <g key={i}>
                    <title>{`${amort.schedule[i].label}: ${formatCurrency(amort.schedule[i].principal)} principal, ${formatCurrency(amort.schedule[i].interest)} interest`}</title>
                    <rect x={b.x} y={b.baseY - b.totalH} width={b.width} height={b.interestH} fill="#ef4444" stroke="#000" strokeWidth="1" />
                    <rect x={b.x} y={b.baseY - b.principalH} width={b.width} height={b.principalH} fill="#16a34a" stroke="#000" strokeWidth="1" />
                  </g>
                ))}
              </svg>
              <div className="flex justify-between items-center bg-black text-white p-4 mt-6 border-4 border-black">
                <span className="font-bold text-xl">Total Paid</span>
                <span className="font-black text-2xl">{formatCurrency(amort.totalPaid)}</span>
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
          <strong>The crossover:</strong> the year green overtakes red is when your loan finally starts working for
          you. Extra payments pull that year forward — watch them move it.
        </p>
      </Footer>
    </div>
  );
}
