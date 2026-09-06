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
import { Calculator, Globe, Wallet } from 'lucide-react';
import { useMemo } from 'react';

import { downloadExcel, downloadPDF } from '../lib/downloadUtils';
import { calculatePPPRate } from '../lib/pppRateLogic';
import SEO from './SEO';

export default function PPPRateCalculator() {
  const [inputs, setInputs] = usePersistedState('PPPRateCalculator', 'inputs', {
    foreignHourly: 50,
    hoursPerWeek: 30,
    billableWeeks: 48,
    exchangeRate: 83,
    pppFactor: 3.5,
    platformFeeRate: 10,
    homeTaxRate: 20,
    localMonthlySalary: 100000
  });

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const results = useMemo(() => calculatePPPRate(inputs), [inputs]);

  const handleDownloadPDF = () => {
    downloadPDF({ inputs, results, schedule: [] });
  };

  const handleDownloadExcel = () => {
    downloadExcel({ inputs, results, schedule: [] });
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="PPP Rate Card — Foreign Quote to Local Life"
        description="Quote a foreign client, live on local costs. Convert hourly rates to local take-home with PPP purchasing power."
        keywords="ppp rate card, freelance foreign rate, purchasing power parity, quote international client"
        canonical={`${import.meta.env.VITE_SITE_URL}/ppp-rate-card`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/ppp_rate_card.png`}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="PPPRateCalculator"
            title="PPP Rate Card"
            subtitle="Earn abroad on paper. Spend at home in reality."
            icon={
              <Globe
                className="w-8 h-8"
                onReset={() => {
                  resetPersistedState('PPPRateCalculator');
                }}
              />
            }
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card title="The Foreign Contract" icon={<Wallet className="w-5 h-5" />}>
            <div className="space-y-4">
              <Input
                id="foreignHourly"
                label="Foreign Hourly Rate"
                type="number"
                value={inputs.foreignHourly}
                onChange={(val) => handleInputChange('foreignHourly', val)}
                prefix="$"
                tooltip="What you quote the client per hour."
              />
              <Input
                id="hoursPerWeek"
                label="Hours / Week"
                type="number"
                value={inputs.hoursPerWeek}
                onChange={(val) => handleInputChange('hoursPerWeek', val)}
                tooltip="Billable hours per week."
              />
              <Input
                id="billableWeeks"
                label="Billable Weeks / Year"
                type="number"
                value={inputs.billableWeeks}
                onChange={(val) => handleInputChange('billableWeeks', val)}
                tooltip="52 minus vacations and bench time."
              />
              <Input
                id="platformFeeRate"
                label="Platform Fee (%)"
                type="number"
                value={inputs.platformFeeRate}
                onChange={(val) => handleInputChange('platformFeeRate', val)}
                tooltip="Upwork/Toptal cut, if any."
              />
              <Input
                id="homeTaxRate"
                label="Home Tax Rate (%)"
                type="number"
                value={inputs.homeTaxRate}
                onChange={(val) => handleInputChange('homeTaxRate', val)}
                tooltip="Effective tax on freelance income at home."
              />
            </div>
          </Card>

          <Card title="Home Reality" icon={<Calculator className="w-5 h-5" />}>
            <div className="space-y-4">
              <Input
                id="exchangeRate"
                label="Exchange Rate"
                type="number"
                value={inputs.exchangeRate}
                onChange={(val) => handleInputChange('exchangeRate', val)}
                tooltip="Local currency per 1 unit of foreign currency."
              />
              <Input
                id="pppFactor"
                label="PPP Cost Factor"
                type="number"
                value={inputs.pppFactor}
                onChange={(val) => handleInputChange('pppFactor', val)}
                tooltip="How many times cheaper life is at home (e.g. 3.5 means ₹1 buys what $3.50 buys abroad)."
              />
              <Input
                id="localMonthlySalary"
                label="Local Monthly Salary"
                type="number"
                value={inputs.localMonthlySalary}
                onChange={(val) => handleInputChange('localMonthlySalary', val)}
                prefix="₹"
                tooltip="The local job offer you are comparing against."
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <Card title="Rate Card Results" icon={<Calculator className="w-5 h-5" />}>
            <div aria-live="polite" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 border-4 border-black bg-yellow-300">
                <MetricDisplay
                  title="Local Take-Home / Mo"
                  value={formatCurrency(results.netLocalMonthly)}
                  subtitle={`${formatCurrency(results.netLocal)} / year`}
                />
              </div>
              <div className="p-6 border-4 border-black bg-green-300">
                <MetricDisplay
                  title="Feels Like Abroad"
                  value={formatCurrency(results.pppEquivalentAnnual)}
                  subtitle="Same lifestyle would cost this much abroad"
                />
              </div>
              <div className="p-6 border-4 border-black bg-blue-300">
                <MetricDisplay
                  title="vs Local Salary"
                  value={`${results.salaryMultiple}x`}
                  subtitle="One contract = this many local salaries"
                />
              </div>
            </div>

            <ResultsAnalysis title="From Quote to Pocket" aria-live="polite">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                  <span className="font-bold text-gray-600">Foreign gross</span>
                  <span className="font-bold">${results.foreignAnnual.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                  <span className="font-bold text-gray-600">Platform fee</span>
                  <span className="font-bold text-red-600">-${results.platformFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                  <span className="font-bold text-gray-600">Home tax</span>
                  <span className="font-bold text-red-600">-${results.homeTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                  <span className="font-bold text-gray-600">True hourly (after fee + tax)</span>
                  <span className="font-bold">${results.effectiveForeignHourly}/hr</span>
                </div>
                <div className="flex justify-between items-center bg-black text-white p-4 mt-6 border-4 border-black">
                  <span className="font-bold text-xl">Local Take-Home</span>
                  <span className="font-black text-2xl">{formatCurrency(results.netLocal)}</span>
                </div>
              </div>
            </ResultsAnalysis>
          </Card>

          <DownloadButtons onDownloadPDF={handleDownloadPDF} onDownloadExcel={handleDownloadExcel} />
        </div>
      </CalculatorLayout>
      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Arbitrage rule:</strong> a $50/hr contract is not ₹3.4L/month. After fees, tax, and unpaid weeks,
          price on the true hourly — then let PPP do the bragging.
        </p>
      </Footer>
    </div>
  );
}
