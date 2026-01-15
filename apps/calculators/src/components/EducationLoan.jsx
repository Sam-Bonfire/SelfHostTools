import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, IndianRupee, Percent, Calendar, Info, PieChart as PieChartIcon, Table as TableIcon, TrendingDown, Clock, BookOpen, Coffee, Coins, Plus, Trash2, CalendarDays, Settings, ArrowLeft } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import Footer from './Footer';
import SEO from './SEO';

import { calculateEducationLoan } from '../lib/educationLoanLogic';


export default function App() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "Education Loan Calculator",
    "description": "Calculate your education loan EMI, interest, and repayment schedule.",
    "brand": {
      "@type": "Brand",
      "name": "Calculators Hub"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  // --- Basic Inputs ---
  const [interestRate, setInterestRate] = useState(10.5);
  const [repaymentTenure, setRepaymentTenure] = useState(10); // in years

  // --- Simple Mode State ---
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [courseDuration, setCourseDuration] = useState(24); // in months

  // --- Advanced Mode State ---
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [courseEndDate, setCourseEndDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]);
  const [disbursements, setDisbursements] = useState([
    { id: 1, date: new Date().toISOString().split('T')[0], amount: 500000 },
    { id: 2, date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0], amount: 500000 }
  ]);

  // --- Common Settings ---
  const [gracePeriod, setGracePeriod] = useState(6); // in months
  const [gracePayment, setGracePayment] = useState(0); // Monthly payment
  const [graceLumpsum, setGraceLumpsum] = useState(0); // Lumpsum payment
  const [capitalizeInterest, setCapitalizeInterest] = useState(true);
  const [extraPayment, setExtraPayment] = useState(0);

  // --- Results State ---
  const [results, setResults] = useState({
    monthlyEMI: 0,
    totalInterest: 0,
    totalAmount: 0,
    moratoriumInterest: 0,
    effectivePrincipal: 0,
    savings: 0,
    timeSavedMonths: 0,
    newTenureMonths: 0,
    totalMoratorium: 0,
    repaymentStartDate: null
  });

  const [schedule, setSchedule] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);

  const calculateLoan = useCallback(() => {
    const { results: calcResults, schedule: calcSchedule } = calculateEducationLoan({
      interestRate,
      repaymentTenure,
      loanAmount,
      courseDuration,
      isAdvanced,
      courseEndDate,
      disbursements,
      gracePeriod,
      gracePayment,
      graceLumpsum,
      capitalizeInterest,
      extraPayment
    });

    setResults(calcResults);
    setSchedule(calcSchedule);

  }, [
    loanAmount, interestRate, repaymentTenure, courseDuration,
    gracePeriod, gracePayment, capitalizeInterest, extraPayment,
    isAdvanced, courseEndDate, disbursements
  ]);

  useEffect(() => {
    calculateLoan();
  }, [calculateLoan]);

  const addDisbursement = () => {
    const nextId = Math.max(...disbursements.map(d => d.id), 0) + 1;
    setDisbursements([...disbursements, { id: nextId, date: new Date().toISOString().split('T')[0], amount: 0 }]);
  };

  const removeDisbursement = (id) => {
    if (disbursements.length > 1) {
      setDisbursements(disbursements.filter(d => d.id !== id));
    }
  };

  const updateDisbursement = (id, field, value) => {
    setDisbursements(disbursements.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatTime = (months) => {
    const y = Math.floor(months / 12);
    const m = Math.ceil(months % 12);
    if (y > 0 && m > 0) return `${y}y ${m}m`;
    if (y > 0) return `${y} Years`;
    return `${m} Months`;
  };

  const formatDate = (dateObj) => {
    return dateObj ? dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '-';
  };

  const principalPercentage = (results.totalAmount > 0)
    ? ((results.totalAmount - results.totalInterest) / results.totalAmount) * 100
    : 0;

  const originalDisbursedValue = isAdvanced
    ? disbursements.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
    : loanAmount;

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="Education Loan Calculator"
        description="Calculate your education loan EMI, interest, and repayment schedule. Plan your studies and future finances with ease."
        keywords="education loan, student loan, emi calculator, moratorium interest, study loan, india student loan, repayment planner"
        canonical={`${import.meta.env.VITE_SITE_URL}/education-loan`}
        structuredData={structuredData}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            icon={Calculator}
            title="Education Loan"
          />
        </div>

        {/* Inputs Section */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <Card className="p-0 border-4 border-black">
            <div className="bg-blue-100 p-4 border-b-4 border-black">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration
              </h2>
            </div>
            <div className="p-4">
              <Tooltip content="Toggle between basic lump-sum loan and detailed multi-disbursement schedules" className="w-full mb-4">
                <Button
                  onClick={() => setIsAdvanced(!isAdvanced)}
                  variant="secondary"
                  className="w-full"
                >
                  {isAdvanced ? 'Switch to Simple Mode' : 'Switch to Advanced Mode'}
                </Button>
              </Tooltip>

              {/* Loan Amount */}
              {!isAdvanced ? (
                <div className="mb-5">
                  <label htmlFor="loanAmount" className="block font-bold mb-2">Loan Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                    <Input
                      id="loanAmount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      onBlur={() => !loanAmount && setLoanAmount(0)}
                      className="pl-9"
                    />
                  </div>
                  <input
                    id="loanAmountSlider"
                    type="range"
                    min={50000}
                    max={10000000}
                    step={50000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black"
                  />
                </div>
              ) : (
                <div className="mb-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold">Disbursements</label>
                    <span className="text-xs px-2 py-1 bg-yellow-200 border-2 border-black font-bold" aria-live="polite">
                      Total: {formatCurrency(originalDisbursedValue)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {disbursements.map((d) => (
                      <div key={d.id} className="flex items-center gap-2">
                        <div className="w-36 flex-shrink-0">
                          <Input
                            id={`disbursement-date-${d.id}`}
                            aria-label={`Disbursement Date ${d.id}`}
                            type="date"
                            value={d.date}
                            onChange={(e) => updateDisbursement(d.id, 'date', e.target.value)}
                            className="w-full text-xs"
                          />
                        </div>
                        <div className="relative flex-1">
                          <IndianRupee className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 z-10" />
                          <Input
                            id={`disbursement-amount-${d.id}`}
                            aria-label={`Disbursement Amount ${d.id}`}
                            type="number"
                            value={d.amount}
                            onChange={(e) => updateDisbursement(d.id, 'amount', e.target.value)}
                            className="pl-6 w-full text-xs"
                            placeholder="Amount"
                          />
                        </div>
                        {disbursements.length > 1 && (
                          <Tooltip content="Remove this tranche" position="top">
                            <Button
                              onClick={() => removeDisbursement(d.id)}
                              variant="destructive"
                              className="px-3 py-1"
                              aria-label="Remove tranche"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    ))}
                    <Tooltip content="Add another loan disbursement date and amount" className="w-full">
                      <Button
                        onClick={addDisbursement}
                        variant="outline"
                        className="w-full text-sm"
                      >
                        <Plus className="w-4 h-4 mr-1 inline" /> Add Tranche
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              )}

              {/* Interest Rate & Tenure */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label htmlFor="interestRate" className="block font-bold mb-2 text-sm">Interest Rate (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                    <Input
                      id="interestRate"
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      onBlur={() => !interestRate && setInterestRate(0)}
                      step="0.1"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="repaymentTenure" className="block font-bold mb-2 text-sm">Tenure (Years)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                    <Input
                      id="repaymentTenure"
                      type="number"
                      value={repaymentTenure}
                      onChange={(e) => setRepaymentTenure(e.target.value)}
                      onBlur={() => !repaymentTenure && setRepaymentTenure(0)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Payment */}
              <div className="bg-green-50 p-4 border-2 border-green-800 mb-5">
                <label htmlFor="extraPayment" className="text-sm font-bold text-green-900 mb-2 block">
                  Extra Monthly Payment
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-700 z-10" />
                  <Input
                    id="extraPayment"
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                    onBlur={() => !extraPayment && setExtraPayment(0)}
                    className="pl-9 border-green-800"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Moratorium Section */}
              <div className="pt-6 border-t-4 border-black">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Moratorium Period
                  </label>
                  <span className="text-xs font-bold px-2 py-1 bg-gray-200 border-2 border-black">
                    {results.totalMoratorium} Months
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    {isAdvanced ? (
                      <>
                        <label htmlFor="courseEndDate" className="text-xs font-bold mb-2 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> End Date
                        </label>
                        <Input
                          id="courseEndDate"
                          type="date"
                          value={courseEndDate}
                          onChange={(e) => setCourseEndDate(e.target.value)}
                        />
                      </>
                    ) : (
                      <>
                        <label htmlFor="courseDuration" className="text-xs font-bold mb-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Duration (Mos)
                        </label>
                        <Input
                          id="courseDuration"
                          type="number"
                          value={courseDuration}
                          onChange={(e) => setCourseDuration(e.target.value)}
                          onBlur={() => !courseDuration && setCourseDuration(0)}
                        />
                      </>
                    )}
                  </div>

                  <div>
                    <label htmlFor="gracePeriod" className="text-xs font-bold mb-2 flex items-center gap-1">
                      <Coffee className="w-3 h-3" /> Grace (Mos)
                    </label>
                    <Input
                      id="gracePeriod"
                      type="number"
                      value={gracePeriod}
                      onChange={(e) => setGracePeriod(e.target.value)}
                      onBlur={() => !gracePeriod && setGracePeriod(0)}
                    />
                  </div>
                </div>

                {gracePeriod > 0 && (
                  <div className="mb-4 bg-blue-50 p-3 border-2 border-blue-800">
                    <label htmlFor="gracePayment" className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Coins className="w-4 h-4" /> Monthly Payment during Grace
                    </label>
                    <div className="relative mb-3">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-700 z-10" />
                      <Input
                        id="gracePayment"
                        type="number"
                        value={gracePayment}
                        onChange={(e) => setGracePayment(e.target.value)}
                        onBlur={() => !gracePayment && setGracePayment(0)}
                        className="pl-9 border-blue-800"
                        placeholder="0"
                      />
                    </div>

                    <label htmlFor="graceLumpsum" className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Lumpsum Payment during Grace
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-700 z-10" />
                      <Input
                        id="graceLumpsum"
                        type="number"
                        value={graceLumpsum}
                        onChange={(e) => setGraceLumpsum(e.target.value)}
                        onBlur={() => !graceLumpsum && setGraceLumpsum(0)}
                        className="pl-9 border-blue-800"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {results.totalMoratorium > 0 && (
                  <div className="p-3 border-2 border-black bg-gray-50 flex items-start gap-3">
                    <Checkbox
                      id="capitalizeInterest"
                      checked={capitalizeInterest}
                      onChange={(e) => setCapitalizeInterest(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="capitalizeInterest" className="text-sm cursor-pointer">
                      <span className="font-bold block">Capitalize Interest?</span>
                      <span className="text-xs text-gray-600">Add moratorium interest to principal.</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <ResultsAnalysis>
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-gray-600">Monthly EMI</h3>
                <div>
                  <motion.h3
                    key={results.monthlyEMI}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-black mt-2"
                  >
                    {formatCurrency(results.monthlyEMI)}
                  </motion.h3>
                  {extraPayment > 0 && (
                    <div className="text-xs text-green-700 mt-1 font-bold">
                      + {formatCurrency(extraPayment)} Extra
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-600 flex items-center justify-between">
                    Total Interest
                    {results.totalMoratorium > 0 && (
                      <span className="text-[10px] font-normal text-gray-400">
                        (Includes moratorium interest)
                      </span>
                    )}
                  </h3>
                </div>
                <div>
                  <motion.h3
                    key={results.totalInterest}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-black text-red-600 mt-2"
                  >
                    {formatCurrency(results.totalInterest)}
                  </motion.h3>
                </div>
              </div>
            </div>

            {/* Savings Banner */}
            {(results.savings > 0 || (gracePayment > 0)) && (
              <div className="bg-green-600 border-4 border-black text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-black/20 rounded-full border-2 border-black">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-green-100 text-sm font-bold uppercase tracking-wider">Total Savings</p>
                    <p className="text-2xl font-black">{formatCurrency(results.savings)}</p>
                  </div>
                </div>
                {results.timeSavedMonths > 0 && (
                  <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-black/20 pt-4 md:pt-0 md:pl-4">
                    <div className="p-3 bg-black/20 rounded-full border-2 border-black">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-green-100 text-sm font-bold uppercase tracking-wider">Time Saved</p>
                      <p className="text-2xl font-black">{formatTime(results.timeSavedMonths)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chart & Breakdown */}
            <div className="border-4 border-black p-6 bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5" />
                Repayment Breakdown
              </h2>
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="relative w-48 h-48 rounded-full flex-shrink-0 border-4 border-black"
                  style={{
                    background: `conic-gradient(
                          #FFDE59 0% ${principalPercentage}%, 
                          #FF6B6B ${principalPercentage}% 100%
                        )`
                  }}>
                  <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Interest %</span>
                    <span className="text-xl font-bold text-foreground">{Math.round(100 - principalPercentage)}%</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white border-2 border-black">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-[#FFDE59] border-2 border-black"></div>
                      <span className="text-sm font-bold">Principal</span>
                    </div>
                    <span className="font-bold">{formatCurrency(originalDisbursedValue)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white border-2 border-black">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-[#FF6B6B] border-2 border-black"></div>
                      <span className="text-sm font-bold">Interest</span>
                    </div>
                    <span className="font-bold">{formatCurrency(results.totalInterest)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Toggle */}
            <div>
              <Tooltip content="View year-by-year breakdown of principal and interest payments" className="w-full">
                <Button
                  onClick={() => setShowSchedule(!showSchedule)}
                  variant="outline"
                  className="w-full flex justify-center items-center gap-2"
                >
                  <TableIcon className="w-5 h-5" />
                  {showSchedule ? 'Hide Schedule' : 'Show Amortization Schedule'}
                </Button>
              </Tooltip>

              {showSchedule && (
                <div className="mt-4 border-4 border-black p-4 bg-white">
                  <div className="flex flex-col md:flex-row gap-4 mb-4 justify-end">
                    <Tooltip content="Download full report including summary and schedule in PDF">
                      <Button
                        variant="secondary"
                        onClick={() => downloadPDF({
                          inputs: { loanAmount, interestRate, repaymentTenure, courseDuration, gracePeriod },
                          results,
                          schedule
                        })}
                        className="w-full md:w-auto text-sm"
                      >
                        Download PDF Report
                      </Button>
                    </Tooltip>
                    <Tooltip content="Download full report including summary and schedule in Excel">
                      <Button
                        variant="primary"
                        onClick={() => downloadExcel({
                          inputs: { loanAmount, interestRate, repaymentTenure, courseDuration, gracePeriod },
                          results,
                          schedule
                        })}
                        className="w-full md:w-auto text-sm"
                      >
                        Download Excel Report
                      </Button>
                    </Tooltip>
                  </div>

                  <div className="overflow-x-auto border-4 border-black">
                    <table className="w-full text-sm text-left bg-white">
                      <thead className="text-xs uppercase bg-black text-white">
                        <tr>
                          <th className="px-4 py-3">Year</th>
                          <th className="px-4 py-3">Principal</th>
                          <th className="px-4 py-3">Interest</th>
                          <th className="px-4 py-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-gray-200">
                        {schedule.map((row) => (
                          <tr key={row.year} className="hover:bg-yellow-50">
                            <td className="px-4 py-3 font-bold">{row.label}</td>
                            <td className="px-4 py-3 text-green-600 font-mono">{formatCurrency(row.principal)}</td>
                            <td className="px-4 py-3 text-red-600 font-mono">{formatCurrency(row.interest)}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold">{formatCurrency(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> These calculations are estimates for planning purposes only.
          <br className="md:hidden" />
          Please consult your financial institution for exact figures and terms.
        </p>
      </Footer>
    </div>
  );
}