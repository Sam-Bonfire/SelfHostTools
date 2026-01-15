
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, Home, Hammer, AlertTriangle, Calendar, TrendingUp, DollarSign, ArrowLeft, Trash2, Plus, AlertOctagon, Info, Percent, Currency, Table as TableIcon } from 'lucide-react';
import { Button, Card, Input, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateHomeOwnerRealism, generateTimelineEvents } from '../lib/homeOwnerLogic';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import Footer from './Footer';
import SEO from './SEO';

export default function HomeOwnerRealistCalculator() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": "Home Owner Realist Calculator",
        "description": "Calculate the TRUE cost of home ownership including maintenance sinking funds and opportunity costs.",
        "brand": {
            "@type": "Brand",
            "name": "SelfHostTools"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
        }
    };

    // --- Inputs ---
    const [propertyPrice, setPropertyPrice] = useState(5000000); // 50L
    const [downPayment, setDownPayment] = useState(1000000); // 10L
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTerm, setLoanTerm] = useState(20);
    const [opportunityCostRate, setOpportunityCostRate] = useState(10); // Market return
    const [appreciationRate, setAppreciationRate] = useState(3);
    const [maintenanceInflation, setMaintenanceInflation] = useState(7); // Default maintenance inflation rate

    // --- Audit Items (The Bomb List) ---
    const [auditItems, setAuditItems] = useState([
        { id: 1, name: 'Roof / Waterproofing', replacementCost: 150000, lifespanYears: 15, currentAgeYears: 10 },
        { id: 2, name: 'HVAC / AC Units', replacementCost: 120000, lifespanYears: 10, currentAgeYears: 5 },
        { id: 3, name: 'Painting (Exterior)', replacementCost: 80000, lifespanYears: 5, currentAgeYears: 3 },
        { id: 4, name: 'Plumbing Overhaul', replacementCost: 50000, lifespanYears: 20, currentAgeYears: 15 },
    ]);

    // --- Results ---
    const [results, setResults] = useState(null);
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [showSchedule, setShowSchedule] = useState(false);

    const calculate = useCallback(() => {
        const res = calculateHomeOwnerRealism({
            propertyPrice,
            downPayment,
            interestRate: parseFloat(interestRate) || 0,
            loanTermYears: parseFloat(loanTerm) || 0,
            auditItems,
            appreciationRate: parseFloat(appreciationRate) || 0,
            opportunityCostRate: parseFloat(opportunityCostRate) || 0,
            maintenanceInflation: parseFloat(maintenanceInflation) || 0
        });
        setResults(res);

        // Generate Timeline
        const events = generateTimelineEvents(res.items, 15);
        setTimelineEvents(events);

    }, [propertyPrice, downPayment, interestRate, loanTerm, auditItems, appreciationRate, opportunityCostRate, maintenanceInflation]);

    useEffect(() => {
        calculate();
    }, [calculate]);

    const addAuditItem = () => {
        const newId = Math.max(...auditItems.map(i => i.id), 0) + 1;
        setAuditItems([...auditItems, { id: newId, name: 'New Item', replacementCost: 10000, lifespanYears: 10, currentAgeYears: 0 }]);
    };

    const removeAuditItem = (id) => {
        setAuditItems(auditItems.filter(i => i.id !== id));
    };

    const updateAuditItem = (id, field, value) => {
        setAuditItems(auditItems.map(i => {
            if (i.id === id) {
                return { ...i, [field]: value };
            }
            return i;
        }));
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8">
            <SEO
                title="Home Maintenance Sinking Fund Calculator"
                description="The hidden cost of home ownership. Calculate your required sinking fund for repairs, painting, and maintenance."
                keywords="home maintenance cost, sinking fund calculator, true cost of home ownership, house repair fund, property maintenance"
                canonical={`${import.meta.env.VITE_SITE_URL}/home-owner-realist`}
                ogImage={`${import.meta.env.VITE_SITE_URL}/og/home_owner.png`}
                structuredData={structuredData}
            />

            <CalculatorLayout>
                <div className="lg:col-span-12">
                    <CalculatorHeader
                        icon={Home}
                        title="The Home Owner Realist"
                    />
                </div>

                {/* LEFT: INPUTS */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6">

                    {/* Property Details */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-blue-100 p-4 border-b-4 border-black">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Currency className="w-5 h-5" /> Financial Inputs
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label htmlFor="property-price" className="block text-[10px] font-black uppercase mb-1">Property Price</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                    <Input id="property-price" type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(parseFloat(e.target.value) || 0)} className="pl-9 font-black" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="down-payment" className="block text-[10px] font-black uppercase mb-1">Down Payment</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                    <Input id="down-payment" type="number" value={downPayment} onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)} className="pl-9 font-black" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="interest-rate" className="block text-[10px] font-black uppercase mb-1">Interest Rate (%)</label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                        <Input id="interest-rate" type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="pl-9 font-black" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="loan-term" className="block text-[10px] font-black uppercase mb-1">Loan Term (Yrs)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                        <Input id="loan-term" type="number" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} className="pl-9 font-black" />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t-2 border-black/10 grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="opp-cost-rate" className="block text-[10px] font-black uppercase mb-1 text-purple-700">Opp. Cost Rate (%)</label>
                                    <Tooltip content="Return you could get if you invested the Down Payment in the market instead.">
                                        <div className="relative">
                                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 z-10" />
                                            <Input id="opp-cost-rate" type="number" value={opportunityCostRate} onChange={(e) => setOpportunityCostRate(e.target.value)} className="pl-9 font-black border-purple-200 bg-purple-50" />
                                        </div>
                                    </Tooltip>
                                </div>
                                <div>
                                    <label htmlFor="appreciation-rate" className="block text-[10px] font-black uppercase mb-1 text-green-700">Appreciation (%)</label>
                                    <div className="relative">
                                        <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 z-10" />
                                        <Input id="appreciation-rate" type="number" value={appreciationRate} onChange={(e) => setAppreciationRate(e.target.value)} className="pl-9 font-black border-green-200 bg-green-50" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="maint-inflation" className="block text-[10px] font-black uppercase mb-1 text-red-700">Maint. Inflation (%)</label>
                                    <Tooltip content="Annual increase in the cost of labor and materials for repairs.">
                                        <div className="relative">
                                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 z-10" />
                                            <Input id="maint-inflation" type="number" value={maintenanceInflation} onChange={(e) => setMaintenanceInflation(e.target.value)} className="pl-9 font-black" />
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* The Audit List */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-red-100 p-4 border-b-4 border-black flex justify-between items-center">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Hammer className="w-5 h-5" /> Maintenance Audit
                            </h2>
                            <Button size="sm" onClick={addAuditItem} className="bg-black text-white hover:bg-gray-800 border-2 border-white/20 text-xs uppercase font-bold flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add Item
                            </Button>
                        </div>
                        <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                            <p className="text-[10px] font-bold text-gray-500 uppercase">List major items to calculate their 'Sinking Fund' cost.</p>
                            {auditItems.map((item, index) => (
                                <div key={item.id} className="p-3 border-2 border-black bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative group">
                                    <button onClick={() => removeAuditItem(item.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    <div className="space-y-3 pr-6">
                                        <div className="relative">
                                            <Hammer className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                            <Input
                                                id={`audit-name-${item.id}`}
                                                value={item.name}
                                                onChange={(e) => updateAuditItem(item.id, 'name', e.target.value)}
                                                className="font-black text-sm border-none bg-transparent pl-6 focus:ring-0 placeholder-gray-400 uppercase w-full"
                                                placeholder="Item Name (e.g. Roof)"
                                                aria-label="Maintenance Item Name"
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label htmlFor={`audit-cost-${item.id}`} className="text-[8px] font-black uppercase text-gray-500">Repl. Cost</label>
                                                <div className="relative">
                                                    <IndianRupee className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                                    <Input id={`audit-cost-${item.id}`} type="number" value={item.replacementCost} onChange={(e) => updateAuditItem(item.id, 'replacementCost', parseFloat(e.target.value) || 0)} className="h-7 text-xs font-bold pl-5" />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor={`audit-lifespan-${item.id}`} className="text-[8px] font-black uppercase text-gray-500">Lifespan (Yr)</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                                    <Input id={`audit-lifespan-${item.id}`} type="number" value={item.lifespanYears} onChange={(e) => updateAuditItem(item.id, 'lifespanYears', parseFloat(e.target.value) || 0)} className="h-7 text-xs font-bold pl-5" />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor={`audit-age-${item.id}`} className="text-[8px] font-black uppercase text-gray-500">Age (Yr)</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                                    <Input id={`audit-age-${item.id}`} type="number" value={item.currentAgeYears} onChange={(e) => updateAuditItem(item.id, 'currentAgeYears', parseFloat(e.target.value) || 0)} className="h-7 text-xs font-bold pl-5" />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Warnings */}
                                        {item.currentAgeYears >= item.lifespanYears && (
                                            <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase flex items-center gap-2">
                                                <AlertOctagon className="w-3 h-3" /> Immediate Replacement Needed!
                                            </div>
                                        )}
                                        {item.currentAgeYears < item.lifespanYears && (item.lifespanYears - item.currentAgeYears) < 3 && (
                                            <div className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 uppercase flex items-center gap-2">
                                                <AlertTriangle className="w-3 h-3" /> Critical: &lt; 3 Years Left
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>

                {/* RIGHT: RESULTS */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <ResultsAnalysis>
                        {/* 1. Main Cost Breakdown */}
                        <Card className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">The Real Monthly Cost</h3>
                            <div className="flex flex-col md:flex-row items-end gap-4 justify-between border-b-4 border-black pb-6 mb-6">
                                <div>
                                    <span className="text-4xl md:text-6xl font-black text-black leading-none">{formatCurrency(results?.financials.trueMonthlyCost || 0)}</span>
                                    <span className="text-lg font-bold text-gray-500">/mo</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black uppercase text-red-600">vs Mortgage: {formatCurrency(results?.financials.monthlyMortgage || 0)}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">You are paying {formatCurrency((results?.financials.trueMonthlyCost || 0) - (results?.financials.monthlyMortgage || 0))} more in hidden costs</p>
                                </div>
                            </div>

                            {/* Bar Chart Breakdown */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-black uppercase">
                                        <span>Mortgage</span>
                                        <span>{formatCurrency(results?.financials.monthlyMortgage || 0)}</span>
                                    </div>
                                    <div className="h-4 bg-gray-100 border-2 border-black w-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-blue-500" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-black uppercase text-red-700">
                                        <span className="flex items-center gap-1"><Hammer className="w-3 h-3" /> Sinking Fund (Maint.)</span>
                                        <span>{formatCurrency(results?.financials.totalMonthlySinkingFund || 0)}</span>
                                    </div>
                                    <div className="h-4 bg-gray-100 border-2 border-black w-full overflow-hidden relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (results?.financials.totalMonthlySinkingFund / results?.financials.trueMonthlyCost) * 300)}%` }} // Exaggerate slightly for visibility if small
                                            className="h-full bg-red-500"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">You must save this monthly to pay for future repairs.</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-black uppercase text-purple-700">
                                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Opportunity Cost</span>
                                        <span>{formatCurrency(results?.financials.monthlyOpportunityCost || 0)}</span>
                                    </div>
                                    <div className="h-4 bg-gray-100 border-2 border-black w-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (results?.financials.monthlyOpportunityCost / results?.financials.trueMonthlyCost) * 300)}%` }}
                                            className="h-full bg-purple-500"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">Lost market returns on your Down Payment ({formatCurrency(downPayment)}).</p>
                                </div>
                            </div>
                        </Card>

                        {/* 2. Immediate Liability Warning */}
                        {results?.financials.immediateLiability > 0 && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-600 text-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-start gap-4">
                                    <AlertOctagon className="w-10 h-10 flex-shrink-0 animate-pulse" />
                                    <div>
                                        <h3 className="text-xl font-black uppercase mb-1">Warning: Immediate Cash Needed</h3>
                                        <p className="font-bold text-red-100 mb-2">Some items are past their lifespan. You need this cash UPFRONT, not in a mortgage.</p>
                                        <span className="text-4xl font-black bg-white text-red-600 px-2 py-1 inline-block mt-2">{formatCurrency(results.financials.immediateLiability)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. Wealth Projection Snapshot */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-4 border-black p-4 bg-green-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="text-[10px] font-black uppercase text-green-700 mb-1">Projected Home Equity ({loanTerm}y)</p>
                                <p className="text-2xl font-black text-black">{formatCurrency(results?.financials.finalEquity || 0)}</p>
                                <p className="text-[9px] font-bold text-green-600 uppercase mt-1">Property Value - Loan Balance</p>
                            </Card>
                            <Card className="border-4 border-black p-4 bg-purple-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="text-[10px] font-black uppercase text-purple-700 mb-1">Opp. Cost Fund ({loanTerm}y)</p>
                                <p className="text-2xl font-black text-black">{formatCurrency(results?.financials.finalOppCost || 0)}</p>
                                <p className="text-[9px] font-bold text-purple-600 uppercase mt-1">If Down Payment was invested at {opportunityCostRate}%</p>
                            </Card>
                        </div>

                        {/* EXPORT SECTION */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <Button
                                variant="secondary"
                                className="flex-1 border-4 border-black font-black uppercase"
                                onClick={() => downloadPDF({
                                    inputs: {
                                        propertyPrice, downPayment, interestRate, loanTermYears: loanTerm,
                                        opportunityCostRate, appreciationRate, maintenanceInflation
                                    },
                                    results,
                                    schedule: results.schedule
                                })}
                            >
                                Download PDF Analysis
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 border-4 border-black font-black uppercase"
                                onClick={() => downloadExcel({
                                    inputs: {
                                        propertyPrice, downPayment, interestRate, loanTermYears: loanTerm,
                                        opportunityCostRate, appreciationRate, maintenanceInflation
                                    },
                                    results,
                                    schedule: results.schedule
                                })}
                            >
                                Download Excel Data
                            </Button>
                        </div>

                        {/* 3. Timeline of Doom */}
                        <Card className="border-4 border-black p-0 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="bg-gray-100 p-4 border-b-4 border-black flex justify-between items-center text-black">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <AlertOctagon className="w-5 h-5 text-red-600" /> Timeline of Doom
                                </h3>
                                <Tooltip content="When things are likely to break and hit your wallet">
                                    <Info className="w-4 h-4 text-gray-400" />
                                </Tooltip>
                            </div>
                            <div className="p-6">
                                <div className="relative border-l-4 border-black ml-4 space-y-8 pb-4">
                                    {timelineEvents.map((event, idx) => (
                                        <div key={idx} className="relative pl-8">
                                            {/* The Dot */}
                                            <div className={`absolute -left-[14px] top-1 w-6 h-6 rounded-full border-4 border-black ${event.year === 0 ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'}`}></div>

                                            <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-default group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">
                                                        {event.year === 0 ? 'Urgent: Year 0' : `Year ${event.year}`}
                                                    </span>
                                                    <span className="text-xs font-black text-red-600 group-hover:scale-110 transition-transform">{formatCurrency(event.cost)}</span>
                                                </div>
                                                <h4 className="font-bold text-sm text-black">{event.item} Renewal</h4>
                                            </div>
                                        </div>
                                    ))}
                                    {timelineEvents.length === 0 && (
                                        <div className="text-center py-6 text-gray-400 font-bold uppercase">Great maintenance. No hits in 15 years.</div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* 4. Detailed Wealth Schedule */}
                        <div className="mt-6">
                            <Button
                                variant="outline"
                                className="w-full border-4 border-black font-black uppercase flex items-center justify-center gap-2 h-12"
                                onClick={() => setShowSchedule(!showSchedule)}
                            >
                                <TableIcon className="w-4 h-4" />
                                {showSchedule ? 'Hide Detailed Schedule' : 'View Year-by-Year Wealth'}
                            </Button>

                            {showSchedule && results?.schedule && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 border-4 border-black overflow-x-auto"
                                >
                                    <table className="w-full text-[10px] text-left">
                                        <thead className="bg-black text-white uppercase font-black">
                                            <tr>
                                                <th className="p-2 text-white">Year</th>
                                                <th className="p-2 text-white">Property Value</th>
                                                <th className="p-2 text-white">Loan Balance</th>
                                                <th className="p-2 text-white">Home Equity</th>
                                                <th className="p-2 text-white">Opp. Cost Fund</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y-2 divide-gray-100 bg-white">
                                            {results.schedule.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-yellow-50">
                                                    <td className="p-2 font-black text-black">{row.label}</td>
                                                    <td className="p-2 font-bold text-black">{formatCurrency(row.propertyValue)}</td>
                                                    <td className="p-2 font-bold text-red-600">{formatCurrency(row.loanBalance)}</td>
                                                    <td className="p-2 font-black text-green-600">{formatCurrency(row.homeEquity)}</td>
                                                    <td className="p-2 font-black text-purple-600">{formatCurrency(row.opportunityCostWealth)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </motion.div>
                            )}
                        </div>
                    </ResultsAnalysis>
                </div>
            </CalculatorLayout>

            <Footer>
                <p>Calculations are estimates based on user inputs. Maintenance costs are industry averages. Inflation is not applied to replacement costs in this version (yet).</p>
            </Footer>

        </div>
    );
}
