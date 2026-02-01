import React, { useState, useEffect } from 'react';
import { Briefcase, IndianRupee, Clock, TrendingUp, TrendingDown, Info, AlertTriangle, ShieldCheck, Pickaxe } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout } from '@packages/styling';
import { calculateAlternateROI } from '../lib/alternateInvestmentLogic';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import SEO from './SEO';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlternateInvestmentCalculator() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": "Active vs Passive Investment Calculator",
        "description": "Calculate the true ROI of active investments like businesses or rentals by deducting the cost of your time and effort.",
        "brand": { "@type": "Brand", "name": "Calculators Hub" }
    };

    // --- INPUTS ---
    const [initialInvestment, setInitial] = useState(1000000);
    const [monthlyContribution, setMonthly] = useState(0);
    const [years, setYears] = useState(10);
    const [estReturnRate, setReturnRate] = useState(15);

    // --- REALITY CHECKS ---
    const [isActiveInvestment, setIsActive] = useState(false);
    const [activeHoursPerWeek, setHours] = useState(5);
    const [userHourlyRate, setHourlyRate] = useState(2500); // What is your time worth?

    // --- ADVANCED ---
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [taxRate, setTaxRate] = useState(10); // LTCG typical
    const [inflationRate, setInflationRate] = useState(6);
    const [benchmarkReturn, setBenchmarkReturn] = useState(12);
    const [marketScenario, setMarketScenario] = useState('normal'); // normal, bull, bear

    const [results, setResults] = useState(null);

    useEffect(() => {
        // Simple Scenario adjustment
        const scenarioAdjustment = marketScenario === 'bull' ? 5 : marketScenario === 'bear' ? -10 : 0;
        const adjustedReturn = (parseFloat(estReturnRate) || 0) + scenarioAdjustment;

        const res = calculateAlternateROI({
            initialInvestment: parseFloat(initialInvestment) || 0,
            monthlyContribution: parseFloat(monthlyContribution) || 0,
            years: parseFloat(years) || 1,
            estReturnRate: adjustedReturn,
            inflationRate: parseFloat(inflationRate) || 0,
            taxRate: parseFloat(taxRate) || 0,
            activeHoursPerWeek: isActiveInvestment ? (parseFloat(activeHoursPerWeek) || 0) : 0,
            userHourlyRate: parseFloat(userHourlyRate) || 0,
            benchmarkReturn: parseFloat(benchmarkReturn) || 0
        });
        setResults(res);
    }, [initialInvestment, monthlyContribution, years, estReturnRate, inflationRate, taxRate, isActiveInvestment, activeHoursPerWeek, userHourlyRate, benchmarkReturn]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8">
            <SEO
                title="Active vs Passive Investment ROI Calculator"
                description="Is that side business actually profitable? Calculate the true ROI by factoring in your time, taxes, and inflation."
                keywords="business roi calculator, opportunity cost calculator, time value of money, real estate roi, sweat equity"
                canonical={`${import.meta.env.VITE_SITE_URL}/alternate-investment`}
                ogImage={`${import.meta.env.VITE_SITE_URL}/og/alternate_investment.png`}
                structuredData={structuredData}
            />

            <CalculatorLayout>
                <div className="lg:col-span-12">
                    <CalculatorHeader
                        icon={Pickaxe}
                        title="The 'Sweat Equity' Truth"
                    />
                </div>

                <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-yellow-100 p-4 border-b-4 border-black">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                                <Briefcase className="w-5 h-5" /> Investment Details
                            </h2>
                        </div>
                        <div className="px-4 pt-4 flex flex-wrap gap-2 mb-2">
                            {[
                                { label: 'Lazy Fund', initial: 1000000, rate: 12, hours: 0, active: false, icon: ShieldCheck },
                                { label: 'Rental', initial: 5000000, rate: 10, hours: 2, active: true, icon: TrendingUp },
                                { label: 'Side Biz', initial: 500000, rate: 25, hours: 10, active: true, icon: Briefcase },
                                { label: 'Trading', initial: 1000000, rate: 20, hours: 20, active: true, icon: TrendingDown }
                            ].map((p) => (
                                <Button
                                    key={p.label}
                                    variant="outline"
                                    className="h-7 text-[8px] px-2 font-black border-2 flex items-center gap-1"
                                    onClick={() => {
                                        setInitial(p.initial);
                                        setReturnRate(p.rate);
                                        setHours(p.hours);
                                        setIsActive(p.active);
                                    }}
                                >
                                    <p.icon className="w-2 h-2" /> {p.label}
                                </Button>
                            ))}
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="initial-investment" className="text-[10px] font-black uppercase mb-1 block">Initial Capital</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input id="initial-investment" type="number" value={initialInvestment} onChange={e => setInitial(e.target.value)} className="pl-8 font-black w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="monthly-contribution" className="text-[10px] font-black uppercase mb-1 block">Monthly Add</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input id="monthly-contribution" type="number" value={monthlyContribution} onChange={e => setMonthly(e.target.value)} className="pl-8 font-black w-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="investment-years" className="text-[10px] font-black uppercase mb-1 block">Time Horizon (Yrs)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input id="investment-years" type="number" value={years} onChange={e => setYears(e.target.value)} className="pl-8 font-black w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="return-rate" className="text-[10px] font-black uppercase mb-1 block">Exp. Return (%)</label>
                                    <div className="relative">
                                        <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input id="return-rate" type="number" value={estReturnRate} onChange={e => setReturnRate(e.target.value)} className="pl-8 font-black w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t-4 border-black/10">
                            <Tooltip content="Toggle advanced settings for Tax and Inflation adjustments" className="w-full">
                                <Button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    variant="secondary"
                                    className="w-full"
                                >
                                    {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings (Tax & Inflation)'}
                                </Button>
                            </Tooltip>

                            <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden space-y-4 pt-4"
                                    >
                                        <div className="grid grid-cols-2 gap-4 p-4 border-2 border-yellow-200 bg-yellow-50 rounded dash-border">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <label htmlFor="tax-rate" className="text-[10px] font-black uppercase block">Tax on Gains (%)</label>
                                                    <Tooltip content="Capital Gains Tax deducted from the final profit.">
                                                        <Info className="w-3 h-3 text-gray-400" />
                                                    </Tooltip>
                                                </div>
                                                <Input id="tax-rate" type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="font-black w-full bg-white border-yellow-200 focus:border-yellow-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <label htmlFor="inflation-rate" className="text-[10px] font-black uppercase block">Inflation (%)</label>
                                                    <Tooltip content="Estimated annual loss of purchasing power (Standard ~6%).">
                                                        <Info className="w-3 h-3 text-gray-400" />
                                                    </Tooltip>
                                                </div>
                                                <Input id="inflation-rate" type="number" value={inflationRate} onChange={e => setInflationRate(e.target.value)} className="font-black w-full bg-white border-yellow-200 focus:border-yellow-500" />
                                            </div>
                                            <div className="col-span-2 border-t border-yellow-200 pt-3 mt-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <label htmlFor="benchmark-return" className="text-[10px] font-black uppercase block text-blue-800">Passive Benchmark Return (%)</label>
                                                    <Tooltip content="Expected annual return of your 'Lazy' alternative (e.g., NIFTY 50 Index Fund ~12%).">
                                                        <Info className="w-3 h-3 text-blue-400" />
                                                    </Tooltip>
                                                </div>
                                                <Input id="benchmark-return" type="number" value={benchmarkReturn} onChange={e => setBenchmarkReturn(e.target.value)} className="font-black w-full bg-white border-blue-200 focus:border-blue-500" />
                                            </div>
                                            <div className="col-span-2 border-t border-yellow-200 pt-3">
                                                <label className="text-[10px] font-black uppercase block mb-2">Market Climate Stress Test</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { id: 'bear', label: 'Bear (-10%)', color: 'bg-red-100 border-red-400 text-red-700' },
                                                        { id: 'normal', label: 'Normal', color: 'bg-white border-black text-black' },
                                                        { id: 'bull', label: 'Bull (+5%)', color: 'bg-green-100 border-green-400 text-green-700' }
                                                    ].map((s) => (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => setMarketScenario(s.id)}
                                                            className={`text-[9px] font-black py-2 px-1 border-2 transition-all ${marketScenario === s.id ? s.color + ' translate-y-[-2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                                        >
                                                            {s.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>

                    <Card className="p-0 border-4 border-black mt-6">
                        <div className="bg-red-50 p-4 border-b-4 border-black">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                                <Clock className="w-5 h-5 text-red-600" /> The "Active" Tax
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className={`p-3 border-2 rounded transition-colors ${isActiveInvestment ? 'bg-red-100 border-red-600' : 'bg-gray-50 border-gray-200'}`}>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <Checkbox checked={isActiveInvestment} onChange={e => setIsActive(e.target.checked)} className="mt-1" />
                                    <div>
                                        <span className={`text-sm font-black uppercase leading-tight block ${isActiveInvestment ? 'text-red-900' : 'text-gray-600'}`}>This is an Active Investment</span>
                                        <p className="text-[10px] mt-1 text-gray-600 leading-relaxed font-bold">
                                            (e.g., Running a business, Managing rental tenants, Day trading)
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <AnimatePresence>
                                {isActiveInvestment && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden space-y-4"
                                    >
                                        <div className="grid grid-cols-2 gap-4 p-4 border-2 border-red-200 bg-red-50 rounded dash-border">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <label htmlFor="active-hours" className="text-[10px] font-black uppercase text-red-800">Hours/Week</label>
                                                    <Tooltip content="Time you spend managing this investment (e.g., Calling tenants, bookkeeping, sales).">
                                                        <Info className="w-3 h-3 text-red-400" />
                                                    </Tooltip>
                                                </div>
                                                <Input id="active-hours" type="number" value={activeHoursPerWeek} onChange={e => setHours(e.target.value)} className="font-black w-full bg-white border-red-200 focus:border-red-900" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <label htmlFor="hourly-rate" className="text-[10px] font-black uppercase text-red-800">Your Hourly Value</label>
                                                    <Tooltip content="What is your time worth? Use your current salary hourly rate or freelance rate.">
                                                        <Info className="w-3 h-3 text-red-400" />
                                                    </Tooltip>
                                                </div>
                                                <Input id="hourly-rate" type="number" value={userHourlyRate} onChange={e => setHourlyRate(e.target.value)} className="font-black w-full bg-white border-red-200 focus:border-red-900" />
                                            </div>
                                            <div className="col-span-2 text-[10px] font-bold text-red-600">
                                                Cost of your time: {formatCurrency(activeHoursPerWeek * 52 * userHourlyRate)} / yr
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>
                </div>

                {results && (
                    <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                        <ResultsAnalysis
                            title="Return on Reality"
                            headerElements={<span className="text-xs font-black px-2 py-1 border-2 border-black bg-black text-white">{years} YEAR VIEW</span>}
                        >
                            {/* BIG REVEAL CARD */}
                            <div className={`p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center ${results.roi.truePassive < 0 ? 'bg-red-100' : 'bg-green-300'}`}>
                                <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-60">True Net Profit (Adjusted)</p>
                                <h3 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">
                                    {formatCurrency(results.netRealProfitAfterTime)}
                                </h3>
                                <div className={`text-sm font-bold uppercase py-1 px-3 rounded border-2 border-black inline-block ${results.roi.truePassive < 0 ? 'bg-red-200 text-red-900' : 'bg-white text-green-900'}`}>
                                    Real ROI: {results.roi.truePassive.toFixed(2)}%
                                </div>
                                {results.roi.truePassive < 0 && (
                                    <p className="mt-4 text-xs font-black text-red-600 max-w-sm">
                                        ⚠️ Your effort costs more than the asset earns. You assume more risk for less money than a job.
                                    </p>
                                )}
                            </div>

                            {/* PASSIVITY SCALE */}
                            <div className="border-4 border-black p-4 bg-white">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-[10px] font-black uppercase text-gray-500">Degree of Passivity</p>
                                    <p className="text-xl font-black">{Math.round(results.passivityScore)}%</p>
                                </div>
                                <div className="h-4 w-full bg-gray-100 border-2 border-black relative overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${results.passivityScore}%` }}
                                        className={`h-full border-r-2 border-black ${results.passivityScore > 80 ? 'bg-blue-400' : results.passivityScore > 40 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-[8px] font-black uppercase text-gray-400">
                                    <span>Job (40h+)</span>
                                    <span>Side Hustle</span>
                                    <span>Pure Passive</span>
                                </div>
                            </div>

                            {/* THREE LEVELS OF TRUTH */}
                            <div className="grid grid-cols-3 gap-2 md:gap-4">
                                <div className="p-3 border-2 border-dashed border-gray-300 rounded bg-gray-50 opacity-60">
                                    <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Level 1: The Lie</p>
                                    <p className="text-[10px] md:text-xs font-bold text-gray-800 uppercase">Nominal Value</p>
                                    <p className="text-lg font-black">{formatCurrency(results.nominalValue)}</p>
                                    <p className="text-[9px] text-green-600 font-bold">+{results.roi.nominal.toFixed(1)}%</p>
                                </div>

                                <div className="p-3 border-2 border-black rounded bg-white relative">
                                    <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Level 2: The Accountant</p>
                                    <p className="text-[10px] md:text-xs font-bold text-gray-800 uppercase">After Tax & Inflation</p>
                                    <p className="text-lg font-black">{formatCurrency(results.realValue)}</p>
                                    <p className="text-[9px] text-yellow-600 font-bold">+{results.roi.real.toFixed(1)}%</p>
                                    {/* Visual Connector Line */}
                                    <div className="absolute top-1/2 -left-3 w-3 h-[2px] bg-black hidden md:block"></div>
                                </div>

                                <div className={`p-3 border-4 border-black rounded relative ${results.roi.truePassive < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                                    <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Level 3: The Reality</p>
                                    <p className="text-[10px] md:text-xs font-bold text-gray-800 uppercase">After Effort</p>
                                    <p className="text-lg font-black">{formatCurrency(results.netRealProfitAfterTime + results.totalInvested)}</p>
                                    <p className={`text-[9px] font-bold ${results.roi.truePassive < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {results.roi.truePassive.toFixed(1)}%
                                    </p>
                                    <div className="absolute top-1/2 -left-3 w-3 h-[2px] bg-black hidden md:block"></div>
                                </div>
                            </div>

                            {/* SWEAT EQUITY VISUALIZER */}
                            {isActiveInvestment && (
                                <div className="border-4 border-black bg-red-50 p-6">
                                    <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-4 text-red-900">
                                        <TrendingDown className="w-5 h-5" /> The Sweat Equity Bill
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b-2 border-red-200 pb-2">
                                            <span className="text-xs font-bold uppercase text-red-800">Total Hours Invested</span>
                                            <span className="text-lg font-black text-black">{Math.round(results.totalHours)} Hours</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b-2 border-red-200 pb-2">
                                            <span className="text-xs font-bold uppercase text-red-800">Opportunity Cost</span>
                                            <span className="text-lg font-black text-red-600">-{formatCurrency(results.totalTimeCost)}</span>
                                        </div>
                                        <div className="bg-white p-4 border-2 border-red-900 mt-4 rounded">
                                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Effective Hourly Wage from Profit</p>
                                            <p className="text-3xl font-black text-black tracking-tight">{formatCurrency(results.effectiveHourlyWage)} / hr</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                (vs your standard value of <strong>{formatCurrency(userHourlyRate)}</strong>/hr)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MARKET COMPARISON (NIFTY 50) */}
                            <div className={`border-4 border-black p-6 ${results.benchmark.isBeatingMarket ? 'bg-green-100' : 'bg-orange-100'}`}>
                                <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-4 text-black">
                                    <TrendingUp className="w-5 h-5" /> Hustle vs. The Market (NIFTY 50)
                                </h3>

                                <div className="mb-4">
                                    <p className="text-sm font-bold uppercase mb-1">The Verdict</p>
                                    <h4 className={`text-2xl md:text-3xl font-black ${results.benchmark.isBeatingMarket ? 'text-green-800' : 'text-orange-900'}`}>
                                        {results.benchmark.isBeatingMarket ? '🏆 You Beat the Index' : '📉 Underperforming Passive Index'}
                                    </h4>
                                    <p className="text-xs font-bold mt-2 opacity-80">
                                        {results.benchmark.isBeatingMarket
                                            ? `Your hard work generated ${formatCurrency(results.benchmark.alpha)} MORE than a lazy NIFTY 50 fund.`
                                            : `You would have made ${formatCurrency(Math.abs(results.benchmark.alpha))} MORE by just investing in NIFTY 50 (12%) and doing nothing.`}
                                    </p>
                                </div>

                                <div className="space-y-3 bg-white border-2 border-black p-4 rounded">
                                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-500">Your Active Investment</p>
                                            <p className="text-base font-black">{formatCurrency(results.netRealProfitAfterTime + results.totalInvested)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-gray-500">Real ROI</p>
                                            <p className={`text-sm font-black ${results.roi.truePassive < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {results.roi.truePassive.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-1">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-500">Lazy Market ({benchmarkReturn}%)</p>
                                            <p className="text-base font-black">{formatCurrency(results.benchmark.realValue)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-gray-500">Benchmark ROI</p>
                                            <p className="text-sm font-black text-blue-600">
                                                {((results.benchmark.realProfit / results.totalInvested) * 100).toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BREAKDOWN TABLE */}
                            <div className="border-4 border-black bg-white p-4">
                                <h3 className="text-sm font-black uppercase mb-4">The Drains on Wealth</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-500">Gross Nominal Profit</span>
                                        <span>{formatCurrency(results.grossProfit)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-red-600">
                                        <span>Tax Drag ({taxRate}%)</span>
                                        <span>-{formatCurrency(results.taxAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-orange-600">
                                        <span>Inflation Loss ({inflationRate}%)</span>
                                        <span>-{formatCurrency(results.postTaxValue - results.realValue)}</span>
                                    </div>
                                    {isActiveInvestment && (
                                        <div className="flex justify-between text-xs font-bold text-red-800 border-t-2 border-dashed border-gray-200 pt-2 mt-2">
                                            <span>Effort Cost</span>
                                            <span>-{formatCurrency(results.totalTimeCost)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col md:flex-row gap-4 justify-end border-t-4 border-black pt-6">
                                <Tooltip content="Download full report including summary in PDF">
                                    <Button
                                        onClick={() => downloadPDF({
                                            inputs: { initialInvestment, monthlyContribution, years, estReturnRate: estReturnRate, inflationRate, taxRate, isActiveInvestment, activeHoursPerWeek, userHourlyRate, benchmarkReturn },
                                            results
                                        })}
                                        variant="secondary"
                                        className="w-full md:w-auto text-sm"
                                    >
                                        Download PDF Report
                                    </Button>
                                </Tooltip>
                                <Tooltip content="Download full report including summary in Excel">
                                    <Button
                                        onClick={() => downloadExcel({
                                            inputs: { initialInvestment, monthlyContribution, years, estReturnRate: estReturnRate, inflationRate, taxRate, isActiveInvestment, activeHoursPerWeek, userHourlyRate, benchmarkReturn },
                                            results,
                                            schedule: []
                                        })}
                                        variant="primary"
                                        className="w-full md:w-auto text-sm"
                                    >
                                        Download Excel Report
                                    </Button>
                                </Tooltip>
                            </div>

                        </ResultsAnalysis>
                    </div>
                )}
            </CalculatorLayout >
        </div >
    );
}
