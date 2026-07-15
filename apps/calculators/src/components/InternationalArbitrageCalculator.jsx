import { resetPersistedState, usePersistedState } from '@packages/persistence';
import {
  CalculatorHeader,
  CalculatorLayout,
  Card,
  DownloadButtons,
  Footer,
  Input,
  MetricDisplay,
  ResultsAnalysis
} from '@packages/styling';
import { AlertCircle, Globe, Percent, PlaneTakeoff, Target, Wallet } from 'lucide-react';
import { useMemo } from 'react';

import { calculateArbitrage } from '../lib/internationalArbitrageLogic';

export default function InternationalArbitrageCalculator() {
  const [inputs, setInputs] = usePersistedState('InternationalArbitrageCalculator', 'inputs', {
    sourceCurrency: 'USD',
    targetCurrency: 'THB',
    grossIncome: 100000,
    sourceTaxRate: 25,
    sourceExpenses: 60000,

    platformFeeRate: 0,
    transfersPerYear: 12,
    transferFeeFixed: 30,
    forexSpreadRate: 1.5,
    exchangeRate: 35,

    targetTaxRate: 15,
    targetExpenses: 700000
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isText = ['sourceCurrency', 'targetCurrency'].includes(name);
    setInputs((prev) => ({
      ...prev,
      [name]: isText ? value : parseFloat(value) || 0
    }));
  };

  const results = useMemo(() => calculateArbitrage(inputs), [inputs]);
  const { source, target, comparison } = results;

  const formatCurrency = (val, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <CalculatorLayout>
        <CalculatorHeader
          namespace="InternationalArbitrageCalculator"
          title="International Arbitrage"
          icon={Globe}

          onReset={() => {
            resetPersistedState('InternationalArbitrageCalculator');
          }}
        />

        <div className="lg:col-span-5 space-y-6">
          <Card title="Source Country (Home)" icon={Wallet} headerColor="bg-blue-100">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Source Currency"
                  id="sourceCurrency"
                  name="sourceCurrency"
                  value={inputs.sourceCurrency}
                  onChange={handleChange}
                  placeholder="USD"
                  className="font-black"
                />
                <Input
                  label="Gross Annual Income"
                  id="grossIncome"
                  name="grossIncome"
                  type="number"
                  value={inputs.grossIncome}
                  onChange={handleChange}
                  className="font-black"
                />
                <Input
                  label="Income Tax Rate (%)"
                  icon={Percent}
                  id="sourceTaxRate"
                  name="sourceTaxRate"
                  type="number"
                  value={inputs.sourceTaxRate}
                  onChange={handleChange}
                  className="font-black"
                />
                <Input
                  label="Annual Living Expenses"
                  id="sourceExpenses"
                  name="sourceExpenses"
                  type="number"
                  value={inputs.sourceExpenses}
                  onChange={handleChange}
                  className="font-black"
                />
              </div>
            </div>
          </Card>

          <Card title="Target Country (Destination)" icon={PlaneTakeoff} headerColor="bg-green-100">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Input
                  label="Target Currency"
                  id="targetCurrency"
                  name="targetCurrency"
                  value={inputs.targetCurrency}
                  onChange={handleChange}
                  placeholder="THB"
                  className="font-black"
                />
                <Input
                  label="Exchange Rate"
                  id="exchangeRate"
                  name="exchangeRate"
                  type="number"
                  value={inputs.exchangeRate}
                  onChange={handleChange}
                  className="font-black"
                  tooltip={`1 ${inputs.sourceCurrency} = X ${inputs.targetCurrency}`}
                />
                <Input
                  label="Target Tax Rate (%)"
                  icon={Percent}
                  id="targetTaxRate"
                  name="targetTaxRate"
                  type="number"
                  value={inputs.targetTaxRate}
                  onChange={handleChange}
                  className="font-black"
                />
                <Input
                  label="Annual Expenses (Local)"
                  id="targetExpenses"
                  name="targetExpenses"
                  type="number"
                  value={inputs.targetExpenses}
                  onChange={handleChange}
                  className="font-black"
                />
              </div>

              <h4 className="text-sm font-bold border-b-2 border-black pb-2 mb-4">Transfer & Platform Fees</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Platform Fee (%)"
                  icon={Percent}
                  id="platformFeeRate"
                  name="platformFeeRate"
                  type="number"
                  value={inputs.platformFeeRate}
                  onChange={handleChange}
                  className="font-black"
                />
                <Input
                  label="Forex Spread (%)"
                  icon={Percent}
                  id="forexSpreadRate"
                  name="forexSpreadRate"
                  type="number"
                  value={inputs.forexSpreadRate}
                  onChange={handleChange}
                  className="font-black"
                />
                <Input
                  label="Fixed Transfer Fee"
                  id="transferFeeFixed"
                  name="transferFeeFixed"
                  type="number"
                  value={inputs.transferFeeFixed}
                  onChange={handleChange}
                  className="font-black"
                />
                <Input
                  label="Transfers Per Year"
                  id="transfersPerYear"
                  name="transfersPerYear"
                  type="number"
                  value={inputs.transfersPerYear}
                  onChange={handleChange}
                  className="font-black"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: RESULTS */}
        <div className="lg:col-span-7 space-y-6">
          <ResultsAnalysis title="Arbitrage Results">
            <div
              className={`border-4 border-black text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4 ${comparison.savingsDifference > 0 ? 'bg-green-600' : 'bg-red-600'}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black/20 rounded-full border-2 border-black">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-xs font-black uppercase tracking-widest">
                    Net Worth Velocity Increase
                  </p>
                  <p className="text-3xl md:text-5xl font-black tracking-tighter">
                    {comparison.savingsIncreasePercent > 0 ? '+' : ''}
                    {comparison.savingsIncreasePercent.toFixed(1)}%
                  </p>
                  <p className="text-[10px] font-bold text-white uppercase mt-1 italic">
                    {comparison.savingsDifference > 0 ? 'Faster wealth accumulation' : 'Slower wealth accumulation'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <MetricDisplay
                  title="Annual Savings (Source)"
                  value={formatCurrency(source.savings, inputs.sourceCurrency)}
                />
              </div>
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <MetricDisplay
                  title="Equivalent Savings (Target)"
                  value={formatCurrency(target.savingsConverted, inputs.sourceCurrency)}
                />
              </div>
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <MetricDisplay
                  title="Time to 1 Yr Source Savings"
                  value={
                    comparison.monthsToReachSourceAnnual > 0
                      ? `${comparison.monthsToReachSourceAnnual.toFixed(1)} Months`
                      : 'N/A'
                  }
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-xs font-black uppercase border-b-2 border-black pb-1 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Fee & Tax Leakage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-[8px] font-black uppercase text-blue-800">Platform Fees</p>
                  <p className="text-sm font-black text-blue-900">
                    -{formatCurrency(target.platformFee, inputs.sourceCurrency)}
                  </p>
                </div>
                <div className="p-3 bg-red-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-[8px] font-black uppercase text-red-800">Transfer & Forex</p>
                  <p className="text-sm font-black text-red-900">
                    -{formatCurrency(target.transferFee + target.forexFee, inputs.sourceCurrency)}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-[8px] font-black uppercase text-orange-800">Target Taxes</p>
                  <p className="text-sm font-black text-orange-900">
                    -{formatCurrency(target.taxAmountConverted, inputs.sourceCurrency)}
                  </p>
                </div>
              </div>
              <div className="bg-[#FF6B6B]/10 border-4 border-black p-4 mt-6">
                <MetricDisplay
                  title="Total Leakage"
                  subtitle="Total money lost in transition"
                  value={`-${formatCurrency(target.platformFee + target.transferFee + target.forexFee + target.taxAmountConverted, inputs.sourceCurrency)}`}
                  color="text-red-900"
                />
              </div>
            </div>

            <DownloadButtons
              onDownloadPDF={() => {}}
              onDownloadExcel={() => {}}
              fileName="International_Arbitrage_Report"
            />
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>
      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> Geo-arbitrage is rarely as profitable as it seems.
          <br className="md:hidden" />
          The true cost of living in a cheaper country is hidden in platform fees, forex spreads, double taxation, and
          transfer costs. Always calculate the 'Leakage' before booking a one-way flight.
        </p>
      </Footer>
    </div>
  );
}
