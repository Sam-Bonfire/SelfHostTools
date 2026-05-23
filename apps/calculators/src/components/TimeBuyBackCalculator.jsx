import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, IndianRupee, Percent, Clock, AlertCircle, Sparkles, User, Briefcase, Zap, Check, X, ShieldAlert, FileText, ArrowRight, Award } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import Footer from './Footer';
import SEO from './SEO';

import { calculateTimeBuyBack } from '../lib/buyBackLogic';

export default function TimeBuyBackCalculator() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "Time Buy-Back Delegate Calculator",
    "description": "Evaluate if delegation is financially and psychologically optimal. Reclaim your time using true net wage and surcharge multipliers.",
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

  // --- Core State Variables ---
  const [jobType, setJobType] = useState('freelance'); // 'freelance' or 'salaried'
  
  // Freelance Parameters
  const [hourlyRate, setHourlyRate] = useState(1500);
  const [hoursPerWeek, setHoursPerWeek] = useState(30);
  const [vacationWeeks, setVacationWeeks] = useState(4);
  const [adminTimePercent, setAdminTimePercent] = useState(20);
  const [isPresumptiveTax, setIsPresumptiveTax] = useState(true);
  const [freelanceTaxRate, setFreelanceTaxRate] = useState(20);

  // Salaried Parameters
  const [salariedGross, setSalariedGross] = useState(1500000);
  const [salariedTaxRate, setSalariedTaxRate] = useState(20);
  const [salariedHoursPerWeek, setSalariedHoursPerWeek] = useState(40);
  const [commuteHoursPerWeek, setCommuteHoursPerWeek] = useState(5);
  const [unpaidOvertimeHours, setUnpaidOvertimeHours] = useState(5);

  // Task Delegation Parameters
  const [taskCost, setTaskCost] = useState(1000);
  const [hoursSaved, setHoursSaved] = useState(4);
  const [energyMultiplier, setEnergyMultiplier] = useState(1.5);
  const [reinvestmentType, setReinvestmentType] = useState('leisure'); // 'leisure', 'upskilling', 'work'

  // Results State
  const [results, setResults] = useState({
    baseline: {
      annualGross: 0,
      annualTax: 0,
      annualNet: 0,
      totalAnnualHours: 0,
      trueNetHourlyWage: 0
    },
    delegation: {
      socraticTimeValue: 0,
      reinvestmentValue: 0,
      delegationGain: 0,
      breakEvenCostPerHour: 0,
      isWorthIt: false
    }
  });

  const calculate = useCallback(() => {
    const data = calculateTimeBuyBack({
      jobType,
      hourlyRate,
      hoursPerWeek,
      vacationWeeks,
      adminTimePercent,
      isPresumptiveTax,
      freelanceTaxRate,
      salariedGross,
      salariedTaxRate,
      salariedHoursPerWeek,
      commuteHoursPerWeek,
      unpaidOvertimeHours,
      taskCost,
      hoursSaved,
      energyMultiplier,
      reinvestmentType
    });
    setResults(data);
  }, [
    jobType,
    hourlyRate,
    hoursPerWeek,
    vacationWeeks,
    adminTimePercent,
    isPresumptiveTax,
    freelanceTaxRate,
    salariedGross,
    salariedTaxRate,
    salariedHoursPerWeek,
    commuteHoursPerWeek,
    unpaidOvertimeHours,
    taskCost,
    hoursSaved,
    energyMultiplier,
    reinvestmentType
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(val);
  };

  const handleExportPDF = () => {
    downloadPDF({
      inputs: {
        isTimeBuyBack: true,
        jobType,
        hourlyRate: jobType === 'freelance' ? hourlyRate : undefined,
        salariedGross: jobType === 'salaried' ? salariedGross : undefined,
        taskCost,
        hoursSaved,
        energyMultiplier,
        reinvestmentType
      },
      results: {
        ...results.baseline,
        ...results.delegation,
        // Match keys required by downloadUtils fallback
        monthlyEMI: results.delegation.reinvestmentValue,
        totalInterest: results.delegation.delegationGain,
        totalAmount: results.baseline.trueNetHourlyWage
      },
      schedule: [
        { label: 'Baseline Hourly Wage', principal: 0, interest: 0, balance: results.baseline.trueNetHourlyWage },
        { label: 'Outsource Cost', principal: taskCost, interest: 0, balance: taskCost },
        { label: 'Time Value Reinvested', principal: 0, interest: results.delegation.reinvestmentValue, balance: results.delegation.reinvestmentValue },
        { label: 'Net Delegation Gain', principal: 0, interest: results.delegation.delegationGain, balance: results.delegation.delegationGain }
      ]
    });
  };

  const handleExportExcel = () => {
    downloadExcel({
      inputs: {
        isTimeBuyBack: true,
        jobType,
        hourlyRate: jobType === 'freelance' ? hourlyRate : undefined,
        salariedGross: jobType === 'salaried' ? salariedGross : undefined,
        taskCost,
        hoursSaved,
        energyMultiplier,
        reinvestmentType
      },
      results: {
        ...results.baseline,
        ...results.delegation,
        monthlyEMI: results.delegation.reinvestmentValue,
        totalInterest: results.delegation.delegationGain,
        totalAmount: results.baseline.trueNetHourlyWage
      },
      schedule: [
        { label: 'Baseline Hourly Wage', principal: 0, interest: 0, balance: results.baseline.trueNetHourlyWage },
        { label: 'Outsource Cost', principal: taskCost, interest: 0, balance: taskCost },
        { label: 'Time Value Reinvested', principal: 0, interest: results.delegation.reinvestmentValue, balance: results.delegation.reinvestmentValue },
        { label: 'Net Delegation Gain', principal: 0, interest: results.delegation.delegationGain, balance: results.delegation.delegationGain }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="Time Buy-Back Delegate Calculator"
        description="Determine if outsourcing tedious chores and tasks is mathematically rational. Factor in true take-home hourly wages and emotional fatigue multipliers."
        keywords="time buy-back calculator, task delegation calculator, buy back time, true hourly wage, surcharge multiplier, outsource calculator"
        canonical={`${import.meta.env.VITE_SITE_URL}/time-buyback`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/time_buyback.png`}
        structuredData={structuredData}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            icon={Zap}
            title="Time Buy-Back & Task Delegate Realist"
          />
        </div>

        {/* LEFT: Inputs Panel */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          
          {/* Job Type Switcher */}
          <div className="flex border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <button
              onClick={() => setJobType('freelance')}
              className={`flex-1 py-3 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${jobType === 'freelance' ? 'bg-[#FFDE59] text-black' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              <Briefcase className="w-4 h-4" /> Freelancer Mode
            </button>
            <button
              onClick={() => setJobType('salaried')}
              className={`flex-1 py-3 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${jobType === 'salaried' ? 'bg-[#FFDE59] text-black' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              <User className="w-4 h-4" /> Salaried Employee
            </button>
          </div>

          {/* 1. Career Profile Baseline Inputs */}
          <Card className="p-0 border-4 border-black">
            <div className="bg-blue-100 p-4 border-b-4 border-black">
              <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                <Clock className="w-5 h-5 text-blue-600" />
                True Net-Hourly Rate Baseline
              </h2>
            </div>
            
            <div className="p-4 space-y-5 animate-in fade-in duration-200">
              {jobType === 'freelance' ? (
                // Freelance Fields
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hourlyRate" className="block text-[10px] font-black uppercase mb-1">Billed Hourly Rate (₹)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <Input id="hourlyRate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} onBlur={() => !hourlyRate && setHourlyRate(0)} className="pl-9 font-black" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="hoursPerWeek" className="block text-[10px] font-black uppercase mb-1">Weekly Billed Hours</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <Input id="hoursPerWeek" type="number" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} onBlur={() => !hoursPerWeek && setHoursPerWeek(0)} className="pl-9 font-black" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="vacationWeeks" className="block text-[10px] font-black uppercase mb-1">Vacation (Weeks/Yr)</label>
                      <Input id="vacationWeeks" type="number" value={vacationWeeks} onChange={(e) => setVacationWeeks(e.target.value)} onBlur={() => !vacationWeeks && setVacationWeeks(0)} className="font-black" />
                    </div>
                    <div>
                      <label htmlFor="adminTimePercent" className="block text-[10px] font-black uppercase mb-1">Unbilled Admin Time (%)</label>
                      <Input id="adminTimePercent" type="number" value={adminTimePercent} onChange={(e) => setAdminTimePercent(e.target.value)} onBlur={() => !adminTimePercent && setAdminTimePercent(0)} className="font-black" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-black/10">
                    <div>
                      <label htmlFor="freelanceTaxRate" className="block text-[10px] font-black uppercase mb-1">Income Tax Rate (%)</label>
                      <Input id="freelanceTaxRate" type="number" value={freelanceTaxRate} onChange={(e) => setFreelanceTaxRate(e.target.value)} onBlur={() => !freelanceTaxRate && setFreelanceTaxRate(0)} className="font-black" />
                    </div>
                    <div className="flex flex-col justify-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={isPresumptiveTax} onChange={(e) => setIsPresumptiveTax(e.target.checked)} />
                        <span className="text-[10px] font-black uppercase">44ADA Presumptive</span>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                // Salaried Fields
                <>
                  <div>
                    <label htmlFor="salariedGross" className="block text-[10px] font-black uppercase mb-1">Annual Gross Salary (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                      <Input id="salariedGross" type="number" value={salariedGross} onChange={(e) => setSalariedGross(e.target.value)} onBlur={() => !salariedGross && setSalariedGross(0)} className="pl-9 font-black" />
                    </div>
                    <input type="range" min={300000} max={6000000} step={50000} value={salariedGross || 0} onChange={(e) => setSalariedGross(Number(e.target.value))} className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black" aria-label="Salary Slider" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="salariedHoursPerWeek" className="block text-[10px] font-black uppercase mb-1">Official Hours/Week</label>
                      <Input id="salariedHoursPerWeek" type="number" value={salariedHoursPerWeek} onChange={(e) => setSalariedHoursPerWeek(e.target.value)} onBlur={() => !salariedHoursPerWeek && setSalariedHoursPerWeek(0)} className="font-black" />
                    </div>
                    <div>
                      <label htmlFor="salariedTaxRate" className="block text-[10px] font-black uppercase mb-1">Effective Tax Rate (%)</label>
                      <Input id="salariedTaxRate" type="number" value={salariedTaxRate} onChange={(e) => setSalariedTaxRate(e.target.value)} onBlur={() => !salariedTaxRate && setSalariedTaxRate(0)} className="font-black" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-black/10">
                    <div>
                      <label htmlFor="commuteHoursPerWeek" className="block text-[10px] font-black uppercase mb-1">Weekly Commute (Hrs)</label>
                      <Input id="commuteHoursPerWeek" type="number" value={commuteHoursPerWeek} onChange={(e) => setCommuteHoursPerWeek(e.target.value)} onBlur={() => !commuteHoursPerWeek && setCommuteHoursPerWeek(0)} className="font-black" />
                    </div>
                    <div>
                      <label htmlFor="unpaidOvertimeHours" className="block text-[10px] font-black uppercase mb-1">Weekly Overtime (Hrs)</label>
                      <Input id="unpaidOvertimeHours" type="number" value={unpaidOvertimeHours} onChange={(e) => setUnpaidOvertimeHours(e.target.value)} onBlur={() => !unpaidOvertimeHours && setUnpaidOvertimeHours(0)} className="font-black" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* 2. Socratic Task Delegation Inputs */}
          <Card className="p-0 border-4 border-black">
            <div className="bg-orange-100 p-4 border-b-4 border-black">
              <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                <Sparkles className="w-5 h-5 text-orange-600" />
                Task Outsourcing details
              </h2>
            </div>
            
            <div className="p-4 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="taskCost" className="block text-[10px] font-black uppercase mb-1">Task Outsource Cost (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Input id="taskCost" type="number" value={taskCost} onChange={(e) => setTaskCost(e.target.value)} onBlur={() => !taskCost && setTaskCost(0)} className="pl-9 font-black" />
                  </div>
                </div>
                <div>
                  <label htmlFor="hoursSaved" className="block text-[10px] font-black uppercase mb-1">Hours Reclaimed</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Input id="hoursSaved" type="number" value={hoursSaved} onChange={(e) => setHoursSaved(e.target.value)} onBlur={() => !hoursSaved && setHoursSaved(0)} className="pl-9 font-black" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="energyMultiplier" className="block text-[10px] font-black uppercase mb-1">Psychological Energy Multiplier (1x to 3x)</label>
                <p className="text-[10px] text-gray-500 mb-2 font-bold uppercase leading-none tracking-tight">Fatigue score: apply high multiplier for tasks you highly dislike</p>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input id="energyMultiplier" type="number" step="0.1" value={energyMultiplier} onChange={(e) => setEnergyMultiplier(e.target.value)} onBlur={() => !energyMultiplier && setEnergyMultiplier(1.0)} className="pl-9 font-black" />
                </div>
                <input type="range" min={1.0} max={3.0} step={0.1} value={energyMultiplier || 1.0} onChange={(e) => setEnergyMultiplier(Number(e.target.value))} className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black" aria-label="Energy Surcharge Slider" />
              </div>

              <div className="pt-4 border-t-2 border-black/10">
                <label htmlFor="reinvestmentType" className="block text-[10px] font-black uppercase mb-1">How will you reinvest this reclaimed time?</label>
                <select
                  id="reinvestmentType"
                  value={reinvestmentType}
                  onChange={(e) => setReinvestmentType(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black font-black uppercase text-xs focus:ring-0 focus:outline-none"
                >
                  <option value="leisure">Leisure / Mental Refresh (Valued with Fatigue Surcharge)</option>
                  <option value="upskilling">Upskilling / Learning (1.5x Future Earnings Value)</option>
                  <option value="work">Direct Side Work / Extra Billing (1x Net Hourly wage)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: Results Display Panel */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <ResultsAnalysis>
            
            {/* Top Stat Banner: Net Delegation Gain / Loss */}
            <div className={`border-4 border-black text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300 ${results.delegation.isWorthIt ? 'bg-green-600' : 'bg-red-600'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black/20 rounded-full border-2 border-black">
                  {results.delegation.isWorthIt ? <Check className="w-8 h-8 text-white" /> : <X className="w-8 h-8 text-white" />}
                </div>
                <div>
                  <p className="text-white/80 text-xs font-black uppercase tracking-widest">Net Delegation Gain / Loss</p>
                  <motion.p
                    key={results.delegation.delegationGain}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl md:text-5xl font-black tracking-tighter"
                  >
                    {formatCurrency(results.delegation.delegationGain)}
                  </motion.p>
                  <p className="text-[10px] font-bold text-white uppercase mt-1">
                    {results.delegation.isWorthIt 
                      ? 'Outsourcing this task is highly rational. Reclaim your sanity and time.' 
                      : 'Not recommended. Outsource cost exceeds the value of time saved.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Metrics: Hourly wage & Reinvest Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* True Net Hourly Wage */}
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-600 uppercase flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    True Net Hourly Wage
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tight leading-none">Your actual take-home hourly rate after taxes and unbillable/commute overheads</p>
                </div>
                <div>
                  <h3 className="text-3xl font-black mt-4">{formatCurrency(results.baseline.trueNetHourlyWage)}/hr</h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">gross: {formatCurrency(results.baseline.annualGross / 12)}/mo | Net: {formatCurrency(results.baseline.annualNet / 12)}/mo</p>
                </div>
              </div>

              {/* Time Reinvestment Value */}
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-600 uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    Reclaimed Time Value
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tight leading-none">The true adjusted value of your {hoursSaved} saved hours based on your reinvestment style</p>
                </div>
                <div>
                  <h3 className="text-3xl font-black mt-4 text-orange-600">{formatCurrency(results.delegation.reinvestmentValue)}</h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">psychological rate: {formatCurrency(results.delegation.socraticTimeValue)}/hr</p>
                </div>
              </div>
            </div>

            {/* Socratic Warning Card (Zero/Negative Hourly wage) */}
            {results.baseline.trueNetHourlyWage <= 0 && (
              <div className="bg-[#FF6B6B]/10 border-4 border-black p-4 flex items-start gap-4 animate-bounce">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-black uppercase text-red-950 leading-tight">CRITICAL FINANCIAL WARN</h4>
                  <p className="text-xs text-red-800 font-bold uppercase mt-1">Your True Net Hourly Wage is zero or negative! Under these baseline parameters, any outsource cost is an outright cash loss. Please audit your income, billable hours, or overhead tax parameters above.</p>
                </div>
              </div>
            )}

            {/* Socratic Warning Card (High Task Cost vs Net Hourly Rate) */}
            {taskCost > results.baseline.trueNetHourlyWage * hoursSaved && results.delegation.isWorthIt && (
              <div className="bg-[#FF9900]/10 border-4 border-black p-4 flex items-start gap-4">
                <ShieldAlert className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-black uppercase text-orange-950 leading-tight">PSYCHOLOGICAL COGNITIVE TRADE-OFF</h4>
                  <p className="text-xs text-orange-800 font-bold uppercase mt-1">This task has a higher outsource cost than your net financial hourly returns, but is marked as WORTH IT purely because of your high Fatigue Multiplier ({energyMultiplier}x). You are technically trading cash for mental relief. Ensure you have the cash reserves to absorb this convenience tax.</p>
                </div>
              </div>
            )}

            {/* Core outsourcing Visual Comparison */}
            <div className="border-4 border-black p-6 bg-yellow-50 space-y-6">
              <h2 className="text-lg font-black flex items-center gap-2 uppercase">
                <Zap className="w-5 h-5 text-black" />
                Delegation Cost vs Reinvested Value
              </h2>
              
              <div className="space-y-4">
                {/* Outsource Cost */}
                <div>
                  <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black uppercase text-gray-500">Outsource Task Cost</span><span className="text-xs font-black">{formatCurrency(taskCost)}</span></div>
                  <div className="w-full bg-gray-200 border-2 border-black h-6 relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-red-400 h-full border-r-2 border-black" style={{ width: `${Math.min(100, (parseFloat(taskCost) / Math.max(1, parseFloat(results.delegation.reinvestmentValue) + parseFloat(taskCost))) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Reinvested Value */}
                <div>
                  <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black uppercase text-green-600">Reclaimed Time Value ({reinvestmentType.toUpperCase()})</span><span className="text-xs font-black text-green-600">{formatCurrency(results.delegation.reinvestmentValue)}</span></div>
                  <div className="w-full bg-gray-200 border-2 border-black h-6 relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-green-400 h-full border-r-2 border-black" style={{ width: `${Math.min(100, (parseFloat(results.delegation.reinvestmentValue) / Math.max(1, parseFloat(results.delegation.reinvestmentValue) + parseFloat(taskCost))) * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Break Even Info */}
              <div className="bg-white border-2 border-black p-3 text-xs font-bold uppercase tracking-tight flex justify-between items-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span>Maximum Outsource cost you should pay:</span>
                <span className="font-black text-green-600">{formatCurrency(results.delegation.reinvestmentValue)} ({formatCurrency(results.delegation.breakEvenCostPerHour)}/hr)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="secondary" onClick={handleExportPDF} className="flex-1 flex justify-center items-center gap-2 border-4 font-black uppercase py-3"><FileText className="w-5 h-5" /> Download PDF Analysis</Button>
              <Button variant="primary" onClick={handleExportExcel} className="flex-1 flex justify-center items-center gap-2 border-4 font-black uppercase py-3"><Calculator className="w-5 h-5" /> Export Excel Model</Button>
            </div>

          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium"><strong>Disclaimer:</strong> The Psychological Fatigue Multiplier is a subjective cognitive weight designed to quantify unliked labor; actual wealth outcomes are based strictly on take-home billable cash flows. Plan your cash purchases responsibly.</p>
      </Footer>
    </div>
  );
}
