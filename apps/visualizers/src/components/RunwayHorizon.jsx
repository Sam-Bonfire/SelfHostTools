import React, { useState, useMemo } from 'react';
import { Card, Input, CalculatorHeader, CalculatorLayout, ResultsAnalysis, Button, DownloadButtons, Footer, MetricDisplay } from '@packages/styling';
import { SEO } from '@packages/components';
import { Sun, Calendar, AlertOctagon, TrendingUp, ShieldAlert, Award, Download } from 'lucide-react';
import { calculateRunwayData, generateSVGPath } from '../lib/runwayLandscape';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { usePersistedState, resetPersistedState } from '@packages/components';

export default function RunwayHorizon() {
    const [cash, setCash] = usePersistedState('RunwayHorizon', 'cash', 250000);
    const [fixedExpenses, setFixedExpenses] = usePersistedState('RunwayHorizon', 'fixedExpenses', 30000);
    const [variableExpenses, setVariableExpenses] = usePersistedState('RunwayHorizon', 'variableExpenses', 15000);
    const [income, setIncome] = usePersistedState('RunwayHorizon', 'income', 10000);
    const [scenario, setScenario] = usePersistedState('RunwayHorizon', 'scenario', 'comfort');
    const [lifeEvents, setLifeEvents] = usePersistedState('RunwayHorizon', 'lifeEvents', []);

    const resultsRef = React.useRef(null);

    const presetEvents = useMemo(() => [
        { id: 'e1', name: 'Car Breakdown', amount: -50000, month: 4, icon: '💥' },
        { id: 'e2', name: 'Medical Hit', amount: -100000, month: 8, icon: '🏥' },
        { id: 'e3', name: 'Job Loss (3 mo)', amount: -(income * 3), month: 12, icon: '📉' },
        { id: 'e4', name: 'Year-End Bonus', amount: 50000, month: 12, icon: '💰' }
    ], [income]);

    const toggleLifeEvent = (eventDef) => {
        setLifeEvents(prev => {
            if (prev.some(e => e.id === eventDef.id)) {
                return prev.filter(e => e.id !== eventDef.id);
            }
            return [...prev, eventDef];
        });
    };

    const runwayData = useMemo(() => {
        const effectiveVariableExpenses = scenario === 'survival' ? 0 : Number(variableExpenses);
        return calculateRunwayData(
            Number(cash),
            Number(fixedExpenses),
            effectiveVariableExpenses,
            Number(income),
            lifeEvents
        );
    }, [cash, fixedExpenses, variableExpenses, income, scenario, lifeEvents]);

    const svgPaths = useMemo(() => {
        return generateSVGPath(runwayData.history, 600, 300);
    }, [runwayData.history]);

    // Find the month where cash hits 0 (first month where balance === 0)
    const crashMonth = useMemo(() => {
        if (runwayData.isInfinite) return null;
        const firstZero = runwayData.history.find(h => h.balance === 0);
        return firstZero ? firstZero.month : null;
    }, [runwayData.history, runwayData.isInfinite]);

    // Find SVG coordinate of the crash month to position warning flag
    const crashPointX = useMemo(() => {
        if (crashMonth === null || !svgPaths.points) return null;
        const pt = svgPaths.points[crashMonth];
        return pt ? pt.x : null;
    }, [crashMonth, svgPaths.points]);

    const handleDownloadPDF = async () => {
        const el = resultsRef.current;
        if (!el) return;
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        pdf.save('runway_horizon_report.pdf');
    };

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
            <SEO
                title="Runway Horizon Visualizer"
                description="Visualize your personal cash runway and runway crash point over a 24-month horizon using an interactive smooth Bezier landscape."
                keywords="cash runway, burn rate, runway horizon, budget visualizer, cashflow tracker"
                canonical={`${import.meta.env.VITE_SITE_URL}/runway-horizon`}
            />

            <CalculatorLayout>
                <div className="lg:col-span-12">
                    <CalculatorHeader
                        icon={Sun}
                        title="Personal Runway Horizon"
                    
            onReset={() => { resetPersistedState('RunwayHorizon'); window.location.reload(); }} />
                </div>

                {/* LEFT Panel: Financial Inputs */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                    <Card title="Runway Inputs" headerColor="bg-yellow-300">
                        <div className="space-y-5">
                            <Input
                                id="cashInput"
                                label="Current Liquid Cash (₹)"
                                type="number"
                                value={cash}
                                onChange={(e) => setCash(Math.max(0, Number(e.target.value)))}
                                className="font-black"
                            />

                            <Input
                                id="fixedExpensesInput"
                                label="Fixed Monthly Expenses (₹)"
                                type="number"
                                value={fixedExpenses}
                                onChange={(e) => setFixedExpenses(Math.max(0, Number(e.target.value)))}
                                className="font-black"
                            />

                            <Input
                                id="variableExpensesInput"
                                label="Variable Monthly Expenses (₹)"
                                type="number"
                                value={variableExpenses}
                                onChange={(e) => setVariableExpenses(Math.max(0, Number(e.target.value)))}
                                className="font-black"
                            />

                            <Input
                                id="incomeInput"
                                label="Stable Monthly Income (₹)"
                                type="number"
                                value={income}
                                onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                                className="font-black"
                            />
                        </div>
                    </Card>

                    <Card title="Scenario Mode" headerColor="bg-black text-white">
                        <div className="flex gap-0 mb-4">
                            <button
                                onClick={() => setScenario('comfort')}
                                className={`flex-1 py-3 px-4 text-xs font-black uppercase border-4 border-black transition-all ${
                                    scenario === 'comfort'
                                        ? 'bg-[#FFDE59] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                🏡 Comfort
                            </button>
                            <button
                                onClick={() => setScenario('survival')}
                                className={`flex-1 py-3 px-4 text-xs font-black uppercase border-4 border-l-0 border-black transition-all ${
                                    scenario === 'survival'
                                        ? 'bg-[#FFDE59] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                🏕️ Survival
                            </button>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">
                                {scenario === 'survival'
                                    ? 'Variable expenses set to ₹0. Only fixed costs apply.'
                                    : 'Full expenses applied (fixed + variable).'}
                            </p>
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="pt-2">
                        <DownloadButtons onDownloadPDF={handleDownloadPDF} />
                    </div>
                </div>

                {/* RIGHT Panel: SVG Landscape & Amortization Metrics */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                    <ResultsAnalysis>
                        <div ref={resultsRef} className="space-y-6">
                        {/* Runway Metrics grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-5 h-full">
                                <MetricDisplay
                                    title="Runway Duration"
                                    value={runwayData.isInfinite ? 'Infinite 🚀' : `${runwayData.runwayMonths} Months`}
                                    subtitle={runwayData.isInfinite ? 'Self-Sufficient Wealth' : 'Until absolute cashout'}
                                />
                            </Card>

                            <Card className="p-5 h-full">
                                <MetricDisplay
                                    title="Net Monthly Burn"
                                    value={`₹${runwayData.netBurn.toLocaleString('en-IN')}`}
                                    subtitle={runwayData.netBurn > 0 ? 'Total Outflow speed' : 'Surplus Savings / Month'}
                                />
                            </Card>

                            <Card className="p-5 h-full">
                                <MetricDisplay
                                    title="Horizon Status"
                                    value={
                                        <div className="flex items-center gap-2">
                                            {runwayData.isInfinite ? (
                                                <><Award className="w-8 h-8 text-green-700" /> SAFE</>
                                            ) : runwayData.runwayMonths < 6 ? (
                                                <><ShieldAlert className="w-8 h-8 text-red-600" /> CRITICAL</>
                                            ) : (
                                                <><Calendar className="w-8 h-8 text-blue-700" /> STABLE</>
                                            )}
                                        </div>
                                    }
                                    subtitle={runwayData.isInfinite ? 'Accumulating Cashflow' : `${runwayData.runwayMonths} months of safety`}
                                />
                            </Card>
                        </div>

                        {/* Life Event Stress-Test Panel */}
                        <Card title="Life Event Stress-Test (Click to Inject)" headerColor="bg-black text-white" className="relative overflow-hidden">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {presetEvents.map(ev => {
                                    const isActive = lifeEvents.some(e => e.id === ev.id);
                                    return (
                                        <button
                                            key={ev.id}
                                            onClick={() => toggleLifeEvent(ev)}
                                            className={`p-3 border-2 border-black font-bold text-[10px] uppercase flex flex-col items-center gap-2 transition-all ${
                                                isActive 
                                                    ? 'bg-[#EF4444] text-white shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.5)] translate-y-0.5' 
                                                    : 'bg-white hover:bg-[#FFDE59] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
                                            }`}
                                        >
                                            <span className="text-2xl">{ev.icon}</span>
                                            <span className="text-center">{ev.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Interactive SVG Rolling Landscape */}
                        <Card title="24-Month Rolling Horizon" headerColor="bg-black text-white" className="relative overflow-hidden">
                            <div className="overflow-x-auto">
                                <div className="min-w-[600px] relative">
                                    <svg viewBox="0 0 600 300" className="w-full h-auto block overflow-visible select-none">
                                        {/* Vintage grid mesh lines */}
                                        <g stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3">
                                            <line x1="20" y1="40" x2="580" y2="40" />
                                            <line x1="20" y1="100" x2="580" y2="100" />
                                            <line x1="20" y1="160" x2="580" y2="160" />
                                            <line x1="20" y1="220" x2="580" y2="220" />
                                            <line x1="20" y1="260" x2="580" y2="260" />

                                            {/* Vertical Timeline Month Bars */}
                                            <line x1="20" y1="20" x2="20" y2="260" />
                                            <line x1="160" y1="20" x2="160" y2="260" />
                                            <line x1="300" y1="20" x2="300" y2="260" />
                                            <line x1="440" y1="20" x2="440" y2="260" />
                                            <line x1="580" y1="20" x2="580" y2="260" />
                                        </g>

                                        {/* Rolling Hills Landscape Path Fill */}
                                        {svgPaths.fillPath && (
                                            <path
                                                d={svgPaths.fillPath}
                                                fill={runwayData.isInfinite ? '#DCFCE7' : '#EFF6FF'}
                                                className="transition-all duration-300"
                                            />
                                        )}

                                        {/* Top rolling hill outline */}
                                        {svgPaths.linePath && (
                                            <path
                                                d={svgPaths.linePath}
                                                fill="none"
                                                stroke="#000000"
                                                strokeWidth="4"
                                                className="transition-all duration-300"
                                            />
                                        )}

                                        {/* Life Event Markers on Landscape */}
                                        {lifeEvents.map(ev => {
                                            const pt = svgPaths.points && svgPaths.points[ev.month];
                                            if (!pt) return null;
                                            return (
                                                <g key={ev.id} className="transition-all duration-300">
                                                    <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y - 30} stroke="#000" strokeWidth="2" strokeDasharray="2 2" />
                                                    <circle cx={pt.x} cy={pt.y} r="5" fill={ev.amount < 0 ? '#EF4444' : '#10B981'} stroke="#000" strokeWidth="2.5" />
                                                    <text x={pt.x} y={pt.y - 35} textAnchor="middle" fontSize="16">
                                                        {ev.icon}
                                                    </text>
                                                    <text x={pt.x} y={pt.y - 55} textAnchor="middle" fontSize="10" fontWeight="900" fill={ev.amount < 0 ? '#EF4444' : '#10B981'} className="uppercase">
                                                        {ev.amount > 0 ? '+' : ''}{ev.amount.toLocaleString()}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* Critical Crash point alerts */}
                                        {crashPointX !== null && crashPointX < 580 && (
                                            <g>
                                                {/* Danger Area Fill */}
                                                <rect
                                                    x={crashPointX}
                                                    y="40"
                                                    width={580 - crashPointX}
                                                    height="220"
                                                    fill="#FEE2E2"
                                                    fillOpacity="0.6"
                                                    stroke="#EF4444"
                                                    strokeWidth="2"
                                                    strokeDasharray="4 4"
                                                />
                                                {/* Alert Skull flag */}
                                                <line
                                                    x1={crashPointX}
                                                    y1="260"
                                                    x2={crashPointX}
                                                    y2="50"
                                                    stroke="#EF4444"
                                                    strokeWidth="3"
                                                />
                                                <circle cx={crashPointX} cy="50" r="14" fill="#EF4444" stroke="#000000" strokeWidth="2.5" />
                                                <text
                                                    x={crashPointX}
                                                    y="54"
                                                    textAnchor="middle"
                                                    fill="#FFFFFF"
                                                    fontSize="10"
                                                    fontWeight="900"
                                                >
                                                    ☠️
                                                </text>
                                                <text
                                                    x={crashPointX + 10}
                                                    y="90"
                                                    fill="#EF4444"
                                                    fontSize="9"
                                                    fontWeight="900"
                                                    className="uppercase tracking-tight"
                                                >
                                                    CRASH OUT (M{crashMonth})
                                                </text>
                                            </g>
                                        )}

                                        {/* Safe Wealth Expansion display */}
                                        {runwayData.isInfinite && (
                                            <g>
                                                <circle cx="300" cy="80" r="16" fill="#10B981" stroke="#000000" strokeWidth="2.5" />
                                                <text x="300" y="84" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">
                                                    🚀
                                                </text>
                                                <text x="325" y="85" fill="#10B981" fontSize="10" fontWeight="900" className="uppercase tracking-wide">
                                                    Infinite Savings Accumulation
                                                </text>
                                            </g>
                                        )}

                                        {/* Bottom Baseline Floor */}
                                        <line x1="10" y1="260" x2="590" y2="260" stroke="#000000" strokeWidth="6" />

                                        {/* Grid Labels */}
                                        <g fill="#6B7280" fontSize="9" fontWeight="900" className="uppercase">
                                            <text x="20" y="278" textAnchor="middle">Today</text>
                                            <text x="160" y="278" textAnchor="middle">Month 6</text>
                                            <text x="300" y="278" textAnchor="middle">Month 12</text>
                                            <text x="440" y="278" textAnchor="middle">Month 18</text>
                                            <text x="580" y="278" textAnchor="middle">Month 24</text>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                        </Card>
                        </div>
                    </ResultsAnalysis>
                </div>
            </CalculatorLayout>
        
      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> This runway calculation is mathematical. 
          <br className="md:hidden" />
          The true lesson is elasticity—your survival runway is always longer than your comfort runway if you are willing to cut variable burn drastically.
        </p>
      </Footer>
    </div>
    );
}
