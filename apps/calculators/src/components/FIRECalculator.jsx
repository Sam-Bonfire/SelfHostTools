import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Calculator, IndianRupee, TrendingUp, TrendingDown, ArrowLeft, Settings, Info, Briefcase, GraduationCap, Landmark, Coins, AlertCircle, Sunrise, Sunset, ShieldCheck, FileText, Table } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import Footer from './Footer';
import SEO from './SEO';

import { calculateFIRE } from '../lib/fireLogic';

export default function FIRECalculator() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "FIRE Calculator",
    "description": "Calculate your path to financial freedom/retirement, accounting for inflation and returns.",
    "brand": { "@type": "Brand", "name": "Calculators Hub" },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
  };

  // --- INPUTS ---
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(50);
  const [currentMonthlyExpenses, setExpenses] = useState(50000);
  const [currentSavings, setSavings] = useState(2000000); // Current Corpus
  const [monthlyInvestment, setMonthlyInv] = useState(50000); // SIP

  // --- REALITY FACTORS ---
  const [inflationRate, setInflation] = useState(6);
  const [medicalInflation, setMedicalInflation] = useState(12); // Healthcare inflation > General
  const [preRetirementReturn, setPreReturn] = useState(12);
  const [postRetirementReturn, setPostReturn] = useState(8);
  const [lifestyleInflation, setLifestyleInflation] = useState(2); // New: Lifestyle inflation rate

  // --- RESULTS ---
  const [results, setResults] = useState({
    requiredCorpus: 0,
    estimatedCorpusAtRetirement: 0,
    shortfall: 0,
    canRetire: false,
    yearsToFIRE: 0,
    monthlyExpensesAtRetirement: 0,
    supportableMonthlyIncome: 0,
    surplusCorpus: 0
  });

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const calculate = useCallback(() => {
    const { results: calcResults } = calculateFIRE({
      currentAge,
      retirementAge,
      currentMonthlyExpenses,
      currentSavings,
      monthlyInvestment,
      inflationRate,
      medicalInflation,
      preRetirementReturn,
      postRetirementReturn,
      lifestyleInflation
    });

    setResults(calcResults);

  }, [currentAge, retirementAge, currentMonthlyExpenses, currentSavings, monthlyInvestment, inflationRate, medicalInflation, preRetirementReturn, postRetirementReturn, lifestyleInflation]);

  const generateSchedule = useCallback(() => {
    const { schedule } = calculateFIRE({
      currentAge,
      retirementAge,
      currentMonthlyExpenses,
      currentSavings,
      monthlyInvestment,
      inflationRate,
      medicalInflation,
      preRetirementReturn,
      postRetirementReturn,
      lifestyleInflation
    });
    return schedule;
  }, [currentAge, retirementAge, currentMonthlyExpenses, currentSavings, monthlyInvestment, inflationRate, medicalInflation, preRetirementReturn, postRetirementReturn, lifestyleInflation]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const checkExports = (type) => {
    const data = {
      inputs: {
        currentAge,
        retirementAge,
        currentMonthlyExpenses,
        currentSavings,
        monthlyInvestment,
        inflationRate,
        medicalInflation,
        preRetirementReturn,
        postRetirementReturn,
        lifestyleInflation
      },
      results,
      schedule: generateSchedule()
    };

    if (type === 'pdf') {
      downloadPDF(data);
    } else {
      downloadExcel(data);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="FIRE & Retirement Planner"
        description="Calculate your path to financial independence. Factor in inflation, taxes, and healthcare to find your true freedom number."
        keywords="fire calculator, financial independence retire early, retirement calculator, fire movement, retirement planning india, early retirement"
        canonical={`${import.meta.env.VITE_SITE_URL}/fire-calculator`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/fire_calculator.png`}
        structuredData={structuredData}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            icon={Flame}
            title="FIRE Calculator"
          />
        </div>

        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <Card className="p-0 border-4 border-black">
            <div className="bg-blue-100 p-4 border-b-4 border-black">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sunrise className="w-5 h-5" /> The Accumulation Phase
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currentAge" className="text-[10px] font-black uppercase mb-1 block">Current Age</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 z-10">Yr</span>
                    <Input id="currentAge" type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} onBlur={() => !currentAge && setCurrentAge(0)} className="pl-8 font-black" />
                  </div>
                </div>
                <div>
                  <label htmlFor="retirementAge" className="text-[10px] font-black uppercase text-orange-600 mb-1 block">FIRE Age</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-600 z-10">Yr</span>
                    <Input id="retirementAge" type="number" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} onBlur={() => !retirementAge && setRetirementAge(0)} className="border-orange-600 font-black text-orange-600 pl-8" />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="expenses" className="text-[10px] font-black uppercase mb-1 block">Monthly Expenses (Today)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                  <Input id="expenses" type="number" value={currentMonthlyExpenses} onChange={e => setExpenses(e.target.value)} onBlur={() => !currentMonthlyExpenses && setExpenses(0)} className="pl-8 font-black" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currentSavings" className="text-[10px] font-black uppercase mb-1 block">Current Corpus</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input id="currentSavings" type="number" value={currentSavings} onChange={e => setSavings(e.target.value)} onBlur={() => !currentSavings && setSavings(0)} className="pl-8 font-black" />
                  </div>
                </div>
                <div>
                  <label htmlFor="monthlyInvestment" className="text-[10px] font-black uppercase mb-1 block">Monthly SIP</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input id="monthlyInvestment" type="number" value={monthlyInvestment} onChange={e => setMonthlyInv(e.target.value)} onBlur={() => !monthlyInvestment && setMonthlyInv(0)} className="pl-8 font-black" />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inflationRate" className="text-[10px] font-black uppercase mb-1 block">Standard Inflation (%)</label>
                  <div className="relative">
                    <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Input id="inflationRate" type="number" value={inflationRate} onChange={e => setInflation(e.target.value)} onBlur={() => !inflationRate && setInflation(0)} className="pl-8 font-black" />
                  </div>
                </div>
                <div>
                  <label htmlFor="medicalInflation" className="text-[10px] font-black uppercase text-red-700 mb-1 block">Medical Inflation (%)</label>
                  <Tooltip content="Healthcare costs rise faster than standard CPI. Standard is 12-14%.">
                    <div className="relative">
                      <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-red-600 z-10" />
                      <Input id="medicalInflation" type="number" value={medicalInflation} onChange={e => setMedicalInflation(e.target.value)} onBlur={() => !medicalInflation && setMedicalInflation(0)} className="border-red-700 font-black text-red-700 pl-8" />
                    </div>
                  </Tooltip>
                </div>

                <div className="pt-4 border-t-2 border-black/10">
                  <label htmlFor="lifestyleInflation" className="block text-[10px] font-black uppercase mb-1 text-purple-600">Lifestyle Inflation (%)</label>
                  <div className="flex gap-2 mb-3" role="group" aria-label="Lifestyle Inflation Presets">
                    <button aria-pressed={lifestyleInflation == 0} onClick={() => setLifestyleInflation(0)} className={`flex-1 py-1 text-[8px] font-black border-2 border-black uppercase ${lifestyleInflation == 0 ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>Minimal</button>
                    <button aria-pressed={lifestyleInflation == 2} onClick={() => setLifestyleInflation(2)} className={`flex-1 py-1 text-[8px] font-black border-2 border-black uppercase ${lifestyleInflation == 2 ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>Standard</button>
                    <button aria-pressed={lifestyleInflation == 5} onClick={() => setLifestyleInflation(5)} className={`flex-1 py-1 text-[8px] font-black border-2 border-black uppercase ${lifestyleInflation == 5 ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>High</button>
                  </div>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 z-10" />
                    <Input id="lifestyleInflation" type="number" value={lifestyleInflation} onChange={e => setLifestyleInflation(e.target.value)} onBlur={() => !lifestyleInflation && setLifestyleInflation(0)} className="pl-9 font-black border-purple-200" />
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 leading-tight">Tendency to spend more as you earn more. 2-3% is standard.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preRetirementReturn" className="text-[10px] font-black uppercase mb-1 block">Pre-FIRE Return (%)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 z-10">%</span>
                    <Input id="preRetirementReturn" type="number" value={preRetirementReturn} onChange={e => setPreReturn(e.target.value)} onBlur={() => !preRetirementReturn && setPreReturn(0)} className="pl-8 font-black" />
                  </div>
                </div>
                <div>
                  <label htmlFor="postRetirementReturn" className="text-[10px] font-black uppercase mb-1 block">Post-FIRE Return (%)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 z-10">%</span>
                    <Input id="postRetirementReturn" type="number" value={postRetirementReturn} onChange={e => setPostReturn(e.target.value)} onBlur={() => !postRetirementReturn && setPostReturn(0)} className="pl-8 font-black" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div role="region" aria-live="polite" aria-atomic="true" className="lg:col-span-12 xl:col-span-7 space-y-6">
          <ResultsAnalysis
            title="Freedom Analysis"
            headerElements={
              <span className={`text-xs font-black px-2 py-1 border-2 border-black ${results.canRetire ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                {results.canRetire ? 'ON TRACK' : 'WORK IN PROGRESS'}
              </span>
            }
          >
            <div className="bg-black text-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,222,89,1)]">
              <h3 className="text-xs font-black uppercase text-yellow-300 mb-2 tracking-widest">Required FIRE Corpus</h3>
              <p className="text-4xl md:text-5xl font-black tracking-tighter">{formatCurrency(results.requiredCorpus)}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-2 italic uppercase">Needed to sustain {formatCurrency(results.monthlyExpensesAtRetirement)}/mo forever</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Projected Savings</p>
                <p className="text-xl font-black">{formatCurrency(results.estimatedCorpusAtRetirement)}</p>
                <p className="text-[9px] font-bold text-gray-400 italic mt-1">At age {retirementAge}</p>
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Funding Shortfall</p>
                <p className="text-xl font-black text-red-600">{formatCurrency(results.shortfall)}</p>
                <p className="text-[9px] font-bold text-gray-400 italic mt-1">Gap to fill in {results.yearsToFIRE} years</p>
              </div>
            </div>

            <div className="border-4 border-black p-6 bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 uppercase tracking-tight">
                <Sunrise className="w-5 h-5 text-blue-600" /> Life at Age {retirementAge} (Current Plan)
              </h2>
              <div className="space-y-4">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Based on your current savings rate, you will be able to afford:
                </p>
                <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase">Standard Expenses/mo</span>
                  <span className="font-bold">{formatCurrency(results.supportableMonthlyIncome * 0.8)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase text-red-800">Medical Buffer/mo</span>
                  <span className="font-bold text-red-800">{formatCurrency(results.supportableMonthlyIncome * 0.2)}</span>
                </div>
                <div className="p-3 bg-blue-100 border-2 border-black">
                  <p className="text-[9px] font-black uppercase text-blue-800 mb-1">Reality Check</p>
                  <div className="flex justify-between items-center text-sm font-black text-blue-900">
                    <span>Projected Income:</span>
                    <span>{formatCurrency(results.supportableMonthlyIncome)}/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-blue-800/60 mt-1">
                    <span>Desired Income:</span>
                    <span>{formatCurrency(results.monthlyExpensesAtRetirement)}/mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GOAL CARD */}
            {!results.canRetire && (
              <div className="border-4 border-black p-6 bg-[#FFDE59]">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6 uppercase tracking-tight text-black">
                  <Coins className="w-5 h-5" /> To Achieve Full Freedom
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[9px] font-black uppercase text-gray-500 mb-1">Required Monthly SIP</p>
                      <p className="text-xl font-black">{formatCurrency(results.totalSIPRequired)}</p>
                    </div>
                    <div className="p-3 bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[9px] font-black uppercase text-yellow-300 mb-1">Extra SIP Needed</p>
                      <p className="text-xl font-black">+{formatCurrency(results.extraSIPNeeded)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-black border-dashed">
                    <p className="text-xs font-black uppercase mb-3">If Goal Achieved, You Get:</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-xs font-black uppercase">Standard Expenses/mo</span>
                        <span className="font-bold">{formatCurrency(results.monthlyExpensesAtRetirement * 0.8)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-xs font-black uppercase text-red-800">Medical Buffer/mo</span>
                        <span className="font-bold text-red-800">{formatCurrency(results.monthlyExpensesAtRetirement * 0.2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
          <strong>The 4% Rule:</strong> Standard retirement planning assumes a 4% withdrawal rate. However, in India, due to higher inflation, a 3% or lower withdrawal rate is safer for a longer retirement.
        </p>
      </Footer>
    </div>
  );
}
