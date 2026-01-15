import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Calculator, IndianRupee, TrendingUp, TrendingDown, ArrowLeft, Settings, Info, Landmark, ShieldCheck, Laptop, Receipt, UserCheck, Clock, AlertCircle, PiggyBank, Palmtree, Target, Building, Users, Megaphone, Wifi, FileText, Table } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import Footer from './Footer';
import SEO from './SEO';

import { calculateFreelanceIncome, calculateAdminTime as getAdminPercent } from '../lib/freelanceLogic';

export default function FreelanceIncomeCalculator() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "Freelance Real Income Calculator",
    "description": "Calculate your true freelance take-home pay after accounting for taxes, overheads, and unpaid admin hours.",
    "brand": { "@type": "Brand", "name": "Calculators Hub" }
  };

  // --- INCOME INPUTS ---
  const [hourlyRate, setHourlyRate] = useState(2500);
  const [billableHours, setBillableHours] = useState(100); // per month

  // --- TIME OFF ---
  const [vacationWeeks, setVacationWeeks] = useState(4); // Weeks off per year

  // --- REALITY FACTORS ---
  const [adminTimePercent, setAdminTime] = useState(20); // 20% of time spent on unpaid admin
  const [showAdminEstimator, setShowAdminEstimator] = useState(false);
  const [adminBreakdown, setAdminBreakdown] = useState({
    email: { hours: 5, period: 'week' }, // 5 hrs/week on email
    sales: { hours: 2, period: 'week' }, // 2 hrs/week on proposals
    finance: { hours: 1, period: 'month' }, // 1 hr/month on invoicing
    learning: { hours: 2, period: 'week' }, // 2 hrs/week on skill dev
    misc: { hours: 0, period: 'week' } // catch-all
  });
  const [taxRate, setTaxRate] = useState(20);
  const [isPresumptiveTax, setIsPresumptiveTax] = useState(true); // 44ADA

  // --- EXPENSES ---
  const [softwareSaaS, setSoftware] = useState(5000);
  const [hardwareSinkingFund, setHardware] = useState(3000);
  const [healthInsurance, setHealth] = useState(2000);
  const [pensionNPS, setPension] = useState(10000);
  const [officeRent, setOfficeRent] = useState(0);
  const [professionalFees, setProfessionalFees] = useState(0); // Accountant/Lawyer
  const [marketingCosts, setMarketingCosts] = useState(0); // Hosting/Ads
  const [internetPhone, setInternetPhone] = useState(1000);

  // --- GOALS ---
  const [targetMonthlyIncome, setTargetIncome] = useState(150000);

  // --- PROJECT ESTIMATOR ---
  const [projectHours, setProjectHours] = useState(40);
  const [projectBuffer, setProjectBuffer] = useState(20); // % buffer for scope creep
  const [projectDirectCosts, setProjectDirectCosts] = useState(0); // outsourcing, assets, etc

  // --- RESULTS ---
  const [results, setResults] = useState({
    grossMonthly: 0,
    netTakeHome: 0,
    realHourlyRate: 0,
    totalExpenses: 0,
    effectiveTaxAmount: 0,
    totalHoursWorked: 0,
    requiredRate: 0,
    projectEstimates: { min: 0, recommended: 0 }
  });

  const calculate = useCallback(() => {
    const monthlyExpenses = (parseFloat(softwareSaaS) || 0) + (parseFloat(hardwareSinkingFund) || 0) +
      (parseFloat(healthInsurance) || 0) + (parseFloat(pensionNPS) || 0) +
      (parseFloat(officeRent) || 0) + (parseFloat(professionalFees) || 0) +
      (parseFloat(marketingCosts) || 0) + (parseFloat(internetPhone) || 0);

    const calculatedResults = calculateFreelanceIncome({
      hourlyRate,
      billableHours,
      vacationWeeks,
      adminTimePercent,
      taxRate,
      isPresumptiveTax,
      monthlyExpenses,
      targetMonthlyIncome,
      projectHours,
      projectBuffer,
      projectDirectCosts
    });

    setResults(calculatedResults);

  }, [hourlyRate, billableHours, vacationWeeks, adminTimePercent, taxRate, isPresumptiveTax, softwareSaaS, hardwareSinkingFund, healthInsurance, pensionNPS, officeRent, professionalFees, marketingCosts, internetPhone, targetMonthlyIncome, projectHours, projectBuffer, projectDirectCosts]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Admin Estimator Logic
  useEffect(() => {
    if (!showAdminEstimator) return;
    const newPercent = getAdminPercent(adminBreakdown, billableHours);
    setAdminTime(newPercent);
  }, [adminBreakdown, billableHours, showAdminEstimator]);

  const updateAdminBreakdown = (key, field, value) => {
    setAdminBreakdown(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const checkExports = (type) => {
    const schedule = Array.from({ length: 12 }, (_, i) => ({
      label: `Month ${i + 1}`,
      principal: results.grossMonthly,
      interest: results.totalExpenses + results.effectiveTaxAmount,
      balance: results.netTakeHome
    }));

    const data = {
      inputs: {
        hourlyRate, billableHours, vacationWeeks, adminTimePercent, taxRate, isPresumptiveTax,
        officeRent, professionalFees, marketingCosts, internetPhone, softwareSaaS, hardwareSinkingFund, healthInsurance, pensionNPS
      },
      results,
      schedule
    };

    if (type === 'pdf') {
      downloadPDF(data);
    } else {
      downloadExcel(data);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="Freelance 'Real' Pay Calculator"
        description="Calculate your true take-home pay as a freelancer after overheads, taxes, and unpaid admin time."
        keywords="freelance income calculator, hourly rate, take home pay, freelance overheads, 44ADA tax, project fee estimator"
        canonical={`${import.meta.env.VITE_SITE_URL}/freelance-calculator`}
        structuredData={structuredData}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            icon={Briefcase}
            title="Freelance Reality Hub"
          />
        </div>

        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <Card className="p-0 border-4 border-black">
            <div className="bg-blue-100 p-4 border-b-4 border-black">
              <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                <Receipt className="w-5 h-5" /> Billed Income
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Hourly Rate</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} onBlur={() => !hourlyRate && setHourlyRate(0)} className="pl-8 font-black w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Billable Hrs/Mo</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input type="number" value={billableHours} onChange={e => setBillableHours(e.target.value)} onBlur={() => !billableHours && setBillableHours(0)} className="pl-8 font-black w-full" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[10px] font-black uppercase mb-1 block text-orange-600">Unpaid Time Off (Weeks/Yr)</label>
                <Tooltip content="Vacations, Sick days, Public Holidays where you earn ₹0" className="w-full">
                  <div className="relative">
                    <Palmtree className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-orange-600 z-10" />
                    <Input type="number" value={vacationWeeks} onChange={e => setVacationWeeks(e.target.value)} onBlur={() => !vacationWeeks && setVacationWeeks(0)} className="pl-8 font-black text-orange-600 border-orange-200 w-full" />
                  </div>
                </Tooltip>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Tooltip content="Work you do that you can't bill for: Sales, Invoicing, Emails, Learning skills." className="z-20">
                      <label className="text-[10px] font-black uppercase text-red-600 block border-b border-dashed border-red-300 cursor-help">Unbillable Time (%)</label>
                    </Tooltip>
                  </div>
                  <div className="relative mb-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-red-600 z-10" />
                    <Input type="number" value={adminTimePercent} onChange={e => setAdminTime(e.target.value)} onBlur={() => !adminTimePercent && setAdminTime(0)} className="border-red-600 font-black text-red-600 pl-8 w-full" />
                  </div>
                  <p className="text-[9px] text-red-400 font-bold leading-tight opacity-70">
                    Standard: 20-30%
                  </p>
                  <button
                    onClick={() => setShowAdminEstimator(!showAdminEstimator)}
                    className="text-[9px] font-bold uppercase underline mt-1 text-red-600 hover:text-red-800"
                  >
                    {showAdminEstimator ? "Hide Estimator" : "Help me estimate"}
                  </button>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Est. Tax Slab (%)</label>
                  <div className="relative mb-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 z-10">%</span>
                    <Input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} onBlur={() => !taxRate && setTaxRate(0)} className="pl-8 font-black w-full" />
                  </div>
                </div>
              </div>

              {showAdminEstimator && (
                <div className="bg-red-50 p-3 border-2 border-red-100 rounded animate-in slide-in-from-top-2">
                  <p className="text-[10px] font-black uppercase text-red-400 mb-2">Estimate Unbillable Hours</p>
                  <div className="space-y-2">
                    {[
                      { id: 'email', label: 'Email/Slack' },
                      { id: 'sales', label: 'Sales/Call' },
                      { id: 'finance', label: 'Invoicing' },
                      { id: 'learning', label: 'Learning' },
                      { id: 'misc', label: 'Misc/Other' }
                    ].map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                        <label className="col-span-4 text-[9px] font-bold uppercase">{item.label}</label>
                        <div className="col-span-4">
                          <Input
                            type="number"
                            value={adminBreakdown[item.id].hours}
                            onChange={e => updateAdminBreakdown(item.id, 'hours', e.target.value)}
                            className="h-6 text-[10px] px-2 font-black w-full"
                            placeholder="Hrs"
                          />
                        </div>
                        <div className="col-span-4">
                          <select
                            value={adminBreakdown[item.id].period}
                            onChange={e => updateAdminBreakdown(item.id, 'period', e.target.value)}
                            className="h-6 w-full text-[9px] font-bold bg-white border-2 border-black rounded px-1 uppercase"
                          >
                            <option value="day">/ Day</option>
                            <option value="week">/ Week</option>
                            <option value="month">/ Month</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-0 border-4 border-black">
            <div className="bg-red-50 p-4 border-b-4 border-black">
              <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                <Laptop className="w-5 h-5 text-red-600" /> Business Overheads
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Software/SaaS</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input type="number" value={softwareSaaS} onChange={e => setSoftware(e.target.value)} onBlur={() => !softwareSaaS && setSoftware(0)} className="pl-8 font-black w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Laptop/Gear Fund</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input type="number" value={hardwareSinkingFund} onChange={e => setHardware(e.target.value)} onBlur={() => !hardwareSinkingFund && setHardware(0)} className="pl-8 font-black w-full" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Health Insurance</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input type="number" value={healthInsurance} onChange={e => setHealth(e.target.value)} onBlur={() => !healthInsurance && setHealth(0)} className="pl-8 font-black w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Pension/NPS</label>
                  <div className="relative">
                    <PiggyBank className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input type="number" value={pensionNPS} onChange={e => setPension(e.target.value)} onBlur={() => !pensionNPS && setPension(0)} className="pl-8 font-black w-full" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-black/10">
                <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Office & Ops</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">Rent/Coworking</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                      <Input type="number" value={officeRent} onChange={e => setOfficeRent(e.target.value)} className="pl-8 font-black w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">Professional Fees</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                      <Input type="number" value={professionalFees} onChange={e => setProfessionalFees(e.target.value)} className="pl-8 font-black w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">Marketing/Ads</label>
                    <div className="relative">
                      <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                      <Input type="number" value={marketingCosts} onChange={e => setMarketingCosts(e.target.value)} className="pl-8 font-black w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">Internet/Phone</label>
                    <div className="relative">
                      <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                      <Input type="number" value={internetPhone} onChange={e => setInternetPhone(e.target.value)} className="pl-8 font-black w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-0 border-4 border-black">
            <div className="bg-green-50 p-4 border-b-4 border-black">
              <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                <Landmark className="w-5 h-5 text-green-700" /> Tax Strategy
              </h2>
            </div>
            <div className="p-4">
              <div className={`p-3 border-2 rounded transition-colors ${isPresumptiveTax ? 'bg-green-100 border-green-600' : 'bg-gray-50 border-gray-200'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox checked={isPresumptiveTax} onChange={e => setIsPresumptiveTax(e.target.checked)} className="mt-1" />
                  <div>
                    <span className={`text-sm font-black uppercase leading-tight block ${isPresumptiveTax ? 'text-green-900' : 'text-gray-600'}`}>Apply 44ADA Presumptive Scheme</span>
                    <p className="text-xs mt-1 text-gray-600 leading-relaxed font-medium">
                      Designed for freelancers: You only declare <strong>50% of your gross receipt as taxable income</strong>. The other 50% is treated as automatic expenses (no proofs needed).
                    </p>
                    {isPresumptiveTax && (
                      <div className="mt-2 text-[10px] font-bold text-green-800 bg-white/50 p-2 rounded inline-block">
                        ✅ Taxable Income = {((parseFloat(hourlyRate) * parseFloat(billableHours) * 12) * 0.5).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })} (50% of Gross)
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <ResultsAnalysis
            title="Profitability Analysis"
            headerElements={<span className="text-xs font-black px-2 py-1 border-2 border-black bg-black text-white">MONTHLY VIEW</span>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Gross Billing</p>
                <p className="text-xl font-black">{formatCurrency(results.grossMonthly)}</p>
              </div>
              <div className="bg-blue-50 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-black text-blue-800 uppercase mb-1">Total Hours Worked</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <p className="text-xl font-black">{results.totalHoursWorked} Hrs</p>
                </div>
                <p className="text-[8px] font-bold text-blue-700 uppercase mt-1 italic">Includes {results.totalHoursWorked - billableHours} hrs of unpaid admin</p>
              </div>
            </div>

            <div className="bg-green-600 text-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black/20 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <PiggyBank className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-green-100 text-xs font-black uppercase tracking-widest">Real Take-Home Pay</p>
                  <p className="text-3xl md:text-4xl font-black tracking-tighter">{formatCurrency(results.netTakeHome)}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-100 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-red-900 font-black text-lg flex items-center gap-2 mb-1 uppercase tracking-tight">
                    <TrendingDown className="w-5 h-5" />
                    The "Real" Hourly Rate
                  </h3>
                  <p className="text-xs font-bold text-red-700 uppercase mb-4">What you actually earn per hour of work</p>
                  <p className="text-4xl font-black text-red-900 tracking-tighter">{formatCurrency(results.realHourlyRate)}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] font-black text-red-900/40 uppercase mb-1">Billed Rate</span>
                  <span className="text-2xl font-black text-red-400 opacity-40 line-through decoration-red-900/50 decoration-4">
                    {formatCurrency(hourlyRate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border-4 border-black">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4" /> Goal Check
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">To take home <strong>{formatCurrency(targetMonthlyIncome)}</strong>/mo:</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black ${results.requiredRate > hourlyRate ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(results.requiredRate)}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">/hr required</span>
                  </div>
                </div>
                <div className="text-right">
                  <label className="text-[8px] font-black uppercase mb-1 block text-gray-400">Target Net Income</label>
                  <div className="relative w-32">
                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input type="number" value={targetMonthlyIncome} onChange={e => setTargetIncome(e.target.value)} className="h-8 text-xs pl-6 font-black border-2" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-4 border-black p-6 bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 uppercase tracking-tight">
                <Receipt className="w-5 h-5" /> Cost of Doing Business
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase text-gray-500">Business Expenses</span>
                  <span className="font-bold text-red-600">-{formatCurrency(results.totalExpenses)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase text-gray-500">Income Tax (Est)</span>
                  <span className="font-bold text-red-600">-{formatCurrency(results.effectiveTaxAmount)}</span>
                </div>
              </div>
            </div>

            <div className="border-4 border-black p-6 bg-blue-50">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 uppercase tracking-tight">
                <Briefcase className="w-5 h-5" /> Project Fee Estimator
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Est. Hours</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input type="number" value={projectHours} onChange={e => setProjectHours(e.target.value)} className="pl-8 font-black w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Buffer (%)</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input type="number" value={projectBuffer} onChange={e => setProjectBuffer(e.target.value)} className="pl-8 font-black w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Direct Costs</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input type="number" value={projectDirectCosts} onChange={e => setProjectDirectCosts(e.target.value)} className="pl-8 font-black w-full" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div>
                    <span className="text-xs font-black uppercase text-gray-500 block">Baseline Quote</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Based on current real rate</span>
                  </div>
                  <span className="font-bold text-lg">{formatCurrency(results.projectEstimates.min)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#FFDE59] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div>
                    <span className="text-xs font-black uppercase text-black block">Recommended Quote</span>
                    <span className="text-[9px] font-bold text-black/60 uppercase">To hit income goal</span>
                  </div>
                  <span className="font-bold text-xl">{formatCurrency(results.projectEstimates.recommended)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <Tooltip content="Download PDF report" className="w-full">
                <Button variant="secondary" onClick={() => checkExports('pdf')} className="w-full text-sm font-bold flex items-center justify-center gap-2 border-2 border-black">
                  <FileText className="w-4 h-4" /> Download PDF Report
                </Button>
              </Tooltip>
              <Tooltip content="Download Excel report" className="w-full">
                <Button variant="primary" onClick={() => checkExports('excel')} className="w-full text-sm font-bold flex items-center justify-center gap-2 border-2 border-black">
                  <Table className="w-4 h-4" /> Download Excel Report
                </Button>
              </Tooltip>
            </div>
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Pro Tip:</strong> Most freelancers underprice because they compare their 'Billed Rate' to a salary. A ₹2,500 hourly rate is often equivalent to a ₹1,200 salary after accounting for benefits, taxes, and overheads.
        </p>
      </Footer>
    </div>
  );
}
