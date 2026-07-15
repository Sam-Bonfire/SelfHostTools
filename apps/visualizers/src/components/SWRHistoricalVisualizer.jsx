import { SEO } from '@packages/components';
import { resetPersistedState, usePersistedState } from '@packages/persistence';
import { CalculatorHeader, CalculatorLayout, Card, Footer, Input, ResultsAnalysis, Select } from '@packages/styling';
import { AlertTriangle, CheckCircle, IndianRupee, LineChart } from 'lucide-react';
import { useMemo } from 'react';

const SCENARIOS = {
  depression: {
    name: '1929 Great Depression',
    description: 'A massive deflationary crash followed by slow recovery.',
    startYear: 1929,
    returns: [
      -8.4, -24.9, -43.3, -8.1, 53.9, -1.4, 47.6, 33.9, -35.0, 31.1, -0.4, -9.7, -11.5, 20.3, 25.9, 19.7, 36.4, -8.0,
      5.7, 5.5, 18.7, 31.7, 24.0, 18.3, -1.0, 52.6, 31.5, 6.5, -10.7, 43.3
    ],
    inflation: [
      0, -2.3, -9.0, -9.9, -5.1, 3.1, 2.2, 1.5, 3.6, -2.1, -1.4, 0.7, 5.0, 10.9, 6.1, 1.7, 2.3, 8.3, 14.4, 8.1, -1.2,
      1.3, 7.9, 1.9, 0.8, 0.7, -0.4, 1.5, 3.3, 2.8
    ]
  },
  stagflation: {
    name: '1968 Stagflation',
    description: 'High inflation eroding real value despite nominal market gains.',
    startYear: 1968,
    returns: [
      11.0, -8.5, 4.0, 14.3, 19.0, -14.6, -26.4, 37.2, 23.6, -7.1, 6.5, 18.6, 32.5, -4.9, 21.5, 22.5, 6.2, 31.7, 18.6,
      5.2, 16.6, 31.6, -3.1, 30.4, 7.6, 10.0, 1.3, 37.5, 22.9, 33.3
    ],
    inflation: [
      4.2, 5.4, 5.9, 4.3, 3.2, 6.2, 11.0, 9.1, 5.8, 6.5, 7.6, 11.3, 13.5, 10.3, 6.1, 3.2, 4.3, 3.5, 1.9, 3.6, 4.1, 4.8,
      5.4, 4.2, 3.0, 3.0, 2.6, 2.8, 2.9, 2.3
    ]
  },
  dotcom: {
    name: '2000 Dot-com & GFC',
    description: 'Two massive crashes within a decade testing early sequence of returns.',
    startYear: 2000,
    returns: [
      -9.1, -11.8, -22.1, 28.6, 10.8, 4.9, 15.7, 5.4, -37.0, 26.4, 15.0, 2.1, 16.0, 32.3, 13.6, 1.3, 11.9, 21.8, -4.3,
      31.4, 18.4, 28.7, -18.1, 24.2, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0
    ],
    inflation: [
      3.3, 2.8, 1.5, 2.2, 2.6, 3.3, 3.2, 2.8, 3.8, -0.3, 1.6, 3.1, 2.0, 1.4, 1.6, 0.1, 1.2, 2.1, 2.4, 1.8, 1.2, 4.7,
      8.0, 4.1, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0
    ]
  }
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function SWRHistoricalVisualizer() {
  const [portfolioValue, setPortfolioValue] = usePersistedState('SWRHistoricalVisualizer', 'portfolioValue', 1000000);
  const [withdrawalRate, setWithdrawalRate] = usePersistedState('SWRHistoricalVisualizer', 'withdrawalRate', 4);
  const [selectedScenario, setSelectedScenario] = usePersistedState(
    'SWRHistoricalVisualizer',
    'selectedScenario',
    'stagflation'
  );

  const scenario = SCENARIOS[selectedScenario];

  const results = useMemo(() => {
    let currentPortfolio = portfolioValue;
    let currentWithdrawal = portfolioValue * (withdrawalRate / 100);
    const path = [];
    let depletedYear = null;
    let totalWithdrawn = 0;

    for (let i = 0; i < 30; i++) {
      const year = scenario.startYear + i;
      const ret = scenario.returns[i] / 100;
      const inf = scenario.inflation[i] / 100;

      currentPortfolio -= currentWithdrawal;
      totalWithdrawn += currentWithdrawal;

      if (currentPortfolio <= 0) {
        currentPortfolio = 0;
        if (!depletedYear) depletedYear = year;
      } else {
        currentPortfolio = currentPortfolio * (1 + ret);
      }

      path.push({
        year,
        portfolio: currentPortfolio,
        withdrawal: currentWithdrawal,
        returnPct: ret * 100,
        inflationPct: inf * 100
      });

      currentWithdrawal = currentWithdrawal * (1 + inf);
    }

    return {
      path,
      depletedYear,
      finalValue: currentPortfolio,
      totalWithdrawn
    };
  }, [portfolioValue, withdrawalRate, scenario]);

  const maxPortfolio = Math.max(portfolioValue, ...results.path.map((d) => d.portfolio));

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <CalculatorLayout>
        <SEO
          title="SWR Historical Path Visualizer"
          description="See how your safe withdrawal rate would have survived the Great Depression, 1970s Stagflation, and the 2008 Financial Crisis."
        />

        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="SWRHistoricalVisualizer"
            title="SWR History Visualizer"
            icon={LineChart}
            color="bg-blue-300"

            onReset={() => {
              resetPersistedState('SWRHistoricalVisualizer');
            }}
          />
        </div>

        <div className="col-span-1 lg:col-span-4 space-y-6">
          <Card title="Simulation Parameters" className="bg-white">
            <div className="space-y-4">
              <Input
                id="portfolio"
                label="Initial Portfolio ($)"
                type="number"
                value={portfolioValue}
                onChange={(e) => setPortfolioValue(Number(e.target.value))}
                icon={IndianRupee}
              />

              <div>
                <Input
                  id="wr"
                  label="Withdrawal Rate (%)"
                  type="number"
                  step="0.1"
                  value={withdrawalRate}
                  onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                />
                <div className="flex gap-2 mt-2">
                  {[3, 4, 5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setWithdrawalRate(rate)}
                      className={`flex-1 text-xs py-1 border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none transition-all ${withdrawalRate === rate ? 'bg-black text-white' : 'bg-gray-100'}`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Select
                  id="scenario"
                  label="Economic Cycle"
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  options={[
                    { value: 'depression', label: SCENARIOS.depression.name },
                    { value: 'stagflation', label: SCENARIOS.stagflation.name },
                    { value: 'dotcom', label: SCENARIOS.dotcom.name }
                  ]}
                />
                <p className="mt-2 text-sm text-gray-600 font-medium">{scenario.description}</p>
              </div>
            </div>
          </Card>

          <ResultsAnalysis aria-live="polite">
            <div className="space-y-4">
              <h3 className="font-black text-xl border-b-2 border-black pb-2">Simulation Result</h3>

              {results.depletedYear ? (
                <div className="bg-red-200 border-4 border-black p-4 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <AlertTriangle className="w-6 h-6 text-red-700 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-red-900 text-lg uppercase">Portfolio Depleted</p>
                    <p className="text-red-800 font-medium mt-1">
                      Ran out of money in <strong>{results.depletedYear}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-200 border-4 border-black p-4 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <CheckCircle className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-green-900 text-lg uppercase">Survived 30 Years</p>
                    <p className="text-green-800 font-medium mt-1">
                      Ending Balance: <strong>{formatCurrency(results.finalValue)}</strong>
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-2">
                <div className="flex justify-between border-b-2 border-black border-dashed pb-1">
                  <span className="font-bold">Initial Withdrawal:</span>
                  <span className="font-mono">{formatCurrency(portfolioValue * (withdrawalRate / 100))}</span>
                </div>
                <div className="flex justify-between border-b-2 border-black border-dashed pb-1">
                  <span className="font-bold">Final Withdrawal:</span>
                  <span className="font-mono">{formatCurrency(results.path[results.path.length - 1].withdrawal)}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="font-bold">Total Withdrawn:</span>
                  <span className="font-mono">{formatCurrency(results.totalWithdrawn)}</span>
                </div>
              </div>
            </div>
          </ResultsAnalysis>
        </div>

        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          <Card title={`${scenario.name} Timeline`} className="bg-white flex-grow flex flex-col min-h-[400px]">
            <div className="flex-grow relative border-4 border-black bg-[#fafafa] p-4 mt-2 overflow-hidden flex flex-col">
              <div className="flex-grow w-full h-full relative" style={{ minHeight: '300px' }}>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = 100 - ratio * 100;
                    return (
                      <g key={ratio}>
                        <line x1="0" y1={y} x2="300" y2={y} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,2" />
                        <text x="-2" y={y + 3} textAnchor="end" fontSize="4" fill="#6b7280" className="font-mono">
                          {formatCurrency(maxPortfolio * ratio).replace('.00', '')}
                        </text>
                      </g>
                    );
                  })}

                  <polyline
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2"
                    points={results.path
                      .map((d, i) => {
                        const x = (i / 29) * 300;
                        const y = 100 - (d.portfolio / maxPortfolio) * 100;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  <polygon
                    fill={results.depletedYear ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}
                    points={`0,100 ${results.path
                      .map((d, i) => {
                        const x = (i / 29) * 300;
                        const y = 100 - (d.portfolio / maxPortfolio) * 100;
                        return `${x},${y}`;
                      })
                      .join(' ')} 300,100`}
                  />

                  {results.path.map((d, i) => {
                    const x = (i / 29) * 300;
                    const y = 100 - (d.portfolio / maxPortfolio) * 100;
                    return <circle key={i} cx={x} cy={y} r="1.5" fill={d.portfolio === 0 ? '#ef4444' : '#000000'} />;
                  })}
                </svg>

                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs font-bold text-gray-600">
                  <span>{scenario.startYear}</span>
                  <span>{scenario.startYear + 15}</span>
                  <span>{scenario.startYear + 29}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Why does this happen?" className="bg-blue-100">
            <p className="font-medium text-gray-800 leading-relaxed">
              The sequence of returns risk is the danger that the timing of withdrawals from a retirement account will
              have a negative impact on the overall rate of return. Even if average returns are positive, withdrawing
              during a prolonged down market (like 1929) or during high inflation (like the 1970s) forces you to sell
              more shares to meet your living expenses, permanently impairing the portfolio's ability to recover.
            </p>
          </Card>
        </div>
      </CalculatorLayout>
      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> Historical returns do not guarantee future performance.
          <br className="md:hidden" />
          The danger lies in "Sequence of Returns Risk": selling assets during a market crash to fund living expenses
          permanently destroys your portfolio's ability to compound when the market recovers.
        </p>
      </Footer>
    </div>
  );
}
