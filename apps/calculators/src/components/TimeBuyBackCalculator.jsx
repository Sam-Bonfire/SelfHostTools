import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, IndianRupee, Percent, Clock, AlertCircle, Sparkles, User, Briefcase, Zap, Check, X, ShieldAlert, FileText, ArrowRight, Award } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, DownloadButtons, Footer, Select, MetricDisplay } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import SEO from './SEO';

import { calculateTimeBuyBack } from '../lib/buyBackLogic';
import { usePersistedState, resetPersistedState } from '@packages/persistence';

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
  const [jobType, setJobType] = usePersistedState('TimeBuyBackCalculator', 'jobType', 'freelance'); // 'freelance' or 'salaried'
  
  // Freelance Parameters
  const [hourlyRate, setHourlyRate] = usePersistedState('TimeBuyBackCalculator', 'hourlyRate', 1500);
  const [hoursPerWeek, setHoursPerWeek] = usePersistedState('TimeBuyBackCalculator', 'hoursPerWeek', 30);
  const [vacationWeeks, setVacationWeeks] = usePersistedState('TimeBuyBackCalculator', 'vacationWeeks', 4);
  const [adminTimePercent, setAdminTimePercent] = usePersistedState('TimeBuyBackCalculator', 'adminTimePercent', 20);
  const [isPresumptiveTax, setIsPresumptiveTax] = usePersistedState('TimeBuyBackCalculator', 'isPresumptiveTax', true);
  const [freelanceTaxRate, setFreelanceTaxRate] = usePersistedState('TimeBuyBackCalculator', 'freelanceTaxRate', 20);

  // Salaried Parameters
  const [salariedGross, setSalariedGross] = usePersistedState('TimeBuyBackCalculator', 'salariedGross', 1500000);
  const [salariedTaxRate, setSalariedTaxRate] = usePersistedState('TimeBuyBackCalculator', 'salariedTaxRate', 20);
  const [salariedHoursPerWeek, setSalariedHoursPerWeek] = usePersistedState('TimeBuyBackCalculator', 'salariedHoursPerWeek', 40);
  const [commuteHoursPerWeek, setCommuteHoursPerWeek] = usePersistedState('TimeBuyBackCalculator', 'commuteHoursPerWeek', 5);
  const [unpaidOvertimeHours, setUnpaidOvertimeHours] = usePersistedState('TimeBuyBackCalculator', 'unpaidOvertimeHours', 5);

  // Task Delegation Parameters
  const [taskCost, setTaskCost] = usePersistedState('TimeBuyBackCalculator', 'taskCost', 1000);
  const [hoursSaved, setHoursSaved] = usePersistedState('TimeBuyBackCalculator', 'hoursSaved', 4);
  const [energyMultiplier, setEnergyMultiplier] = usePersistedState('TimeBuyBackCalculator', 'energyMultiplier', 1.5);
  const [reinvestmentType, setReinvestmentType] = usePersistedState('TimeBuyBackCalculator', 'reinvestmentType', 'leisure'); // 'leisure', 'upskilling', 'work'

  // Results State
  const [results, setResults] = usePersistedState('TimeBuyBackCalculator', 'results', {
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
          <CalculatorHeader namespace="TimeBuyBackCalculator"
            icon={Zap}
            title="Time Buy-Back & Task Delegate Realist"
          
            onReset={() => { resetPersistedState('TimeBuyBackCalculator'); window.location.reload(); }} />
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
          <Card title="True Net-Hourly Rate Baseline" icon={Clock} headerColor="bg-blue-100">
            <div className="space-y-5 animate-in fade-in duration-200">
              {jobType === 'freelance' ? (
                // Freelance Fields
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input id="hourlyRate" label="Billed Hourly Rate (₹)" icon={IndianRupee} type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} onBlur={() => !hourlyRate && setHourlyRate(0)} className="font-black" />
                    </div>
                    <div>
                      <Input id="hoursPerWeek" label="Weekly Billed Hours" icon={Clock} type="number" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} onBlur={() => !hoursPerWeek && setHoursPerWeek(0)} className="font-black" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input id="vacationWeeks" label="Vacation (Weeks/Yr)" type="number" value={vacationWeeks} onChange={(e) => setVacationWeeks(e.target.value)} onBlur={() => !vacationWeeks && setVacationWeeks(0)} className="font-black" />
                    </div>
                    <div>
                      <Input id="adminTimePercent" label="Unbilled Admin Time (%)" type="number" value={adminTimePercent} onChange={(e) => setAdminTimePercent(e.target.value)} onBlur={() => !adminTimePercent && setAdminTimePercent(0)} className="font-black" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-black/10">
                    <div>
                      <Input id="freelanceTaxRate" label="Income Tax Rate (%)" type="number" value={freelanceTaxRate} onChange={(e) => setFreelanceTaxRate(e.target.value)} onBlur={() => !freelanceTaxRate && setFreelanceTaxRate(0)} className="font-black" />
                    </div>
                    <div className="flex flex-col justify-end pb-2">
                      <Checkbox checked={isPresumptiveTax} onChange={(e) => setIsPresumptiveTax(e.target.checked)} label="44ADA Presumptive" />
                    </div>
                  </div>
                </>
              ) : (
                // Salaried Fields
                <>
                  <div>
                    <Input id="salariedGross" label="Annual Gross Salary (₹)" icon={IndianRupee} type="number" value={salariedGross} onChange={(e) => setSalariedGross(e.target.value)} onBlur={() => !salariedGross && setSalariedGross(0)} className="font-black" />
                    <input type="range" min={300000} max={6000000} step={50000} value={salariedGross || 0} onChange={(e) => setSalariedGross(Number(e.target.value))} className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black" aria-label="Salary Slider" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input id="salariedHoursPerWeek" label="Official Hours/Week" type="number" value={salariedHoursPerWeek} onChange={(e) => setSalariedHoursPerWeek(e.target.value)} onBlur={() => !salariedHoursPerWeek && setSalariedHoursPerWeek(0)} className="font-black" />
                    </div>
                    <div>
                      <Input id="salariedTaxRate" label="Effective Tax Rate (%)" type="number" value={salariedTaxRate} onChange={(e) => setSalariedTaxRate(e.target.value)} onBlur={() => !salariedTaxRate && setSalariedTaxRate(0)} className="font-black" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-black/10">
                    <div>
                      <Input id="commuteHoursPerWeek" label="Weekly Commute (Hrs)" type="number" value={commuteHoursPerWeek} onChange={(e) => setCommuteHoursPerWeek(e.target.value)} onBlur={() => !commuteHoursPerWeek && setCommuteHoursPerWeek(0)} className="font-black" />
                    </div>
                    <div>
                      <Input id="unpaidOvertimeHours" label="Weekly Overtime (Hrs)" type="number" value={unpaidOvertimeHours} onChange={(e) => setUnpaidOvertimeHours(e.target.value)} onBlur={() => !unpaidOvertimeHours && setUnpaidOvertimeHours(0)} className="font-black" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* 2. Socratic Task Delegation Inputs */}
          <Card title="Task Outsourcing details" icon={Sparkles} headerColor="bg-orange-100">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input id="taskCost" label="Task Outsource Cost (₹)" icon={IndianRupee} type="number" value={taskCost} onChange={(e) => setTaskCost(e.target.value)} onBlur={() => !taskCost && setTaskCost(0)} className="font-black" />
                </div>
                <div>
                  <Input id="hoursSaved" label="Hours Reclaimed" icon={Clock} type="number" value={hoursSaved} onChange={(e) => setHoursSaved(e.target.value)} onBlur={() => !hoursSaved && setHoursSaved(0)} className="font-black" />
                </div>
              </div>

              <div>
                <Input id="energyMultiplier" label="Psychological Energy Multiplier (1x to 3x)" icon={Percent} type="number" step="0.1" value={energyMultiplier} onChange={(e) => setEnergyMultiplier(e.target.value)} onBlur={() => !energyMultiplier && setEnergyMultiplier(1.0)} className="font-black" />
                <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase leading-none tracking-tight">Fatigue score: apply high multiplier for tasks you highly dislike</p>
                <input type="range" min={1.0} max={3.0} step={0.1} value={energyMultiplier || 1.0} onChange={(e) => setEnergyMultiplier(Number(e.target.value))} className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black" aria-label="Energy Surcharge Slider" />
              </div>

              <div className="pt-4 border-t-2 border-black/10">
                <Select
                  id="reinvestmentType"
                  label="How will you reinvest this reclaimed time?"
                  value={reinvestmentType}
                  onChange={(e) => setReinvestmentType(e.target.value)}
                >
                  <option value="leisure">Leisure / Mental Refresh (Valued with Fatigue Surcharge)</option>
                  <option value="upskilling">Upskilling / Learning (1.5x Future Earnings Value)</option>
                  <option value="work">Direct Side Work / Extra Billing (1x Net Hourly wage)</option>
                </Select>
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
                <MetricDisplay
                  title="True Net Hourly Wage"
                  value={`${formatCurrency(results.baseline.trueNetHourlyWage)}/hr`}
                  subtitle={`gross: ${formatCurrency(results.baseline.annualGross / 12)}/mo | Net: ${formatCurrency(results.baseline.annualNet / 12)}/mo`}
                />
                <p className="text-[10px] text-gray-500 mt-4 uppercase font-bold tracking-tight leading-none">
                  Your actual take-home hourly rate after taxes and unbillable/commute overheads
                </p>
              </div>

              {/* Time Reinvestment Value */}
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <MetricDisplay
                  title="Reclaimed Time Value"
                  value={formatCurrency(results.delegation.reinvestmentValue)}
                  subtitle={`psychological rate: ${formatCurrency(results.delegation.socraticTimeValue)}/hr`}
                  color="text-orange-600"
                />
                <p className="text-[10px] text-gray-500 mt-4 uppercase font-bold tracking-tight leading-none">
                  The true adjusted value of your {hoursSaved} saved hours based on your reinvestment style
                </p>
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
              <DownloadButtons 
                onDownloadPDF={handleExportPDF}
                onDownloadExcel={handleExportExcel}
              />
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
