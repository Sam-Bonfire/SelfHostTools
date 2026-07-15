import { SEO } from '@packages/components';
import { resetPersistedState, usePersistedState } from '@packages/persistence';
import {
  Button,
  CalculatorHeader,
  CalculatorLayout,
  Card,
  Footer,
  Input,
  MetricDisplay,
  ResultsAnalysis
} from '@packages/styling';
import { Landmark, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

import { calculateCompoundingSchedules, Particle, resolveCollisions } from '../lib/snowballPhysics';

export default function CompoundInterestSandbox() {
  const [startBalance, setStartBalance] = usePersistedState('CompoundInterestSandbox', 'startBalance', 10000);
  const [monthlyDeposit, setMonthlyDeposit] = usePersistedState('CompoundInterestSandbox', 'monthlyDeposit', 2000);
  const [expectedReturn, setExpectedReturn] = usePersistedState('CompoundInterestSandbox', 'expectedReturn', 12);
  const [years, setYears] = usePersistedState('CompoundInterestSandbox', 'years', 25);
  const [isPlaying, setIsPlaying] = usePersistedState('CompoundInterestSandbox', 'isPlaying', true);

  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Calculate historical compounding schedule
  const compoundingSchedule = useMemo(() => {
    return calculateCompoundingSchedules(
      Number(monthlyDeposit),
      Number(expectedReturn),
      Number(startBalance),
      Number(years)
    );
  }, [monthlyDeposit, expectedReturn, startBalance, years]);

  const latestYearData = useMemo(() => {
    return compoundingSchedule[compoundingSchedule.length - 1] || { balance: 0, contributions: 0, interest: 0 };
  }, [compoundingSchedule]);

  // Coin representation value for legend display
  const coinValue = useMemo(() => {
    const v = latestYearData.balance;
    if (v <= 0) return 1000;

    // Target between 20 and 600 coins based on balance size
    const targetCoins = Math.min(600, Math.max(20, Math.floor(Math.sqrt(v) / 5)));
    const rawCoinVal = v / targetCoins;

    const magnitude = Math.pow(10, Math.floor(Math.log10(rawCoinVal)));
    const firstDigit = rawCoinVal / magnitude;

    let niceFirstDigit = 1;
    if (firstDigit > 5) niceFirstDigit = 10;
    else if (firstDigit > 2.5) niceFirstDigit = 5;
    else if (firstDigit > 1.25) niceFirstDigit = 2;

    return niceFirstDigit * magnitude;
  }, [latestYearData.balance]);

  // Reset physics particles when parameters change
  useEffect(() => {
    particlesRef.current = [];
  }, [startBalance, monthlyDeposit, expectedReturn, years]);

  // Handle physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth || 400);
    let height = (canvas.height = 400);

    const contributions = latestYearData.contributions;
    const interest = latestYearData.interest;

    const contribCoinsCount = Math.max(1, Math.floor(contributions / coinValue));
    const interestCoinsCount = Math.max(0, Math.floor(interest / coinValue));

    // Dynamically size coins: fewer = bigger, many = smaller
    const desiredTotal = contribCoinsCount + interestCoinsCount;
    const coinRadius = desiredTotal > 400 ? 4 : desiredTotal > 200 ? 5 : desiredTotal > 100 ? 6 : 8;

    // Sync particles array length with desired count
    let particles = particlesRef.current;

    // Rebuild if count changed significantly or is empty
    if (particles.length === 0 || Math.abs(particles.length - desiredTotal) > 5) {
      particles = [];
      for (let i = 0; i < contribCoinsCount; i++) {
        particles.push(
          new Particle(
            Math.random() * (width - 40) + 20,
            Math.random() * -100 - 10,
            coinRadius,
            '#3B82F6',
            'contribution'
          )
        );
      }
      for (let i = 0; i < interestCoinsCount; i++) {
        particles.push(
          new Particle(Math.random() * (width - 40) + 20, Math.random() * -200 - 10, coinRadius, '#FBBF24', 'interest')
        );
      }
      particlesRef.current = particles;
    }

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 400;
      height = canvas.height = 400;
    };

    window.addEventListener('resize', handleResize);

    const runLoop = () => {
      if (isPlaying) {
        // Clear and draw background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw Jar outline (Neo-Brutalist thick borders)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'miter';
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(10, height - 10);
        ctx.lineTo(width - 10, height - 10);
        ctx.lineTo(width - 10, 10);
        ctx.stroke();

        // Draw ground shadow detail
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, height - 10, width - 20, 6);

        // Resolve elastic circle collisions
        resolveCollisions(particles);

        // Update and render particles
        particles.forEach((p) => {
          p.update(width, height, 0.15, 0.98);

          ctx.fillStyle = p.color;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Mini inner highlight circle for premium skeuomorphic/brutalist look
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(p.x - 2, p.y - 2, p.radius * 0.25, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrameRef.current = requestAnimationFrame(runLoop);
    };

    runLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [latestYearData, isPlaying]);

  const resetSandbox = () => {
    particlesRef.current = [];
    // Trigger small state shift to force redraw
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 50);
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
      <SEO
        title="Compound Interest Snowball Sandbox"
        description="Visualize compound interest using an interactive physics simulation. Watch contribution and interest coins accumulate over time."
        keywords="compound interest, sandbox, compound sandbox, wealth builder, physics simulation"
        canonical={`${import.meta.env.VITE_SITE_URL}/compound-sandbox`}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="CompoundInterestSandbox"
            icon={Landmark}
            title="Compound Interest Snowball"

            onReset={() => {
              resetPersistedState('CompoundInterestSandbox');
            }}
          />
        </div>

        {/* LEFT Panel: Simulation Parameters */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <Card title="Simulation Parameters" headerColor="bg-yellow-300">
            <div className="space-y-5">
              <Input
                id="startBalance"
                label="Initial Balance (₹)"
                type="number"
                value={startBalance}
                onChange={(e) => setStartBalance(Math.max(0, Number(e.target.value)))}
                className="font-black"
              />

              <Input
                id="monthlyDeposit"
                label="Monthly Contribution (₹)"
                type="number"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Math.max(0, Number(e.target.value)))}
                className="font-black"
              />

              <Input
                id="expectedReturn"
                label="Expected Annual Return (%)"
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Math.max(0, Number(e.target.value)))}
                className="font-black"
              />

              <Input
                id="years"
                label="Duration (Years)"
                type="number"
                value={years}
                onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
                className="font-black"
              />

              <div className="pt-4 border-t-2 border-black/10 flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 flex items-center justify-center gap-2 font-black uppercase"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? 'Pause simulation' : 'Start simulation'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Run
                    </>
                  )}
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2 font-black uppercase"
                  onClick={resetSandbox}
                  aria-label="Reset simulation coins"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT Panel: Physics Canvas and Results */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
          <ResultsAnalysis>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-blue-100">
                <MetricDisplay
                  title="Total Contributions"
                  value={`₹${latestYearData.contributions.toLocaleString('en-IN')}`}
                />
              </Card>

              <Card className="bg-yellow-100">
                <MetricDisplay
                  title="Compounded Interest"
                  value={`₹${latestYearData.interest.toLocaleString('en-IN')}`}
                />
              </Card>

              <Card className="bg-green-100 font-bold">
                <MetricDisplay
                  title="Total Maturity Value"
                  value={`₹${latestYearData.balance.toLocaleString('en-IN')}`}
                />
              </Card>
            </div>

            {/* Interactive Jar Canvas */}
            <Card className="relative overflow-hidden p-0">
              <div className="bg-black p-4 border-b-4 border-black flex justify-between items-center text-white font-bold">
                <h2 className="text-sm uppercase tracking-wider">Physics Compounding Sandbox</h2>
                <div className="flex gap-4 text-[10px] tracking-wide uppercase">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block border border-white"></span>{' '}
                    Contribution
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block border border-white"></span>{' '}
                    Interest
                  </span>
                </div>
              </div>
              <div className="bg-white p-4">
                <canvas ref={canvasRef} className="w-full bg-white block border-2 border-dashed border-gray-300" />
              </div>
            </Card>

            {/* Dynamic Coin Legend */}
            <Card className="p-4 bg-gray-50">
              <div className="flex flex-wrap items-center gap-6 text-xs font-black uppercase">
                <span className="text-[10px] text-gray-500">Visual Legend:</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-500 border-2 border-black inline-block"></span>1 Coin =
                  ₹{coinValue.toLocaleString('en-IN')} (Contribution)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-black inline-block"></span>1 Coin
                  = ₹{coinValue.toLocaleString('en-IN')} (Interest)
                </span>
                <span className="text-[9px] text-gray-400 font-bold">
                  Total coins:{' '}
                  {Math.max(2, Math.floor(latestYearData.contributions / coinValue)) +
                    Math.max(1, Math.floor(latestYearData.interest / coinValue))}
                </span>
              </div>
            </Card>
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> Compound interest acts like a snowball; early contributions build the core, but
          it's the compounding momentum over time that creates massive wealth.
          <br className="md:hidden" />
          Start early, and let the physics of exponential growth do the heavy lifting.
        </p>
      </Footer>
    </div>
  );
}
