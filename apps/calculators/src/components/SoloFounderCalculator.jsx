import React, { useState, useMemo } from 'react';
import { IndianRupee, Rocket, TrendingDown, TrendingUp, Target, Server, Percent, Briefcase, Zap, Info, Clock } from 'lucide-react';
import { Button, Card, Input, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, DownloadButtons, Footer, MetricDisplay } from '@packages/styling';
import { calculateSoloFounderRunway } from '../lib/soloFounderLogic';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import { usePersistedState, resetPersistedState } from '@packages/components';

export default function SoloFounderCalculator() {
    // Inputs
    const [mrr, setMrr] = usePersistedState('SoloFounderCalculator', 'mrr', 50000);
    const [averageRevenuePerUser, setAverageRevenuePerUser] = usePersistedState('SoloFounderCalculator', 'averageRevenuePerUser', 1000);
    const [churnRatePercent, setChurnRatePercent] = usePersistedState('SoloFounderCalculator', 'churnRatePercent', 5);
    const [stripeFeePercent, setStripeFeePercent] = usePersistedState('SoloFounderCalculator', 'stripeFeePercent', 2.9);
    const [stripeFixedFee, setStripeFixedFee] = usePersistedState('SoloFounderCalculator', 'stripeFixedFee', 25);
    const [serverCosts, setServerCosts] = usePersistedState('SoloFounderCalculator', 'serverCosts', 2000);
    const [toolCosts, setToolCosts] = usePersistedState('SoloFounderCalculator', 'toolCosts', 3000);
    const [taxRatePercent, setTaxRatePercent] = usePersistedState('SoloFounderCalculator', 'taxRatePercent', 10);
    const [dayJobSalary, setDayJobSalary] = usePersistedState('SoloFounderCalculator', 'dayJobSalary', 100000);
    const [weeklyHoursDedicated, setWeeklyHoursDedicated] = usePersistedState('SoloFounderCalculator', 'weeklyHoursDedicated', 20);

    // Calculate
    const results = useMemo(() => {
        return calculateSoloFounderRunway({
            mrr: Number(mrr),
            averageRevenuePerUser: Number(averageRevenuePerUser),
            churnRatePercent: Number(churnRatePercent),
            stripeFeePercent: Number(stripeFeePercent),
            stripeFixedFee: Number(stripeFixedFee),
            serverCosts: Number(serverCosts),
            toolCosts: Number(toolCosts),
            taxRatePercent: Number(taxRatePercent),
            dayJobSalary: Number(dayJobSalary),
            weeklyHoursDedicated: Number(weeklyHoursDedicated)
        });
    }, [mrr, averageRevenuePerUser, churnRatePercent, stripeFeePercent, stripeFixedFee, serverCosts, toolCosts, taxRatePercent, dayJobSalary, weeklyHoursDedicated]);

    const { financials, milestones, metrics } = results;

    // Formatting utility
    const formatCurrency = (val) => {
        if (val === Infinity) return "Impossible";
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Calculate progress towards Freedom MRR
    const freedomProgress = milestones.freedomMRR > 0 && milestones.freedomMRR !== Infinity ? Math.min(100, (mrr / milestones.freedomMRR) * 100) : 0;

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <CalculatorLayout>
            <div className="lg:col-span-12">
        <CalculatorHeader
                title="Solo-Founder Runway & Bootstrapping"
                icon={<Rocket className="w-8 h-8 md:w-10 md:h-10 text-purple-500" 
            onReset={() => { resetPersistedState('SoloFounderCalculator'); window.location.reload(); }} />}
                color="bg-purple-100"
            />
      </div>

            <div className="lg:col-span-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Inputs */}
                <div className="lg:col-span-5 space-y-6">
                    <Card title="Business Metrics" icon={Target} headerColor="bg-white" className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                        <div className="space-y-4">
                            <Input
                                id="mrr"
                                label="Current MRR"
                                type="number"
                                value={mrr}
                                onChange={(e) => setMrr(e.target.value)}
                                icon={<IndianRupee className="w-5 h-5 text-gray-500" />}
                                tooltip="Monthly Recurring Revenue before any deductions."
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="averageRevenuePerUser"
                                    label="ARPU (₹)"
                                    type="number"
                                    value={averageRevenuePerUser}
                                    onChange={(e) => setAverageRevenuePerUser(e.target.value)}
                                    tooltip="Average Revenue Per User. Used to estimate transaction fees."
                                />
                                <Input
                                    id="churnRatePercent"
                                    label="Churn Rate (%)"
                                    type="number"
                                    value={churnRatePercent}
                                    onChange={(e) => setChurnRatePercent(e.target.value)}
                                    icon={<TrendingDown className="w-5 h-5 text-gray-500" />}
                                    tooltip="Percentage of MRR lost every month."
                                />
                            </div>

                            <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
                                <label className="block text-sm font-black uppercase text-gray-700 mb-3 flex items-center gap-1">
                                    <Zap className="w-4 h-4" /> Gateway Fees (Stripe, Razorpay)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        id="stripeFeePercent"
                                        label="Variable %"
                                        type="number"
                                        value={stripeFeePercent}
                                        onChange={(e) => setStripeFeePercent(e.target.value)}
                                        step="0.1"
                                    />
                                    <Input
                                        id="stripeFixedFee"
                                        label="Fixed (₹)"
                                        type="number"
                                        value={stripeFixedFee}
                                        onChange={(e) => setStripeFixedFee(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Overhead & Goals" icon={Server} headerColor="bg-white" className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="serverCosts"
                                    label="Server/Hosting"
                                    type="number"
                                    value={serverCosts}
                                    onChange={(e) => setServerCosts(e.target.value)}
                                    icon={<Server className="w-5 h-5 text-gray-500" />}
                                />
                                <Input
                                    id="toolCosts"
                                    label="SaaS Tools"
                                    type="number"
                                    value={toolCosts}
                                    onChange={(e) => setToolCosts(e.target.value)}
                                />
                            </div>

                            <Input
                                id="taxRatePercent"
                                label="Self-Employment Tax (%)"
                                type="number"
                                value={taxRatePercent}
                                onChange={(e) => setTaxRatePercent(e.target.value)}
                                icon={<Percent className="w-5 h-5 text-gray-500" />}
                                tooltip="Estimated income tax rate on your business profits."
                            />

                            <div className="pt-4 border-t-2 border-black">
                                <Input
                                    id="dayJobSalary"
                                    label="Day Job Target (Net)"
                                    type="number"
                                    value={dayJobSalary}
                                    onChange={(e) => setDayJobSalary(e.target.value)}
                                    icon={<Briefcase className="w-5 h-5 text-gray-500" />}
                                    tooltip="How much net profit do you need to comfortably quit your job?"
                                />
                                <Input
                                    id="weeklyHoursDedicated"
                                    label="Weekly Hours on Project"
                                    type="number"
                                    value={weeklyHoursDedicated}
                                    onChange={(e) => setWeeklyHoursDedicated(e.target.value)}
                                    icon={<Clock className="w-5 h-5 text-gray-500" />}
                                    className="mt-4"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-purple-50">
                        <DownloadButtons 
                            onDownloadPDF={() => downloadPDF({
                                inputs: { mrr, averageRevenuePerUser, churnRatePercent, stripeFeePercent, stripeFixedFee, serverCosts, toolCosts, taxRatePercent, dayJobSalary, weeklyHoursDedicated },
                                results: { financials, milestones, metrics }
                            })}
                            onDownloadExcel={() => downloadExcel({
                                inputs: { mrr, averageRevenuePerUser, churnRatePercent, stripeFeePercent, stripeFixedFee, serverCosts, toolCosts, taxRatePercent, dayJobSalary, weeklyHoursDedicated },
                                results: { financials, milestones, metrics }
                            })}
                        />
                    </Card>
                </div>

                {/* RIGHT: Results */}
                <div className="lg:col-span-7 space-y-6">
                    <ResultsAnalysis
                        title="The Reality Check"
                        verdict={milestones.hasReachedFreedom ? "You have reached Freedom MRR! Time to quit." : (milestones.isProfitable ? "Profitable, but keep grinding towards Freedom." : "Currently burning cash. Focus on reaching Break-Even.")}
                        verdictColor={milestones.hasReachedFreedom ? "text-green-600" : (milestones.isProfitable ? "text-yellow-600" : "text-rose-600")}
                    >
                        {/* Progress Bar Container */}
                        <div className="mb-8 p-4 bg-gray-50 border-4 border-black relative">
                            <h3 className="font-black uppercase mb-4 text-sm text-gray-500">Freedom Progress</h3>
                            
                            {/* The Bar */}
                            <div className="h-8 w-full bg-gray-200 border-2 border-black relative overflow-hidden">
                                <div 
                                    className={`h-full border-r-2 border-black transition-all duration-1000 ${milestones.hasReachedFreedom ? 'bg-green-500' : 'bg-purple-500'}`} 
                                    style={{ width: `${Math.max(2, freedomProgress)}%` }}
                                ></div>
                                {/* Break Even Marker */}
                                <div 
                                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-500 transition-all duration-1000 z-10 flex flex-col items-center justify-center"
                                    style={{ left: `${Math.min(100, (milestones.breakEvenMRR / milestones.freedomMRR) * 100)}%` }}
                                    title="Break-Even Point"
                                >
                                </div>
                            </div>

                            <div className="flex justify-between mt-2 text-xs font-bold text-gray-500">
                                <span>₹0</span>
                                <span className="text-red-500">Break-Even ({formatCurrency(milestones.breakEvenMRR)})</span>
                                <span className="text-green-600">Freedom ({formatCurrency(milestones.freedomMRR)})</span>
                            </div>
                        </div>

                        {/* Core Milestones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className={`p-4 border-4 border-black ${milestones.isProfitable ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                <MetricDisplay 
                                    title={
                                        <span className="flex items-center justify-between">
                                            Current Net Profit
                                            {milestones.isProfitable ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
                                        </span>
                                    }
                                    value={`${formatCurrency(financials.netProfit)} / mo`}
                                    color={milestones.isProfitable ? 'text-emerald-600' : 'text-rose-600'}
                                    subtitle={`Equivalent to ${formatCurrency(metrics.trueHourlyRate)}/hour for your time.`}
                                />
                            </div>

                            <div className="p-4 border-4 border-black bg-purple-50">
                                <MetricDisplay 
                                    title="Users Needed for Freedom"
                                    value={metrics.customersNeededForFreedom}
                                    subtitle={`Active paying users at ${formatCurrency(averageRevenuePerUser)} ARPU.`}
                                />
                            </div>
                        </div>

                        {/* The Waterfall Breakdown */}
                        <div className="border-4 border-black bg-white overflow-hidden">
                            <div className="bg-black text-white p-3 border-b-4 border-black">
                                <h3 className="font-black uppercase text-sm">Monthly Cash Flow Breakdown</h3>
                            </div>
                            
                            <div className="p-4 space-y-3 font-bold">
                                <div className="flex justify-between items-center text-lg">
                                    <span>Gross MRR</span>
                                    <span>{formatCurrency(mrr)}</span>
                                </div>
                                <div className="flex justify-between items-center text-rose-500 pl-4 border-l-4 border-rose-500">
                                    <span>- Churned Revenue</span>
                                    <span>-{formatCurrency(financials.monthlyChurnedRevenue)}</span>
                                </div>
                                <div className="flex justify-between items-center text-rose-500 pl-4 border-l-4 border-rose-500">
                                    <span>- Payment Gateway Fees</span>
                                    <span>-{formatCurrency(financials.totalStripeFees)}</span>
                                </div>
                                <div className="flex justify-between items-center text-rose-500 pl-4 border-l-4 border-rose-500">
                                    <span>- Infrastructure & Tools</span>
                                    <span>-{formatCurrency(financials.totalOverhead)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xl pt-3 border-t-2 border-dashed border-gray-300">
                                    <span>Gross Profit</span>
                                    <span className={financials.grossProfit > 0 ? "text-green-600" : "text-rose-600"}>
                                        {formatCurrency(financials.grossProfit)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-rose-500 pl-4 border-l-4 border-rose-500">
                                    <span>- Income Taxes ({taxRatePercent}%)</span>
                                    <span>-{formatCurrency(financials.taxes)}</span>
                                </div>
                                <div className="flex justify-between items-center text-2xl pt-3 border-t-4 border-black">
                                    <span>True Net Profit</span>
                                    <span className={financials.netProfit > 0 ? "text-green-600" : "text-rose-600"}>
                                        {formatCurrency(financials.netProfit)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reality Note */}
                        {metrics.marginPerUserPercent <= 0 && (
                            <div className="mt-6 p-4 bg-red-100 border-4 border-red-500 text-red-800 font-bold flex items-start gap-3">
                                <Info className="w-6 h-6 flex-shrink-0" />
                                <div>
                                    <p className="uppercase mb-1">Fatal Economics!</p>
                                    <p className="text-sm">Your unit economics are fundamentally broken. Your churn and transaction fees consume 100%+ of your revenue. You can never reach Break-Even no matter how many users you acquire. Raise prices or lower variable costs immediately.</p>
                                </div>
                            </div>
                        )}
                        {metrics.marginPerUserPercent > 0 && (
                            <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-200 text-purple-800 font-medium text-sm">
                                <p><strong>Did you know?</strong> Your actual profit margin per active user is exactly <strong>{metrics.marginPerUserPercent.toFixed(1)}%</strong>. Every new {formatCurrency(averageRevenuePerUser)} user only adds {formatCurrency(averageRevenuePerUser * (metrics.marginPerUserPercent / 100))} to your bottom line before taxes.</p>
                            </div>
                        )}
                    </ResultsAnalysis>
                </div>
            
      </div>
    </div>
        </CalculatorLayout>
        <Footer>
            <p className="text-gray-600 font-medium">
                <strong>Disclaimer:</strong> Revenue is vanity, profit is sanity, but cash is reality.
                <br className="md:hidden" />
                Never mistake MRR for personal income. After churn, gateway fees, servers, tools, and taxes, the real money you take home is often less than half of your topline.
            </p>
        </Footer>
    </div>
    );
}
