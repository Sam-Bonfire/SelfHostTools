import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Home, Calculator, IndianRupee, TrendingUp, TrendingDown, ArrowLeft, Settings, Info, Building, Key, Landmark, ShieldCheck, LineChart, AlertCircle, Table as TableIcon } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, DownloadButtons, Footer, MetricDisplay , ActionEngine } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';

import SEO from './SEO';

import { calculateBuyVsRent } from '../lib/homeLoanRentLogic';
import { usePersistedState, resetPersistedState } from '@packages/persistence';
import { macroData } from '@packages/macro-data';
import { generateActions } from '../lib/actionEngine';

export default function HomeLoanRentCalculator() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "Home Loan vs Rent Calculator",
    "description": "Compare the true financial impact of buying vs renting a home including opportunity cost and tax benefits.",
    "brand": { "@type": "Brand", "name": "Calculators Hub" }
  };

  // --- BUYING INPUTS ---
  const [propertyValue, setPropertyValue] = usePersistedState('HomeLoanRentCalculator', 'propertyValue', 8000000);
  const [downPayment, setDownPayment] = usePersistedState('HomeLoanRentCalculator', 'downPayment', 1600000); // 20%
  const [interestRate, setInterestRate] = usePersistedState('HomeLoanRentCalculator', 'interestRate', macroData.interestRates.homeLoan);
  const [loanTenure, setLoanTenure] = usePersistedState('HomeLoanRentCalculator', 'loanTenure', 20);
  const [propertyAppreciation, setPropertyAppreciation] = usePersistedState('HomeLoanRentCalculator', 'propertyAppreciation', 5);
  const [maintenanceCost, setMaintenance] = usePersistedState('HomeLoanRentCalculator', 'maintenanceCost', 1); // 1% of value / yr

  // --- RENTING INPUTS ---
  const [monthlyRent, setMonthlyRent] = usePersistedState('HomeLoanRentCalculator', 'monthlyRent', 25000);
  const [rentInflation, setRentInflation] = usePersistedState('HomeLoanRentCalculator', 'rentInflation', macroData.inflation.rent);

  // --- REALITY FACTORS ---
  const [investDifference, setInvestDifference] = usePersistedState('HomeLoanRentCalculator', 'investDifference', true);
  const [equityReturn, setEquityReturn] = usePersistedState('HomeLoanRentCalculator', 'equityReturn', 12);
  const [taxBenefit, setTaxBenefit] = usePersistedState('HomeLoanRentCalculator', 'taxBenefit', true); // Sec 24 deduction

  // --- RESULTS ---
  const [results, setResults] = usePersistedState('HomeLoanRentCalculator', 'results', {
    buyNetWealth: 0,
    rentNetWealth: 0,
    monthlyEMI: 0,
    buyTotalOutflow: 0,
    rentTotalOutflow: 0,
    winner: ''
  });

  const [schedule, setSchedule] = usePersistedState('HomeLoanRentCalculator', 'schedule', []);
  const [showSchedule, setShowSchedule] = usePersistedState('HomeLoanRentCalculator', 'showSchedule', false);

  const calculate = useCallback(() => {
    const calcResult = calculateBuyVsRent({
      propertyValue,
      downPayment,
      interestRate,
      loanTenure,
      propertyAppreciation,
      maintenanceCost,
      monthlyRent,
      rentInflation,
      investDifference,
      equityReturn,
      taxBenefit
    });

    setResults(calcResult);
    setSchedule(calcResult.schedule);

  }, [propertyValue, downPayment, interestRate, loanTenure, propertyAppreciation, maintenanceCost, monthlyRent, rentInflation, investDifference, equityReturn, taxBenefit]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const actions = generateActions('HomeLoanRentCalculator', { investDifference, loanTenure }, results);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="Home Loan vs Rent Calculator"
        description="The 'Buy or Bye' Reality Check. Compare buying vs renting while accounting for opportunity costs and maintenance."
        keywords="buy vs rent, rent vs buy calculator, home ownership cost, real estate investment, home loan calculator, renting vs buying india"
        canonical={`${import.meta.env.VITE_SITE_URL}/home-loan-vs-rent`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/buy_vs_rent.png`}
        structuredData={structuredData}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader namespace="HomeLoanRentCalculator"
            icon={Home}
            title="Buy vs Rent Hub"
          
            onReset={() => { resetPersistedState('HomeLoanRentCalculator'); window.location.reload(); }} />
        </div>

        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <Card title="Buy Scenario" icon={Landmark} headerColor="bg-blue-100">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Property Value" icon={IndianRupee} id="property-value" type="number" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} onBlur={() => !propertyValue && setPropertyValue(0)} className="font-black" />
                <Input label="Down Payment" icon={IndianRupee} id="down-payment" type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} onBlur={() => !downPayment && setDownPayment(0)} className="font-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Int. Rate (%)" icon={<span className="text-[10px] font-black text-gray-400">%</span>} id="interest-rate" type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} onBlur={() => !interestRate && setInterestRate(0)} className="font-black" />
                <Input label="Tenure (Yrs)" icon={<span className="text-[10px] font-black text-gray-400">Yr</span>} id="loan-tenure" type="number" value={loanTenure} onChange={e => setLoanTenure(e.target.value)} onBlur={() => !loanTenure && setLoanTenure(0)} className="font-black" />
              </div>
              <Input label="Expected Appreciation (%)" icon={<TrendingUp className="w-3 h-3 text-green-600" />} id="property-appreciation" type="number" value={propertyAppreciation} onChange={e => setPropertyAppreciation(e.target.value)} onBlur={() => !propertyAppreciation && setPropertyAppreciation(0)} className="font-black" />
            </div>
          </Card>

          <Card title="Rent Scenario" icon={Key} headerColor="bg-purple-100">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Monthly Rent" icon={IndianRupee} id="monthly-rent" type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} onBlur={() => !monthlyRent && setMonthlyRent(0)} className="font-black" />
                <Input label="Rent Inflation (%)" icon={<TrendingUp className="w-3 h-3 text-red-600" />} id="rent-inflation" type="number" value={rentInflation} onChange={e => setRentInflation(e.target.value)} onBlur={() => !rentInflation && setRentInflation(0)} className="font-black" />
              </div>
            </div>
          </Card>

          <Card title="Reality Factors" icon={<AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />} headerColor="bg-red-50">
            <div className="space-y-4">
              <Checkbox
                label="Invest the Difference"
                tooltip="Renting is cheaper? Invest the savings."
                checked={investDifference}
                onChange={e => setInvestDifference(e.target.checked)}
              />
              {investDifference && (
                <div className="pl-8 animate-in zoom-in-95">
                  <Input label="Equity Return Rate (%)" id="equity-return" type="number" value={equityReturn} onChange={e => setEquityReturn(e.target.value)} onBlur={() => !equityReturn && setEquityReturn(0)} className="h-8 border-green-600 font-black" />
                </div>
              )}
              <Checkbox
                label="Tax Benefit (Old Regime)"
                tooltip="Save tax on interest paid (Sec 24b)."
                checked={taxBenefit}
                onChange={e => setTaxBenefit(e.target.checked)}
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <ResultsAnalysis
            title="Reality Analysis"
            headerElements={
              <div className="flex gap-2">
                <span className={`text-[10px] font-black px-2 py-1 border-2 border-black ${results.winner === 'Buy' ? 'bg-green-500 text-white' : 'bg-white text-black'}`}>BUY</span>
                <span className={`text-[10px] font-black px-2 py-1 border-2 border-black ${results.winner === 'Rent' ? 'bg-green-500 text-white' : 'bg-white text-black'}`}>RENT</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <MetricDisplay
                  title="Buy Wealth (Net)"
                  value={formatCurrency(results.buyNetWealth)}
                  subtitle="Property Value - Remaining Loan"
                />
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <MetricDisplay
                  title="Rent Wealth (Net)"
                  value={formatCurrency(results.rentNetWealth)}
                  subtitle="Invested DP + Invested Savings"
                />
              </div>
            </div>

            <div className="bg-black text-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,222,89,1)]">
              <h3 className="text-xs font-black uppercase text-yellow-300 mb-2 tracking-widest">The Financial Verdict</h3>
              <p className="text-lg font-bold leading-tight">
                Over {loanTenure} years, {results.winner === 'Buy' ? 'Buying' : 'Renting'} creates
                <span className="text-green-400 mx-2 text-2xl font-black">
                  {formatCurrency(Math.abs(results.buyNetWealth - results.rentNetWealth))}
                </span>
                more wealth for you.
              </p>
            </div>

            <div>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <DownloadButtons 
                  onDownloadPDF={() => downloadPDF({
                    inputs: {
                      propertyPrice: propertyValue, interestRate, monthlyRent, rentInflation, tenure: loanTenure
                    },
                    results,
                    schedule: schedule.map(s => ({
                      label: s.label,
                      principal: s.buyWealth, // Mapping Buy Wealth to Principal slot
                      interest: s.rentWealth, // Mapping Rent Wealth to Interest slot
                      balance: s.buyWealth - s.rentWealth // Difference
                    }))
                  })}
                  onDownloadExcel={() => downloadExcel({
                    inputs: {
                      propertyPrice: propertyValue, interestRate, monthlyRent, rentInflation, tenure: loanTenure
                    },
                    results,
                    schedule: schedule.map(s => ({
                      label: s.label,
                      principal: s.buyWealth,
                      interest: s.rentWealth,
                      balance: s.buyWealth - s.rentWealth
                    }))
                  })}
                  pdfText="Download Report (PDF)"
                  excelText="Download Analysis (Excel)"
                />
              </div>

              <Button
                onClick={() => setShowSchedule(!showSchedule)}
                variant="outline"
                className="w-full flex justify-center items-center gap-2 border-4 font-black uppercase h-12"
              >
                <TableIcon className="w-5 h-5" />
                {showSchedule ? 'Hide Data' : 'View Detailed Comparison'}
              </Button>

              {showSchedule && (
                <div className="mt-4 border-4 border-black p-4 bg-white animate-in slide-in-from-top-4">
                  <div className="overflow-x-auto border-2 border-black">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-black text-white uppercase font-black">
                        <tr>
                          <th className="p-2 text-white">Period</th>
                          <th className="p-2 text-white">Buy Wealth</th>
                          <th className="p-2 text-white">Rent Wealth</th>
                          <th className="p-2 text-right text-white">Advantage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-gray-100 text-black">
                        {schedule.map(row => (
                          <tr key={row.label} className="hover:bg-yellow-50 transition-colors">
                            <td className="p-2 font-bold uppercase">{row.label}</td>
                            <td className="p-2 font-mono">{formatCurrency(row.buyWealth)}</td>
                            <td className="p-2 font-mono">{formatCurrency(row.rentWealth)}</td>
                            <td className={`p-2 text-right font-black ${row.buyWealth > row.rentWealth ? 'text-blue-600' : 'text-purple-600'}`}>
                              {row.buyWealth > row.rentWealth ? 'Buy' : 'Rent'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </ResultsAnalysis>

          <ActionEngine calculatorId="HomeLoanRentCalculator" actions={actions} />
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> This comparison is strictly financial. Buying provides emotional security and stability, while Renting provides mobility and asset diversification. Both involve market risk.
        </p>
      </Footer>
    </div>
  );
}
