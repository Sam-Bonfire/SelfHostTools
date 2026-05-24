import React, { useState, useMemo } from 'react';
import { IndianRupee, TrendingUp, AlertTriangle, Activity, Settings, Info, Briefcase, ChevronRight } from 'lucide-react';
import { Button, Card, Input, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, DownloadButtons } from '@packages/styling';
import { calculateLifestyleCreep } from '../lib/lifestyleCreepLogic';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function LifestyleCreepCalculator() {
    // Inputs
    const [monthlyIncome, setMonthlyIncome] = useState(100000);
    const [monthlySavings, setMonthlySavings] = useState(20000);
    const [annualRaisePercent, setAnnualRaisePercent] = useState(10);
    const [roiPercent, setRoiPercent] = useState(12);
    const [inflationPercent, setInflationPercent] = useState(6);
    const [years, setYears] = useState(20);
    
    // The main slider
    const [raiseInvestedPercent, setRaiseInvestedPercent] = useState(50);

    // Calculate
    const results = useMemo(() => {
        return calculateLifestyleCreep({
            monthlyIncome: Number(monthlyIncome),
            monthlySavings: Number(monthlySavings),
            annualRaisePercent: Number(annualRaisePercent),
            roiPercent: Number(roiPercent),
            inflationPercent: Number(inflationPercent),
            raiseInvestedPercent: Number(raiseInvestedPercent),
            years: Number(years)
        });
    }, [monthlyIncome, monthlySavings, annualRaisePercent, roiPercent, inflationPercent, raiseInvestedPercent, years]);

    const { schedule, summary } = results;

    // Formatting utility
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(val);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-bold mb-2">Year {label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="font-bold text-sm">
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <CalculatorLayout>
            <CalculatorHeader
                title="Lifestyle Creep Simulator"
                description="The silent wealth destroyer. See what happens when you spend your raise vs. invest it over 20 years."
                icon={<Activity className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />}
                color="bg-rose-100"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Inputs */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                        <h2 className="text-xl font-black uppercase flex items-center gap-2 mb-6 border-b-4 border-black pb-4">
                            <Settings className="w-6 h-6" /> Variables
                        </h2>

                        <div className="space-y-5">
                            <Input
                                id="monthlyIncome"
                                label="Current Take-Home (Monthly)"
                                type="number"
                                value={monthlyIncome}
                                onChange={(e) => setMonthlyIncome(e.target.value)}
                                icon={<IndianRupee className="w-5 h-5 text-gray-500" />}
                                tooltip="Your current net monthly income after taxes."
                            />

                            <Input
                                id="monthlySavings"
                                label="Current Savings (Monthly)"
                                type="number"
                                value={monthlySavings}
                                onChange={(e) => setMonthlySavings(e.target.value)}
                                icon={<IndianRupee className="w-5 h-5 text-gray-500" />}
                                tooltip="How much of your current income you already save/invest each month."
                            />

                            <div className="pt-4 border-t-2 border-dashed border-gray-300">
                                <Input
                                    id="annualRaisePercent"
                                    label="Expected Annual Raise %"
                                    type="number"
                                    value={annualRaisePercent}
                                    onChange={(e) => setAnnualRaisePercent(e.target.value)}
                                    icon={<TrendingUp className="w-5 h-5 text-gray-500" />}
                                    tooltip="Average % your salary increases each year."
                                />

                                <div className="mt-6 p-4 bg-rose-50 border-2 border-black">
                                    <label htmlFor="raiseInvestedPercent" className="block text-sm font-black uppercase text-gray-700 mb-2 flex items-center gap-1">
                                        <Info className="w-4 h-4" /> % of Raise Invested
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            id="raiseInvestedPercent"
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="5"
                                            value={raiseInvestedPercent}
                                            onChange={(e) => setRaiseInvestedPercent(e.target.value)}
                                            className="w-full accent-rose-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="font-black text-xl w-16 text-right text-rose-600">{raiseInvestedPercent}%</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-500 mt-2">
                                        0% = You inflate your lifestyle to consume the whole raise. <br/>
                                        100% = You live on your old salary and invest all new money.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t-2 border-dashed border-gray-300 grid grid-cols-2 gap-4">
                                <Input
                                    id="roiPercent"
                                    label="ROI (%)"
                                    type="number"
                                    value={roiPercent}
                                    onChange={(e) => setRoiPercent(e.target.value)}
                                    tooltip="Expected annual return on investments."
                                />
                                <Input
                                    id="inflationPercent"
                                    label="Inflation (%)"
                                    type="number"
                                    value={inflationPercent}
                                    onChange={(e) => setInflationPercent(e.target.value)}
                                    tooltip="Average inflation rate."
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Download Card */}
                    <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-rose-50">
                        <DownloadButtons 
                            onDownloadPDF={() => downloadPDF({
                                inputs: { monthlyIncome, monthlySavings, annualRaisePercent, raiseInvestedPercent, roiPercent, inflationPercent, years },
                                results: summary,
                                schedule
                            })}
                            onDownloadExcel={() => downloadExcel({
                                inputs: { monthlyIncome, monthlySavings, annualRaisePercent, raiseInvestedPercent, roiPercent, inflationPercent, years },
                                results: summary,
                                schedule
                            })}
                        />
                    </Card>
                </div>

                {/* RIGHT: Results & Chart */}
                <div className="lg:col-span-8 space-y-6">
                    <ResultsAnalysis
                        title="The Cost of Creep"
                        verdict={
                            summary.costOfCreepNominal > 0 ? 
                            `You lose ${formatCurrency(summary.costOfCreepNominal)} to lifestyle inflation.` :
                            "You are immune to lifestyle creep!"
                        }
                        verdictColor={summary.costOfCreepNominal > 0 ? "text-rose-600" : "text-green-600"}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded">
                                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Scenario A (100% Invested)</p>
                                <p className="text-xl font-black">{formatCurrency(summary.finalBalanceA)}</p>
                            </div>
                            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Your Plan ({raiseInvestedPercent}% Invested)</p>
                                <p className="text-xl font-black">{formatCurrency(summary.finalBalanceB)}</p>
                            </div>
                            <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded">
                                <p className="text-xs font-bold text-rose-600 uppercase mb-1">Scenario C (0% Invested)</p>
                                <p className="text-xl font-black">{formatCurrency(summary.finalBalanceC)}</p>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-80 w-full mt-6 border-4 border-black p-4 bg-white">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={schedule} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis 
                                        dataKey="year" 
                                        tickFormatter={(val) => `Yr ${val}`}
                                        stroke="#000"
                                        tick={{fill: '#000', fontWeight: 'bold'}}
                                    />
                                    <YAxis 
                                        tickFormatter={(val) => `₹${(val/10000000).toFixed(1)}Cr`}
                                        stroke="#000"
                                        tick={{fill: '#000', fontWeight: 'bold'}}
                                    />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontWeight: 'bold' }} />
                                    
                                    <Area type="monotone" dataKey="balanceA" name="100% Invested" stroke="#10b981" fillOpacity={0.1} fill="#10b981" />
                                    <Area type="monotone" dataKey="balanceB" name={`Your Plan (${raiseInvestedPercent}%)`} stroke="#3b82f6" fillOpacity={0.3} fill="#3b82f6" />
                                    <Area type="monotone" dataKey="balanceC" name="0% Invested (Full Creep)" stroke="#f43f5e" fillOpacity={0.1} fill="#f43f5e" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 border-4 border-black">
                            <h3 className="font-black uppercase flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" /> Reality Check
                            </h3>
                            <p className="text-sm font-medium">
                                In <strong>real terms (adjusted for {inflationPercent}% inflation)</strong>, your final portfolio value is actually <strong>{formatCurrency(summary.finalRealBalanceB)}</strong> in today's purchasing power. By letting lifestyle creep consume {(100 - raiseInvestedPercent)}% of your raises, you forfeit a massive <strong>{formatCurrency(summary.maxCreepCostReal)}</strong> of real purchasing power compared to being perfectly disciplined.
                            </p>
                        </div>
                    </ResultsAnalysis>
                </div>
            </div>
        </CalculatorLayout>
    );
}
