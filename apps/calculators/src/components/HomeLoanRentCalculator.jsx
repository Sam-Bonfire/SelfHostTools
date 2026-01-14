import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Home, Calculator, IndianRupee, TrendingUp, TrendingDown, ArrowLeft, Settings, Info, Building, Key, Landmark, ShieldCheck, LineChart, AlertCircle, Table as TableIcon } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import Footer from './Footer';
import SEO from './SEO';

import { calculateBuyVsRent } from '../lib/homeLoanRentLogic';

export default function HomeLoanRentCalculator() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "Home Loan vs Rent Calculator",
    "description": "Compare the true financial impact of buying vs renting a home including opportunity cost and tax benefits.",
    "brand": { "@type": "Brand", "name": "Calculators Hub" }
  };

  // --- BUYING INPUTS ---
  const [propertyValue, setPropertyValue] = useState(8000000);
  const [downPayment, setDownPayment] = useState(1600000); // 20%
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [propertyAppreciation, setPropertyAppreciation] = useState(5);
  const [maintenanceCost, setMaintenance] = useState(1); // 1% of value / yr

  // --- RENTING INPUTS ---
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [rentInflation, setRentInflation] = useState(8);

  // --- REALITY FACTORS ---
  const [investDifference, setInvestDifference] = useState(true);
  const [equityReturn, setEquityReturn] = useState(12);
  const [taxBenefit, setTaxBenefit] = useState(true); // Sec 24 deduction

  // --- RESULTS ---
  const [results, setResults] = useState({
    buyNetWealth: 0,
    rentNetWealth: 0,
    monthlyEMI: 0,
    buyTotalOutflow: 0,
    rentTotalOutflow: 0,
    winner: ''
  });

  const [schedule, setSchedule] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);

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

  // ... (rest remains)

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
      <SEO
        title="Home Loan vs Rent Calculator"
        description="The 'Buy or Bye' Reality Check. Compare buying vs renting while accounting for opportunity costs and maintenance."
        keywords="buy vs rent, rent vs buy calculator, home ownership cost, real estate investment, home loan calculator, renting vs buying india"
        canonical={`${import.meta.env.VITE_SITE_URL}/home-loan-vs-rent`}
        structuredData={structuredData}
      />
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="mb-8 flex justify-between items-center bg-yellow-300 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4">
            <Tooltip content="Return to Hub" position="right">
              <Link to="/" aria-label="Back" className="p-2 bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all block">
                <ArrowLeft className="w-5 h-5 text-black" />
              </Link>
            </Tooltip>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
              <Home className="w-6 h-6 md:w-8 md:h-8" /> BUY vs RENT
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* INPUTS */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-0 border-4 border-black">
              <div className="bg-blue-100 p-4 border-b-4 border-black">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Landmark className="w-5 h-5" /> Buy Scenario
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">Property Value</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                      <Input type="number" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} onBlur={() => !propertyValue && setPropertyValue(0)} className="pl-8 font-black" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">Down Payment</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                      <Input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} onBlur={() => !downPayment && setDownPayment(0)} className="pl-8 font-black" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">Int. Rate (%)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 z-10">%</span>
                      <Input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} onBlur={() => !interestRate && setInterestRate(0)} className="pl-8 font-black" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">Tenure (Yrs)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 z-10">Yr</span>
                      <Input type="number" value={loanTenure} onChange={e => setLoanTenure(e.target.value)} onBlur={() => !loanTenure && setLoanTenure(0)} className="pl-8 font-black" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Expected Appreciation (%)</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-green-600 z-10" />
                    <Input type="number" value={propertyAppreciation} onChange={e => setPropertyAppreciation(e.target.value)} onBlur={() => !propertyAppreciation && setPropertyAppreciation(0)} className="pl-8 font-black" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-0 border-4 border-black">
              <div className="bg-purple-100 p-4 border-b-4 border-black">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Key className="w-5 h-5" /> Rent Scenario
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">Monthly Rent</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                      <Input type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} onBlur={() => !monthlyRent && setMonthlyRent(0)} className="pl-8 font-black" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">Rent Inflation (%)</label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-red-600 z-10" />
                      <Input type="number" value={rentInflation} onChange={e => setRentInflation(e.target.value)} onBlur={() => !rentInflation && setRentInflation(0)} className="pl-8 font-black" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-0 border-4 border-black">
              <div className="bg-red-50 p-4 border-b-4 border-black">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" /> Reality Factors
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={investDifference} onChange={e => setInvestDifference(e.target.checked)} />
                  <div>
                    <span className="text-xs font-black uppercase">Invest the Difference</span>
                    <p className="text-[9px] font-bold text-gray-400">Renting is cheaper? Invest the savings.</p>
                  </div>
                </label>
                {investDifference && (
                  <div className="pl-8 animate-in zoom-in-95">
                    <label className="text-[10px] font-black uppercase text-green-700">Equity Return Rate (%)</label>
                    <Input type="number" value={equityReturn} onChange={e => setEquityReturn(e.target.value)} onBlur={() => !equityReturn && setEquityReturn(0)} className="h-8 border-green-600 font-black" />
                  </div>
                )}
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={taxBenefit} onChange={e => setTaxBenefit(e.target.checked)} />
                  <div>
                    <span className="text-xs font-black uppercase">Tax Benefit (Old Regime)</span>
                    <p className="text-[9px] font-bold text-gray-400">Save tax on interest paid (Sec 24b).</p>
                  </div>
                </label>
              </div>
            </Card>
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="h-full flex flex-col border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="bg-[#FFDE59] p-4 border-b-4 border-black flex justify-between items-center">
                <h2 className="text-lg font-bold uppercase italic text-black">Reality Analysis</h2>
                <div className="flex gap-2">
                  <span className={`text-[10px] font-black px-2 py-1 border-2 border-black ${results.winner === 'Buy' ? 'bg-green-500 text-white' : 'bg-white text-black'}`}>BUY</span>
                  <span className={`text-[10px] font-black px-2 py-1 border-2 border-black ${results.winner === 'Rent' ? 'bg-green-500 text-white' : 'bg-white text-black'}`}>RENT</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Buy Wealth (Net)</p>
                    <p className="text-2xl font-black">{formatCurrency(results.buyNetWealth)}</p>
                    <p className="text-[9px] font-bold text-gray-400 italic">Property Value - Remaining Loan</p>
                  </div>
                  <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Rent Wealth (Net)</p>
                    <p className="text-2xl font-black">{formatCurrency(results.rentNetWealth)}</p>
                    <p className="text-[9px] font-bold text-gray-400 italic">Invested DP + Invested Savings</p>
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
                  <Button
                    onClick={() => setShowSchedule(!showSchedule)}
                    variant="outline"
                    className="w-full flex justify-center items-center gap-2 border-4 font-black uppercase"
                  >
                    <TableIcon className="w-5 h-5" />
                    {showSchedule ? 'Hide Data' : 'View Detailed Comparison'}
                  </Button>

                  {showSchedule && (
                    <div className="mt-4 border-4 border-black p-4 bg-white animate-in slide-in-from-top-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-black text-white uppercase font-black">
                            <tr>
                              <th className="p-2">Period</th>
                              <th className="p-2">Buy Wealth</th>
                              <th className="p-2">Rent Wealth</th>
                              <th className="p-2 text-right">Advantage</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-gray-100">
                            {schedule.map(row => (
                              <tr key={row.label} className="hover:bg-yellow-50">
                                <td className="p-2 font-bold">{row.label}</td>
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
              </div>
            </Card>
          </div>
        </div>

        <Footer>
          <p className="text-gray-600 font-medium">
            <strong>Disclaimer:</strong> This comparison is strictly financial. Buying provides emotional security and stability, while Renting provides mobility and asset diversification. Both involve market risk.
          </p>
        </Footer>
      </div>
    </div>
  );
}
