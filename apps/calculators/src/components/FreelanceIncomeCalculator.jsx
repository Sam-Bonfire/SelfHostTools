import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Calculator, IndianRupee, TrendingUp, TrendingDown, ArrowLeft, Settings, Info, Landmark, ShieldCheck, Laptop, Receipt, UserCheck, Clock, AlertCircle, PiggyBank, Palmtree, Target, Building, Users, Megaphone, Wifi, FileText, Table } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, DownloadButtons, Footer, MetricDisplay } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';

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
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/freelance_calculator.png`}
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
          <Card title="Billed Income" icon={Receipt} headerColor="bg-blue-100" className="p-0 border-4 border-black">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input id="hourly-rate" label="Hourly Rate" icon={IndianRupee} type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} onBlur={() => !hourlyRate && setHourlyRate(0)} className="font-black w-full" />
                </div>
                <div>
                  <Input id="billable-hours" label="Billable Hrs/Mo" icon={Clock} type="number" value={billableHours} onChange={e => setBillableHours(e.target.value)} onBlur={() => !billableHours && setBillableHours(0)} className="font-black w-full" />
                </div>
              </div>

              <div className="mt-4">
                <Tooltip content="Vacations, Sick days, Public Holidays where you earn ₹0" className="w-full">
                  <Input id="vacation-weeks" label="Unpaid Time Off (Weeks/Yr)" icon={Palmtree} type="number" value={vacationWeeks} onChange={e => setVacationWeeks(e.target.value)} onBlur={() => !vacationWeeks && setVacationWeeks(0)} className="font-black text-orange-600 border-orange-200 w-full" />
                </Tooltip>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-1">
                    <Tooltip content="Work you do that you can't bill for: Sales, Invoicing, Emails, Learning skills." className="z-20 inline-block">
                      <span className="text-[10px] font-black uppercase text-red-600 block border-b border-dashed border-red-300 cursor-help">Unbillable Time (%)</span>
                    </Tooltip>
                  </div>
                  <Input id="admin-time-percent" icon={Clock} type="number" value={adminTimePercent} onChange={e => setAdminTime(e.target.value)} onBlur={() => !adminTimePercent && setAdminTime(0)} className="border-red-600 font-black text-red-600 w-full mb-1" />
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
                  <Input id="tax-rate" label="Est. Tax Slab (%)" type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} onBlur={() => !taxRate && setTaxRate(0)} className="font-black w-full mb-2" />
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
                        <label htmlFor={`admin-hours-${item.id}`} className="col-span-4 text-[9px] font-bold uppercase">{item.label}</label>
                        <div className="col-span-4">
                          <Input
                            id={`admin-hours-${item.id}`}
                            type="number"
                            value={adminBreakdown[item.id].hours}
                            onChange={e => updateAdminBreakdown(item.id, 'hours', e.target.value)}
                            className="h-6 text-[10px] px-2 font-black w-full"
                            placeholder="Hrs"
                          />
                        </div>
                        <div className="col-span-4">
                          <select
                            id={`admin-period-${item.id}`}
                            aria-label={`Time period for ${item.label}`}
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

          <Card title="Business Overheads" icon={Laptop} headerColor="bg-red-50" className="p-0 border-4 border-black">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input id="expense-software" label="Software/SaaS" icon={IndianRupee} type="number" value={softwareSaaS} onChange={e => setSoftware(e.target.value)} onBlur={() => !softwareSaaS && setSoftware(0)} className="font-black w-full" />
                </div>
                <div>
                  <Input id="expense-hardware" label="Laptop/Gear Fund" icon={IndianRupee} type="number" value={hardwareSinkingFund} onChange={e => setHardware(e.target.value)} onBlur={() => !hardwareSinkingFund && setHardware(0)} className="font-black w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input id="expense-health" label="Health Insurance" icon={ShieldCheck} type="number" value={healthInsurance} onChange={e => setHealth(e.target.value)} onBlur={() => !healthInsurance && setHealth(0)} className="font-black w-full" />
                </div>
                <div>
                  <Input id="expense-pension" label="Pension/NPS" icon={PiggyBank} type="number" value={pensionNPS} onChange={e => setPension(e.target.value)} onBlur={() => !pensionNPS && setPension(0)} className="font-black w-full" />
                </div>
              </div>

              <div className="pt-4 border-t-2 border-black/10">
                <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Office & Ops</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input id="expense-rent" label="Rent/Coworking" icon={Building} type="number" value={officeRent} onChange={e => setOfficeRent(e.target.value)} className="font-black w-full" />
                  </div>
                  <div>
                    <Input id="expense-pro-fees" label="Professional Fees" icon={Users} type="number" value={professionalFees} onChange={e => setProfessionalFees(e.target.value)} className="font-black w-full" />
                  </div>
                  <div>
                    <Input id="expense-marketing" label="Marketing/Ads" icon={Megaphone} type="number" value={marketingCosts} onChange={e => setMarketingCosts(e.target.value)} className="font-black w-full" />
                  </div>
                  <div>
                    <Input id="expense-internet" label="Internet/Phone" icon={Wifi} type="number" value={internetPhone} onChange={e => setInternetPhone(e.target.value)} className="font-black w-full" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Tax Strategy" icon={Landmark} headerColor="bg-green-50" className="p-0 border-4 border-black">
            <div className="p-4">
              <div className={`p-3 border-2 rounded transition-colors ${isPresumptiveTax ? 'bg-green-100 border-green-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex flex-col gap-1">
                  <Checkbox 
                    label="Apply 44ADA Presumptive Scheme" 
                    checked={isPresumptiveTax} 
                    onChange={e => setIsPresumptiveTax(e.target.checked)} 
                  />
                  <div className="ml-7">
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      Designed for freelancers: You only declare <strong>50% of your gross receipt as taxable income</strong>. The other 50% is treated as automatic expenses (no proofs needed).
                    </p>
                    {isPresumptiveTax && (
                      <div className="mt-2 text-[10px] font-bold text-green-800 bg-white/50 p-2 rounded inline-block">
                        ✅ Taxable Income = {((parseFloat(hourlyRate) * parseFloat(billableHours) * 12) * 0.5).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })} (50% of Gross)
                      </div>
                    )}
                  </div>
                </div>
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
                <MetricDisplay title="Gross Billing" value={formatCurrency(results.grossMonthly)} />
              </div>
              <div className="bg-blue-50 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <MetricDisplay 
                  title="Total Hours Worked" 
                  value={`${results.totalHoursWorked} Hrs`} 
                  subtitle={`Includes ${results.totalHoursWorked - billableHours} hrs of unpaid admin`} 
                />
              </div>
            </div>

            <div className="bg-green-600 text-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black/20 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <PiggyBank className="w-8 h-8 text-white" />
                </div>
                <MetricDisplay title="Real Take-Home Pay" value={formatCurrency(results.netTakeHome)} />
              </div>
            </div>

            <div className="bg-red-100 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-red-900 font-black text-lg flex items-center gap-2 mb-1 uppercase tracking-tight">
                    <TrendingDown className="w-5 h-5" />
                    The "Real" Hourly Rate
                  </h3>
                  <MetricDisplay title="What you actually earn per hour of work" value={formatCurrency(results.realHourlyRate)} />
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
                  <Input id="target-monthly-income" label="Target Net Income" icon={IndianRupee} type="number" value={targetMonthlyIncome} onChange={e => setTargetIncome(e.target.value)} className="w-32 h-8 text-xs font-black border-2" />
                </div>
              </div>
            </div>

            <Card title="Cost of Doing Business" icon={Receipt} headerColor="bg-gray-50" className="border-4 border-black p-0">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase text-gray-500">Business Expenses</span>
                  <span className="font-bold text-red-600">-{formatCurrency(results.totalExpenses)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase text-gray-500">Income Tax (Est)</span>
                  <span className="font-bold text-red-600">-{formatCurrency(results.effectiveTaxAmount)}</span>
                </div>
              </div>
            </Card>

            <Card title="Project Fee Estimator" icon={Briefcase} headerColor="bg-blue-50" className="border-4 border-black p-0">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <Input id="project-hours" label="Est. Hours" icon={Clock} type="number" value={projectHours} onChange={e => setProjectHours(e.target.value)} className="font-black w-full" />
                  </div>
                  <div>
                    <Input id="project-buffer" label="Buffer (%)" icon={ShieldCheck} type="number" value={projectBuffer} onChange={e => setProjectBuffer(e.target.value)} className="font-black w-full" />
                  </div>
                  <div>
                    <Input id="project-direct-costs" label="Direct Costs" icon={IndianRupee} type="number" value={projectDirectCosts} onChange={e => setProjectDirectCosts(e.target.value)} className="font-black w-full" />
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
            </Card>

            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <DownloadButtons 
                onDownloadPDF={() => checkExports('pdf')}
                onDownloadExcel={() => checkExports('excel')}
              />
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
