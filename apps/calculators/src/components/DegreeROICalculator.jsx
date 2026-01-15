import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, TrendingUp, AlertTriangle, Briefcase, Calculator, IndianRupee, Percent, Calendar, XCircle, CheckCircle, Info } from 'lucide-react';
import { Button, Card, Input, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout } from '@packages/styling';
import { motion } from 'framer-motion';
import { calculateDegreeROI } from '../lib/degreeROILogic';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import Footer from './Footer';
import SEO from './SEO';

const NeoLineChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const width = 600;
    const height = 300;
    const padding = 40;

    // Find Min/Max Y
    const allValues = data.flatMap(d => [d.degreeNetWorth, d.altNetWorth]);
    const minY = Math.min(...allValues, 0); // Always include 0
    const maxY = Math.max(...allValues, 0);

    // Scale functions
    const getX = (index) => padding + (index / (data.length - 1)) * (width - 2 * padding);
    const getY = (value) => height - padding - ((value - minY) / (maxY - minY)) * (height - 2 * padding);

    // Generate Paths
    const degreePath = data.map((d, i) => `${getX(i)},${getY(d.degreeNetWorth)}`).join(' ');
    const altPath = data.map((d, i) => `${getX(i)},${getY(d.altNetWorth)}`).join(' ');
    const zeroLineY = getY(0);

    return (
        <div className="w-full overflow-hidden border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Grid / Axes */}
                <line x1={padding} y1={zeroLineY} x2={width - padding} y2={zeroLineY} stroke="#000" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#000" strokeWidth="2" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#000" strokeWidth="2" />

                {/* Legend / Zeroline Text */}
                <text x={width - padding} y={zeroLineY - 5} textAnchor="end" fontSize="10" fontWeight="bold">0</text>
                <text x={padding + 5} y={padding + 10} fontSize="10" fontWeight="bold">Net Worth</text>

                {/* Lines */}
                <polyline points={altPath} fill="none" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={degreePath} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                {/* Dots for endpoints */}
                <circle cx={getX(data.length - 1)} cy={getY(data[data.length - 1].altNetWorth)} r="4" fill="#16a34a" stroke="black" strokeWidth="2" />
                <circle cx={getX(data.length - 1)} cy={getY(data[data.length - 1].degreeNetWorth)} r="4" fill="#2563eb" stroke="black" strokeWidth="2" />
            </svg>
            <div className="flex justify-center gap-6 p-2 bg-gray-50 border-t-4 border-black text-xs font-black uppercase">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 border-2 border-black"></div> Degree Path
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 border-2 border-black"></div> Alt Path
                </div>
            </div>
        </div>
    );
};

