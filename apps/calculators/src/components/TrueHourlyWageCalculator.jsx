import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, IndianRupee, Clock, ArrowLeft, Car, Coffee, Heart, AlertTriangle, FileText, Table, Scissors, Wind, Calendar, Palmtree, Percent } from 'lucide-react';
import { Button, Card, Input, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, DownloadButtons, Footer, MetricDisplay } from '@packages/styling';
import SEO from './SEO';
import { calculateTrueHourlyWage } from '../lib/trueHourlyLogic';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import { usePersistedState, resetPersistedState } from '@packages/components';

export default function TrueHourlyWageCalculator() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": "True Hourly Wage Calculator",
        "description": "Calculate your real hourly wage after accounting for unpaid overtime, commute, and work-related expenses.",
        "brand": { "@type": "Brand", "name": "Calculators Hub" }
    };

    // --- INPUTS ---
    const [annualGrossSalary, setAnnualGross] = usePersistedState('TrueHourlyWageCalculator', 'annualGrossSalary', 1200000); // 12 LPA default
    const [annualBonus, setBonus] = usePersistedState('TrueHourlyWageCalculator', 'annualBonus', 0);
    const [taxRate, setTaxRate] = usePersistedState('TrueHourlyWageCalculator', 'taxRate', 20);

    const [workingDaysPerWeek, setWorkingDays] = usePersistedState('TrueHourlyWageCalculator', 'workingDaysPerWeek', 5);
    const [vacationWeeksPerYear, setVacationWeeks] = usePersistedState('TrueHourlyWageCalculator', 'vacationWeeksPerYear', 2);
    const [standardHoursPerWeek, setStandardHours] = usePersistedState('TrueHourlyWageCalculator', 'standardHoursPerWeek', 40);

    // Time Leaks
    const [commuteOneWayMinutes, setCommuteMinutes] = usePersistedState('TrueHourlyWageCalculator', 'commuteOneWayMinutes', 45);
    const [groomingMinutesDaily, setGroomingMinutes] = usePersistedState('TrueHourlyWageCalculator', 'groomingMinutesDaily', 20);
    const [decompressionMinutesDaily, setDecompressionMinutes] = usePersistedState('TrueHourlyWageCalculator', 'decompressionMinutesDaily', 30);
    const [unpaidOvertimeHoursPerWeek, setUnpaidOvertime] = usePersistedState('TrueHourlyWageCalculator', 'unpaidOvertimeHoursPerWeek', 2);

    // Money Leaks
    const [commuteDailyCost, setCommuteCost] = usePersistedState('TrueHourlyWageCalculator', 'commuteDailyCost', 100);
    const [monthlyConvenienceRen, setConvenienceCost] = usePersistedState('TrueHourlyWageCalculator', 'monthlyConvenienceRen', 2000); // Takeout etc
    const [monthlyHealthren, setHealthCost] = usePersistedState('TrueHourlyWageCalculator', 'monthlyHealthren', 1000); // Physio/Therapy

    // --- RESULTS ---
    const [results, setResults] = usePersistedState('TrueHourlyWageCalculator', 'results', null);

    const calculate = useCallback(() => {
        const res = calculateTrueHourlyWage({
            annualGrossSalary,
            annualBonus,
            taxRate,
            workingDaysPerWeek,
            vacationWeeksPerYear,
            standardHoursPerWeek,
            commuteOneWayMinutes,
            groomingMinutesDaily,
            decompressionMinutesDaily,
            commuteDailyCost,
            monthlyConvenienceRen,
            monthlyHealthren,
            unpaidOvertimeHoursPerWeek
        });
        setResults(res);
    }, [annualGrossSalary, annualBonus, taxRate, workingDaysPerWeek, vacationWeeksPerYear, standardHoursPerWeek, commuteOneWayMinutes, groomingMinutesDaily, decompressionMinutesDaily, unpaidOvertimeHoursPerWeek, commuteDailyCost, monthlyConvenienceRen, monthlyHealthren]);

    useEffect(() => {
        calculate();
    }, [calculate]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    const checkExports = (type) => {
        if (!results) return;

        // Prepare data for export
        const data = {
            inputs: {
                annualGrossSalary, taxRate, standardHoursPerWeek,
                commuteOneWayMinutes, commuteDailyCost,
                monthlyConvenienceRen, monthlyHealthren
            },
            results: {
                ...results.financials,
                ...results.rates,
                ...results.time,
                ...results.leaks
            },
            // Dummy schedule for compatibility if needed, or custom handling in downloadUtils
            schedule: []
        };

        if (type === 'pdf') {
            downloadPDF(data, 'True Hourly Wage Report');
        } else {
            downloadExcel(data, 'True_Hourly_Wage_Report');
        }
    };

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8">
            <SEO
                title="True Hourly Wage Calculator"
                description="What do you really earn? Calculate your real profit per hour after accounting for commute, taxes, and work-related expenses."
                keywords="true hourly wage, real salary, commute cost, work life balance, net earnings per hour, employment overheads"
                canonical={`${import.meta.env.VITE_SITE_URL}/true-hourly-wage`}
                ogImage={`${import.meta.env.VITE_SITE_URL}/og/true_hourly_wage.png`}
                structuredData={structuredData}
            />

            <CalculatorLayout>
                <div className="lg:col-span-12">
                    <CalculatorHeader
                        icon={Briefcase}
                        title="True Hourly Wage"
                    
            onReset={() => { resetPersistedState('TrueHourlyWageCalculator'); window.location.reload(); }} />
                </div>

                {/* INPUTS COLUMN */}
                <div className="lg:col-span-5 space-y-6">

                    {/* 1. INCOME */}
                    <Card title="Base Income" icon={IndianRupee} headerColor="bg-blue-100">
                        <div className="space-y-4">
                            <div>
                                <Input label="Annual Gross Salary" id="annual-gross-salary" type="number" value={annualGrossSalary} onChange={e => setAnnualGross(e.target.value)} icon={IndianRupee} className="font-black w-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Input label="Yearly Bonus" id="annual-bonus" type="number" value={annualBonus} onChange={e => setBonus(e.target.value)} icon={IndianRupee} className="font-black w-full" />
                                </div>
                                <div>
                                    <Input label="Tax Rate (%)" id="tax-rate" type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} icon={Percent} className="font-black w-full" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 2. TIME LEAKS */}
                    <Card title="Time Leaks" icon={Clock} headerColor="bg-orange-100">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Input label="Commute (One Way)" id="commute-minutes" type="number" value={commuteOneWayMinutes} onChange={e => setCommuteMinutes(e.target.value)} icon={Car} placeholder="Mins" className="font-black w-full" />
                                    <span className="text-[9px] text-gray-500 font-bold uppercase block mt-1">Minutes per trip</span>
                                </div>
                                <div>
                                    <Input label="Unpaid Overtime" id="unpaid-overtime" type="number" value={unpaidOvertimeHoursPerWeek} onChange={e => setUnpaidOvertime(e.target.value)} icon={Clock} placeholder="Hrs" className="font-black w-full" />
                                    <span className="text-[9px] text-gray-500 font-bold uppercase block mt-1">Hours per week</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Input label="Grooming/Prep" id="grooming-minutes" type="number" value={groomingMinutesDaily} onChange={e => setGroomingMinutes(e.target.value)} icon={Scissors} placeholder="Mins/day" className="font-black w-full" />
                                </div>
                                <div>
                                    <Input label="Decompression" id="decompression-minutes" type="number" value={decompressionMinutesDaily} onChange={e => setDecompressionMinutes(e.target.value)} icon={Wind} placeholder="Mins/day" className="font-black w-full" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-t-2 border-black/10 pt-4">
                                <div>
                                    <Input label="Week Days" id="working-days" type="number" value={workingDaysPerWeek} onChange={e => setWorkingDays(e.target.value)} icon={Calendar} className="h-8 font-black text-sm w-full" />
                                </div>
                                <div>
                                    <Input label="Std Hours" id="standard-hours" type="number" value={standardHoursPerWeek} onChange={e => setStandardHours(e.target.value)} icon={Clock} className="h-8 font-black text-sm w-full" />
                                </div>
                                <div>
                                    <Input label="Vacation Wks" id="vacation-weeks" type="number" value={vacationWeeksPerYear} onChange={e => setVacationWeeks(e.target.value)} icon={Palmtree} className="h-8 font-black text-sm w-full" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 3. MONEY LEAKS */}
                    <Card title="Money Leaks (Post-Tax)" icon={AlertTriangle} headerColor="bg-red-100">
                        <div className="space-y-4">
                            <div>
                                <Input label="Daily Commute Cost" id="commute-cost" type="number" value={commuteDailyCost} onChange={e => setCommuteCost(e.target.value)} icon={IndianRupee} className="font-black w-full" />
                                <span className="text-[9px] text-gray-500 font-bold uppercase block mt-1">Gas, Train, Parking</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Input label="Convenience Tax" id="convenience-cost" type="number" value={monthlyConvenienceRen} onChange={e => setConvenienceCost(e.target.value)} icon={Coffee} className="font-black w-full" />
                                    <span className="text-[9px] text-gray-500 font-bold uppercase block mt-1">Per Month (Takeout, Maid)</span>
                                </div>
                                <div>
                                    <Input label="Health/Sanity" id="health-cost" type="number" value={monthlyHealthren} onChange={e => setHealthCost(e.target.value)} icon={Heart} className="font-black w-full" />
                                    <span className="text-[9px] text-gray-500 font-bold uppercase block mt-1">Per Month (Therapy, Physio)</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>


                {/* RESULTS COLUMN */}
                <div className="lg:col-span-7 space-y-6">
                    {results && (
                        <ResultsAnalysis>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* NOMINAL RATE */}
                                <Card className="p-4 border-4 border-black bg-gray-50 flex flex-col justify-between h-full" animate={false}>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-500">The Lie</p>
                                        <h3 className="text-xl font-bold uppercase">Nominal Hourly</h3>
                                    </div>
                                    <div className="my-4">
                                        <MetricDisplay 
                                            value={formatCurrency(results.rates.nominalHourly)}
                                            subtitle={`Based on Gross / ${results.time.standardHours}h`}
                                            color="text-gray-400 line-through decoration-2 decoration-red-500"
                                        />
                                    </div>
                                </Card>

                                {/* REAL RATE */}
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="h-full"
                                >
                                    <Card className="p-4 border-4 border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-full" animate={false}>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-black">The Truth</p>
                                            <h3 className="text-xl font-bold uppercase">True Hourly</h3>
                                        </div>
                                        <div className="my-4">
                                            <MetricDisplay 
                                                value={formatCurrency(results.rates.trueHourly)}
                                                subtitle={`Net Income / ${results.time.totalHours}h Real`}
                                                color="text-black"
                                            />
                                        </div>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* WATERFALL / BREAKDOWN */}
                            <Card title="The Audit" icon={FileText} headerColor="bg-black !text-white">
                                <div className="space-y-4">
                                    {/* VISUAL BAR CHART */}
                                    <div className="space-y-4 mb-8">
                                        <h4 className="text-xs font-black uppercase border-b-2 border-black pb-2 mb-4">Where the money goes</h4>
                                        <div className="space-y-2">
                                            {/* Gross */}
                                            <div className="group">
                                                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                                                    <span>Gross Income</span>
                                                    <span>{formatCurrency(results.financials.annualGross)}</span>
                                                </div>
                                                <div className="h-4 bg-gray-200 w-full relative border border-black">
                                                    <div className="absolute top-0 left-0 h-full bg-green-500 w-full"></div>
                                                </div>
                                            </div>

                                            {/* Deductions Visual */}
                                            <div className="flex gap-1 h-32 items-end mt-4 pl-4 border-l-2 border-black border-dashed">
                                                {/* Tax */}
                                                <div className="flex-1 flex flex-col items-center justify-end group">
                                                    <span className="text-[9px] font-bold -rotate-90 mb-2 whitespace-nowrap">Tax</span>
                                                    <div className="w-full bg-red-400 border border-black transition-all group-hover:bg-red-500" style={{ height: `${(results.financials.annualTax / results.financials.annualGross) * 100}%`, minHeight: '4px' }}></div>
                                                    <span className="text-[9px] font-bold mt-1">-{formatCurrency(results.financials.annualTax)}</span>
                                                </div>
                                                {/* Commute Money */}
                                                <div className="flex-1 flex flex-col items-center justify-end group">
                                                    <span className="text-[9px] font-bold -rotate-90 mb-2 whitespace-nowrap">Commute $</span>
                                                    <div className="w-full bg-orange-400 border border-black transition-all group-hover:bg-orange-500" style={{ height: `${(results.leaks.commuteCost / results.financials.annualGross) * 100}%`, minHeight: '4px' }}></div>
                                                    <span className="text-[9px] font-bold mt-1">-{formatCurrency(results.leaks.commuteCost)}</span>
                                                </div>
                                                {/* Life Cost */}
                                                <div className="flex-1 flex flex-col items-center justify-end group">
                                                    <span className="text-[9px] font-bold -rotate-90 mb-2 whitespace-nowrap">Life Tax</span>
                                                    <div className="w-full bg-yellow-400 border border-black transition-all group-hover:bg-yellow-500" style={{ height: `${((results.leaks.convenienceCost + results.leaks.healthCost) / results.financials.annualGross) * 100}%`, minHeight: '4px' }}></div>
                                                    <span className="text-[9px] font-bold mt-1">-{formatCurrency(results.leaks.convenienceCost + results.leaks.healthCost)}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t-2 border-black">
                                                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                                                    <span>Effective Net Income</span>
                                                    <span>{formatCurrency(results.financials.effectiveNet)}</span>
                                                </div>
                                                <div className="h-6 bg-green-600 w-full relative border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase border-b-2 border-black pb-2 mb-4">Where the time goes</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-blue-50 border-2 border-black">
                                                <span className="block text-[10px] font-bold uppercase text-gray-500">Standard Work</span>
                                                <span className="text-lg font-black">{results.time.standardHours} hrs</span>
                                            </div>
                                            <div className="p-3 bg-red-50 border-2 border-black">
                                                <span className="block text-[10px] font-bold uppercase text-red-500">Unpaid "Work"</span>
                                                <span className="text-lg font-black text-red-600">+{results.time.totalTimeLeaks} hrs</span>
                                                <div className="mt-1 text-[9px] font-bold text-gray-500 leading-tight">
                                                    Commute: {results.leaks.commuteHours}h<br />
                                                    Prep: {results.leaks.groomingHours}h<br />
                                                    Overtime: {results.leaks.unpaidOvertimeHours}h
                                                </div>
                                            </div>
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
                    )}
                </div>

            </CalculatorLayout>

            {/* REALIST'S NOTE */}
            <div className="mt-8 p-6 border-4 border-black bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-bold text-gray-800">
                    <strong className="text-black">Reality Check:</strong> If your True Hourly Wage is lower than your local fast-food rate, it might be time to discuss remote work or a raise.
                </p>
            </div>
        
      <Footer />
    </div>
    );
}
