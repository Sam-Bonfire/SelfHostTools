import { SEO } from '@packages/components';
import { resetPersistedState, usePersistedState } from '@packages/persistence';
import {
  CalculatorHeader,
  CalculatorLayout,
  Card,
  DownloadButtons,
  Footer,
  Input,
  ResultsAnalysis
} from '@packages/styling';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { calculateHabitDivergence, generateHabitSVGPaths } from '../lib/habitCompounderLogic';

export default function HabitCompounder() {
  const [weeklyRate, setWeeklyRate] = usePersistedState('HabitCompounder', 'weeklyRate', 1);
  const [years, setYears] = usePersistedState('HabitCompounder', 'years', 10);

  const resultsRef = useRef(null);

  const data = useMemo(() => {
    return calculateHabitDivergence(weeklyRate, years);
  }, [weeklyRate, years]);

  const svgPaths = useMemo(() => {
    return generateHabitSVGPaths(data.history, 800, 400, 40);
  }, [data.history]);

  const isGrowth = weeklyRate >= 0;
  const outcomeColor = isGrowth ? 'text-green-600' : 'text-red-500';
  const outcomeBgColor = isGrowth ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500';

  const formattedMultiplier = data.multiplier.toFixed(isGrowth && data.multiplier > 10 ? 0 : 2);
  const percentageChange = ((data.multiplier - 1) * 100).toFixed(1);

  const handleDownloadPDF = async () => {
    const el = resultsRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save('habit_compounder_report.pdf');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black p-4 md:p-8 font-sans">
      <SEO
        title="Habit Compounder Visualizer"
        description="Visualize the massive divergence between remaining stagnant and changing by just 1% a week over a decade."
        keywords="habit compounding, 1 percent better, atomic habits, exponential growth, visualizer"
        canonical={`${import.meta.env.VITE_SITE_URL}/habit-compounder`}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="HabitCompounder"
            icon={isGrowth ? TrendingUp : TrendingDown}
            title="The Habit Compounder"
            onReset={() => {
              resetPersistedState('HabitCompounder');
            }}
          />
        </div>

        {/* LEFT Panel: Inputs */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <Card title="The 1% Rule" headerColor="bg-black text-white">
            <div className="space-y-5">
              <div>
                <Input
                  id="weeklyRateInput"
                  label="Weekly Change Rate (%)"
                  type="number"
                  step="0.1"
                  value={weeklyRate}
                  onChange={(e) => setWeeklyRate(Number(e.target.value))}
                  className="font-black text-lg"
                />
                <input
                  id="weeklyRateSlider"
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={weeklyRate}
                  onChange={(e) => setWeeklyRate(Number(e.target.value))}
                  className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black"
                  aria-label="Weekly Rate Slider"
                />
                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                  Try +1% for growth, or -1% for decay.
                </p>
              </div>

              <div className="pt-4 border-t-2 border-black/10">
                <Input
                  id="yearsInput"
                  label="Time Horizon (Years)"
                  type="number"
                  min="1"
                  max="50"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
                  className="font-black text-lg"
                />
                <input
                  id="yearsSlider"
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black"
                  aria-label="Years Slider"
                />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="pt-2">
            <DownloadButtons onDownloadPDF={handleDownloadPDF} />
          </div>
        </div>

        {/* RIGHT Panel: Visualizer */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
          <ResultsAnalysis>
            <div ref={resultsRef} className="space-y-6">
              <div
                className={`p-6 border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4 ${outcomeBgColor}`}
              >
                <div className="space-y-1 text-center md:text-left">
                  <h2 className="text-sm font-black uppercase tracking-wider text-black">The Brutal Reality</h2>
                  <p className="text-xl md:text-2xl font-bold leading-tight">
                    In {years} years, the person who changed by {weeklyRate > 0 ? '+' : ''}
                    {weeklyRate}% a week is{' '}
                    <span className={`font-black underline decoration-4 ${outcomeColor}`}>{formattedMultiplier}x</span>{' '}
                    compared to the person who stayed exactly the same.
                  </p>
                </div>
                <div className={`text-4xl md:text-6xl font-black ${outcomeColor}`}>
                  {percentageChange > 0 ? '+' : ''}
                  {percentageChange}%
                </div>
              </div>

              <Card
                title={`${years}-Year Divergence Graph`}
                headerColor="bg-black text-white"
                className="relative overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[600px] relative">
                    <svg viewBox="0 0 800 400" className="w-full h-auto block overflow-visible select-none">
                      {/* Grid lines */}
                      <g stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4">
                        <line x1="20" y1="40" x2="780" y2="40" />
                        <line x1="20" y1="120" x2="780" y2="120" />
                        <line x1="20" y1="200" x2="780" y2="200" />
                        <line x1="20" y1="280" x2="780" y2="280" />
                        <line x1="20" y1="360" x2="780" y2="360" />

                        {/* Vertical Year Lines */}
                        {Array.from({ length: Math.min(years + 1, 11) }).map((_, i) => {
                          const numLines = Math.min(years, 10);
                          const x = 20 + (i / numLines) * 760;
                          return <line key={i} x1={x} y1="20" x2={x} y2="380" />;
                        })}
                      </g>

                      {/* Fill area between flat and compound */}
                      {svgPaths.fillPath && (
                        <path
                          d={svgPaths.fillPath}
                          fill={isGrowth ? '#DCFCE7' : '#FEE2E2'}
                          fillOpacity="0.8"
                          className="transition-all duration-500 ease-out"
                        />
                      )}

                      {/* Stagnation Line (Flat) */}
                      {svgPaths.flatPath && (
                        <g>
                          <path
                            d={svgPaths.flatPath}
                            fill="none"
                            stroke="#000000"
                            strokeWidth="4"
                            className="transition-all duration-500 ease-out"
                          />
                          <text
                            x="20"
                            y={svgPaths.scaleY ? svgPaths.scaleY(1) - 10 : 0}
                            fontWeight="900"
                            fontSize="12"
                            className="uppercase"
                          >
                            Baseline (Stagnation)
                          </text>
                        </g>
                      )}

                      {/* Compounding Line */}
                      {svgPaths.compoundPath && (
                        <path
                          d={svgPaths.compoundPath}
                          fill="none"
                          stroke={isGrowth ? '#16A34A' : '#DC2626'}
                          strokeWidth="6"
                          className="transition-all duration-500 ease-out drop-shadow-md"
                        />
                      )}

                      {/* Data Point at End */}
                      {svgPaths.points && svgPaths.points.length > 0 && (
                        <g className="transition-all duration-500 ease-out">
                          <circle
                            cx={svgPaths.points[svgPaths.points.length - 1].x}
                            cy={svgPaths.points[svgPaths.points.length - 1].yCompound}
                            r="8"
                            fill={isGrowth ? '#16A34A' : '#DC2626'}
                            stroke="#000"
                            strokeWidth="3"
                          />
                          <rect
                            x={svgPaths.points[svgPaths.points.length - 1].x - 80}
                            y={svgPaths.points[svgPaths.points.length - 1].yCompound - 40}
                            width="70"
                            height="24"
                            fill="#000"
                          />
                          <text
                            x={svgPaths.points[svgPaths.points.length - 1].x - 45}
                            y={svgPaths.points[svgPaths.points.length - 1].yCompound - 24}
                            fill="#FFF"
                            fontSize="12"
                            fontWeight="900"
                            textAnchor="middle"
                          >
                            {formattedMultiplier}x
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                </div>
              </Card>
            </div>
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium text-sm">
          <strong>The brutal math of consistency:</strong> Over long periods, the difference between trying slightly and
          doing nothing is not linear—it is astronomical.
        </p>
      </Footer>
    </div>
  );
}
