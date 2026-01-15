import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, IndianRupee, Percent, Calendar, PieChart as PieChartIcon, Table as TableIcon, TrendingUp, TrendingDown, ArrowLeft, Settings, Coins, PiggyBank, Eye, AlertCircle, Info, Flame, Landmark, ShieldCheck, Target } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import Footer from './Footer';
import SEO from './SEO';

import { calculateSIPReality } from '../lib/sipLogic';

export default function SIPCalculator() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "SIP Calculator",
    "description": "Calculate returns on your Systematic Investment Plan (SIP) or find the required SIP for your financial goals.",
    "brand": {
      "@type": "Brand",
      "name": "Calculators Hub"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };

  // --- Mode Toggle ---
  const [calcMode, setCalcMode] = useState('investment'); // 'investment' or 'goal'
  const isGoalMode = calcMode === 'goal';

  // --- Core Inputs ---
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [targetCorpus, setTargetCorpus] = useState(10000000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [isStepUp, setIsStepUp] = useState(false);
  const [stepUpPercentage, setStepUpPercentage] = useState(10);

  // --- Reality Factors ---
  const [useInflation, setUseInflation] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);
  const [useFees, setUseFees] = useState(false);
  const [expenseRatio, setExpenseRatio] = useState(1.0);
  const [useTax, setUseTax] = useState(false);

  const [assetMix, setAssetMix] = useState({ equity: 100, debt: 0, gold: 0 });
  const [taxRates, setTaxRates] = useState({ equity: 10, debt: 30, gold: 15 });

  // --- Results ---
  const [results, setResults] = useState({
    totalInvested: 0,
    totalReturns: 0,
    maturityValue: 0,
    realValue: 0,
    postTaxValue: 0,
    wealthLostToFees: 0,
    taxAmount: 0,
    inflationLoss: 0,
    requiredSIP: 0
  });

  const [schedule, setSchedule] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);

  const calculateSIP = useCallback(() => {
    const { results: calcResults, schedule: calcSchedule } = calculateSIPReality({
      calcMode,
      monthlyInvestment,
      targetCorpus,
      expectedReturn,
      timePeriod,
      isStepUp,
      stepUpPercentage,
      useInflation,
      inflationRate,
      useFees,
      expenseRatio,
      useTax,
      assetMix,
      taxRates
    });

    setResults(calcResults);
    setSchedule(calcSchedule);

  }, [calcMode, monthlyInvestment, targetCorpus, expectedReturn, timePeriod, isStepUp, stepUpPercentage, useInflation, inflationRate, useFees, expenseRatio, useTax, assetMix, taxRates]);

  useEffect(() => {
    calculateSIP();
  }, [calculateSIP]);

  const updateMix = (asset, val) => {
    const num = val === "" ? "" : Math.max(0, Math.min(100, parseInt(val) || 0));
    const effectiveNum = num === "" ? 0 : num;
    setAssetMix(prev => {
      let newMix = { ...prev, [asset]: num };
      if (asset === 'debt' || asset === 'gold') {
        const currentDebt = asset === 'debt' ? effectiveNum : (prev.debt === "" ? 0 : prev.debt);
        const currentGold = asset === 'gold' ? effectiveNum : (prev.gold === "" ? 0 : prev.gold);
        const currentOthers = currentDebt + currentGold;

        newMix.equity = currentOthers > 100 ? 0 : 100 - currentOthers;
        if (currentOthers > 100) {
          if (asset === 'debt') newMix.gold = 100 - effectiveNum;
          else newMix.debt = 100 - effectiveNum;
        }
      }
      return newMix;
    });
  };

  const updateTaxRate = (asset, val) => {
    setTaxRates(prev => ({ ...prev, [asset]: val === "" ? "" : (parseFloat(val) || 0) }));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(val);
  };

  const investedPercentage = (results.maturityValue > 0)
    ? (results.totalInvested / results.maturityValue) * 100
    : 0;

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="SIP Calculator & Goal Planner"
        description="Calculate SIP returns or find the investment needed to reach your financial goals. Includes Step-Up, Inflation, and Tax factors."
        keywords="sip calculator, mutual fund calculator, investment planner, wealth growth, step-up sip, financial goals, compound interest"
        canonical={`${import.meta.env.VITE_SITE_URL}/sip-calculator`}
        structuredData={structuredData}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            icon={TrendingUp}
            title="SIP Reality Hub"
          />
        </div>

        <div className="lg:col-span-12 xl:col-span-5 space-y-6">

          {/* Mode Switcher */}
          <div className="flex border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <button
              onClick={() => setCalcMode('investment')}
              className={`flex-1 py-3 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${calcMode === 'investment' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              <Coins className="w-4 h-4" /> Investment Based
            </button>
            <button
              onClick={() => setCalcMode('goal')}
              className={`flex-1 py-3 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${calcMode === 'goal' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              <Target className="w-4 h-4" /> Goal Based
            </button>
          </div>

          {/* 1. Core Strategy */}
          <Card className="p-0 border-4 border-black">
            <div className="bg-blue-100 p-4 border-b-4 border-black flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                <Calculator className="w-5 h-5" />
                Core Strategy
              </h2>
            </div>
            <div className="p-4 space-y-5">
              {calcMode === 'investment' ? (
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Monthly SIP Amount</label>
                  <p className="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-tight">How much you want to invest monthly</p>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(e.target.value)} onBlur={() => !monthlyInvestment && setMonthlyInvestment(0)} className="pl-9 font-black" />
                  </div>
                  <input type="range" min={500} max={100000} step={500} value={monthlyInvestment || 0} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black" />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-blue-700">Target Final Corpus</label>
                  <p className="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-tight">The wealth you wish to accumulate</p>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 z-10" />
                    <Input type="number" value={targetCorpus} onChange={(e) => setTargetCorpus(e.target.value)} onBlur={() => !targetCorpus && setTargetCorpus(0)} className="pl-9 font-black border-blue-600 text-blue-700" />
                  </div>
                  <input type="range" min={100000} max={50000000} step={100000} value={targetCorpus || 0} onChange={(e) => setTargetCorpus(Number(e.target.value))} className="w-full mt-3 h-2 bg-blue-100 appearance-none cursor-pointer accent-blue-600" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Expected Return (%)</label>
                  <p className="text-[10px] text-gray-500 mb-2 font-bold uppercase leading-none tracking-tighter">Avg. Annual growth</p>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} onBlur={() => !expectedReturn && setExpectedReturn(0)} className="font-black pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Duration (Yrs)</label>
                  <p className="text-[10px] text-gray-500 mb-2 font-bold uppercase leading-none tracking-tighter">Years to invest</p>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Input type="number" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} onBlur={() => !timePeriod && setTimePeriod(0)} className="font-black pl-9" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-black/10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox checked={isStepUp} onChange={(e) => setIsStepUp(e.target.checked)} />
                  <div className="flex-1">
                    <span className="text-xs font-black uppercase group-hover:text-blue-600 transition-colors">Enable Annual Step-Up</span>
                    <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Increase investment as your salary grows</p>
                  </div>
                </label>
                {isStepUp && (
                  <div className="mt-6 pl-8 animate-in fade-in slide-in-from-left-2">
                    <div className="bg-green-50 p-4 border-2 border-green-800 mb-5 animate-in zoom-in-95 duration-200">
                      <label htmlFor="stepUp" className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Annual Step-Up (%)
                      </label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-700 z-10" />
                        <Input id="stepUp" type="number" value={stepUpPercentage} onChange={(e) => setStepUpPercentage(e.target.value)} onBlur={() => !stepUpPercentage && setStepUpPercentage(0)} className="pl-9 border-green-800 bg-white font-black" />
                      </div>
                      <p className="text-[10px] text-green-700 mt-2 font-bold uppercase leading-tight">Monthly SIP will grow by this % every 12 months.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* 2. Reality Adjustments */}
          <Card className="p-0 border-4 border-black">
            <div className="bg-red-50 p-4 border-b-4 border-black">
              <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Realistic Adjustments
              </h2>
            </div>
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={useInflation} onChange={(e) => setUseInflation(e.target.checked)} />
                  <div><span className="text-xs font-black uppercase flex items-center gap-2"><Flame className="w-3 h-3 text-orange-600" /> Inflation Adjustment</span></div>
                </label>
                {useInflation && <div className="pl-8 animate-in zoom-in-95">
                  <div className="relative">
                    <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-orange-600 z-10" />
                    <Input type="number" value={inflationRate} onChange={(e) => setInflationRate(e.target.value)} onBlur={() => !inflationRate && setInflationRate(0)} className="h-8 pl-8 border-orange-600 font-black" />
                  </div>
                </div>}
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={useFees} onChange={(e) => setUseFees(e.target.checked)} />
                  <div><span className="text-xs font-black uppercase flex items-center gap-2"><Landmark className="w-3 h-3 text-blue-600" /> Mutual Fund Fees</span></div>
                </label>
                {useFees && <div className="pl-8 animate-in zoom-in-95">
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-600 z-10" />
                    <Input type="number" value={expenseRatio} onChange={(e) => setExpenseRatio(e.target.value)} onBlur={() => !expenseRatio && setExpenseRatio(0)} className="h-8 pl-8 border-blue-600 font-black" />
                  </div>
                </div>}
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={useTax} onChange={(e) => setUseTax(e.target.checked)} />
                  <div><span className="text-xs font-black uppercase flex items-center gap-2 text-black"><ShieldCheck className="w-3 h-3 text-green-600" /> Tax Liability & Asset Mix</span></div>
                </label>
                {useTax && (
                  <div className="pl-8 space-y-6 animate-in zoom-in-95 duration-200">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase border-b-2 border-black pb-1">Quick Allocation</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setAssetMix({ equity: 80, debt: 10, gold: 10 }); }}
                          className="flex-1 py-1 text-[8px] font-black border-2 border-black bg-blue-100 hover:bg-blue-200 uppercase"
                        >
                          Aggressive
                        </button>
                        <button
                          onClick={() => { setAssetMix({ equity: 50, debt: 35, gold: 15 }); }}
                          className="flex-1 py-1 text-[8px] font-black border-2 border-black bg-orange-100 hover:bg-orange-200 uppercase"
                        >
                          Balanced
                        </button>
                        <button
                          onClick={() => { setAssetMix({ equity: 20, debt: 70, gold: 10 }); }}
                          className="flex-1 py-1 text-[8px] font-black border-2 border-black bg-green-100 hover:bg-green-200 uppercase"
                        >
                          Safe
                        </button>
                      </div>
                      <p className="text-[10px] font-black uppercase border-b-2 border-black pb-1">Custom Allocation & Tax Rates</p>
                      <div className="space-y-2 p-2 bg-blue-50/50 border border-blue-200">
                        <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-blue-700">Equity (%)</span></div>
                        <div className="flex gap-2">
                          <Tooltip content="Auto-calculated. Equity = 100% - (Debt + Gold/Silver). Edit Debt and Gold to adjust Equity.">
                            <div className="flex-1">
                              <Input type="number" value={assetMix.equity} disabled className="h-8 text-xs border-black bg-gray-100 w-full font-black cursor-not-allowed" />
                            </div>
                          </Tooltip>
                          <div className="flex-1 relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-400 uppercase z-10">Tax %</span><Input type="number" value={taxRates.equity} onChange={(e) => updateTaxRate('equity', e.target.value)} onBlur={() => taxRates.equity === '' && updateTaxRate('equity', 0)} className="h-8 text-xs pl-10 border-black font-black" /></div>
                        </div>
                      </div>
                      <div className="space-y-2 p-2 bg-orange-50/50 border border-orange-200">
                        <span className="text-[10px] font-black uppercase text-orange-700">Debt (%)</span>
                        <div className="flex gap-2">
                          <Input type="number" value={assetMix.debt} onChange={(e) => updateMix('debt', e.target.value)} onBlur={() => assetMix.debt === '' && updateMix('debt', 0)} className="h-8 text-xs border-black flex-1 font-black" />
                          <div className="flex-1 relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-400 uppercase z-10">Tax %</span><Input type="number" value={taxRates.debt} onChange={(e) => updateTaxRate('debt', e.target.value)} onBlur={() => taxRates.debt === '' && updateTaxRate('debt', 0)} className="h-8 text-xs pl-10 border-black font-black" /></div>
                        </div>
                      </div>
                      <div className="space-y-2 p-2 bg-yellow-50/50 border border-yellow-200">
                        <span className="text-[10px] font-black uppercase text-yellow-600">Gold/Silver (%)</span>
                        <div className="flex gap-2">
                          <Input type="number" value={assetMix.gold} onChange={(e) => updateMix('gold', e.target.value)} onBlur={() => assetMix.gold === '' && updateMix('gold', 0)} className="h-8 text-xs border-black flex-1 font-black" />
                          <div className="flex-1 relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-400 uppercase z-10">Tax %</span><Input type="number" value={taxRates.gold} onChange={(e) => updateTaxRate('gold', e.target.value)} onBlur={() => taxRates.gold === '' && updateTaxRate('gold', 0)} className="h-8 text-xs pl-10 border-black font-black" /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: RESULTS */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <ResultsAnalysis>
            {/* Result Highlights */}
            <AnimatePresence mode="wait">
              {isGoalMode ? (
                <motion.div
                  key="goal-banner"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-blue-600 border-4 border-black text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-black/20 rounded-full border-2 border-black">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-xs font-black uppercase tracking-widest">Required Monthly SIP</p>
                      <motion.p
                        key={results.requiredSIP}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-3xl md:text-5xl font-black tracking-tighter"
                      >
                        {formatCurrency(results.requiredSIP)}
                      </motion.p>
                      {isStepUp && <p className="text-[10px] font-bold text-blue-200 uppercase mt-1 italic">Starting amount with {stepUpPercentage}% annual growth</p>}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="inv-banner"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-green-600 border-4 border-black text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-black/20 rounded-full border-2 border-black">
                      <PiggyBank className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-green-100 text-xs font-black uppercase tracking-widest">Final Maturity Value</p>
                      <motion.p
                        key={results.maturityValue}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-3xl md:text-5xl font-black tracking-tighter"
                      >
                        {formatCurrency(results.maturityValue)}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-gray-600 uppercase">Total Invested</h3>
                <div>
                  <h3 className="text-3xl font-black mt-2">{formatCurrency(results.totalInvested)}</h3>
                </div>
              </div>
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-gray-600 uppercase">Wealth Gained</h3>
                <div>
                  <h3 className="text-3xl font-black text-green-600 mt-2">{formatCurrency(results.totalReturns)}</h3>
                </div>
              </div>
            </div>

            {/* Reality Deductions */}
            {(useFees || useTax || useInflation) && (
              <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4">
                <h3 className="text-xs font-black uppercase border-b-2 border-black pb-1 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Reality Deductions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {useFees && <div className="p-3 bg-blue-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><p className="text-[8px] font-black uppercase text-blue-800">Fees Impact</p><p className="text-sm font-black text-blue-900">-{formatCurrency(results.wealthLostToFees)}</p></div>}
                  {useTax && <div className="p-3 bg-red-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><p className="text-[8px] font-black uppercase text-red-800">Estimated Tax</p><p className="text-sm font-black text-red-900">-{formatCurrency(results.taxAmount)}</p></div>}
                  {useInflation && <div className="p-3 bg-orange-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><p className="text-[8px] font-black uppercase text-orange-800">Inflation Impact</p><p className="text-sm font-black text-orange-900">-{formatCurrency(results.inflationLoss)}</p></div>}
                </div>
                <div className="bg-[#FF6B6B]/10 border-4 border-black p-4 mt-6 flex justify-between items-center">
                  <div><h4 className="text-sm font-black uppercase text-red-900 leading-tight">Post-Everything Value</h4><p className="text-[9px] font-bold text-red-700 uppercase">Actual purchasing power</p></div>
                  <p className="text-3xl font-black text-red-900">{formatCurrency(results.realValue)}</p>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="border-4 border-black p-6 bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5" /> Growth Breakdown
              </h2>
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="relative w-48 h-48 rounded-full flex-shrink-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  style={{ background: `conic-gradient(#cbd5e1 0% ${investedPercentage}%, #16a34a ${investedPercentage}% 100%)` }}>
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col border-4 border-black">
                    <span className="text-[10px] text-gray-500 font-black uppercase text-center leading-none mb-1">Returns %</span>
                    <span className="text-xl font-black">{Math.round(100 - investedPercentage)}%</span>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-3"><div className="w-4 h-4 bg-slate-300 border-2 border-black"></div><span className="text-sm font-bold">Invested</span></div>
                    <span className="font-bold">{formatCurrency(results.totalInvested)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-3"><div className="w-4 h-4 bg-green-600 border-2 border-black"></div><span className="text-sm font-bold">Returns</span></div>
                    <span className="font-bold text-green-700">{formatCurrency(results.totalReturns)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <Tooltip content="View year-by-year breakdown" className="w-full">
                <Button onClick={() => setShowSchedule(!showSchedule)} variant="outline" className="w-full flex justify-center items-center gap-2 border-4 font-black uppercase bg-gray-50"><TableIcon className="w-5 h-5" />{showSchedule ? 'Hide Yearly Data' : 'View Yearly Data'}</Button>
              </Tooltip>
              {showSchedule && (
                <div className="mt-4 border-4 border-black p-4 bg-white animate-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col md:flex-row gap-4 mb-4 justify-end">
                    <Tooltip content="Download PDF report"><Button variant="secondary" onClick={() => downloadPDF({ inputs: { loanAmount: isGoalMode ? results.requiredSIP : monthlyInvestment, interestRate: expectedReturn, repaymentTenure: timePeriod, stepUp: isStepUp ? stepUpPercentage : undefined, isGoal: isGoalMode ? targetCorpus : undefined }, results, schedule: schedule.map(s => ({ ...s, balance: s.balance, principal: s.principal, interest: s.interest })) })} className="w-full md:w-auto text-sm">Download PDF Report</Button></Tooltip>
                    <Tooltip content="Download Excel report"><Button variant="primary" onClick={() => downloadExcel({ inputs: { loanAmount: isGoalMode ? results.requiredSIP : monthlyInvestment, interestRate: expectedReturn, repaymentTenure: timePeriod, stepUp: isStepUp ? stepUpPercentage : undefined }, results, schedule })} className="w-full md:w-auto text-sm">Download Excel Report</Button></Tooltip>
                  </div>
                  <div className="overflow-x-auto border-4 border-black">
                    <table className="w-full text-sm text-left bg-white">
                      <thead className="text-xs uppercase bg-black text-white"><tr><th className="px-4 py-3 text-white">Period</th><th className="px-4 py-3 text-white">Invested (Yr)</th><th className="px-4 py-3 text-white">Returns (Yr)</th><th className="px-4 py-3 text-right text-white">End Value</th></tr></thead>
                      <tbody className="divide-y-2 divide-gray-200">{schedule.map((row) => (<tr key={row.label} className="hover:bg-yellow-50 transition-colors"><td className="px-4 py-3 font-bold">{row.label}</td><td className="px-4 py-3 text-slate-600 font-mono">{formatCurrency(row.principal)}</td><td className="px-4 py-3 text-green-600 font-mono">+{formatCurrency(row.interest)}</td><td className="px-4 py-3 text-right font-mono font-bold">{formatCurrency(row.balance)}</td></tr>))}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium"><strong>Disclaimer:</strong> Returns are estimated based on past performance and are not guaranteed. Mutual fund investments are subject to market risks.</p>
      </Footer>
    </div>
  );
}