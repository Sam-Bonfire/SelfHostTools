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
import { Briefcase, Calculator, Receipt, Wallet } from 'lucide-react';
import { useMemo } from 'react';

import { downloadExcel, downloadPDF } from '../lib/downloadUtils';
import { calculateSalaryDecoding } from '../lib/salaryDecoderLogic';
import SEO from './SEO';

export default function SalaryDecoderCalculator() {
  const [inputs, setInputs] = usePersistedState('SalaryDecoderCalculator', 'inputs', {
    baseSalary: 80000,
    annualBonus: 10000,
    employerRetirement: 5000,
    healthInsurance: 3000,
    otherPerks: 2000,
    preTaxContributions: 6000,
    filingStatus: 'single',
    stateLocalTaxes: 2000,
    mortgageInterest: 0,
    charitableContributions: 500,
    medicalExpenses: 0,
    otherItemized: 0
  });

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const results = useMemo(() => calculateSalaryDecoding(inputs), [inputs]);

  const handleDownloadPDF = () => {
    downloadPDF({ inputs, results, schedule: [] });
  };

  const handleDownloadExcel = () => {
    downloadExcel({ inputs, results, schedule: [] });
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const formatPercent = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'percent', maximumFractionDigits: 1 }).format(val);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="Salary Decoder — CTC to In-Hand"
        description="Decode your CTC into real monthly in-hand pay. Splits non-cash perks, pre-tax contributions, and taxes."
        keywords="salary decoder, ctc to in-hand, take home pay calculator, salary breakdown"
        canonical={`${import.meta.env.VITE_SITE_URL}/salary-decoder`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/salary_decoder.png`}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="SalaryDecoderCalculator"
            title="Salary Decoder"
            subtitle="Your CTC is not your salary. Find what actually hits your bank."
            icon={
              <Wallet
                className="w-8 h-8"
                onReset={() => {
                  resetPersistedState('SalaryDecoderCalculator');
                }}
              />
            }
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card title="CTC Components" icon={<Briefcase className="w-5 h-5" />}>
            <div className="space-y-4">
              <Input
                id="baseSalary"
                label="Base Salary (Annual)"
                type="number"
                value={inputs.baseSalary}
                onChange={(val) => handleInputChange('baseSalary', val)}
                prefix="$"
                tooltip="Fixed cash pay before bonus and perks."
              />
              <Input
                id="annualBonus"
                label="Annual Bonus"
                type="number"
                value={inputs.annualBonus}
                onChange={(val) => handleInputChange('annualBonus', val)}
                prefix="$"
                tooltip="Variable cash pay. Taxed as ordinary income."
              />
              <Input
                id="employerRetirement"
                label="Employer Retirement Match"
                type="number"
                value={inputs.employerRetirement}
                onChange={(val) => handleInputChange('employerRetirement', val)}
                prefix="$"
                tooltip="Never hits your paycheck, but it is part of your CTC."
              />
              <Input
                id="healthInsurance"
                label="Health Insurance Premium"
                type="number"
                value={inputs.healthInsurance}
                onChange={(val) => handleInputChange('healthInsurance', val)}
                prefix="$"
                tooltip="Employer-paid premium counted in CTC, not in cash."
              />
              <Input
                id="otherPerks"
                label="Other Perks (Annual)"
                type="number"
                value={inputs.otherPerks}
                onChange={(val) => handleInputChange('otherPerks', val)}
                prefix="$"
                tooltip="Meals, wellness, learning budgets, etc."
              />
            </div>
          </Card>

          <Card title="Pre-Tax & Deductions" icon={<Receipt className="w-5 h-5" />}>
            <div className="space-y-4">
              <Input
                id="preTaxContributions"
                label="Pre-Tax Contributions"
                type="number"
                value={inputs.preTaxContributions}
                onChange={(val) => handleInputChange('preTaxContributions', val)}
                prefix="$"
                tooltip="401(k), HSA, etc. Reduces taxable income."
              />
              <Select
                id="filingStatus"
                label="Filing Status"
                value={inputs.filingStatus}
                onChange={(e) => handleInputChange('filingStatus', e.target.value)}
              >
                <option value="single">Single</option>
                <option value="married">Married Filing Jointly</option>
                <option value="hoh">Head of Household</option>
              </Select>
              <Input
                id="stateLocalTaxes"
                label="State & Local Taxes (SALT)"
                type="number"
                value={inputs.stateLocalTaxes}
                onChange={(val) => handleInputChange('stateLocalTaxes', val)}
                prefix="$"
                tooltip="Capped at ₹10,000 for itemized deductions."
              />
              <Input
                id="charitableContributions"
                label="Charitable Contributions"
                type="number"
                value={inputs.charitableContributions}
                onChange={(val) => handleInputChange('charitableContributions', val)}
                prefix="$"
                tooltip="Donations to qualified organizations."
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <Card title="Decoded Results" icon={<Calculator className="w-5 h-5" />}>
            <div aria-live="polite" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 border-4 border-black bg-yellow-300">
                <MetricDisplay
                  title="Monthly In-Hand"
                  value={formatCurrency(results.inHandMonthly)}
                  subtitle={`${formatCurrency(results.inHandAnnual)} / year`}
                />
              </div>
              <div className="p-6 border-4 border-black bg-gray-100">
                <MetricDisplay
                  title="Total CTC"
                  value={formatCurrency(results.ctc)}
                  subtitle={`Cash pay: ${formatCurrency(results.grossCash)}`}
                />
              </div>
              <div className="p-6 border-4 border-black bg-green-300">
                <MetricDisplay
                  title="CTC Efficiency"
                  value={formatPercent(results.ctcEfficiency)}
                  subtitle="Share of CTC reaching your bank"
                />
              </div>
            </div>

            <ResultsAnalysis title="Where Did My CTC Go?" aria-live="polite">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                  <span className="font-bold text-gray-600">Total CTC</span>
                  <span className="font-bold">{formatCurrency(results.ctc)}</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                  <span className="font-bold text-gray-600">Non-cash perks (retirement, health)</span>
                  <span className="font-bold text-red-600">
                    -{formatCurrency(results.ctc - results.grossCash)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                  <span className="font-bold text-gray-600">Pre-tax contributions</span>
                  <span className="font-bold text-red-600">-{formatCurrency(results.preTax)}</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                  <span className="font-bold text-gray-600">
                    Income tax ({results.tax.bestStrategy} deduction)
                  </span>
                  <span className="font-bold text-red-600">
                    -{formatCurrency(results.tax.recommendedTax)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-black text-white p-4 mt-6 border-4 border-black">
                  <span className="font-bold text-xl">Annual In-Hand</span>
                  <span className="font-black text-2xl">{formatCurrency(results.inHandAnnual)}</span>
                </div>
              </div>
            </ResultsAnalysis>
          </Card>

          <DownloadButtons onDownloadPDF={handleDownloadPDF} onDownloadExcel={handleDownloadExcel} />
        </div>
      </CalculatorLayout>
      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Reality check:</strong> A ₹100k CTC with ₹10k of perks and ₹12k of tax is a ₹78k salary.
          Compare offers on in-hand pay, not CTC.
        </p>
      </Footer>
    </div>
  );
}
