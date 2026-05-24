import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, IndianRupee, Percent, Calendar, PieChart as PieChartIcon, Table as TableIcon, TrendingUp, AlertCircle, Info, Flame, Trash2, Plus, Clock, Award, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, DownloadButtons } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import Footer from './Footer';
import SEO from './SEO';

import { calculateSaaSLeak, SUBSCRIPTION_CATEGORIES, USAGE_FREQUENCIES } from '../lib/saasLeakLogic';

export default function SaasLeakCalculator() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "SaaS Leak Calculator",
    "description": "Calculate the true opportunity cost of your monthly subscriptions. See how compounding returns and active work hours drain your long-term wealth.",
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

  // --- State Variables ---
  const [calcMode, setCalcMode] = useState('aggregate'); // 'individual' or 'aggregate'
  const [monthlyInvestment, setMonthlyInvestment] = useState(2500); // flat monthly spend
  const [expectedReturn, setExpectedReturn] = useState(12); // NIFTY average returns ~12% nominal
  const [hourlyWage, setHourlyWage] = useState(500); // User net hourly wage (in Rs)

  // Default subscriptions list
  const [subscriptions, setSubscriptions] = useState([
    { id: 'sub-1', name: 'Netflix Premium', cost: 649, active: true, category: 'entertainment', usageFrequency: 'weekly', billingPeriod: 'monthly' },
    { id: 'sub-2', name: 'Spotify Premium', cost: 179, active: true, category: 'entertainment', usageFrequency: 'daily', billingPeriod: 'monthly' },
    { id: 'sub-3', name: 'GitHub Copilot', cost: 850, active: true, category: 'dev_tools', usageFrequency: 'daily', billingPeriod: 'monthly' },
    { id: 'sub-4', name: 'YouTube Premium', cost: 189, active: true, category: 'entertainment', usageFrequency: 'daily', billingPeriod: 'monthly' },
    { id: 'sub-5', name: 'Claude Pro', cost: 1800, active: true, category: 'ai_tools', usageFrequency: 'daily', billingPeriod: 'monthly' },
  ]);

  const [newSubName, setNewSubName] = useState('');
  const [newSubCost, setNewSubCost] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('other');
  const [newSubFrequency, setNewSubFrequency] = useState('monthly');
  const [newSubBillingPeriod, setNewSubBillingPeriod] = useState('monthly');

  const [results, setResults] = useState({
    results: {
      totalMonthlySpend: 0,
      annualSpend: 0,
      annualHoursRequired: 0,
      careerDaysRequired: 0,
    },
    projections: {
      10: { years: 10, principal: 0, futureValue: 0, compoundReturns: 0 },
      20: { years: 20, principal: 0, futureValue: 0, compoundReturns: 0 },
      30: { years: 30, principal: 0, futureValue: 0, compoundReturns: 0 },
    },
    schedule: []
  });

  const [showSchedule, setShowSchedule] = useState(false);

  // --- Calculate Function ---
  const calculate = useCallback(() => {
    const data = calculateSaaSLeak({
      calcMode,
      monthlyInvestment,
      expectedReturn,
      hourlyWage,
      subscriptions
    });
    setResults(data);
  }, [calcMode, monthlyInvestment, expectedReturn, hourlyWage, subscriptions]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // --- Subscriptions Management ---
  const handleAddSubscription = (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCost) return;
    const costNum = parseFloat(newSubCost);
    if (isNaN(costNum) || costNum <= 0) return;

    setSubscriptions(prev => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        name: newSubName.trim(),
        cost: costNum,
        active: true,
        category: newSubCategory,
        usageFrequency: newSubFrequency,
        billingPeriod: newSubBillingPeriod
      }
    ]);
    setNewSubName('');
    setNewSubCost('');
    setNewSubCategory('other');
    setNewSubFrequency('monthly');
    setNewSubBillingPeriod('monthly');
  };

  const handleToggleSubActive = (id) => {
    setSubscriptions(prev =>
      prev.map(sub => sub.id === id ? { ...sub, active: !sub.active } : sub)
    );
  };

  const handleDeleteSubscription = (id) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(val);
  };

  // Export Helpers
  const handleExportPDF = () => {
    downloadPDF({
      inputs: {
        isSaaSLeak: true,
        calcMode,
        monthlyInvestment: calcMode === 'individual' ? monthlyInvestment : undefined,
        expectedReturn,
        hourlyWage,
        subscriptionsCount: subscriptions.length
      },
      results: {
        ...results.results,
        // Match expected variables mapped in downloadUtils
        projections: results.projections,
        // Fallback properties just in case
        monthlyEMI: results.results.totalMonthlySpend,
        totalInterest: results.projections[30].compoundReturns,
        totalAmount: results.projections[30].futureValue
      },
      schedule: results.schedule
    });
  };

  const handleExportExcel = () => {
    downloadExcel({
      inputs: {
        isSaaSLeak: true,
        calcMode,
        monthlyInvestment: calcMode === 'individual' ? monthlyInvestment : undefined,
        expectedReturn,
        hourlyWage,
        subscriptionsCount: subscriptions.length
      },
      results: {
        ...results.results,
        projections: results.projections,
        monthlyEMI: results.results.totalMonthlySpend,
        totalInterest: results.projections[30].compoundReturns,
        totalAmount: results.projections[30].futureValue
      },
      schedule: results.schedule
    });
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="SaaS Subscription Leak Calculator"
        description="Find the real compound opportunity cost of your software subscriptions. Translate monthly leaky expenses into index fund wealth losses and work-hours active labor equivalence."
        keywords="saas leak calculator, subscription cost calculator, opportunity cost calculator, compound interest, index fund growth, hourly labor equivalence"
        canonical={`${import.meta.env.VITE_SITE_URL}/saas-leak`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/saas_leak.png`}
        structuredData={structuredData}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            icon={Flame}
            title="SaaS Subscription Leak Realist"
          />
        </div>

        {/* LEFT: Inputs Panel */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          
          {/* Mode Switcher */}
          <div className="flex border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <button
              onClick={() => setCalcMode('aggregate')}
              className={`flex-1 py-3 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${calcMode === 'aggregate' ? 'bg-[#FFDE59] text-black' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              <TableIcon className="w-4 h-4" /> Subscription Audit
            </button>
            <button
              onClick={() => setCalcMode('individual')}
              className={`flex-1 py-3 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${calcMode === 'individual' ? 'bg-[#FFDE59] text-black' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              <Calculator className="w-4 h-4" /> Flat Monthly Spend
            </button>
          </div>

          {/* 2. Flat Spend Input (Visible only in flat mode) */}
          {calcMode === 'individual' && (
            <Card className="p-0 border-4 border-black animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="bg-orange-100 p-4 border-b-4 border-black">
                <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                  <IndianRupee className="w-5 h-5 text-orange-600" />
                  Monthly Subscriptions Spend
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="monthlyInvestment" className="block text-[10px] font-black uppercase mb-1">Total Monthly Subscriptions Budget (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Input id="monthlyInvestment" type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(e.target.value)} onBlur={() => !monthlyInvestment && setMonthlyInvestment(0)} className="pl-9 font-black" />
                  </div>
                  <input type="range" min={100} max={25000} step={200} value={monthlyInvestment || 0} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black" aria-label="Flat Budget Slider" />
                </div>
              </div>
            </Card>
          )}

          {/* 3. Subscription Audit Table (Visible in aggregate mode) */}
          {calcMode === 'aggregate' && (
            <Card className="p-0 border-4 border-black animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="bg-[#FF9900]/10 p-4 border-b-4 border-black flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                  <TableIcon className="w-5 h-5 text-orange-600" />
                  Active Subscriptions Audit
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {/* List subscriptions */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {subscriptions.map(sub => {
                    const cat = SUBSCRIPTION_CATEGORIES.find(c => c.id === sub.category) || { label: 'Other', color: '#6b7280' };
                    const freq = USAGE_FREQUENCIES.find(f => f.id === sub.usageFrequency) || { label: 'Monthly' };
                    return (
                      <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={sub.active} onChange={() => handleToggleSubActive(sub.id)} aria-label={`Toggle ${sub.name}`} />
                          <div>
                            <span className={`text-xs font-black uppercase ${sub.active ? 'text-black' : 'text-gray-400 line-through'}`}>{sub.name}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-[9px] font-mono font-bold bg-gray-200 px-1 border border-black/20 text-black">
                                ₹{sub.cost} / {sub.billingPeriod === 'yearly' ? 'yr' : 'mo'}
                              </span>
                              <span 
                                className="text-[9px] font-mono font-bold px-1 text-white"
                                style={{ backgroundColor: cat.color }}
                              >
                                {cat.label}
                              </span>
                              <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-800 px-1">
                                {freq.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSubscription(sub.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 border-2 border-transparent hover:border-black active:translate-y-[1px] transition-all"
                          aria-label={`Delete ${sub.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  {subscriptions.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-xs font-bold uppercase">No subscriptions added. Add one below!</div>
                  )}
                </div>

                {/* Add new subscription form */}
                <div className="border-t-2 border-black/10 pt-4 space-y-3">
                  <p className="text-[10px] font-black uppercase">Add Subscriptions</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="newSubName" className="block text-[10px] font-black uppercase mb-1">Sub Name</label>
                      <Input
                        id="newSubName"
                        type="text"
                        placeholder="e.g. Netflix"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        className="text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label htmlFor="newSubCost" className="block text-[10px] font-black uppercase mb-1">Cost</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                        <Input
                          id="newSubCost"
                          type="number"
                          placeholder="Cost"
                          value={newSubCost}
                          onChange={(e) => setNewSubCost(e.target.value)}
                          className="text-xs font-bold pl-7"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="newSubBillingPeriod" className="block text-[10px] font-black uppercase mb-1">Billing Period</label>
                      <select
                        id="newSubBillingPeriod"
                        value={newSubBillingPeriod}
                        onChange={(e) => setNewSubBillingPeriod(e.target.value)}
                        className="w-full text-xs font-bold bg-white border-2 border-black p-2 h-9 outline-none"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="newSubCategory" className="block text-[10px] font-black uppercase mb-1">Category</label>
                      <select
                        id="newSubCategory"
                        value={newSubCategory}
                        onChange={(e) => setNewSubCategory(e.target.value)}
                        className="w-full text-xs font-bold bg-white border-2 border-black p-2 h-9 outline-none"
                      >
                        {SUBSCRIPTION_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="newSubFrequency" className="block text-[10px] font-black uppercase mb-1">Usage Frequency</label>
                      <select
                        id="newSubFrequency"
                        value={newSubFrequency}
                        onChange={(e) => setNewSubFrequency(e.target.value)}
                        className="w-full text-xs font-bold bg-white border-2 border-black p-2 h-9 outline-none"
                      >
                        {USAGE_FREQUENCIES.map(freq => (
                          <option key={freq.id} value={freq.id}>{freq.label} (approx. {freq.usesPerMonth} uses/mo)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button onClick={handleAddSubscription} variant="primary" className="w-full text-xs font-black uppercase border-2 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Subscription
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* 1. Core Financial Baseline */}
          <Card className="p-0 border-4 border-black">
            <div className="bg-blue-100 p-4 border-b-4 border-black">
              <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                <Clock className="w-5 h-5 text-blue-600" />
                Hourly Wage & Growth Baseline
              </h2>
            </div>
            <div className="p-4 space-y-5">
              <div>
                <label htmlFor="hourlyWage" className="block text-[10px] font-black uppercase mb-1">True Net Hourly Wage (₹)</label>
                <p className="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-tight leading-none">Your take-home earnings per hour of work</p>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input id="hourlyWage" type="number" value={hourlyWage} onChange={(e) => setHourlyWage(e.target.value)} onBlur={() => !hourlyWage && setHourlyWage(0)} className="pl-9 font-black" />
                </div>
                <input type="range" min={100} max={5000} step={50} value={hourlyWage || 0} onChange={(e) => setHourlyWage(Number(e.target.value))} className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black" aria-label="Hourly Wage Slider" />
              </div>

              <div>
                <label htmlFor="expectedReturn" className="block text-[10px] font-black uppercase mb-1">Alternative Investment Return (% p.a.)</label>
                <p className="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-tight leading-none">Expected return if invested in an index fund</p>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input id="expectedReturn" type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} onBlur={() => !expectedReturn && setExpectedReturn(0)} className="pl-9 font-black" />
                </div>
                <input type="range" min={4} max={25} step={1} value={expectedReturn || 0} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black" aria-label="Expected Return Slider" />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: Results Display Panel */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <ResultsAnalysis>
            
            {/* Top Stat Card: 30-Year Compounded Lost Wealth */}
            <div className="bg-red-600 border-4 border-black text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full">
                <div className="p-3 bg-black/20 rounded-full border-2 border-black hidden md:block">
                  <Flame className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-red-100 text-xs font-black uppercase tracking-widest">30-Year Compounded Lost Wealth</p>
                  <motion.p
                    key={results.projections?.[30]?.futureValue}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl md:text-5xl font-black tracking-tighter text-white"
                  >
                    {formatCurrency(results.projections?.[30]?.futureValue || 0)}
                  </motion.p>
                  <div className="flex flex-wrap gap-2 mt-2 border-t border-white/20 pt-2 text-[10px] font-bold uppercase tracking-tight text-red-100">
                    <span>Monthly Spend: <strong className="text-white">{formatCurrency(results.results.totalMonthlySpend)}/mo</strong></span>
                    <span className="hidden md:inline">•</span>
                    <span>Annual Spend: <strong className="text-white">{formatCurrency(results.results.annualSpend)}/yr</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Stats Grid: Work Equivalents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Working Hours Needed */}
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-600 uppercase flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Annual Active Labor Hours
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tight leading-none">Working hours required purely to fund these subscriptions</p>
                </div>
                <div>
                  <h3 className="text-3xl font-black mt-4">{results.results.annualHoursRequired} Hours</h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">based on true net hourly earnings of ₹{hourlyWage}/hr</p>
                </div>
              </div>

              {/* Work Days Needed */}
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-600 uppercase flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    Equivalent Work Days
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tight leading-none">Days of labor dedicated entirely to subscription companies</p>
                </div>
                <div>
                  <h3 className="text-3xl font-black mt-4 text-orange-600">{results.results.careerDaysRequired} Days</h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">assuming an standard 8-hour workday</p>
                </div>
              </div>
            </div>

            {/* Socratic Warning Check */}
            {hourlyWage <= 0 && (
              <div className="bg-[#FF6B6B]/10 border-4 border-black p-4 flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1 animate-bounce" />
                <div>
                  <h4 className="text-sm font-black uppercase text-red-950 leading-tight">CRITICAL FINANCIAL baseline WARN</h4>
                  <p className="text-xs text-red-800 font-bold uppercase mt-1">Your True Net Hourly Wage is set to zero or negative! If you aren't earning billable cash, subscriptions are a direct erosion of finite savings. Enter a realistic hourly wage to calculate the labor hours required to sustain this spend.</p>
                </div>
              </div>
            )}

            {/* Dead Weight Alert Card */}
            {results.deadWeightItems && results.deadWeightItems.length > 0 && (
              <Card className="p-0 border-4 border-black bg-red-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-red-100 p-3 border-b-4 border-black flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
                  <h3 className="text-xs font-black uppercase text-red-950">Dead Weight Subscriptions Detected!</h3>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[10px] text-red-800 font-bold uppercase tracking-tight leading-tight mb-2">
                    The following subscriptions are marked as "Rarely Used" but cost more than ₹200/month. Consider canceling:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {results.deadWeightItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-2 border-2 border-black text-xs font-bold uppercase">
                        <span className="text-black">{item.name}</span>
                        <span className="text-red-600 font-mono">{formatCurrency(item.cost)}/{item.billingPeriod === 'yearly' ? 'yr' : 'mo'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Category Spending Breakdown */}
            {calcMode === 'aggregate' && results.categoryBreakdown && results.categoryBreakdown.length > 0 && (
              <Card className="p-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                <div className="bg-blue-50 p-3 border-b-4 border-black">
                  <h3 className="text-xs font-black uppercase text-black flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-blue-600" />
                    Spending Breakdown by Category
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.categoryBreakdown.map(cat => (
                      <div key={cat.id} className="border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gray-50 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black uppercase" style={{ color: cat.color }}>{cat.label}</span>
                          <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-black uppercase">{cat.percent}%</span>
                        </div>
                        <div className="flex justify-between items-end mt-2 pt-2 border-t border-black/10">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">{cat.count} {cat.count === 1 ? 'Sub' : 'Subs'}</span>
                          <span className="text-xs font-mono font-black">{formatCurrency(cat.totalMonthly)}/mo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* SaaS Efficiency & Cost-Per-Use Table */}
            {calcMode === 'aggregate' && subscriptions.filter(s => s.active).length > 0 && (
              <Card className="p-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                <div className="bg-emerald-50 p-3 border-b-4 border-black">
                  <h3 className="text-xs font-black uppercase text-black flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    SaaS Efficiency & Cost-Per-Use Audit
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-3 leading-tight tracking-tight">
                    Estimating how much you actually pay for each session of usage:
                  </p>
                  <div className="overflow-x-auto border-2 border-black">
                    <table className="w-full text-xs text-left bg-white font-sans">
                      <thead className="text-[9px] uppercase bg-black text-white">
                        <tr>
                          <th className="px-3 py-2 text-white">Subscription</th>
                          <th className="px-3 py-2 text-white">Frequency</th>
                          <th className="px-3 py-2 text-white text-center">Value Score</th>
                          <th className="px-3 py-2 text-white text-right">Cost Per Use</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-black/10">
                        {subscriptions.filter(s => s.active).map(sub => {
                          const metrics = results.perSubMetrics?.[sub.id] || { costPerUse: 0, valueScore: 0 };
                          const freq = USAGE_FREQUENCIES.find(f => f.id === sub.usageFrequency) || { label: 'Monthly' };
                          return (
                            <tr key={sub.id} className="hover:bg-emerald-50/50 transition-colors uppercase font-bold text-[10px]">
                              <td className="px-3 py-2 text-black">{sub.name}</td>
                              <td className="px-3 py-2 text-gray-500">{freq.label}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`px-1 text-[9px] text-white ${metrics.valueScore >= 7 ? 'bg-green-600' : metrics.valueScore >= 4 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                  {metrics.valueScore}/10
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-black">{formatCurrency(metrics.costPerUse)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            )}

            {/* Compound Interest Opportunity Cost Grid */}
            <div className="border-4 border-black p-6 bg-yellow-50">
              <h2 className="text-lg font-black flex items-center gap-2 mb-4 uppercase">
                <TrendingUp className="w-5 h-5 text-black" />
                The Index Opportunity Cost Sandbox
              </h2>
              <p className="text-xs text-gray-600 font-bold mb-6 uppercase leading-tight">If you diverted ₹{results.results.totalMonthlySpend}/mo to a NIFTY 50 index fund compounding at {expectedReturn}% per annum, here is the net wealth accumulated:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 10 Years */}
                <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-36">
                  <div>
                    <span className="px-2 py-1 bg-black text-white text-[9px] font-black uppercase">10 Years</span>
                    <p className="text-xs font-bold text-gray-500 uppercase mt-2">Principal: {formatCurrency(results.projections[10].principal)}</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-black">{formatCurrency(results.projections[10].futureValue)}</p>
                    <p className="text-[9px] text-green-600 font-bold uppercase">Compound: +{formatCurrency(results.projections[10].compoundReturns)}</p>
                  </div>
                </div>

                {/* 20 Years */}
                <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-36">
                  <div>
                    <span className="px-2 py-1 bg-black text-white text-[9px] font-black uppercase">20 Years</span>
                    <p className="text-xs font-bold text-gray-500 uppercase mt-2">Principal: {formatCurrency(results.projections[20].principal)}</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-orange-600">{formatCurrency(results.projections[20].futureValue)}</p>
                    <p className="text-[9px] text-green-600 font-bold uppercase">Compound: +{formatCurrency(results.projections[20].compoundReturns)}</p>
                  </div>
                </div>

                {/* 30 Years */}
                <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-36">
                  <div>
                    <span className="px-2 py-1 bg-red-600 text-white text-[9px] font-black uppercase">30 Years</span>
                    <p className="text-xs font-bold text-gray-500 uppercase mt-2">Principal: {formatCurrency(results.projections[30].principal)}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-red-600">{formatCurrency(results.projections[30].futureValue)}</p>
                    <p className="text-[9px] text-green-600 font-bold uppercase">Compound: +{formatCurrency(results.projections[30].compoundReturns)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Breakdown Custom Circle Visualizer */}
            <div className="border-4 border-black p-6 bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 uppercase">
                <PieChartIcon className="w-5 h-5" /> 30-Year Compounding vs Principal
              </h2>
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div 
                  className="relative w-48 h-48 rounded-full flex-shrink-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  style={{
                    background: `conic-gradient(#fca5a5 0% ${
                      (results.projections[30].principal / results.projections[30].futureValue) * 100
                    }%, #10b981 ${
                      (results.projections[30].principal / results.projections[30].futureValue) * 100
                    }% 100%)`
                  }}
                >
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col border-4 border-black">
                    <span className="text-[10px] text-gray-500 font-black uppercase text-center leading-none mb-1">Compound Yield</span>
                    <span className="text-xl font-black text-green-600">
                      {results.projections[30].futureValue > 0
                        ? Math.round(
                            (results.projections[30].compoundReturns / results.projections[30].futureValue) * 100
                          )
                        : 0}%
                    </span>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-300 border-2 border-black"></div>
                      <span className="text-sm font-bold uppercase text-gray-600">Total Money Out (Principal)</span>
                    </div>
                    <span className="font-mono font-black">{formatCurrency(results.projections[30].principal)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 border-2 border-black"></div>
                      <span className="text-sm font-bold uppercase text-green-600">Lost Interest (Wealth Compound)</span>
                    </div>
                    <span className="font-mono font-black text-green-600">+{formatCurrency(results.projections[30].compoundReturns)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Yearly Schedule Controls */}
            <div>
              <Tooltip content="View annual compound trajectory" className="w-full">
                <Button onClick={() => setShowSchedule(!showSchedule)} variant="outline" className="w-full flex justify-center items-center gap-2 border-4 font-black uppercase bg-gray-50">
                  <TableIcon className="w-5 h-5" />{showSchedule ? 'Hide Yearly Projections' : 'View Year-by-Year Compound Projections'}
                </Button>
              </Tooltip>
              
              {showSchedule && (
                <div className="mt-4 border-4 border-black p-4 bg-white animate-in slide-in-from-top-4 duration-300">
                  <div className="overflow-x-auto border-4 border-black">
                    <table className="w-full text-sm text-left bg-white">
                      <thead className="text-xs uppercase bg-black text-white">
                        <tr>
                          <th className="px-4 py-3 text-white">Period</th>
                          <th className="px-4 py-3 text-white">Cumulative Spend</th>
                          <th className="px-4 py-3 text-white">Compound Yield</th>
                          <th className="px-4 py-3 text-right text-white">Total Lost Wealth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-gray-200">
                        {results.schedule.map((row) => (
                          <tr key={row.label} className="hover:bg-yellow-50 transition-colors">
                            <td className="px-4 py-3 font-bold">{row.label}</td>
                            <td className="px-4 py-3 text-red-500 font-mono">-{formatCurrency(row.principal)}</td>
                            <td className="px-4 py-3 text-green-600 font-mono">+{formatCurrency(row.interest)}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold">{formatCurrency(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Permanent Export Card */}
            <div className="bg-gray-50 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black uppercase text-black leading-none">Export Subscription Leak Analysis</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-tight leading-none">Take your offline financial audit reports home</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButtons 
                  onDownloadPDF={handleExportPDF}
                  onDownloadExcel={handleExportExcel}
                />
              </div>
            </div>

          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium"><strong>Disclaimer:</strong> Real returns are calculated based on historical index averages and are subject to market volatility. The work hour equivalent assumes standard payroll taxes are already deducted from the net hourly wage.</p>
      </Footer>
    </div>
  );
}
