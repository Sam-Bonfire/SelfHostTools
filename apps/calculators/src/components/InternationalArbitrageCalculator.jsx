import React, { useState, useMemo } from 'react';
import { 
  CalculatorLayout, 
  CalculatorHeader, 
  ResultsAnalysis, 
  Input, 
  Card,
  DownloadButtons 
} from '@packages/styling';
import { calculateArbitrage } from '../lib/internationalArbitrageLogic';
import { Globe, PlaneTakeoff, Percent, DollarSign, Wallet, FileDown } from 'lucide-react';

export default function InternationalArbitrageCalculator() {
  const [inputs, setInputs] = useState({
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
    setInputs(prev => ({
      ...prev,
      [name]: isText ? value : parseFloat(value) || 0
    }));
  };

  const results = useMemo(() => calculateArbitrage(inputs), [inputs]);

  const { source, target, comparison } = results;

  return (
    <CalculatorLayout>
      <CalculatorHeader 
        title="International Arbitrage"
        description="Calculate geo-arbitrage, PPP ratios, and international transfer fees to find your true global net worth velocity."
        icon={Globe}
        color="bg-blue-100"
      />
      
      {/* We should replace bg-purple-100 with bg-blue-100 to follow rules */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card title="Source Country (Home)" icon={Wallet}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                id="sourceCurrency"
                name="sourceCurrency"
                label="Source Currency"
                value={inputs.sourceCurrency}
                onChange={handleChange}
                placeholder="USD"
              />
              <Input 
                id="grossIncome"
                name="grossIncome"
                label="Gross Annual Income"
                type="number"
                value={inputs.grossIncome}
                onChange={handleChange}
                prefix={inputs.sourceCurrency}
              />
              <Input 
                id="sourceTaxRate"
                name="sourceTaxRate"
                label="Income Tax Rate (%)"
                type="number"
                value={inputs.sourceTaxRate}
                onChange={handleChange}
                icon={Percent}
              />
              <Input 
                id="sourceExpenses"
                name="sourceExpenses"
                label="Annual Living Expenses"
                type="number"
                value={inputs.sourceExpenses}
                onChange={handleChange}
                prefix={inputs.sourceCurrency}
              />
            </div>
          </Card>

          <Card title="Target Country (Destination)" icon={PlaneTakeoff}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Input 
                id="targetCurrency"
                name="targetCurrency"
                label="Target Currency"
                value={inputs.targetCurrency}
                onChange={handleChange}
                placeholder="THB"
              />
              <Input 
                id="exchangeRate"
                name="exchangeRate"
                label="Exchange Rate"
                type="number"
                value={inputs.exchangeRate}
                onChange={handleChange}
                helperText={`1 ${inputs.sourceCurrency} = X ${inputs.targetCurrency}`}
              />
              <Input 
                id="targetTaxRate"
                name="targetTaxRate"
                label="Target Income Tax Rate (%)"
                type="number"
                value={inputs.targetTaxRate}
                onChange={handleChange}
                icon={Percent}
              />
              <Input 
                id="targetExpenses"
                name="targetExpenses"
                label="Annual Living Expenses (Local)"
                type="number"
                value={inputs.targetExpenses}
                onChange={handleChange}
                prefix={inputs.targetCurrency}
              />
            </div>
            
            <h4 className="text-sm font-bold border-b-2 border-black pb-2 mb-4">Transfer & Platform Fees</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                id="platformFeeRate"
                name="platformFeeRate"
                label="Platform Fee (%)"
                type="number"
                value={inputs.platformFeeRate}
                onChange={handleChange}
                helperText="Upwork, Fiverr, etc."
                icon={Percent}
              />
              <Input 
                id="forexSpreadRate"
                name="forexSpreadRate"
                label="Forex Spread (%)"
                type="number"
                value={inputs.forexSpreadRate}
                onChange={handleChange}
                icon={Percent}
              />
              <Input 
                id="transferFeeFixed"
                name="transferFeeFixed"
                label={`Fixed Transfer Fee (${inputs.sourceCurrency})`}
                type="number"
                value={inputs.transferFeeFixed}
                onChange={handleChange}
                helperText="Per transfer"
                prefix={inputs.sourceCurrency}
              />
              <Input 
                id="transfersPerYear"
                name="transfersPerYear"
                label="Transfers Per Year"
                type="number"
                value={inputs.transfersPerYear}
                onChange={handleChange}
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <ResultsAnalysis 
            title="Arbitrage Results"
            isPositive={comparison.savingsDifference > 0}
            primaryMetric={{
              label: "Net Worth Velocity Increase",
              value: `${comparison.savingsIncreasePercent > 0 ? '+' : ''}${comparison.savingsIncreasePercent.toFixed(1)}%`,
              subValue: comparison.savingsDifference > 0 ? 'Faster wealth accumulation' : 'Slower wealth accumulation'
            }}
            metrics={[
              {
                label: `Annual Savings (${inputs.sourceCurrency})`,
                value: source.savings.toLocaleString(undefined, { maximumFractionDigits: 0 }),
                subValue: 'Source Country'
              },
              {
                label: `Equivalent Savings (${inputs.sourceCurrency})`,
                value: target.savingsConverted.toLocaleString(undefined, { maximumFractionDigits: 0 }),
                subValue: 'Target Country'
              },
              {
                label: "Time to 1 Year Source Savings",
                value: comparison.monthsToReachSourceAnnual > 0 ? `${comparison.monthsToReachSourceAnnual.toFixed(1)} Months` : 'N/A',
                subValue: 'Velocity'
              }
            ]}
          />
          
          <Card title="Fee & Tax Leakage" className="bg-yellow-50">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">Platform Fees:</span>
                <span>{inputs.sourceCurrency} {target.platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">Transfer & Forex:</span>
                <span>{inputs.sourceCurrency} {(target.transferFee + target.forexFee).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">Target Taxes:</span>
                <span>{inputs.sourceCurrency} {target.taxAmountConverted.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="pt-2 border-t-2 border-black flex justify-between items-center font-bold">
                <span>Total Leakage:</span>
                <span>{inputs.sourceCurrency} {(target.platformFee + target.transferFee + target.forexFee + target.taxAmountConverted).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </Card>

          <DownloadButtons 
            onPdf={() => {}} 
            onExcel={() => {}} 
            fileName="International_Arbitrage_Report" 
          />
        </div>
      </div>
    </CalculatorLayout>
  );
}
