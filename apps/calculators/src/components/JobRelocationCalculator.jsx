import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, IndianRupee, TrendingUp, TrendingDown, ArrowRight, Clock, AlertCircle, Info, FileText, Table, Briefcase, Users } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, DownloadButtons, Footer, MetricDisplay, Select } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';

import SEO from './SEO';

import { calculateRelocationImpact } from '../lib/relocationLogic';
import { usePersistedState, resetPersistedState } from '@packages/persistence';

export default function JobRelocationCalculator() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": "Job Relocation Calculator",
        "description": "Calculate the true financial impact of relocating for a job, accounting for hidden costs and lifestyle changes.",
        "brand": { "@type": "Brand", "name": "Calculators Hub" },
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
    };

    // --- CURRENT STATE INPUTS ---
    const [currentSalary, setCurrentSalary] = usePersistedState('JobRelocationCalculator', 'currentSalary', 600000); // Annual
    const [currentRent, setCurrentRent] = usePersistedState('JobRelocationCalculator', 'currentRent', 0);
    const [currentExpenses, setCurrentExpenses] = usePersistedState('JobRelocationCalculator', 'currentExpenses', 15000);
    const [isLivingWithFamily, setIsLivingWithFamily] = usePersistedState('JobRelocationCalculator', 'isLivingWithFamily', true);

    // Optional expense breakdown
    const [showCurrentExpenseBreakdown, setShowCurrentExpenseBreakdown] = usePersistedState('JobRelocationCalculator', 'showCurrentExpenseBreakdown', false);
    const [currentExpenseBreakdown, setCurrentExpenseBreakdown] = usePersistedState('JobRelocationCalculator', 'currentExpenseBreakdown', {
        groceries: 8000,
        utilities: 2000,
        transport: 3000,
        entertainment: 5000,
        personal: 2000,
        misc: 0
    });

    // --- NEW JOB INPUTS ---
    const [newSalary, setNewSalary] = usePersistedState('JobRelocationCalculator', 'newSalary', 1000000);
    const [newRent, setNewRent] = usePersistedState('JobRelocationCalculator', 'newRent', 25000);
    const [newExpenses, setNewExpenses] = usePersistedState('JobRelocationCalculator', 'newExpenses', 20000);
    const [relocationBonus, setRelocationBonus] = usePersistedState('JobRelocationCalculator', 'relocationBonus', 0);

    // Optional new expense breakdown
    const [showNewExpenseBreakdown, setShowNewExpenseBreakdown] = usePersistedState('JobRelocationCalculator', 'showNewExpenseBreakdown', false);
    const [newExpenseBreakdown, setNewExpenseBreakdown] = usePersistedState('JobRelocationCalculator', 'newExpenseBreakdown', {
        groceries: 12000,
        utilities: 3000,
        transport: 5000,
        entertainment: 8000,
        personal: 3000,
        misc: 0
    });

    // --- FRICTION COSTS ---
    const [movingCost, setMovingCost] = usePersistedState('JobRelocationCalculator', 'movingCost', 30000);
    const [setupCost, setSetupCost] = usePersistedState('JobRelocationCalculator', 'setupCost', 75000); // Deposit + Brokerage

    // Optional friction breakdown
    const [showFrictionBreakdown, setShowFrictionBreakdown] = usePersistedState('JobRelocationCalculator', 'showFrictionBreakdown', false);
    const [frictionBreakdown, setFrictionBreakdown] = usePersistedState('JobRelocationCalculator', 'frictionBreakdown', {
        packers: 30000,
        travel: 10000,
        deposit: 50000,
        brokerage: 25000,
        furniture: 40000,
        misc: 0
    });

    // --- LIFESTYLE FACTORS ---
    const [commuteTimeDelta, setCommuteTimeDelta] = usePersistedState('JobRelocationCalculator', 'commuteTimeDelta', 0); // Minutes per day
    const [currentCommuteMode, setCurrentCommuteMode] = usePersistedState('JobRelocationCalculator', 'currentCommuteMode', 'walk');
    const [currentCommuteCost, setCurrentCommuteCost] = usePersistedState('JobRelocationCalculator', 'currentCommuteCost', 0);
    const [newCommuteMode, setNewCommuteMode] = usePersistedState('JobRelocationCalculator', 'newCommuteMode', 'public');
    const [newCommuteCost, setNewCommuteCost] = usePersistedState('JobRelocationCalculator', 'newCommuteCost', 0);

    // --- BENEFITS & PERKS ---
    // Current Job Benefits
    const [showCurrentBenefits, setShowCurrentBenefits] = usePersistedState('JobRelocationCalculator', 'showCurrentBenefits', false);
    const [currentBenefits, setCurrentBenefits] = usePersistedState('JobRelocationCalculator', 'currentBenefits', {
        healthInsurance: 0, // Company-paid (₹0 out-of-pocket)
        pfMatch: 12, // Percentage
        mealVouchers: 0,
        gymMembership: 0,
        stockOptions: 0,
        otherPerks: 0
    });

    // New Job Benefits
    const [showNewBenefits, setShowNewBenefits] = usePersistedState('JobRelocationCalculator', 'showNewBenefits', false);
    const [newBenefits, setNewBenefits] = usePersistedState('JobRelocationCalculator', 'newBenefits', {
        healthInsurance: 0, // Self-paid or company-paid
        pfMatch: 12, // Percentage
        mealVouchers: 0,
        gymMembership: 0,
        stockOptions: 0,
        otherPerks: 0
    });

    // --- RESULTS ---
    const [results, setResults] = usePersistedState('JobRelocationCalculator', 'results', {
        current: { monthlyNet: 0, surplus: 0, expenses: 0 },
        new: { monthlyNet: 0, surplus: 0, adjustedSurplus: 0, expenses: 0 },
        analysis: {
            monthlyDelta: 0,
            annualDelta: 0,
            totalFriction: 0,
            recoveryMonths: 0,
            commuteCost: 0,
            isProfitable: false
        }
    });

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    const calculate = useCallback(() => {
        const calcResults = calculateRelocationImpact({
            currentSalary,
            currentRent,
            currentExpenses,
            currentExpenseBreakdown: showCurrentExpenseBreakdown ? currentExpenseBreakdown : null,
            isLivingWithFamily,
            newSalary,
            newRent,
            newExpenses,
            newExpenseBreakdown: showNewExpenseBreakdown ? newExpenseBreakdown : null,
            relocationBonus,
            movingCost,
            setupCost,
            frictionBreakdown: showFrictionBreakdown ? frictionBreakdown : null,
            commuteTimeDelta,
            currentCommuteMode,
            currentCommuteCost,
            newCommuteMode,
            newCommuteCost
        });

        setResults(calcResults);
    }, [currentSalary, currentRent, currentExpenses, currentExpenseBreakdown, showCurrentExpenseBreakdown, isLivingWithFamily, newSalary, newRent, newExpenses, newExpenseBreakdown, showNewExpenseBreakdown, relocationBonus, movingCost, setupCost, frictionBreakdown, showFrictionBreakdown, commuteTimeDelta, currentCommuteMode, currentCommuteCost, newCommuteMode, newCommuteCost]);

    useEffect(() => {
        calculate();
    }, [calculate]);

    const checkExports = (type) => {
        const data = {
            inputs: {
                currentSalary,
                currentRent,
                currentExpenses,
                isLivingWithFamily,
                newSalary,
                newRent,
                newExpenses,
                relocationBonus,
                movingCost,
                setupCost,
                commuteTimeDelta
            },
            results
        };

        if (type === 'pdf') {
            downloadPDF(data, 'Job Relocation Analysis');
        } else {
            downloadExcel(data, 'Job_Relocation_Analysis');
        }
    };

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8">
            <SEO
                title="Job Relocation Realist Calculator"
                description="Calculate the true financial impact of moving for a job. Factor in hidden costs, lifestyle changes, and the value of your current setup."
                keywords="job relocation calculator, cost of living calculator, moving for job, relocation cost calculator, job offer comparison, salary comparison"
                canonical={`${import.meta.env.VITE_SITE_URL}/job-relocation`}
                ogImage={`${import.meta.env.VITE_SITE_URL}/og/job_relocation.png`}
                structuredData={structuredData}
            />

            <CalculatorLayout>
                <div className="lg:col-span-12">
                    <CalculatorHeader namespace="JobRelocationCalculator"
                        icon={MapPin}
                        title="Job Relocation Realist"
                    
            onReset={() => { resetPersistedState('JobRelocationCalculator'); window.location.reload(); }} />
                </div>

                {/* LEFT COLUMN - INPUTS */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                    {/* CURRENT STATE */}
                    <Card title="The Sanctuary (Current State)" icon={Home} headerColor="bg-green-100" className="p-4 space-y-4">
                        <div className="space-y-4">
                            <Input id="current-salary" label="Annual Salary (Gross)" icon={IndianRupee} type="number" value={currentSalary} onChange={e => setCurrentSalary(Number(e.target.value))} className="font-black" />

                            <div className="grid grid-cols-2 gap-4">
                                <Input id="current-rent" label="Monthly Rent" icon={IndianRupee} type="number" value={currentRent} onChange={e => setCurrentRent(Number(e.target.value))} className="font-black" />
                                <div>
                                    <Input
                                        id="current-expenses"
                                        label="Monthly Expenses"
                                        icon={IndianRupee}
                                        type="number"
                                        value={showCurrentExpenseBreakdown ? Object.values(currentExpenseBreakdown).reduce((sum, val) => sum + val, 0) : currentExpenses}
                                        onChange={e => !showCurrentExpenseBreakdown && setCurrentExpenses(Number(e.target.value))}
                                        className="font-black mb-1"
                                        disabled={showCurrentExpenseBreakdown}
                                    />
                                    <button
                                        onClick={() => setShowCurrentExpenseBreakdown(!showCurrentExpenseBreakdown)}
                                        className="text-[9px] font-bold uppercase underline text-green-600 hover:text-green-800"
                                    >
                                        {showCurrentExpenseBreakdown ? "Use simple total" : "Break down expenses"}
                                    </button>
                                </div>
                            </div>

                            {showCurrentExpenseBreakdown && (
                                <div className="bg-green-50 p-3 border-2 border-green-100 rounded animate-in slide-in-from-top-2">
                                    <p className="text-[10px] font-black uppercase text-green-600 mb-2">Expense Breakdown</p>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'groceries', label: 'Groceries & Food', icon: '🛒' },
                                            { id: 'utilities', label: 'Utilities', icon: '💡' },
                                            { id: 'transport', label: 'Transport', icon: '🚗' },
                                            { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
                                            { id: 'personal', label: 'Personal Care', icon: '💅' },
                                            { id: 'misc', label: 'Miscellaneous', icon: '📝' }
                                        ].map((item) => (
                                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor={`current-expense-${item.id}`} className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>{item.icon}</span> {item.label}
                                                </label>
                                                <div className="col-span-6">
                                                    <Input
                                                        id={`current-expense-${item.id}`}
                                                        icon={IndianRupee}
                                                        type="number"
                                                        value={currentExpenseBreakdown[item.id]}
                                                        onChange={e => setCurrentExpenseBreakdown(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] font-black w-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-green-200 flex justify-between items-center">
                                            <span className="text-[9px] font-black uppercase text-green-700">Total</span>
                                            <span className="text-sm font-black text-green-700">
                                                {formatCurrency(Object.values(currentExpenseBreakdown).reduce((sum, val) => sum + val, 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t-2 border-black/10">
                                <p className="text-[10px] font-black uppercase text-gray-600 mb-2">Living Situation</p>
                                <Checkbox
                                    label="Living with Family (Rent-Free)"
                                    checked={isLivingWithFamily}
                                    onChange={e => setIsLivingWithFamily(e.target.checked)}
                                />
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 leading-tight ml-8">
                                    ✓ Saves ~30% on groceries, utilities, and maintenance
                                </p>
                            </div>

                            <div className="pt-4 border-t-2 border-black/10">
                                <p className="text-[10px] font-black uppercase text-gray-600 mb-2">Current Commute</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        id="current-commute-mode"
                                        label="Mode"
                                        value={currentCommuteMode}
                                        onChange={e => setCurrentCommuteMode(e.target.value)}
                                        className="h-9 text-xs font-bold uppercase"
                                    >
                                        <option value="walk">🚶 Walk</option>
                                        <option value="bike">🚴 Bike</option>
                                        <option value="car">🚗 Car</option>
                                        <option value="public">🚇 Public Transport</option>
                                        <option value="mixed">🔀 Mixed</option>
                                    </Select>
                                    <Input
                                        id="current-commute-cost"
                                        label="Cost/Month"
                                        icon={IndianRupee}
                                        type="number"
                                        value={currentCommuteCost}
                                        onChange={e => setCurrentCommuteCost(Number(e.target.value))}
                                        className="font-black"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t-2 border-black/10">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black uppercase text-gray-600">Benefits & Perks</p>
                                    <button
                                        onClick={() => setShowCurrentBenefits(!showCurrentBenefits)}
                                        className="text-[9px] font-bold uppercase underline text-green-600 hover:text-green-800"
                                    >
                                        {showCurrentBenefits ? "Hide details" : "Add benefits"}
                                    </button>
                                </div>

                                {showCurrentBenefits && (
                                    <div className="bg-green-50 p-3 border-2 border-green-100 rounded animate-in slide-in-from-top-2">
                                        <p className="text-[10px] font-black uppercase text-green-600 mb-2">Current Benefits Package</p>
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="current-health-insurance" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>💊</span> Health Insurance
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 text-gray-400 z-10" />
                                                    <Input
                                                        id="current-health-insurance"
                                                        type="number"
                                                        value={currentBenefits.healthInsurance}
                                                        onChange={e => setCurrentBenefits(prev => ({ ...prev, healthInsurance: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                        placeholder="0 if company-paid"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="current-pf-match" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>🏦</span> PF Match (%)
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 z-10">%</span>
                                                    <Input
                                                        id="current-pf-match"
                                                        type="number"
                                                        value={currentBenefits.pfMatch}
                                                        onChange={e => setCurrentBenefits(prev => ({ ...prev, pfMatch: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="current-meal-vouchers" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>🍽️</span> Meal Vouchers
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 text-gray-400 z-10" />
                                                    <Input
                                                        id="current-meal-vouchers"
                                                        type="number"
                                                        value={currentBenefits.mealVouchers}
                                                        onChange={e => setCurrentBenefits(prev => ({ ...prev, mealVouchers: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                        placeholder="/month"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="current-gym-membership" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>💪</span> Gym Membership
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 text-gray-400 z-10" />
                                                    <Input
                                                        id="current-gym-membership"
                                                        type="number"
                                                        value={currentBenefits.gymMembership}
                                                        onChange={e => setCurrentBenefits(prev => ({ ...prev, gymMembership: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                        placeholder="/month"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="current-stock-options" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>📈</span> Stock/RSUs
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 text-gray-400 z-10" />
                                                    <Input
                                                        id="current-stock-options"
                                                        type="number"
                                                        value={currentBenefits.stockOptions}
                                                        onChange={e => setCurrentBenefits(prev => ({ ...prev, stockOptions: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                        placeholder="/month value"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="current-other-perks" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>🎁</span> Other Perks
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 text-gray-400 z-10" />
                                                    <Input
                                                        id="current-other-perks"
                                                        type="number"
                                                        value={currentBenefits.otherPerks}
                                                        onChange={e => setCurrentBenefits(prev => ({ ...prev, otherPerks: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                        placeholder="/month"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-green-200 flex justify-between items-center">
                                                <span className="text-[9px] font-black uppercase text-green-700">Total Monthly Value</span>
                                                <span className="text-sm font-black text-green-700">
                                                    {formatCurrency(
                                                        currentBenefits.mealVouchers +
                                                        currentBenefits.gymMembership +
                                                        currentBenefits.stockOptions +
                                                        currentBenefits.otherPerks +
                                                        ((currentSalary * currentBenefits.pfMatch) / 100 / 12)
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* NEW JOB OFFER */}
                    <Card title="The Leap (New Job Offer)" icon={Briefcase} headerColor="bg-blue-100" className="p-4 space-y-4">
                        <div className="space-y-4">
                            <Input id="new-salary" label="New Annual Salary (Gross)" icon={IndianRupee} type="number" value={newSalary} onChange={e => setNewSalary(Number(e.target.value))} className="font-black border-blue-600 text-blue-700" />

                            <div className="grid grid-cols-2 gap-4">
                                <Input id="new-rent" label="Expected Rent" icon={IndianRupee} type="number" value={newRent} onChange={e => setNewRent(Number(e.target.value))} className="font-black" />
                                <div>
                                    <Input
                                        id="new-expenses"
                                        label="Expected Expenses"
                                        icon={IndianRupee}
                                        type="number"
                                        value={showNewExpenseBreakdown ? Object.values(newExpenseBreakdown).reduce((sum, val) => sum + val, 0) : newExpenses}
                                        onChange={e => !showNewExpenseBreakdown && setNewExpenses(Number(e.target.value))}
                                        className="font-black mb-1"
                                        disabled={showNewExpenseBreakdown}
                                    />
                                    <button
                                        onClick={() => setShowNewExpenseBreakdown(!showNewExpenseBreakdown)}
                                        className="text-[9px] font-bold uppercase underline text-blue-600 hover:text-blue-800"
                                    >
                                        {showNewExpenseBreakdown ? "Use simple total" : "Break down expenses"}
                                    </button>
                                </div>
                            </div>

                            {showNewExpenseBreakdown && (
                                <div className="bg-blue-50 p-3 border-2 border-blue-100 rounded animate-in slide-in-from-top-2">
                                    <p className="text-[10px] font-black uppercase text-blue-600 mb-2">Expected Expense Breakdown</p>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'groceries', label: 'Groceries & Food', icon: '🛒' },
                                            { id: 'utilities', label: 'Utilities', icon: '💡' },
                                            { id: 'transport', label: 'Transport', icon: '🚗' },
                                            { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
                                            { id: 'personal', label: 'Personal Care', icon: '💅' },
                                            { id: 'misc', label: 'Miscellaneous', icon: '📝' }
                                        ].map((item) => (
                                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor={`new-expense-${item.id}`} className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>{item.icon}</span> {item.label}
                                                </label>
                                                <div className="col-span-6">
                                                    <Input
                                                        id={`new-expense-${item.id}`}
                                                        icon={IndianRupee}
                                                        type="number"
                                                        value={newExpenseBreakdown[item.id]}
                                                        onChange={e => setNewExpenseBreakdown(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] font-black w-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                                            <span className="text-[9px] font-black uppercase text-blue-700">Total</span>
                                            <span className="text-sm font-black text-blue-700">
                                                {formatCurrency(Object.values(newExpenseBreakdown).reduce((sum, val) => sum + val, 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Input id="relocation-bonus" label="Relocation Bonus" icon={IndianRupee} type="number" value={relocationBonus} onChange={e => setRelocationBonus(Number(e.target.value))} className="font-black" />

                            <div className="pt-4 border-t-2 border-black/10">
                                <p className="text-[10px] font-black uppercase text-blue-600 mb-2">Expected Commute</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        id="new-commute-mode"
                                        label="Mode"
                                        value={newCommuteMode}
                                        onChange={e => setNewCommuteMode(e.target.value)}
                                        className="h-9 text-xs font-bold uppercase"
                                    >
                                        <option value="walk">🚶 Walk</option>
                                        <option value="bike">🚴 Bike</option>
                                        <option value="car">🚗 Car</option>
                                        <option value="public">🚇 Public Transport</option>
                                        <option value="mixed">🔀 Mixed</option>
                                    </Select>
                                    <Input
                                        id="new-commute-cost"
                                        label="Cost/Month"
                                        icon={IndianRupee}
                                        type="number"
                                        value={newCommuteCost}
                                        onChange={e => setNewCommuteCost(Number(e.target.value))}
                                        className="font-black"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t-2 border-black/10">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black uppercase text-gray-600">Benefits & Perks</p>
                                    <button
                                        onClick={() => setShowNewBenefits(!showNewBenefits)}
                                        className="text-[9px] font-bold uppercase underline text-blue-600 hover:text-blue-800"
                                    >
                                        {showNewBenefits ? "Hide details" : "Add benefits"}
                                    </button>
                                </div>

                                {showNewBenefits && (
                                    <div className="bg-blue-50 p-3 border-2 border-blue-100 rounded animate-in slide-in-from-top-2">
                                        <p className="text-[10px] font-black uppercase text-blue-600 mb-2">New Benefits Package</p>
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="new-health-insurance" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>💊</span> Health Insurance
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 text-gray-400 z-10" />
                                                    <Input
                                                        id="new-health-insurance"
                                                        type="number"
                                                        value={newBenefits.healthInsurance}
                                                        onChange={e => setNewBenefits(prev => ({ ...prev, healthInsurance: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                        placeholder="0 if company-paid"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="new-pf-match" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>🏦</span> PF Match (%)
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 z-10">%</span>
                                                    <Input
                                                        id="new-pf-match"
                                                        type="number"
                                                        value={newBenefits.pfMatch}
                                                        onChange={e => setNewBenefits(prev => ({ ...prev, pfMatch: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="new-meal-vouchers" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>🍽️</span> Meal Vouchers
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 text-gray-400 z-10" />
                                                    <Input
                                                        id="new-meal-vouchers"
                                                        type="number"
                                                        value={newBenefits.mealVouchers}
                                                        onChange={e => setNewBenefits(prev => ({ ...prev, mealVouchers: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                        placeholder="/month"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="new-gym-membership" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>💪</span> Gym Membership
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 text-gray-400 z-10" />
                                                    <Input
                                                        id="new-gym-membership"
                                                        type="number"
                                                        value={newBenefits.gymMembership}
                                                        onChange={e => setNewBenefits(prev => ({ ...prev, gymMembership: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                        placeholder="/month"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="new-stock-options" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>📈</span> Stock/RSUs
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 text-gray-400 z-10" />
                                                    <Input
                                                        id="new-stock-options"
                                                        type="number"
                                                        value={newBenefits.stockOptions}
                                                        onChange={e => setNewBenefits(prev => ({ ...prev, stockOptions: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                        placeholder="/month value"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor="new-other-perks" className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>🎁</span> Other Perks
                                                </label>
                                                <div className="col-span-6 relative">
                                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 text-gray-400 z-10" />
                                                    <Input
                                                        id="new-other-perks"
                                                        type="number"
                                                        value={newBenefits.otherPerks}
                                                        onChange={e => setNewBenefits(prev => ({ ...prev, otherPerks: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] pl-5 font-black w-full"
                                                        placeholder="/month"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                                                <span className="text-[9px] font-black uppercase text-blue-700">Total Monthly Value</span>
                                                <span className="text-sm font-black text-blue-700">
                                                    {formatCurrency(
                                                        newBenefits.mealVouchers +
                                                        newBenefits.gymMembership +
                                                        newBenefits.stockOptions +
                                                        newBenefits.otherPerks +
                                                        ((newSalary * newBenefits.pfMatch) / 100 / 12)
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* FRICTION COSTS */}
                    <Card title="The Friction (One-time Costs)" icon={<AlertCircle className="text-red-600 w-5 h-5" />} headerColor="bg-red-50" className="p-4 space-y-4">
                        <div className="space-y-4">
                            <div className="mb-2">
                                <p className="text-[10px] font-black uppercase text-red-600 mb-2">One-Time Moving Costs</p>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="total-friction-cost" className="text-[9px] font-bold uppercase text-gray-600">Total Friction Cost</label>
                                    <button
                                        onClick={() => setShowFrictionBreakdown(!showFrictionBreakdown)}
                                        className="text-[9px] font-bold uppercase underline text-red-600 hover:text-red-800"
                                    >
                                        {showFrictionBreakdown ? "Use simple total" : "Break down costs"}
                                    </button>
                                </div>
                                <Input
                                    id="total-friction-cost"
                                    icon={IndianRupee}
                                    type="number"
                                    value={showFrictionBreakdown ? Object.values(frictionBreakdown).reduce((sum, val) => sum + val, 0) : (movingCost + setupCost)}
                                    onChange={e => {
                                        if (!showFrictionBreakdown) {
                                            const total = Number(e.target.value);
                                            setMovingCost(Math.floor(total * 0.3));
                                            setSetupCost(Math.floor(total * 0.7));
                                        }
                                    }}
                                    className="font-black"
                                    disabled={showFrictionBreakdown}
                                />
                            </div>

                            {showFrictionBreakdown && (
                                <div className="bg-red-50 p-3 border-2 border-red-100 rounded animate-in slide-in-from-top-2">
                                    <p className="text-[10px] font-black uppercase text-red-600 mb-2">Detailed Friction Costs</p>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'packers', label: 'Packers & Movers', icon: '📦' },
                                            { id: 'travel', label: 'Travel (Flight/Train)', icon: '✈️' },
                                            { id: 'deposit', label: 'Security Deposit', icon: '🏦' },
                                            { id: 'brokerage', label: 'Brokerage Fee', icon: '💼' },
                                            { id: 'furniture', label: 'Furniture & Setup', icon: '🛋️' },
                                            { id: 'misc', label: 'Miscellaneous', icon: '📝' }
                                        ].map((item) => (
                                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                                <label htmlFor={`friction-expense-${item.id}`} className="col-span-6 text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <span>{item.icon}</span> {item.label}
                                                </label>
                                                <div className="col-span-6">
                                                    <Input
                                                        id={`friction-expense-${item.id}`}
                                                        icon={IndianRupee}
                                                        type="number"
                                                        value={frictionBreakdown[item.id]}
                                                        onChange={e => setFrictionBreakdown(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                                                        className="h-6 text-[10px] font-black w-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-red-200 flex justify-between items-center">
                                            <span className="text-[9px] font-black uppercase text-red-700">Total</span>
                                            <span className="text-sm font-black text-red-700">
                                                {formatCurrency(Object.values(frictionBreakdown).reduce((sum, val) => sum + val, 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN - RESULTS */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <ResultsAnalysis
                        title="Relocation Impact Analysis"
                        headerElements={
                            <span className={`text-xs font-black px-2 py-1 border-2 border-black ${results.analysis.isProfitable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {results.analysis.isProfitable ? 'PROFITABLE MOVE' : 'FINANCIAL DOWNGRADE'}
                            </span>
                        }
                    >
                        {/* VERDICT CARD */}
                        <div className={`p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${results.analysis.isProfitable ? 'bg-green-50' : 'bg-red-50'}`}>
                            <MetricDisplay 
                                title="Monthly Surplus Delta"
                                value={`${results.analysis.monthlyDelta >= 0 ? '+' : ''}${formatCurrency(results.analysis.monthlyDelta)}`}
                                subtitle={results.analysis.isProfitable
                                    ? `You'll save ${formatCurrency(Math.abs(results.analysis.monthlyDelta))} more per month`
                                    : `You'll save ${formatCurrency(Math.abs(results.analysis.monthlyDelta))} less per month`}
                                color={results.analysis.isProfitable ? 'text-green-700' : 'text-red-700'}
                            />
                        </div>

                        {/* COMPARISON GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CURRENT */}
                            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="text-[10px] font-black text-green-600 uppercase mb-3 flex items-center gap-2">
                                    <Home className="w-4 h-4" /> Current Sanctuary
                                </p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-gray-500">Monthly Net</span>
                                        <span className="font-black">{formatCurrency(results.current.monthlyNet)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-red-600">
                                        <span className="font-bold">- Expenses</span>
                                        <span className="font-black">-{formatCurrency(results.current.expenses + currentRent)}</span>
                                    </div>
                                    <div className="pt-2 border-t-2 border-black flex justify-between items-center">
                                        <span className="text-xs font-black uppercase">Surplus</span>
                                        <span className="text-xl font-black text-green-700">{formatCurrency(results.current.surplus)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* NEW */}
                            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="text-[10px] font-black text-blue-600 uppercase mb-3 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> New City
                                </p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-gray-500">Monthly Net</span>
                                        <span className="font-black">{formatCurrency(results.new.monthlyNet)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-red-600">
                                        <span className="font-bold">- Expenses</span>
                                        <span className="font-black">-{formatCurrency(results.new.expenses + newRent)}</span>
                                    </div>
                                    {results.analysis.commuteCost > 0 && (
                                        <div className="flex justify-between items-center text-xs text-orange-600">
                                            <span className="font-bold">- Commute Tax</span>
                                            <span className="font-black">-{formatCurrency(results.analysis.commuteCost)}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t-2 border-black flex justify-between items-center">
                                        <span className="text-xs font-black uppercase">Surplus</span>
                                        <span className={`text-xl font-black ${results.analysis.isProfitable ? 'text-green-700' : 'text-red-700'}`}>
                                            {formatCurrency(results.new.adjustedSurplus)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SUNK COST RECOVERY */}
                        {results.analysis.totalFriction > 0 && results.analysis.isProfitable && (
                            <div className="border-4 border-black p-6 bg-yellow-50">
                                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 uppercase tracking-tight">
                                    <Clock className="w-5 h-5 text-orange-600" /> Break-Even Timeline
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <span className="text-xs font-black uppercase">Total Friction Cost</span>
                                        <span className="font-bold text-red-600">{formatCurrency(results.analysis.totalFriction)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,222,89,1)]">
                                        <span className="text-xs font-black uppercase text-yellow-300">Months to Recover</span>
                                        <span className="text-2xl font-black">{results.analysis.recoveryMonths} months</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-500 italic">
                                        After {results.analysis.recoveryMonths} months, the new job will have paid off the moving costs and you'll start seeing real gains.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ANNUAL PROJECTION */}
                        <div className="border-4 border-black p-6 bg-gray-50">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 uppercase tracking-tight">
                                <TrendingUp className="w-5 h-5 text-purple-600" /> Annual Impact
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-[9px] font-black uppercase text-gray-500 mb-1">Current Annual Savings</p>
                                    <p className="text-xl font-black">{formatCurrency(results.current.surplus * 12)}</p>
                                </div>
                                <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-[9px] font-black uppercase text-gray-500 mb-1">New Annual Savings</p>
                                    <p className="text-xl font-black">{formatCurrency(results.new.adjustedSurplus * 12)}</p>
                                </div>
                            </div>
                            <div className={`mt-4 p-4 border-2 border-black ${results.analysis.isProfitable ? 'bg-green-100' : 'bg-red-100'}`}>
                                <p className="text-[9px] font-black uppercase text-gray-600 mb-1">Net Annual Delta</p>
                                <p className={`text-2xl font-black ${results.analysis.isProfitable ? 'text-green-700' : 'text-red-700'}`}>
                                    {results.analysis.annualDelta >= 0 ? '+' : ''}{formatCurrency(results.analysis.annualDelta)}
                                </p>
                            </div>
                        </div>

                        {/* EXPENSE RATIO WARNING */}
                        {(() => {
                            const newExpenseRatio = ((results.new.expenses + newRent + newCommuteCost) / results.new.monthlyNet) * 100;
                            const isHighRisk = newExpenseRatio > 60;
                            const isMediumRisk = newExpenseRatio > 50 && newExpenseRatio <= 60;

                            if (isHighRisk || isMediumRisk) {
                                return (
                                    <div className={`border-4 border-black p-6 ${isHighRisk ? 'bg-red-100' : 'bg-yellow-100'} animate-in slide-in-from-bottom-4`}>
                                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 uppercase tracking-tight">
                                            <AlertCircle className={`w-5 h-5 ${isHighRisk ? 'text-red-600' : 'text-yellow-600'}`} />
                                            {isHighRisk ? '⚠️ High Risk Alert' : '💡 Caution'}
                                        </h2>
                                        <p className="text-sm font-bold mb-2">
                                            Your new expenses will be <span className={`text-xl ${isHighRisk ? 'text-red-700' : 'text-yellow-700'}`}>{newExpenseRatio.toFixed(0)}%</span> of your net income.
                                        </p>
                                        <p className="text-xs font-medium text-gray-700">
                                            {isHighRisk
                                                ? '🚨 This is considered high risk. Financial advisors recommend keeping expenses below 50% of income for financial stability.'
                                                : '⚠️ You\'re approaching the 60% threshold. Consider ways to reduce expenses or increase income.'}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* VISUAL EXPENSE COMPARISON */}
                        <div className="border-4 border-black p-6 bg-white">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 uppercase tracking-tight">
                                📊 Expense Breakdown Comparison
                            </h2>
                            <div className="space-y-4">
                                {/* Current Expenses */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-black uppercase text-green-600">Current Expenses</span>
                                        <span className="text-sm font-bold">
                                            {formatCurrency(results.current.expenses + currentRent + currentCommuteCost)}
                                            <span className="text-[10px] text-gray-500 ml-1">
                                                ({(((results.current.expenses + currentRent + currentCommuteCost) / results.current.monthlyNet) * 100).toFixed(0)}% of income)
                                            </span>
                                        </span>
                                    </div>
                                    <div className="w-full h-6 bg-gray-200 border-2 border-black">
                                        <div
                                            className="h-full bg-green-500 border-r-2 border-black transition-all duration-500"
                                            style={{ width: `${Math.min(((results.current.expenses + currentRent + currentCommuteCost) / results.current.monthlyNet) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* New Expenses */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-black uppercase text-blue-600">New Expenses</span>
                                        <span className="text-sm font-bold">
                                            {formatCurrency(results.new.expenses + newRent + newCommuteCost)}
                                            <span className="text-[10px] text-gray-500 ml-1">
                                                ({(((results.new.expenses + newRent + newCommuteCost) / results.new.monthlyNet) * 100).toFixed(0)}% of income)
                                            </span>
                                        </span>
                                    </div>
                                    <div className="w-full h-6 bg-gray-200 border-2 border-black">
                                        <div
                                            className={`h-full border-r-2 border-black transition-all duration-500 ${((results.new.expenses + newRent + newCommuteCost) / results.new.monthlyNet) > 0.6 ? 'bg-red-500' :
                                                ((results.new.expenses + newRent + newCommuteCost) / results.new.monthlyNet) > 0.5 ? 'bg-yellow-500' :
                                                    'bg-blue-500'
                                                }`}
                                            style={{ width: `${Math.min(((results.new.expenses + newRent + newCommuteCost) / results.new.monthlyNet) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Reference Line */}
                                <div className="pt-2 border-t border-gray-300">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase">
                                        💡 Recommended: Keep expenses below 50% of income
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* COMMUTE COMPARISON */}
                        <div className="border-4 border-black p-6 bg-purple-50">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 uppercase tracking-tight">
                                <Clock className="w-5 h-5 text-purple-600" /> Commute Impact Analysis
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Current Commute */}
                                <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-[10px] font-black uppercase text-green-600 mb-2">Current Commute</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-bold text-gray-600">Mode</span>
                                            <span className="font-black">{currentCommuteMode === 'walk' ? '🚶 Walk' : currentCommuteMode === 'bike' ? '🚴 Bike' : currentCommuteMode === 'car' ? '🚗 Car' : currentCommuteMode === 'public' ? '🚇 Public' : '🔀 Mixed'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="font-bold text-gray-600">Cost/Month</span>
                                            <span className="font-black">{formatCurrency(currentCommuteCost)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* New Commute */}
                                <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-[10px] font-black uppercase text-blue-600 mb-2">New Commute</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-bold text-gray-600">Mode</span>
                                            <span className="font-black">{newCommuteMode === 'walk' ? '🚶 Walk' : newCommuteMode === 'bike' ? '🚴 Bike' : newCommuteMode === 'car' ? '🚗 Car' : newCommuteMode === 'public' ? '🚇 Public' : '🔀 Mixed'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="font-bold text-gray-600">Cost/Month</span>
                                            <span className="font-black">{formatCurrency(newCommuteCost)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Commute Delta */}
                            {newCommuteCost !== currentCommuteCost && (
                                <div className={`mt-4 p-3 border-2 border-black ${newCommuteCost > currentCommuteCost ? 'bg-red-100' : 'bg-green-100'}`}>
                                    <p className="text-xs font-black uppercase">
                                        Commute Cost Change:
                                        <span className={`ml-2 text-lg ${newCommuteCost > currentCommuteCost ? 'text-red-700' : 'text-green-700'}`}>
                                            {newCommuteCost > currentCommuteCost ? '+' : ''}{formatCurrency(newCommuteCost - currentCommuteCost)}/month
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* BENEFITS COMPARISON */}
                        {(showCurrentBenefits || showNewBenefits) && (
                            <div className="border-4 border-black p-6 bg-gradient-to-br from-green-50 to-blue-50">
                                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 uppercase tracking-tight">
                                    💼 Total Compensation Analysis
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Current Benefits */}
                                    <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <p className="text-[10px] font-black uppercase text-green-600 mb-3">Current Total Comp</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-bold text-gray-600">Base Salary</span>
                                                <span className="font-black">{formatCurrency(currentSalary / 12)}/mo</span>
                                            </div>
                                            {showCurrentBenefits && (
                                                <>
                                                    <div className="flex justify-between text-xs text-green-600">
                                                        <span className="font-bold">+ Benefits</span>
                                                        <span className="font-black">
                                                            {formatCurrency(
                                                                currentBenefits.mealVouchers +
                                                                currentBenefits.gymMembership +
                                                                currentBenefits.stockOptions +
                                                                currentBenefits.otherPerks +
                                                                ((currentSalary * currentBenefits.pfMatch) / 100 / 12)
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="pt-2 border-t-2 border-black flex justify-between">
                                                        <span className="text-xs font-black uppercase">Total Comp</span>
                                                        <span className="text-lg font-black text-green-700">
                                                            {formatCurrency(
                                                                (currentSalary / 12) +
                                                                currentBenefits.mealVouchers +
                                                                currentBenefits.gymMembership +
                                                                currentBenefits.stockOptions +
                                                                currentBenefits.otherPerks +
                                                                ((currentSalary * currentBenefits.pfMatch) / 100 / 12)
                                                            )}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* New Benefits */}
                                    <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <p className="text-[10px] font-black uppercase text-blue-600 mb-3">New Total Comp</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-bold text-gray-600">Base Salary</span>
                                                <span className="font-black">{formatCurrency(newSalary / 12)}/mo</span>
                                            </div>
                                            {showNewBenefits && (
                                                <>
                                                    <div className="flex justify-between text-xs text-blue-600">
                                                        <span className="font-bold">+ Benefits</span>
                                                        <span className="font-black">
                                                            {formatCurrency(
                                                                newBenefits.mealVouchers +
                                                                newBenefits.gymMembership +
                                                                newBenefits.stockOptions +
                                                                newBenefits.otherPerks +
                                                                ((newSalary * newBenefits.pfMatch) / 100 / 12)
                                                            )}
                                                        </span>
                                                    </div>
                                                    {newBenefits.healthInsurance > 0 && (
                                                        <div className="flex justify-between text-xs text-red-600">
                                                            <span className="font-bold">- Health Insurance</span>
                                                            <span className="font-black">-{formatCurrency(newBenefits.healthInsurance)}</span>
                                                        </div>
                                                    )}
                                                    <div className="pt-2 border-t-2 border-black flex justify-between">
                                                        <span className="text-xs font-black uppercase">Total Comp</span>
                                                        <span className="text-lg font-black text-blue-700">
                                                            {formatCurrency(
                                                                (newSalary / 12) +
                                                                newBenefits.mealVouchers +
                                                                newBenefits.gymMembership +
                                                                newBenefits.stockOptions +
                                                                newBenefits.otherPerks +
                                                                ((newSalary * newBenefits.pfMatch) / 100 / 12) -
                                                                newBenefits.healthInsurance
                                                            )}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Total Comp Delta */}
                                {(showCurrentBenefits && showNewBenefits) && (() => {
                                    const currentTotalComp = (currentSalary / 12) +
                                        currentBenefits.mealVouchers +
                                        currentBenefits.gymMembership +
                                        currentBenefits.stockOptions +
                                        currentBenefits.otherPerks +
                                        ((currentSalary * currentBenefits.pfMatch) / 100 / 12);

                                    const newTotalComp = (newSalary / 12) +
                                        newBenefits.mealVouchers +
                                        newBenefits.gymMembership +
                                        newBenefits.stockOptions +
                                        newBenefits.otherPerks +
                                        ((newSalary * newBenefits.pfMatch) / 100 / 12) -
                                        newBenefits.healthInsurance;

                                    const delta = newTotalComp - currentTotalComp;

                                    return (
                                        <div className={`mt-4 p-4 border-2 border-black ${delta > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <p className="text-xs font-black uppercase mb-1">
                                                Total Compensation Change:
                                            </p>
                                            <p className={`text-2xl font-black ${delta > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                {delta > 0 ? '+' : ''}{formatCurrency(delta)}/month
                                            </p>
                                            <p className="text-[9px] font-bold text-gray-600 mt-1 italic">
                                                {delta > 0
                                                    ? '✓ Your total compensation (salary + benefits) will increase'
                                                    : '⚠️ Despite salary increase, total compensation may decrease due to benefits'}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* EXPORT BUTTONS */}
                        <div className="flex flex-col md:flex-row gap-4 mt-6">
                            <DownloadButtons 
                                onDownloadPDF={() => checkExports('pdf')}
                                onDownloadExcel={() => checkExports('excel')}
                            />
                        </div>
                    </ResultsAnalysis>

                    {/* THE REALIST'S NOTE */}
                    <Card title="The Realist's Note" icon={<Info className="!text-yellow-300 w-5 h-5" />} headerColor="bg-black !text-yellow-300" className="!bg-[#FEF08A]">
                        <div className="space-y-4">
                            <p className="text-sm font-bold leading-relaxed text-black">
                                💡 A spreadsheet cannot calculate the value of a home-cooked meal from a loved one or the peace of mind that comes with zero monthly debt. Sometimes, <strong>not having new expenses is worth more than a 20% increase in your paycheck.</strong>
                            </p>
                            <p className="text-sm font-bold leading-relaxed text-black">
                                Finances are a pivot point, but they are not the whole story. Factors like your love for your current city, the psychological safety of your existing social circle, or the specific "flow state" you find in your current role often outweigh monetary gains.
                            </p>
                            <p className="text-sm font-black leading-relaxed text-black italic">
                                Always ask: <span className="underline">Is this move buying me a better life, or just a bigger number?</span>
                            </p>
                        </div>
                    </Card>
                </div>
            </CalculatorLayout>

            <Footer>
                <p className="text-gray-600 font-medium">
                    <strong>Social Capital Matters:</strong> Moving for a job means leaving behind years of built relationships, local knowledge, and support systems. These intangible assets often take 1-2 years to rebuild in a new city.
                </p>
            </Footer>
        </div>
    );
}
