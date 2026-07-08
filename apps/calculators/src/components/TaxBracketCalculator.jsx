import React, { useState, useMemo } from 'react';
import { CalculatorLayout, CalculatorHeader, ResultsAnalysis, Input, Card, DownloadButtons, Footer, Select, MetricDisplay } from '@packages/styling';
import { Building2, Receipt, HeartHandshake, Stethoscope, Briefcase, Calculator } from 'lucide-react';
import { calculateTaxBracketOptimization } from '../lib/taxBracketLogic';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import { usePersistedState, resetPersistedState } from '@packages/persistence';

export default function TaxBracketCalculator() {
  const [inputs, setInputs] = usePersistedState('TaxBracketCalculator', 'inputs', {
    grossIncome: 75000,
    filingStatus: 'single', // 'single', 'married', 'hoh'
    stateLocalTaxes: 2000,
    mortgageInterest: 0,
    charitableContributions: 500,
    medicalExpenses: 0,
    otherItemized: 0
  });

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const results = useMemo(() => calculateTaxBracketOptimization(inputs), [inputs]);

  const handleDownloadPDF = () => {
    downloadPDF({ inputs, results, schedule: [] });
  };

  const handleDownloadExcel = () => {
    downloadExcel({ inputs, results, schedule: [] });
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const formatPercent = (val) => new Intl.NumberFormat('en-IN', { style: 'percent', maximumFractionDigits: 2 }).format(val);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <CalculatorLayout>
      <div className="lg:col-span-12">
        <CalculatorHeader namespace="TaxBracketCalculator" 
        title="Tax Bracket Optimizer"
        icon={<Building2 className="w-8 h-8" 
            onReset={() => { resetPersistedState('TaxBracketCalculator'); window.location.reload(); }} />}
      />
      </div>

        <div className="lg:col-span-4 space-y-6">
          <Card title="Income & Filing" icon={<Briefcase className="w-5 h-5" />}>
            <div className="space-y-4">
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
                id="grossIncome"
                label="Gross Annual Income"
                type="number"
                value={inputs.grossIncome}
                onChange={(val) => handleInputChange('grossIncome', val)}
                prefix="$"
                tooltip="Your total income before taxes and deductions."
              />
            </div>
          </Card>

          <Card title="Itemized Deductions" icon={<Receipt className="w-5 h-5" />}>
            <div className="space-y-4">
              <Input
                id="stateLocalTaxes"
                label="State & Local Taxes (SALT)"
                type="number"
                value={inputs.stateLocalTaxes}
                onChange={(val) => handleInputChange('stateLocalTaxes', val)}
                prefix="$"
                tooltip="Property taxes, state income taxes, etc. Capped at ₹10,000."
              />
              
              <Input
                id="mortgageInterest"
                label="Mortgage Interest"
                type="number"
                value={inputs.mortgageInterest}
                onChange={(val) => handleInputChange('mortgageInterest', val)}
                prefix="$"
                tooltip="Interest paid on your primary mortgage."
              />

              <Input
                id="charitableContributions"
                label="Charitable Contributions"
                type="number"
                value={inputs.charitableContributions}
                onChange={(val) => handleInputChange('charitableContributions', val)}
                prefix="$"
                tooltip="Donations to qualified 501(c)(3) organizations."
              />

              <Input
                id="medicalExpenses"
                label="Medical Expenses"
                type="number"
                value={inputs.medicalExpenses}
                onChange={(val) => handleInputChange('medicalExpenses', val)}
                prefix="$"
                tooltip="Out-of-pocket medical expenses. Only the amount exceeding 7.5% of AGI is deductible."
              />

              <Input
                id="otherItemized"
                label="Other Itemized Deductions"
                type="number"
                value={inputs.otherItemized}
                onChange={(val) => handleInputChange('otherItemized', val)}
                prefix="$"
                tooltip="Any other qualified itemized deductions."
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <Card title="Optimization Results" icon={<Calculator className="w-5 h-5" />}>
            <div aria-live="polite" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 border-4 border-black ${results.bestStrategy === 'standard' ? 'bg-yellow-300' : 'bg-gray-100 opacity-75'} relative`}>
                {results.bestStrategy === 'standard' && (
                  <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-sm font-bold border-l-4 border-b-4 border-black">
                    RECOMMENDED
                  </div>
                )}
                <MetricDisplay
                  title="Standard Deduction"
                  value={formatCurrency(results.standardDeduction)}
                  subtitle={
                    <span className="block mt-2 space-y-1">
                      <span className="block">Estimated Tax: {formatCurrency(results.comparisons.standard.totalTax)}</span>
                      <span className="block">Effective Rate: {formatPercent(results.comparisons.standard.effectiveRateGross)}</span>
                    </span>
                  }
                />
              </div>

              <div className={`p-6 border-4 border-black ${results.bestStrategy === 'itemized' ? 'bg-green-300' : 'bg-gray-100 opacity-75'} relative`}>
                {results.bestStrategy === 'itemized' && (
                  <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-sm font-bold border-l-4 border-b-4 border-black">
                    RECOMMENDED
                  </div>
                )}
                <MetricDisplay
                  title="Itemized Deductions"
                  value={formatCurrency(results.itemizedDetails.totalItemized)}
                  subtitle={
                    <span className="block mt-2 space-y-1">
                      <span className="block">Estimated Tax: {formatCurrency(results.comparisons.itemized.totalTax)}</span>
                      <span className="block">Effective Rate: {formatPercent(results.comparisons.itemized.effectiveRateGross)}</span>
                    </span>
                  }
                />
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-100 border-4 border-black">
              <MetricDisplay 
                title="Tax Savings" 
                value={formatCurrency(results.taxSavings)} 
                subtitle={`By choosing the ${results.bestStrategy} deduction strategy.`}
                color="text-blue-700" 
              />
            </div>

            <ResultsAnalysis
              title="Tax Bracket Breakdown (Recommended Strategy)"
              aria-live="polite"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                  <span className="font-bold text-gray-600">Gross Income</span>
                  <span className="font-bold">{formatCurrency(results.grossIncome)}</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                  <span className="font-bold text-gray-600">Applied Deduction ({results.bestStrategy})</span>
                  <span className="font-bold text-red-600">-{formatCurrency(results.appliedDeduction)}</span>
                </div>
                <div className="flex justify-between items-center border-b-4 border-black pb-2 mb-4">
                  <span className="font-black text-lg">Taxable Income</span>
                  <span className="font-black text-lg">{formatCurrency(results.recommendedTaxable)}</span>
                </div>

                <div className="space-y-2 mt-4">
                  <h4 className="font-bold mb-2">Marginal Tax Buckets:</h4>
                  {results.recommendedBreakdown.map((bracket, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 border-2 border-gray-200">
                      <span className="font-medium">
                        {formatPercent(bracket.rate)} Bracket
                        <span className="text-xs text-gray-500 ml-2">
                          (on {formatCurrency(bracket.income)})
                        </span>
                      </span>
                      <span className="font-bold">{formatCurrency(bracket.tax)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center bg-black text-white p-4 mt-6 border-4 border-black">
                  <span className="font-bold text-xl">Total Estimated Tax</span>
                  <span className="font-black text-2xl">{formatCurrency(results.recommendedTax)}</span>
                </div>
              </div>
            </ResultsAnalysis>
          </Card>

          <DownloadButtons 
            onDownloadPDF={handleDownloadPDF}
            onDownloadExcel={handleDownloadExcel}
          />
        </div>
      
    </CalculatorLayout>
    <Footer>
        <p className="text-gray-600 font-medium">
            <strong>Disclaimer:</strong> Getting a raise into a higher tax bracket never results in less take-home pay, because only the money *above* the threshold is taxed at the higher rate.
            <br className="md:hidden" />
            Understanding marginal tax rates prevents you from turning down income out of mathematical misunderstanding.
        </p>
    </Footer>
    </div>
    );
}
