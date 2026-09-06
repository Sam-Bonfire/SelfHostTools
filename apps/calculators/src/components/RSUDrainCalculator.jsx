import { resetPersistedState, usePersistedState } from '@packages/persistence';
import {
  CalculatorHeader,
  CalculatorLayout,
  Card,
  DownloadButtons,
  Footer,
  Input,
  MetricDisplay,
  ResultsAnalysis,
  Select
} from '@packages/styling';
import { Calculator, Coins, Landmark } from 'lucide-react';
import { useMemo } from 'react';

import { downloadExcel, downloadPDF } from '../lib/downloadUtils';
import { calculateRSUTaxDrain } from '../lib/rsuTaxDrainLogic';
import SEO from './SEO';

export default function RSUDrainCalculator() {
  const [inputs, setInputs] = usePersistedState('RSUDrainCalculator', 'inputs', {
    grantType: 'RSU',
    shareCount: 1000,
    sharePrice: 100,
    strikePrice: 0,
    vestingYears: 4,
    federalRate: 32,
    stateRate: 5
  });

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const results = useMemo(() => calculateRSUTaxDrain(inputs), [inputs]);

  const handleDownloadPDF = () => {
    downloadPDF({ inputs, results, schedule: results.schedule });
  };

  const handleDownloadExcel = () => {
    downloadExcel({ inputs, results, schedule: results.schedule });
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const formatPercent = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'percent', maximumFractionDigits: 1 }).format(val);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="RSU Tax Drain Calculator"
        description="See what your equity grant actually pays after vest-date taxes. RSU vs options, sell-to-cover shares, and a yearly vest calendar."
        keywords="rsu tax calculator, equity tax drain, vesting schedule, sell to cover, stock options tax"
        canonical={`${import.meta.env.VITE_SITE_URL}/rsu-tax-drain`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/rsu_tax_drain.png`}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="RSUDrainCalculator"
            title="RSU Tax Drain"
            subtitle="Your grant is not your money. The taxman vests first."
            icon={
              <Coins
                className="w-8 h-8"
                onReset={() => {
                  resetPersistedState('RSUDrainCalculator');
                }}
              />
            }
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card title="The Grant" icon={<Landmark className="w-5 h-5" />}>
            <div className="space-y-4">
              <Select
                id="grantType"
                label="Grant Type"
                value={inputs.grantType}
                onChange={(e) => handleInputChange('grantType', e.target.value)}
              >
                <option value="RSU">RSU</option>
                <option value="Option">Stock Option</option>
              </Select>
              <Input
                id="shareCount"
                label="Share Count"
                type="number"
                value={inputs.shareCount}
                onChange={(val) => handleInputChange('shareCount', val)}
                tooltip="Total shares in the grant."
              />
              <Input
                id="sharePrice"
                label="Current Share Price"
                type="number"
                value={inputs.sharePrice}
                onChange={(val) => handleInputChange('sharePrice', val)}
                prefix="$"
                tooltip="Price at vest. RSUs are taxed on full value; options on the spread."
              />
              {inputs.grantType === 'Option' && (
                <Input
                  id="strikePrice"
                  label="Strike Price"
                  type="number"
                  value={inputs.strikePrice}
                  onChange={(val) => handleInputChange('strikePrice', val)}
                  prefix="$"
                  tooltip="What you pay per share to exercise."
                />
              )}
              <Input
                id="vestingYears"
                label="Vesting Years"
                type="number"
                value={inputs.vestingYears}
                onChange={(val) => handleInputChange('vestingYears', val)}
                tooltip="Linear vesting assumed: equal tranches per year."
              />
            </div>
          </Card>

          <Card title="Your Tax Rates" icon={<Calculator className="w-5 h-5" />}>
            <div className="space-y-4">
              <Input
                id="federalRate"
                label="Marginal Rate (%)"
                type="number"
                value={inputs.federalRate}
                onChange={(val) => handleInputChange('federalRate', val)}
                tooltip="Your top marginal rate — vests stack on top of salary."
              />
              <Input
                id="stateRate"
                label="State/Local Rate (%)"
                type="number"
                value={inputs.stateRate}
                onChange={(val) => handleInputChange('stateRate', val)}
                tooltip="State and local income tax on the vest."
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <Card title="Drain Results" icon={<Calculator className="w-5 h-5" />}>
            <div aria-live="polite" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 border-4 border-black bg-yellow-300">
                <MetricDisplay title="Grant Face Value" value={formatCurrency(results.grossValue)} />
              </div>
              <div className="p-6 border-4 border-black bg-red-300">
                <MetricDisplay
                  title="Tax Drain"
                  value={formatCurrency(results.totalTax)}
                  subtitle={`${formatPercent(results.effectiveTaxRate)} effective`}
                />
              </div>
              <div className="p-6 border-4 border-black bg-green-300">
                <MetricDisplay
                  title="You Actually Keep"
                  value={formatCurrency(results.netValue)}
                  subtitle={`${results.sharesKept} of ${inputs.shareCount} shares`}
                />
              </div>
            </div>

            <ResultsAnalysis title="Yearly Vest Calendar" aria-live="polite">
              <div className="space-y-2">
                {results.schedule.map((t) => (
                  <div
                    key={t.label}
                    className="flex justify-between items-center p-2 bg-gray-50 border-2 border-gray-200"
                  >
                    <span className="font-medium">
                      {t.label}
                      <span className="text-xs text-gray-500 ml-2">({t.shares} shares)</span>
                    </span>
                    <span className="font-bold">
                      {formatCurrency(t.gross)} <span className="text-red-600">-{formatCurrency(t.tax)}</span> ={' '}
                      {formatCurrency(t.net)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center bg-black text-white p-4 mt-6 border-4 border-black">
                  <span className="font-bold text-xl">Net After All Vests</span>
                  <span className="font-black text-2xl">{formatCurrency(results.netValue)}</span>
                </div>
              </div>
            </ResultsAnalysis>
          </Card>

          <DownloadButtons onDownloadPDF={handleDownloadPDF} onDownloadExcel={handleDownloadExcel} />
        </div>
      </CalculatorLayout>
      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Sell-to-cover:</strong> your employer withholds ~{results.sharesWithheld} shares for tax at each
          vest. You never touch that money — price your lifestyle on the net, not the headline grant.
        </p>
      </Footer>
    </div>
  );
}
