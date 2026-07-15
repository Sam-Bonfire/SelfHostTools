import { SEO } from '@packages/components';
import { resetPersistedState, usePersistedState } from '@packages/persistence';
import {
  CalculatorHeader,
  CalculatorLayout,
  Card,
  DownloadButtons,
  Footer,
  Input,
  MetricDisplay,
  ResultsAnalysis
} from '@packages/styling';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AlertTriangle, Clock, Coffee, ShieldAlert, Sparkles } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { calculateFreedomIndex, generateDonutWedge } from '../lib/freedomMath';

export default function FreedomClock() {
  const [sleep, setSleep] = usePersistedState('FreedomClock', 'sleep', 8);
  const [commute, setCommute] = usePersistedState('FreedomClock', 'commute', 1);
  const [work, setWork] = usePersistedState('FreedomClock', 'work', 8);
  const [admin, setAdmin] = usePersistedState('FreedomClock', 'admin', 1.5);
  const [chores, setChores] = usePersistedState('FreedomClock', 'chores', 2);
  const [currentAge, setCurrentAge] = usePersistedState('FreedomClock', 'currentAge', 28);
  const [retirementAge, setRetirementAge] = usePersistedState('FreedomClock', 'retirementAge', 55);
  const [monthlyIncome, setMonthlyIncome] = usePersistedState('FreedomClock', 'monthlyIncome', 80000);
  const resultsRef = useRef(null);

  const timeBreakdown = useMemo(() => {
    const committed = Number(sleep) + Number(commute) + Number(work) + Number(admin) + Number(chores);
    const isOverlimit = committed > 24;

    // If committed tasks exceed 24, clamp them proportionally to fit into 24 hours
    let finalSleep = Number(sleep);
    let finalCommute = Number(commute);
    let finalWork = Number(work);
    let finalAdmin = Number(admin);
    let finalChores = Number(chores);
    let finalFreedom = 24 - committed;

    if (isOverlimit) {
      const scale = 24 / committed;
      finalSleep = Number((sleep * scale).toFixed(1));
      finalCommute = Number((commute * scale).toFixed(1));
      finalWork = Number((work * scale).toFixed(1));
      finalAdmin = Number((admin * scale).toFixed(1));
      finalChores = Number((chores * scale).toFixed(1));
      finalFreedom = 0;
    }

    const categories = [
      { name: 'Sleep 🛌', hours: finalSleep, color: '#3B82F6' },
      { name: 'Commute 🚗', hours: finalCommute, color: '#F97316' },
      { name: 'Core Work 💼', hours: finalWork, color: '#000000' },
      { name: 'Unbilled Admin 📧', hours: finalAdmin, color: '#EF4444' },
      { name: 'Chores 🧹', hours: finalChores, color: '#10B981' },
      { name: 'Pure Freedom 🌟', hours: Math.max(0, Number(finalFreedom.toFixed(1))), color: '#FFDE59' }
    ];

    // Convert hours to angles (360 degrees total for 24 hours, so 15 degrees per hour)
    let accumulatedAngle = 0;
    const wedges = categories.map((cat) => {
      const angleDelta = cat.hours * 15; // 360 / 24 = 15 deg/hr
      const startAngle = accumulatedAngle;
      const endAngle = startAngle + angleDelta;
      accumulatedAngle = endAngle;

      // Generate donut wedge path
      const path = generateDonutWedge(150, 150, 60, 120, startAngle, endAngle);

      return {
        ...cat,
        startAngle,
        endAngle,
        path
      };
    });

    const freedomIndex = calculateFreedomIndex(Math.max(0, finalFreedom));

    return {
      wedges,
      freedomIndex,
      isOverlimit,
      committedHours: committed,
      freedomHours: Math.max(0, finalFreedom)
    };
  }, [sleep, commute, work, admin, chores]);

  const qualitativeFeedback = useMemo(() => {
    const idx = timeBreakdown.freedomIndex;
    if (idx < 10) {
      return {
        style: 'bg-red-100 text-red-800 border-red-500',
        title: 'Living to Work ⚠️',
        description:
          'Extreme danger of mental fatigue, high stress, and absolute burnout. Your overhead drag is too high. Consider outsourcing chores or automating admin tasks immediately.',
        icon: ShieldAlert
      };
    } else if (idx < 25) {
      return {
        style: 'bg-yellow-100 text-yellow-800 border-yellow-500',
        title: 'Survival Mode ⚡',
        description:
          'Decent daily baseline, but overhead drag restricts genuine growth, health routines, and personal creative freedom. Seek ways to buy back 1–2 hours.',
        icon: Coffee
      };
    } else {
      return {
        style: 'bg-green-100 text-green-800 border-green-500',
        title: 'Wealthy Freedom 🌟',
        description:
          'Excellent life balance! You have abundant margin to dedicate to upskilling, fitness, reading, and high-value side ventures.',
        icon: Sparkles
      };
    }
  }, [timeBreakdown.freedomIndex]);

  // Lifetime True Freedom Hours + Time Buy-Back calculations
  const lifetimeStats = useMemo(() => {
    const yearsRemaining = Math.max(0, Number(retirementAge) - Number(currentAge));
    const dailyFreedomHours = timeBreakdown.freedomHours;
    const lifetimeFreedomHours = Math.round(dailyFreedomHours * 365 * yearsRemaining);

    const workHoursPerMonth = Number(work) * 4.33 * 5; // 5 working days assumed
    const hourlyValue = workHoursPerMonth > 0 ? Number(monthlyIncome) / workHoursPerMonth : 0;

    const outsourcableHours = Number(chores) + Number(admin);
    const outsourceRatePerHr = 300; // baseline ₹300/hr
    const monthlyOutsourceCost = Math.round(outsourcableHours * outsourceRatePerHr * 30);

    return {
      yearsRemaining,
      lifetimeFreedomHours,
      hourlyValue: Math.round(hourlyValue),
      outsourcableHours,
      monthlyOutsourceCost,
      buyBackROI: hourlyValue > outsourceRatePerHr ? 'Positive' : 'Negative'
    };
  }, [timeBreakdown.freedomHours, currentAge, retirementAge, work, monthlyIncome, chores, admin]);

  const handleDownloadPDF = async () => {
    const el = resultsRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight() - 20));
    pdf.save('freedom_clock_report.pdf');
  };

  const FeedbackIcon = qualitativeFeedback.icon;

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
      <SEO
        title="24-Hour Freedom Clock Visualizer"
        description="Visualize your daily life time splits (sleep, work, commute, and freedom) in a beautiful interactive circular clock chart."
        keywords="freedom clock, sleep tracker, life time allocation, burn rate timer, time budget"
        canonical={`${import.meta.env.VITE_SITE_URL}/freedom-clock`}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="FreedomClock"
            icon={Clock}
            title="24-Hour Freedom Clock"

            onReset={() => {
              resetPersistedState('FreedomClock');
            }}
          />
        </div>

        {/* LEFT Panel: Daily Hour Allocations */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <Card title="Time Allocations" headerColor="bg-[#FFDE59]">
            <div className="space-y-5">
              {timeBreakdown.isOverlimit && (
                <div className="p-4 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold uppercase flex gap-2 items-center">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Allocated hours exceed 24! Values scaled down proportionally.</span>
                </div>
              )}

              <Input
                id="sleepInput"
                label="Sleep Duration (Hours)"
                type="number"
                value={sleep}
                step={0.5}
                onChange={(e) => setSleep(Math.max(0, Number(e.target.value)))}
                className="font-black"
              />

              <Input
                id="commuteInput"
                label="Daily Commute (Hours)"
                type="number"
                value={commute}
                step={0.5}
                onChange={(e) => setCommute(Math.max(0, Number(e.target.value)))}
                className="font-black"
              />

              <Input
                id="workInput"
                label="Day Job Core Hours"
                type="number"
                value={work}
                step={0.5}
                onChange={(e) => setWork(Math.max(0, Number(e.target.value)))}
                className="font-black"
              />

              <Input
                id="adminInput"
                label="Unbilled Admin Tasks"
                type="number"
                value={admin}
                step={0.5}
                onChange={(e) => setAdmin(Math.max(0, Number(e.target.value)))}
                className="font-black"
              />

              <Input
                id="choresInput"
                label="Life Chores & Commits"
                type="number"
                value={chores}
                step={0.5}
                onChange={(e) => setChores(Math.max(0, Number(e.target.value)))}
                className="font-black"
              />
            </div>
          </Card>

          {/* Lifetime Strategy Inputs */}
          <Card title="Lifetime Freedom Strategy" headerColor="bg-black text-white">
            <div className="space-y-5">
              <Input
                id="currentAgeInput"
                label="Current Age"
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Math.max(1, Math.min(100, Number(e.target.value))))}
                className="font-black"
              />
              <Input
                id="retirementAgeInput"
                label="Desired Retirement Age"
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Math.max(1, Math.min(100, Number(e.target.value))))}
                className="font-black"
              />
              <Input
                id="monthlyIncomeInput"
                label="Monthly Income (₹)"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
                className="font-black"
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="pt-2">
            <DownloadButtons onDownloadPDF={handleDownloadPDF} />
          </div>
        </div>

        {/* RIGHT Panel: Clockface Donut Visualizer */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
          <ResultsAnalysis>
            <div ref={resultsRef} className="space-y-6">
              {/* Clock Metrics summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-5 bg-white">
                  <MetricDisplay
                    title="Daily Committed Hours"
                    value={`${Math.min(24, timeBreakdown.committedHours).toFixed(1)} Hours`}
                  />
                </Card>

                <Card className="p-5 bg-white font-bold">
                  <MetricDisplay title="Daily Freedom Hours" value={`${timeBreakdown.freedomHours.toFixed(1)} Hours`} />
                </Card>

                <Card className="p-5 bg-white font-bold">
                  <MetricDisplay title="Daily Freedom Index" value={`${timeBreakdown.freedomIndex}%`} />
                </Card>
              </div>

              {/* Qualitative Feedback Alert Box */}
              <Card className={`p-5 ${qualitativeFeedback.style}`}>
                <div className="flex gap-4 items-start">
                  <FeedbackIcon className="w-8 h-8 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-black uppercase mb-1">{qualitativeFeedback.title}</h3>
                    <p className="text-xs font-bold leading-relaxed">{qualitativeFeedback.description}</p>
                  </div>
                </div>
              </Card>

              {/* Custom Donut Clockface */}
              <Card
                title="24-Hour Donut Auditor"
                headerColor="bg-black text-white"
                className="relative overflow-hidden bg-white"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center justify-around">
                  {/* SVG Donut Dial */}
                  <svg width="300" height="300" className="block select-none overflow-visible w-full max-w-[280px]">
                    <g>
                      {/* Render wedges */}
                      {timeBreakdown.wedges.map((wedge, idx) => (
                        <path
                          key={idx}
                          d={wedge.path}
                          fill={wedge.color}
                          stroke="#000000"
                          strokeWidth="3.5"
                          className="transition-all duration-300 hover:opacity-90"
                          title={`${wedge.name}: ${wedge.hours} hrs`}
                        />
                      ))}

                      {/* Center Clock text decoration */}
                      <circle cx="150" cy="150" r="54" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
                      <text
                        x="150"
                        y="146"
                        textAnchor="middle"
                        fill="#000000"
                        fontSize="10"
                        fontWeight="900"
                        className="uppercase tracking-widest"
                      >
                        Freedom
                      </text>
                      <text
                        x="150"
                        y="165"
                        textAnchor="middle"
                        fill="#000000"
                        fontSize="18"
                        fontWeight="900"
                        className="font-mono"
                      >
                        {timeBreakdown.freedomIndex}%
                      </text>
                    </g>
                  </svg>

                  {/* Legend/Index Breakdown detail list */}
                  <div className="space-y-2 w-full md:w-auto">
                    {timeBreakdown.wedges.map((w, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs font-black uppercase">
                        <span
                          className="w-4 h-4 rounded-full border-2 border-black inline-block"
                          style={{ backgroundColor: w.color }}
                        ></span>
                        <span>
                          {w.name}: {w.hours.toFixed(1)} Hrs
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Lifetime Freedom Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-5 bg-yellow-50">
                  <MetricDisplay
                    title="Lifetime True Freedom Hours"
                    value={`${lifetimeStats.lifetimeFreedomHours.toLocaleString('en-IN')} Hrs`}
                    subtitle={`Over ${lifetimeStats.yearsRemaining} years until age ${retirementAge}`}
                  />
                </Card>

                <Card className="p-5 bg-green-50">
                  <MetricDisplay
                    title="Your Hourly Value"
                    value={`₹${lifetimeStats.hourlyValue.toLocaleString('en-IN')}/hr`}
                    subtitle={`Based on ₹${Number(monthlyIncome).toLocaleString('en-IN')}/mo income`}
                  />
                </Card>
              </div>

              {/* Time Buy-Back Strategy */}
              <Card className="p-5 bg-blue-50">
                <h3 className="text-xs font-black uppercase mb-4">⏱️ Time Buy-Back Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricDisplay
                    title="Outsourceable Hours/Day"
                    value={`${lifetimeStats.outsourcableHours.toFixed(1)} hrs`}
                    subtitle="Admin + Chores"
                  />
                  <MetricDisplay
                    title="Monthly Outsource Cost"
                    value={`₹${lifetimeStats.monthlyOutsourceCost.toLocaleString('en-IN')}`}
                    subtitle="@ ₹300/hr baseline"
                  />
                  <MetricDisplay
                    title="Delegation ROI"
                    value={lifetimeStats.buyBackROI === 'Positive' ? '✅ Worth It' : '⚠️ Break-Even'}
                    color={lifetimeStats.buyBackROI === 'Positive' ? 'text-green-700' : 'text-red-600'}
                    subtitle={`Your hr (₹${lifetimeStats.hourlyValue}) vs outsource (₹300)`}
                  />
                </div>
              </Card>
            </div>
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> This calculation is strictly mathematical. Outsourcing chores also preserves your
          psychological energy, preventing burnout and allowing you to focus on high-leverage tasks.
          <br className="md:hidden" />
          Both time and energy are finite.
        </p>
      </Footer>
    </div>
  );
}
