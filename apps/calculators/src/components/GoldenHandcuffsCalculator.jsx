
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, IndianRupee, TrendingUp, TrendingDown, ArrowLeft, Briefcase, AlertCircle, Lock, Unlock, ArrowRight, XCircle, CheckCircle, FileText, Table, Hash, Calendar } from 'lucide-react';
import { Button, Card, Input, Tooltip } from '@packages/styling';
import { motion } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import { calculateAnnualizedComp, calculateCostOfLeaving, generateProjections, analyzeAlerts } from '../lib/goldenHandcuffsLogic';
import Footer from './Footer';
import SEO from './SEO';

export default function GoldenHandcuffsCalculator() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": "Golden Handcuffs Calculator",
        "description": "Calculate the true cost of leaving your job by factoring in unvested equity, clawbacks, and taxes.",
        "brand": { "@type": "Brand", "name": "Calculators Hub" },
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
    };

    // --- INPUTS ---
    // Current Job
    const [currentBase, setCurrentBase] = useState(2500000); // 25L
    const [currentBonus, setCurrentBonus] = useState(300000); // 3L
    const [currentEquity, setCurrentEquity] = useState([
        { id: 1, type: 'RSU', count: 1000, price: 150, vestingYears: 4, nextVestDate: '' },
        { id: 2, type: 'Option', count: 5000, price: 20, strike: 5, vestingYears: 4, nextVestDate: '' }
    ]);

    // Liabilities
    const [clawback, setClawback] = useState(0);

    // New Job
    const [newBase, setNewBase] = useState(3500000); // 35L
    const [newBonus, setNewBonus] = useState(500000); // 5L
    const [newEquity, setNewEquity] = useState([
        { id: 1, type: 'Option', count: 20000, price: 10, strike: 2, vestingYears: 4 }
    ]);

    // --- RESULTS ---
    const [results, setResults] = useState({
        currentTC: 0,
        newTC: 0,
        freedomTax: 0,
        breakEvenYear: null,
        isNewJobBetter: false,
        schedule: { currentData: [], newData: [] },
        alerts: []
    });

    // --- ACTIONS ---
    const addEquity = (setEquity) => {
        setEquity(prev => [...prev, { id: Date.now(), type: 'RSU', count: 0, price: 0, vestingYears: 4 }]);
    };

    const removeEquity = (setEquity, id) => {
        setEquity(prev => prev.filter(e => e.id !== id));
    };

    const updateEquity = (setEquity, id, field, value) => {
        setEquity(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const calculate = useCallback(() => {
        const currentStats = calculateAnnualizedComp({
            baseSalary: Number(currentBase),
            bonus: Number(currentBonus),
            equity: currentEquity.map(e => ({ ...e, count: Number(e.count), price: Number(e.price), strike: Number(e.strike || 0), vestingYears: Number(e.vestingYears) }))
        });

        const newStats = calculateAnnualizedComp({
            baseSalary: Number(newBase),
            bonus: Number(newBonus),
            equity: newEquity.map(e => ({ ...e, count: Number(e.count), price: Number(e.price), strike: Number(e.strike || 0), vestingYears: Number(e.vestingYears) }))
        });

        const exitCost = calculateCostOfLeaving(
            { clawbackAmount: Number(clawback) },
            { equity: currentEquity.map(e => ({ ...e, count: Number(e.count), price: Number(e.price), strike: Number(e.strike || 0) })) }
        );

        const schedule = generateProjections(
            { baseSalary: Number(currentBase), bonus: Number(currentBonus), equity: currentEquity.map(e => ({ ...e, count: Number(e.count), price: Number(e.price), strike: Number(e.strike || 0), vestingYears: Number(e.vestingYears) })) },
            { baseSalary: Number(newBase), bonus: Number(newBonus), equity: newEquity.map(e => ({ ...e, count: Number(e.count), price: Number(e.price), strike: Number(e.strike || 0), vestingYears: Number(e.vestingYears) })) },
            { clawbackAmount: Number(clawback) },
            4
        );

        const alerts = analyzeAlerts({ equity: currentEquity }, 4);

        setResults({
            currentTC: currentStats.totalAnnualComp,
            currentAnnualEquity: currentStats.equityAnnualized,
            newTC: newStats.totalAnnualComp,
            newAnnualEquity: newStats.equityAnnualized,
            freedomTax: exitCost.totalCost,
            breakEvenYear: schedule.breakEvenYear,
            isNewJobBetter: newStats.totalAnnualComp > currentStats.totalAnnualComp, // Simplistic check, real break even is better
            schedule,
            alerts
        });

    }, [currentBase, currentBonus, currentEquity, clawback, newBase, newBonus, newEquity]);

    useEffect(() => {
        calculate();
        // Auto-save logic could go here
        const data = { currentBase, currentBonus, currentEquity, clawback, newBase, newBonus, newEquity };
        localStorage.setItem('goldenHandcuffsData', JSON.stringify(data));
    }, [calculate]);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('goldenHandcuffsData');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.currentBase) setCurrentBase(parsed.currentBase);
                if (parsed.currentBonus) setCurrentBonus(parsed.currentBonus);
                if (parsed.currentEquity) setCurrentEquity(parsed.currentEquity);
                if (parsed.clawback) setClawback(parsed.clawback);
                if (parsed.newBase) setNewBase(parsed.newBase);
                if (parsed.newBonus) setNewBonus(parsed.newBonus);
                if (parsed.newEquity) setNewEquity(parsed.newEquity);
            } catch (e) {
                console.error("Failed to load saved data", e);
            }
        }
    }, []);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    const exportReport = (type) => {
        const data = {
            inputs: {
                currentBaseSalary: currentBase,
                currentBonus,
                currentAnnualEquity: results.currentAnnualEquity,
                currentTotalComp: results.currentTC,
                newBaseSalary: newBase,
                newBonus: newBonus,
                newAnnualEquity: results.newAnnualEquity,
                newTotalComp: results.newTC
            },
            results: {
                freedomTax: results.freedomTax,
                breakEvenYear: results.breakEvenYear,
                isNewJobBetter: results.isNewJobBetter
            },
            schedule: results.schedule.currentData.map((val, idx) => ({
                label: `Year ${idx + 1}`,
                principal: val, // Borrowing fields for simplicity: Principal = Current Cumulative
                interest: results.schedule.newData[idx], // Interest = New Cumulative
                balance: results.schedule.newData[idx] - val // Balance = Gain/Loss
            }))
        };
        if (type === 'pdf') downloadPDF(data);
        else downloadExcel(data);
    };

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
            <SEO
                title="Golden Handcuffs & RSU Calculator"
                description="Should you quit? Calculate the true cost of unvested equity and clawbacks."
                canonical={`${import.meta.env.VITE_SITE_URL}/golden-handcuffs`}
                structuredData={structuredData}
            />

            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <header className="mb-8 flex justify-between items-center bg-yellow-300 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-4">
                        <Tooltip content="Return to Hub" position="right">
                            <Link to="/" aria-label="Back" className="p-2 bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all block">
                                <ArrowLeft className="w-5 h-5 text-black" />
                            </Link>
                        </Tooltip>
                        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                            <Lock className="w-6 h-6 md:w-8 md:h-8 text-black" /> GOLDEN HANDCUFFS
                        </h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* INPUTS COLUMN */}
                    <div className="lg:col-span-6 space-y-8">

                        {/* 1. CURRENT JOB */}
                        <Card className="p-0 border-4 border-black">
                            <div className="bg-gray-100 p-4 border-b-4 border-black flex justify-between items-center">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Briefcase className="w-5 h-5" /> Current Role (The Handcuffs)</h2>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase mb-1 block">Base Salary</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                            <Input type="number" value={currentBase} onChange={e => setCurrentBase(e.target.value)} className="pl-8 font-black" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase mb-1 block">Annual Bonus</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                            <Input type="number" value={currentBonus} onChange={e => setCurrentBonus(e.target.value)} className="pl-8 font-black" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t-2 border-dashed border-gray-300 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-black uppercase text-blue-700">Equity Grants (Unvested)</label>
                                        <Button size="sm" onClick={() => addEquity(setCurrentEquity)} className="text-[10px] py-1 px-2 h-auto border-2">Add Grant</Button>
                                    </div>
                                    <div className="space-y-3">
                                        {currentEquity.map((grant, idx) => (
                                            <div key={grant.id} className="bg-blue-50 p-2 border-2 border-black relative">
                                                <button onClick={() => removeEquity(setCurrentEquity, grant.id)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 border-black hover:bg-red-600">×</button>
                                                <div className="grid grid-cols-3 gap-2 mb-2">
                                                    <select value={grant.type} onChange={e => updateEquity(setCurrentEquity, grant.id, 'type', e.target.value)} className="border-2 border-black text-xs font-bold p-1">
                                                        <option value="RSU">RSU</option>
                                                        <option value="Option">Option</option>
                                                    </select>
                                                    <div className="relative">
                                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                                        <Input placeholder="Count" type="number" value={grant.count} onChange={e => updateEquity(setCurrentEquity, grant.id, 'count', e.target.value)} className="h-8 text-xs pl-7 font-black" />
                                                    </div>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                                        <Input placeholder="Vesting Yrs" type="number" value={grant.vestingYears} onChange={e => updateEquity(setCurrentEquity, grant.id, 'vestingYears', e.target.value)} className="h-8 text-xs pl-7 font-black" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="relative">
                                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                                        <Input placeholder={grant.type === 'RSU' ? 'Price' : 'Current Price'} type="number" value={grant.price} onChange={e => updateEquity(setCurrentEquity, grant.id, 'price', e.target.value)} className="h-8 text-xs pl-7 font-black" />
                                                    </div>
                                                    {grant.type === 'Option' && (
                                                        <div className="relative">
                                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                                            <Input placeholder="Strike Price" type="number" value={grant.strike} onChange={e => updateEquity(setCurrentEquity, grant.id, 'strike', e.target.value)} className="h-8 text-xs pl-7 font-black" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t-2 border-dashed border-gray-300 pt-4">
                                    <h3 className="text-[10px] font-black uppercase text-red-600 mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> The Clause (Clawbacks)</h3>
                                    <div>
                                        <label className="text-[10px] font-black uppercase mb-1 block">Total Liability Amount</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-red-600 z-10" />
                                            <Input type="number" value={clawback} onChange={e => setClawback(e.target.value)} className="border-red-600 font-black text-red-600 pl-8" />
                                        </div>
                                        <p className="text-[9px] text-gray-500 mt-1">Sign-on bonus repayment, relocation costs, etc.</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* 2. NEW JOB */}
                        <Card className="p-0 border-4 border-black">
                            <div className="bg-green-100 p-4 border-b-4 border-black flex justify-between items-center">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Unlock className="w-5 h-5" /> The Offer (New Role)</h2>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase mb-1 block">Base Salary</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                            <Input type="number" value={newBase} onChange={e => setNewBase(e.target.value)} className="pl-8 font-black" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase mb-1 block">Annual Bonus</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                            <Input type="number" value={newBonus} onChange={e => setNewBonus(e.target.value)} className="pl-8 font-black" />
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t-2 border-dashed border-gray-300 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-black uppercase text-green-700">New Equity Grants</label>
                                        <Button size="sm" onClick={() => addEquity(setNewEquity)} className="text-[10px] py-1 px-2 h-auto border-2">Add Grant</Button>
                                    </div>
                                    <div className="space-y-3">
                                        {newEquity.map((grant, idx) => (
                                            <div key={grant.id} className="bg-green-50 p-2 border-2 border-black relative">
                                                <button onClick={() => removeEquity(setNewEquity, grant.id)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 border-black hover:bg-red-600">×</button>
                                                <div className="grid grid-cols-3 gap-2 mb-2">
                                                    <select value={grant.type} onChange={e => updateEquity(setNewEquity, grant.id, 'type', e.target.value)} className="border-2 border-black text-xs font-bold p-1">
                                                        <option value="RSU">RSU</option>
                                                        <option value="Option">Option</option>
                                                    </select>
                                                    <div className="relative">
                                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                                        <Input placeholder="Count" type="number" value={grant.count} onChange={e => updateEquity(setNewEquity, grant.id, 'count', e.target.value)} className="h-8 text-xs pl-7 font-black" />
                                                    </div>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                                        <Input placeholder="Vesting Yrs" type="number" value={grant.vestingYears} onChange={e => updateEquity(setNewEquity, grant.id, 'vestingYears', e.target.value)} className="h-8 text-xs pl-7 font-black" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="relative">
                                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                                        <Input placeholder={grant.type === 'RSU' ? 'Price' : 'Est. Value'} type="number" value={grant.price} onChange={e => updateEquity(setNewEquity, grant.id, 'price', e.target.value)} className="h-8 text-xs pl-7 font-black" />
                                                    </div>
                                                    {grant.type === 'Option' && (
                                                        <div className="relative">
                                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                                                            <Input placeholder="Strike Price" type="number" value={grant.strike} onChange={e => updateEquity(setNewEquity, grant.id, 'strike', e.target.value)} className="h-8 text-xs pl-7 font-black" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RESULTS COLUMN */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* FREEDOM ANALYSIS */}
                        <Card className="h-full flex flex-col border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                            <div className="bg-black text-white p-4 border-b-4 border-black flex justify-between items-center">
                                <h2 className="text-lg font-black uppercase italic">Decision Matrix</h2>
                                {results.breakEvenYear ? (
                                    <span className="bg-yellow-400 text-black text-xs font-black px-2 py-1 uppercase">Break Even: Year {results.breakEvenYear}</span>
                                ) : (
                                    <span className="bg-red-500 text-white text-xs font-black px-2 py-1 uppercase">Never Catch Up</span>
                                )}
                            </div>

                            <div className="p-6 space-y-6">

                                {/* ALERTS */}
                                {results.alerts.length > 0 && (
                                    <div className="bg-yellow-100 border-2 border-black p-3 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                                        <div className="space-y-1">
                                            {results.alerts.map((alert, i) => (
                                                <p key={i} className="text-xs font-bold text-red-800">{alert.message}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* HEADLINE NUMBERS */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <p className="text-[9px] font-black uppercase text-gray-500 mb-1">Current True Annual Comp</p>
                                        <p className="text-xl font-black">{formatCurrency(results.currentTC)}</p>
                                    </div>
                                    <div className={`p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${results.isNewJobBetter ? 'bg-green-100' : 'bg-red-50'}`}>
                                        <p className={`text-[9px] font-black uppercase mb-1 ${results.isNewJobBetter ? 'text-green-800' : 'text-red-800'}`}>New True Annual Comp</p>
                                        <p className={`text-xl font-black ${results.isNewJobBetter ? 'text-green-800' : 'text-red-800'}`}>{formatCurrency(results.newTC)}</p>
                                    </div>
                                </div>

                                {/* THE FREEDOM TAX */}
                                <div className="bg-red-600 p-4 border-4 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <h3 className="text-xs font-black uppercase text-red-200 mb-2 tracking-widest">The Freedom Tax (Cost of Leaving)</h3>
                                    <p className="text-4xl font-black tracking-tighter">{formatCurrency(results.freedomTax)}</p>
                                    <p className="text-[10px] font-bold text-red-200 mt-2 italic uppercase">Immediate loss (Clawbacks + Forfeited Equity)</p>
                                </div>

                                {/* PROJECTION TABLE */}
                                <div className="border-4 border-black p-4">
                                    <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> 4-Year Cumulative Cashflow
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-black text-white font-black uppercase">
                                                <tr>
                                                    <th className="p-2">Year</th>
                                                    <th className="p-2">Current Job (Stay)</th>
                                                    <th className="p-2">New Job (Total)</th>
                                                    <th className="p-2 text-right">Net diff</th>
                                                </tr>
                                            </thead>
                                            <tbody className="font-mono">
                                                {results.schedule.currentData.map((val, idx) => {
                                                    const newVal = results.schedule.newData[idx];
                                                    const diff = newVal - val;
                                                    return (
                                                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                                            <td className="p-2 font-bold">Year {idx + 1}</td>
                                                            <td className="p-2">{formatCurrency(val)}</td>
                                                            <td className="p-2">{formatCurrency(newVal)}</td>
                                                            <td className={`p-2 text-right font-bold ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* EXPORT OPTIONS */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    <Button variant="secondary" onClick={() => exportReport('pdf')} className="w-full text-sm font-bold flex items-center justify-center gap-2 border-2 border-black h-10">
                                        <FileText className="w-4 h-4" /> Download PDF
                                    </Button>
                                    <Button variant="primary" onClick={() => exportReport('excel')} className="w-full text-sm font-bold flex items-center justify-center gap-2 border-2 border-black h-10">
                                        <Table className="w-4 h-4" /> Download Excel
                                    </Button>
                                </div>

                            </div>
                        </Card>
                    </div>
                </div>

                <Footer>
                    <p className="text-gray-600 font-medium"><strong>Strategy Tip:</strong> If the "Freedom Tax" is high, negotiate a <strong>Sign-on Bonus</strong> to cover the specific clawback amount. Recruiters expect this.</p>
                </Footer>
            </div>
        </div>
    );
}
