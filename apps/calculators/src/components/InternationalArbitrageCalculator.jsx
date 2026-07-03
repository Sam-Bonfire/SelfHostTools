import React, { useState, useMemo } from 'react';
import { CalculatorLayout, CalculatorHeader, ResultsAnalysis, Input, Card, DownloadButtons, Tooltip, Footer } from '@packages/styling';
import { calculateArbitrage } from '../lib/internationalArbitrageLogic';
import { Globe, PlaneTakeoff, Percent, DollarSign, Wallet, FileDown, TrendingUp, AlertCircle, Target } from 'lucide-react';

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

  const formatCurrency = (val, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <CalculatorLayout>
      <div className="lg:col-span-12">
        <div className="lg:col-span-12">
        <CalculatorHeader 
          title="International Arbitrage"
          icon={Globe}
        />
      </div>
      </div>

      <div className="lg:col-span-12 xl:col-span-5 space-y-6">
        <Card className="p-0 border-4 border-black">
          <div className="bg-blue-100 p-4 border-b-4 border-black flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2 text-black">
              <Wallet className="w-5 h-5" />
              Source Country (Home)
            </h2>
          </div>
          <div className="p-4 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sourceCurrency" className="block text-[10px] font-black uppercase mb-1">Source Currency</label>
                <Input id="sourceCurrency" name="sourceCurrency" value={inputs.sourceCurrency} onChange={handleChange} placeholder="USD" className="font-black" />
              </div>
              <div>
                <label htmlFor="grossIncome" className="block text-[10px] font-black uppercase mb-1">Gross Annual Income</label>
                <Input id="grossIncome" name="grossIncome" type="number" value={inputs.grossIncome} onChange={handleChange} className="font-black" />
              </div>
              <div>
                <label htmlFor="sourceTaxRate" className="block text-[10px] font-black uppercase mb-1">Income Tax Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input id="sourceTaxRate" name="sourceTaxRate" type="number" value={inputs.sourceTaxRate} onChange={handleChange} className="font-black pl-9" />
                </div>
              </div>
              <div>
                <label htmlFor="sourceExpenses" className="block text-[10px] font-black uppercase mb-1">Annual Living Expenses</label>
                <Input id="sourceExpenses" name="sourceExpenses" type="number" value={inputs.sourceExpenses} onChange={handleChange} className="font-black" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0 border-4 border-black">
          <div className="bg-green-100 p-4 border-b-4 border-black flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2 text-black">
              <PlaneTakeoff className="w-5 h-5" />
              Target Country (Destination)
            </h2>
          </div>
          <div className="p-4 space-y-5">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="targetCurrency" className="block text-[10px] font-black uppercase mb-1">Target Currency</label>
                <Input id="targetCurrency" name="targetCurrency" value={inputs.targetCurrency} onChange={handleChange} placeholder="THB" className="font-black" />
              </div>
              <div>
                <label htmlFor="exchangeRate" className="block text-[10px] font-black uppercase mb-1">Exchange Rate</label>
                <p className="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-tight">1 {inputs.sourceCurrency} = X {inputs.targetCurrency}</p>
                <Input id="exchangeRate" name="exchangeRate" type="number" value={inputs.exchangeRate} onChange={handleChange} className="font-black" />
              </div>
              <div>
                <label htmlFor="targetTaxRate" className="block text-[10px] font-black uppercase mb-1">Target Tax Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input id="targetTaxRate" name="targetTaxRate" type="number" value={inputs.targetTaxRate} onChange={handleChange} className="font-black pl-9" />
                </div>
              </div>
              <div>
                <label htmlFor="targetExpenses" className="block text-[10px] font-black uppercase mb-1">Annual Expenses (Local)</label>
                <Input id="targetExpenses" name="targetExpenses" type="number" value={inputs.targetExpenses} onChange={handleChange} className="font-black" />
              </div>
            </div>
            
            <h4 className="text-sm font-bold border-b-2 border-black pb-2 mb-4">Transfer & Platform Fees</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="platformFeeRate" className="block text-[10px] font-black uppercase mb-1">Platform Fee (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input id="platformFeeRate" name="platformFeeRate" type="number" value={inputs.platformFeeRate} onChange={handleChange} className="font-black pl-9" />
                </div>
              </div>
              <div>
                <label htmlFor="forexSpreadRate" className="block text-[10px] font-black uppercase mb-1">Forex Spread (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input id="forexSpreadRate" name="forexSpreadRate" type="number" value={inputs.forexSpreadRate} onChange={handleChange} className="font-black pl-9" />
                </div>
              </div>
              <div>
                <label htmlFor="transferFeeFixed" className="block text-[10px] font-black uppercase mb-1">Fixed Transfer Fee</label>
                <Input id="transferFeeFixed" name="transferFeeFixed" type="number" value={inputs.transferFeeFixed} onChange={handleChange} className="font-black" />
              </div>
              <div>
                <label htmlFor="transfersPerYear" className="block text-[10px] font-black uppercase mb-1">Transfers Per Year</label>
                <Input id="transfersPerYear" name="transfersPerYear" type="number" value={inputs.transfersPerYear} onChange={handleChange} className="font-black" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT: RESULTS */}
      <div className="lg:col-span-12 xl:col-span-7 space-y-6">
        <ResultsAnalysis title="Arbitrage Results">
          
          <div className={`border-4 border-black text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4 ${comparison.savingsDifference > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black/20 rounded-full border-2 border-black">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs font-black uppercase tracking-widest">Net Worth Velocity Increase</p>
                <p className="text-3xl md:text-5xl font-black tracking-tighter">
                  {comparison.savingsIncreasePercent > 0 ? '+' : ''}{comparison.savingsIncreasePercent.toFixed(1)}%
                </p>
                <p className="text-[10px] font-bold text-white uppercase mt-1 italic">
                  {comparison.savingsDifference > 0 ? 'Faster wealth accumulation' : 'Slower wealth accumulation'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
              <h3 className="text-[10px] font-black text-gray-600 uppercase">Annual Savings (Source)</h3>
              <h3 className="text-2xl font-black mt-2">{formatCurrency(source.savings, inputs.sourceCurrency)}</h3>
            </div>
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
              <h3 className="text-[10px] font-black text-gray-600 uppercase">Equivalent Savings (Target)</h3>
              <h3 className="text-2xl font-black mt-2">{formatCurrency(target.savingsConverted, inputs.sourceCurrency)}</h3>
            </div>
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
              <h3 className="text-[10px] font-black text-gray-600 uppercase">Time to 1 Yr Source Savings</h3>
              <h3 className="text-2xl font-black mt-2">{comparison.monthsToReachSourceAnnual > 0 ? `${comparison.monthsToReachSourceAnnual.toFixed(1)} Months` : 'N/A'}</h3>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-xs font-black uppercase border-b-2 border-black pb-1 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Fee & Tax Leakage
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[8px] font-black uppercase text-blue-800">Platform Fees</p>
                <p className="text-sm font-black text-blue-900">-{formatCurrency(target.platformFee, inputs.sourceCurrency)}</p>
              </div>
              <div className="p-3 bg-red-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[8px] font-black uppercase text-red-800">Transfer & Forex</p>
                <p className="text-sm font-black text-red-900">-{formatCurrency(target.transferFee + target.forexFee, inputs.sourceCurrency)}</p>
              </div>
              <div className="p-3 bg-orange-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[8px] font-black uppercase text-orange-800">Target Taxes</p>
                <p className="text-sm font-black text-orange-900">-{formatCurrency(target.taxAmountConverted, inputs.sourceCurrency)}</p>
              </div>
            </div>
            <div className="bg-[#FF6B6B]/10 border-4 border-black p-4 mt-6 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black uppercase text-red-900 leading-tight">Total Leakage</h4>
                <p className="text-[9px] font-bold text-red-700 uppercase">Total money lost in transition</p>
              </div>
              <p className="text-3xl font-black text-red-900">-{formatCurrency(target.platformFee + target.transferFee + target.forexFee + target.taxAmountConverted, inputs.sourceCurrency)}</p>
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
    <Footer />
    </div>
    );
}
