import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, IndianRupee, Clock, ArrowLeft, Car, Coffee, Heart, AlertTriangle, FileText, Table, Scissors, Wind, Calendar, Palmtree, Percent } from 'lucide-react';
import { Button, Card, Input, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout } from '@packages/styling';
import SEO from './SEO';
import { calculateTrueHourlyWage } from '../lib/trueHourlyLogic';

export default function TrueHourlyWageCalculator() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": "True Hourly Wage Calculator",
        "description": "Calculate your real hourly wage after accounting for unpaid overtime, commute, and work-related expenses.",
        "brand": { "@type": "Brand", "name": "Calculators Hub" }
    };

    // --- INPUTS ---
    const [annualGrossSalary, setAnnualGross] = useState(1200000); // 12 LPA default
    const [annualBonus, setBonus] = useState(0);
    const [taxRate, setTaxRate] = useState(20);

    const [workingDaysPerWeek, setWorkingDays] = useState(5);
    const [vacationWeeksPerYear, setVacationWeeks] = useState(2);
    const [standardHoursPerWeek, setStandardHours] = useState(40);

    // Time Leaks
    const [commuteOneWayMinutes, setCommuteMinutes] = useState(45);
    const [groomingMinutesDaily, setGroomingMinutes] = useState(20);
    const [decompressionMinutesDaily, setDecompressionMinutes] = useState(30);
    const [unpaidOvertimeHoursPerWeek, setUnpaidOvertime] = useState(2);

    // Money Leaks
    const [commuteDailyCost, setCommuteCost] = useState(100);
    const [monthlyConvenienceRen, setConvenienceCost] = useState(2000); // Takeout etc
    const [monthlyHealthren, setHealthCost] = useState(1000); // Physio/Therapy

    // --- RESULTS ---
    const [results, setResults] = useState(null);

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
                structuredData={structuredData}
            />

            <CalculatorLayout>
                <div className="lg:col-span-12">
                    <CalculatorHeader
                        icon={Briefcase}
                        title="True Hourly Wage"
                    />
                </div>

                {/* INPUTS COLUMN */}
                <div className="lg:col-span-5 space-y-6">

                    {/* 1. INCOME */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-blue-100 p-4 border-b-4 border-black">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                                <IndianRupee className="w-5 h-5" /> Base Income
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase mb-1 block">Annual Gross Salary</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                    <Input type="number" value={annualGrossSalary} onChange={e => setAnnualGross(e.target.value)} className="pl-8 font-black w-full" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block">Yearly Bonus</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input type="number" value={annualBonus} onChange={e => setBonus(e.target.value)} className="pl-8 font-black w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block">Tax Rate (%)</label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="pl-8 font-black w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 2. TIME LEAKS */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-orange-100 p-4 border-b-4 border-black">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                                <Clock className="w-5 h-5" /> Time Leaks
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block">Commute (One Way)</label>
                                    <div className="relative">
                                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input type="number" value={commuteOneWayMinutes} onChange={e => setCommuteMinutes(e.target.value)} className="pl-8 font-black w-full" placeholder="Mins" />
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-bold uppercase">Minutes per trip</span>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block">Unpaid Overtime</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input type="number" value={unpaidOvertimeHoursPerWeek} onChange={e => setUnpaidOvertime(e.target.value)} className="pl-8 font-black w-full" placeholder="Hrs" />
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-bold uppercase">Hours per week</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block">Grooming/Prep</label>
                                    <div className="relative">
                                        <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input type="number" value={groomingMinutesDaily} onChange={e => setGroomingMinutes(e.target.value)} className="pl-8 font-black w-full" placeholder="Mins/day" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block">Decompression</label>
                                    <div className="relative">
                                        <Wind className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input type="number" value={decompressionMinutesDaily} onChange={e => setDecompressionMinutes(e.target.value)} className="pl-8 font-black w-full" placeholder="Mins/day" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-t-2 border-black/10 pt-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase block">Week Days</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input type="number" value={workingDaysPerWeek} onChange={e => setWorkingDays(e.target.value)} className="pl-7 h-8 font-black text-sm w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase block">Std Hours</label>
                                    <div className="relative">
                                        <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input type="number" value={standardHoursPerWeek} onChange={e => setStandardHours(e.target.value)} className="pl-7 h-8 font-black text-sm w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase block">Vacation Wks</label>
                                    <div className="relative">
                                        <Palmtree className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input type="number" value={vacationWeeksPerYear} onChange={e => setVacationWeeks(e.target.value)} className="pl-7 h-8 font-black text-sm w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 3. MONEY LEAKS */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-red-100 p-4 border-b-4 border-black">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                                <AlertTriangle className="w-5 h-5" /> Money Leaks (Post-Tax)
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase mb-1 block">Daily Commute Cost</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                    <Input type="number" value={commuteDailyCost} onChange={e => setCommuteCost(e.target.value)} className="pl-8 font-black w-full" />
                                </div>
                                <span className="text-[9px] text-gray-500 font-bold uppercase">Gas, Train, Parking</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block">Convenience Tax</label>
                                    <div className="relative">
                                        <Coffee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input type="number" value={monthlyConvenienceRen} onChange={e => setConvenienceCost(e.target.value)} className="pl-8 font-black w-full" />
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-bold uppercase">Per Month (Takeout, Maid)</span>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block">Health/Sanity</label>
                                    <div className="relative">
                                        <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input type="number" value={monthlyHealthren} onChange={e => setHealthCost(e.target.value)} className="pl-8 font-black w-full" />
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-bold uppercase">Per Month (Therapy, Physio)</span>
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
                                <Card className="p-4 border-4 border-black bg-gray-50 flex flex-col justify-between h-full">
                                    <p className="text-[10px] font-black uppercase text-gray-500">The Lie</p>
                                    <h3 className="text-xl font-bold uppercase">Nominal Hourly</h3>
                                    <div className="my-4">
                                        <p className="text-3xl font-black text-gray-400 line-through decoration-2 decoration-red-500">{formatCurrency(results.rates.nominalHourly)}</p>
                                        <p className="text-xs font-bold text-gray-400 mt-1">Based on Gross / {results.time.standardHours}h</p>
                                    </div>
                                </Card>

                                {/* REAL RATE */}
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="h-full"
                                >
                                    <Card className="p-4 border-4 border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-full">
                                        <p className="text-[10px] font-black uppercase text-black">The Truth</p>
                                        <h3 className="text-xl font-bold uppercase">True Hourly</h3>
                                        <div className="my-4">
                                            <p className="text-5xl font-black text-black">{formatCurrency(results.rates.trueHourly)}</p>
                                            <p className="text-xs font-bold text-black mt-1">Net Income / {results.time.totalHours}h Real</p>
                                        </div>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* WATERFALL / BREAKDOWN */}
                            <Card className="p-0 border-4 border-black">
                                <div className="bg-black text-white p-4 border-b-4 border-black">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <FileText className="w-5 h-5" /> The Audit
                                    </h2>
                                </div>
                                <div className="p-6">
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
                                <Tooltip content="Download PDF report" className="w-full">
                                    <Button variant="secondary" onClick={() => checkExports('pdf')} className="w-full text-sm font-bold flex items-center justify-center gap-2 border-2 border-black">
                                        <FileText className="w-4 h-4" /> Download PDF Report
                                    </Button>
                                </Tooltip>
                                <Tooltip content="Download Excel report" className="w-full">
                                    <Button variant="primary" onClick={() => checkExports('excel')} className="w-full text-sm font-bold flex items-center justify-center gap-2 border-2 border-black">
                                        <Table className="w-4 h-4" /> Download Spreadsheet
                                    </Button>
                                </Tooltip>
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
        </div>
    );
}