export default function DegreeROICalculator() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": "Degree ROI Calculator",
        "description": "Calculate the Return on Investment of your college degree compared to starting work immediately.",
        "brand": { "@type": "Brand", "name": "Calculators Hub" },
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    };

    // --- INPUTS ---
    // Costs
    const [tuitionPerYear, setTuition] = useState(25000);
    const [livingExpenses, setLiving] = useState(12000);
    const [durationYears, setDuration] = useState(4);
    const [grantsTotal, setGrants] = useState(5000);

    // Loans
    const [loanInterestRate, setLoanRate] = useState(7.0);
    const [loanTermYears, setLoanTerm] = useState(10);

    // Career - Degree
    const [startingSalaryDegree, setStartSalary] = useState(55000);
    const [salaryGrowthDegree, setGrowthDegree] = useState(5);

    // Career - Alt
    const [startingSalaryAlt, setStartSalaryAlt] = useState(30000);
    const [salaryGrowthAlt, setGrowthAlt] = useState(3);

    // Computed State
    const [results, setResults] = useState(null);
    const [schedule, setSchedule] = useState([]);

    // Calculate Handler
    const calculate = useCallback(() => {
        const output = calculateDegreeROI({
            tuitionPerYear,
            livingExpensesPerYear: livingExpenses,
            durationYears,
            costInflation: 5, // Default locked
            grantsTotal,
            loanInterestRate,
            loanTermYears,
            startingSalaryDegree,
            salaryGrowthDegree,
            startingSalaryAlt,
            salaryGrowthAlt,
            taxRate: 20,
            investmentReturn: 7,
            generalInflation: 4
        });
        setResults(output.results);
        setSchedule(output.schedule);
    }, [tuitionPerYear, livingExpenses, durationYears, grantsTotal, loanInterestRate, loanTermYears, startingSalaryDegree, salaryGrowthDegree, startingSalaryAlt, salaryGrowthAlt]);

    // Initial Calc
    useEffect(() => {
        calculate();
    }, [calculate]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8">
            <SEO
                title="Degree ROI Analyzer"
                description="Is college worth it? Compare the long-term ROI of a degree vs entering the workforce effectively."
                keywords="degree roi, education return on investment, college value, degree vs work, cost of education, study investment"
                canonical={`${import.meta.env.VITE_SITE_URL}/degree-roi`}
                structuredData={structuredData}
            />

            <CalculatorLayout>
                <div className="lg:col-span-12">
                    <CalculatorHeader
                        icon={GraduationCap}
                        title="Degree ROI Analyzer"
                    />
                </div>

                {/* Left: Inputs */}
                <div className="lg:col-span-5 space-y-6">
                    {/* COST CARD */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-red-50 p-4 border-b-4 border-black">
                            <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
                                <IndianRupee className="w-5 h-5 text-red-600" /> The Cost
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="tuition" className="text-[10px] font-black uppercase mb-1 block">Tuition / Yr</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input id="tuition" type="number" value={tuitionPerYear} onChange={e => setTuition(e.target.value)} className="font-black pl-9" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="living" className="text-[10px] font-black uppercase mb-1 block">Living / Yr</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input id="living" type="number" value={livingExpenses} onChange={e => setLiving(e.target.value)} className="font-black pl-9" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="grants" className="text-[10px] font-black uppercase mb-1 block text-green-700">Grants / Yr</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-green-700 z-10" />
                                        <Input id="grants" type="number" value={grantsTotal} onChange={e => setGrants(e.target.value)} className="font-black pl-9 border-green-700 text-green-700" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="duration" className="text-[10px] font-black uppercase mb-1 block">Years</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input id="duration" type="number" value={durationYears} onChange={e => setDuration(e.target.value)} className="font-black pl-9" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-dashed border-gray-300">
                                <div>
                                    <label htmlFor="loanRate" className="text-[10px] font-black uppercase mb-1 block text-red-700">Loan Rate (%)</label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-red-700 z-10" />
                                        <Input id="loanRate" type="number" value={loanInterestRate} onChange={e => setLoanRate(e.target.value)} className="font-black pl-9 border-red-700 text-red-700" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="loanTerm" className="text-[10px] font-black uppercase mb-1 block">Term (Yrs)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                        <Input id="loanTerm" type="number" value={loanTermYears} onChange={e => setLoanTerm(e.target.value)} className="font-black pl-9" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* CAREER CARD */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-blue-50 p-4 border-b-4 border-black">
                            <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
                                <Briefcase className="w-5 h-5 text-blue-600" /> The Future
                            </h2>
                        </div>
                        <div className="p-4 space-y-6">
                            {/* Degree Path */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase bg-blue-600 text-white px-2 py-1">With Degree</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startSalaryDegree" className="text-[9px] font-bold text-gray-500 uppercase">Start Salary</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                            <Input id="startSalaryDegree" type="number" value={startingSalaryDegree} onChange={e => setStartSalary(e.target.value)} className="font-black pl-9" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="growthDegree" className="text-[9px] font-bold text-gray-500 uppercase">Growth %</label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                            <Input id="growthDegree" type="number" value={salaryGrowthDegree} onChange={e => setGrowthDegree(e.target.value)} className="font-black pl-9" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alt Path */}
                            <div className="space-y-2 pt-2 border-t-2 border-black">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase bg-green-600 text-white px-2 py-1">Alternative (No Degree)</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startSalaryAlt" className="text-[9px] font-bold text-gray-500 uppercase">Start Salary</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                            <Input id="startSalaryAlt" type="number" value={startingSalaryAlt} onChange={e => setStartSalaryAlt(e.target.value)} className="font-black pl-9" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="growthAlt" className="text-[9px] font-bold text-gray-500 uppercase">Growth %</label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                            <Input id="growthAlt" type="number" value={salaryGrowthAlt} onChange={e => setGrowthAlt(e.target.value)} className="font-black pl-9" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Results */}
                <div className="lg:col-span-7 space-y-6">
                    {results && (
                        <ResultsAnalysis>
                            {/* HERO STATS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="p-4 border-4 border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-full">
                                    <div>
                                        <p className="text-xs font-black uppercase text-black mb-1">Break-Even Age</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-black">
                                                {results.breakEvenYear ? (18 + parseInt(durationYears) + (results.breakEvenYear - parseInt(durationYears))) : "NEVER"}
                                            </span>
                                            <span className="text-sm font-bold text-black opacity-70">Years Old</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold mt-2 leading-tight text-black">
                                        {results.breakEvenYear ? "The age when your Degree Net Worth overtakes the Alternative." : "With these inputs, you never catch up to the alternative path."}
                                    </p>
                                </Card>

                                <Card className={`p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-full ${results.slaveRatio > 15 ? 'bg-[#FF4D4D]' : 'bg-white'}`}>
                                    <div>
                                        <p className="text-xs font-black uppercase text-black opacity-60 mb-1">Loan Burden (SLC)</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-4xl font-black text-black">
                                                {results.slaveRatio > 500 ? 'LETHAL' : `${Math.round(results.slaveRatio)}%`}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold mt-2 leading-tight text-black">
                                        {results.slaveRatio > 15
                                            ? "CRITICAL: High debt burden relative to entry-level pay."
                                            : "Manageable debt range relative to projected salary."}
                                    </p>
                                </Card>
                            </div>

                            {/* CHART */}
                            <div className="border-4 border-black p-4 bg-gray-50">
                                <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> 20-Year Net Worth Projection
                                </h3>
                                <NeoLineChart data={schedule} />
                            </div>

                            {/* EXPORT BUTTONS */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <Button className="flex-1 border-2 border-black" variant="secondary" onClick={() => downloadPDF({
                                    results,
                                    schedule,
                                    inputs: {
                                        tuitionPerYear,
                                        livingExpensesPerYear: livingExpenses,
                                        durationYears,
                                        grantsTotal,
                                        startingSalaryDegree,
                                        salaryGrowthDegree,
                                        startingSalaryAlt,
                                        salaryGrowthAlt
                                    }
                                })}>
                                    Download Analysis (PDF)
                                </Button>
                                <Button className="flex-1 border-2 border-black" variant="primary" onClick={() => downloadExcel({
                                    results,
                                    schedule,
                                    inputs: {
                                        tuitionPerYear,
                                        livingExpensesPerYear: livingExpenses,
                                        durationYears,
                                        grantsTotal,
                                        startingSalaryDegree,
                                        salaryGrowthDegree,
                                        startingSalaryAlt,
                                        salaryGrowthAlt
                                    }
                                })}>
                                    Download Spreadsheet (Excel)
                                </Button>
                            </div>
                        </ResultsAnalysis>
                    )}
                </div>
            </CalculatorLayout>
            <Footer />
        </div>
    );
}
