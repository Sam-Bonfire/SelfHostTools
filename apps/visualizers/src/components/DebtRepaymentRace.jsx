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
import { Award, Flame, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import { calculateDebtRace } from '../lib/debtRaceLogic';

const PRESETS = {
  graduate: {
    name: 'Standard Graduate',
    budget: 10000,
    debts: [
      { id: 'g1', name: 'Credit Card A', balance: 60000, interestRate: 24, minPayment: 1800 },
      { id: 'g2', name: 'Student Loan B', balance: 200000, interestRate: 8.5, minPayment: 2500 },
      { id: 'g3', name: 'Laptop Loan C', balance: 40000, interestRate: 12, minPayment: 1200 }
    ]
  },
  family: {
    name: 'Young Family Debt',
    budget: 22000,
    debts: [
      { id: 'f1', name: 'Car Loan', balance: 350000, interestRate: 10.5, minPayment: 8000 },
      { id: 'f2', name: 'Credit Card', balance: 80000, interestRate: 22, minPayment: 2400 },
      { id: 'f3', name: 'Medical Debt', balance: 50000, interestRate: 7, minPayment: 1500 }
    ]
  },
  slate: {
    name: 'Quick Clean Slate',
    budget: 6000,
    debts: [
      { id: 's1', name: 'Payday Loan', balance: 15000, interestRate: 36, minPayment: 1000 },
      { id: 's2', name: 'CC Small', balance: 25000, interestRate: 20, minPayment: 1200 }
    ]
  }
};

export default function DebtRepaymentRace() {
  const [debts, setDebts] = usePersistedState('DebtRepaymentRace', 'debts', PRESETS.graduate.debts);
  const [totalMonthlyBudget, setTotalMonthlyBudget] = usePersistedState(
    'DebtRepaymentRace',
    'totalMonthlyBudget',
    PRESETS.graduate.budget
  );
  const [timelineMonth, setTimelineMonth] = usePersistedState('DebtRepaymentRace', 'timelineMonth', 0);

  // Editing Debt Form State
  const [newDebtName, setNewDebtName] = usePersistedState('DebtRepaymentRace', 'newDebtName', '');
  const [newDebtBalance, setNewDebtBalance] = usePersistedState('DebtRepaymentRace', 'newDebtBalance', '');
  const [newDebtRate, setNewDebtRate] = usePersistedState('DebtRepaymentRace', 'newDebtRate', '');
  const [newDebtMin, setNewDebtMin] = usePersistedState('DebtRepaymentRace', 'newDebtMin', '');

  const results = useMemo(() => {
    return calculateDebtRace(debts, Number(totalMonthlyBudget));
  }, [debts, totalMonthlyBudget]);

  const maxMonths = useMemo(() => {
    if (results.error) return 0;
    return Math.max(results.snowball.months, results.avalanche.months);
  }, [results]);

  const maxInterest = useMemo(() => {
    if (results.error) return 0;
    return Math.max(results.snowball.totalInterestPaid, results.avalanche.totalInterestPaid);
  }, [results]);

  const loadPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    setDebts(preset.debts);
    setTotalMonthlyBudget(preset.budget);
    setTimelineMonth(0);
  };

  const addDebt = (e) => {
    e.preventDefault();
    if (!newDebtName || !newDebtBalance || !newDebtRate || !newDebtMin) return;

    const newDebt = {
      id: Date.now().toString(),
      name: newDebtName,
      balance: Number(newDebtBalance),
      interestRate: Number(newDebtRate),
      minPayment: Number(newDebtMin)
    };

    setDebts([...debts, newDebt]);
    setNewDebtName('');
    setNewDebtBalance('');
    setNewDebtRate('');
    setNewDebtMin('');
    setTimelineMonth(0);
  };

  const removeDebt = (id) => {
    setDebts(debts.filter((d) => d.id !== id));
    setTimelineMonth(0);
  };

  // Assign a fixed brutalist color to each debt based on its initial index
  const debtColors = useMemo(() => {
    const colors = [
      'bg-red-400',
      'bg-blue-400',
      'bg-yellow-400',
      'bg-purple-400',
      'bg-pink-400',
      'bg-orange-400',
      'bg-teal-400'
    ];
    const colorMap = {};
    debts.forEach((d, i) => {
      colorMap[d.id] = colors[i % colors.length];
    });
    return colorMap;
  }, [debts]);

  // Calculate current positions for racing visualization
  const racePositions = useMemo(() => {
    if (results.error) return { snowballProgress: 0, avalancheProgress: 0 };

    const sbHist = results.snowball.history;
    const avHist = results.avalanche.history;

    // Find progress percentage at target timelineMonth
    const sbIndex = Math.min(timelineMonth, sbHist.length - 1);
    const avIndex = Math.min(timelineMonth, avHist.length - 1);

    const sbRecord = sbHist[sbIndex] || {
      progressPercent: 100,
      debtBalances: [],
      cumulativeInterest: results.snowball.totalInterestPaid
    };
    const avRecord = avHist[avIndex] || {
      progressPercent: 100,
      debtBalances: [],
      cumulativeInterest: results.avalanche.totalInterestPaid
    };

    const startingTotalBalance = debts.reduce((sum, d) => sum + Number(d.balance), 0);

    return {
      snowballProgress: sbRecord.progressPercent,
      avalancheProgress: avRecord.progressPercent,
      sbRemaining: sbRecord.totalRemaining,
      avRemaining: avRecord.totalRemaining,
      sbBalances: sbRecord.debtBalances || [],
      avBalances: avRecord.debtBalances || [],
      sbCumulativeInterest: sbRecord.cumulativeInterest || 0,
      avCumulativeInterest: avRecord.cumulativeInterest || 0,
      startingTotalBalance
    };
  }, [results, timelineMonth, debts]);

  const savings = useMemo(() => {
    if (results.error) return 0;
    return Math.max(0, results.snowball.totalInterestPaid - results.avalanche.totalInterestPaid);
  }, [results]);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
      <SEO
        title="Debt Avalanche vs. Snowball Repayment Race"
        description="Compare Snowball and Avalanche debt payoff strategies in an interactive animated race. See which method saves you more money and time."
        keywords="debt race, debt payoff, snowball vs avalanche, debt repayment, compound interest"
        canonical={`${import.meta.env.VITE_SITE_URL}/debt-race`}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="DebtRepaymentRace"
            icon={Flame}
            title="Debt Avalanche vs. Snowball"

            onReset={() => {
              resetPersistedState('DebtRepaymentRace');
            }}
          />
        </div>

        {/* LEFT Panel: Configuration & Debt List */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          {/* Presets Card */}
          <Card className="p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-50">
            <span className="block text-[10px] font-black uppercase text-gray-500 mb-2">Load Quick Presets</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadPreset('graduate')}
                className="px-3 py-1 bg-white border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                🎓 Graduate
              </button>
              <button
                onClick={() => loadPreset('family')}
                className="px-3 py-1 bg-white border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                🏡 Family
              </button>
              <button
                onClick={() => loadPreset('slate')}
                className="px-3 py-1 bg-white border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                ⚡ Clean Slate
              </button>
            </div>
          </Card>

          {/* Active Debts List */}
          <Card
            title="Your Debts"
            headerColor="bg-[#FFDE59]"
            className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="space-y-4">
              {debts.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between items-center p-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div>
                    <h3 className="font-black text-sm uppercase">{d.name}</h3>
                    <p className="text-xs text-gray-600 font-bold uppercase">
                      ₹{d.balance.toLocaleString('en-IN')} @ {d.interestRate}% • min ₹{d.minPayment}
                    </p>
                  </div>
                  <button
                    onClick={() => removeDebt(d.id)}
                    className="p-1.5 bg-red-100 hover:bg-red-200 border-2 border-black text-red-600 rounded transition-colors"
                    aria-label={`Delete ${d.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add Debt Form */}
              <form onSubmit={addDebt} className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 space-y-3">
                <span className="block text-[10px] font-black uppercase text-gray-500 mb-1">Add New Debt</span>
                <Input
                  type="text"
                  placeholder="Debt Name"
                  value={newDebtName}
                  onChange={(e) => setNewDebtName(e.target.value)}
                  className="h-9 text-xs"
                  aria-label="New Debt Name"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    placeholder="Balance"
                    value={newDebtBalance}
                    onChange={(e) => setNewDebtBalance(e.target.value)}
                    className="h-9 text-xs"
                    aria-label="New Debt Balance"
                  />
                  <Input
                    type="number"
                    placeholder="Rate (%)"
                    value={newDebtRate}
                    onChange={(e) => setNewDebtRate(e.target.value)}
                    className="h-9 text-xs"
                    aria-label="New Debt Interest Rate"
                  />
                  <Input
                    type="number"
                    placeholder="Min Pay"
                    value={newDebtMin}
                    onChange={(e) => setNewDebtMin(e.target.value)}
                    className="h-9 text-xs"
                    aria-label="New Debt Minimum Payment"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-9 flex items-center justify-center gap-2 text-xs font-black uppercase"
                >
                  <Plus className="w-4 h-4" /> Add Debt
                </Button>
              </form>

              {/* Budget Slider */}
              <div className="pt-4 border-t-2 border-black/10">
                <Input
                  id="budgetInput"
                  label="Total Monthly Budget (₹)"
                  type="number"
                  value={totalMonthlyBudget}
                  onChange={(e) => setTotalMonthlyBudget(Math.max(0, Number(e.target.value)))}
                  className="font-black"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT Panel: Amortization Race & Graphs */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
          {results.error ? (
            <Card className="p-6 border-4 border-black bg-red-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-red-800 font-bold">
              <h2 className="text-xl font-black uppercase mb-2">Insufficient Budget!</h2>
              <p>{results.message}</p>
            </Card>
          ) : (
            <ResultsAnalysis>
              {/* Race Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-5 border-4 border-black bg-blue-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <MetricDisplay
                    title="Debt-Free Month"
                    value={`${results.avalanche.months} Months`}
                    subtitle={`VS SNOWBALL: ${results.snowball.months} months`}
                  />
                </Card>

                <Card className="p-5 border-4 border-black bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <MetricDisplay
                    title="Avalanche Interest"
                    value={`₹${results.avalanche.totalInterestPaid.toLocaleString('en-IN')}`}
                    subtitle={`VS SNOWBALL: ₹${results.snowball.totalInterestPaid.toLocaleString('en-IN')}`}
                  />
                </Card>

                <Card className="p-5 border-4 border-black bg-green-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between font-bold">
                  <MetricDisplay
                    title="Avalanche Savings"
                    value={`₹${savings.toLocaleString('en-IN')}`}
                    subtitle={
                      <span className="flex items-center gap-1 text-green-700">
                        <Award className="w-3.5 h-3.5" /> GUARANTEED SAVINGS
                      </span>
                    }
                  />
                </Card>
              </div>

              {/* Repayment Race Tracks */}
              <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
                <h2 className="text-lg font-black uppercase tracking-tight">The Repayment Race</h2>

                {/* TIMELINE Slider */}
                <div className="p-4 bg-gray-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black uppercase">
                      Month {timelineMonth} of {maxMonths}
                    </span>
                    <span className="text-xs font-mono font-bold">
                      {((timelineMonth / maxMonths) * 100).toFixed(0)}% PROGRESS
                    </span>
                  </div>
                  <input
                    id="timelineRange"
                    type="range"
                    min={0}
                    max={maxMonths}
                    value={timelineMonth}
                    onChange={(e) => setTimelineMonth(Number(e.target.value))}
                    className="w-full h-2.5 bg-gray-200 appearance-none cursor-pointer accent-black"
                    aria-label="Simulation Month Selector"
                  />
                </div>

                {/* Track 1: Avalanche */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-xs font-black uppercase mb-2">
                    <div className="space-y-1">
                      <div>🏔️ Track A: Avalanche (Highest Rate)</div>
                      <div className="text-red-500 flex items-center gap-2">
                        <span
                          className="inline-block transition-transform duration-200 origin-bottom-left"
                          style={{
                            transform: `scale(${maxInterest > 0 ? 0.7 + racePositions.avCumulativeInterest / maxInterest : 1})`
                          }}
                        >
                          🔥
                        </span>
                        <span>₹{(racePositions.avCumulativeInterest || 0).toLocaleString('en-IN')} BURNED</span>
                      </div>
                    </div>
                    <span>₹{(racePositions.avRemaining || 0).toLocaleString('en-IN')} LEFT</span>
                  </div>
                  <div className="h-14 w-full border-4 border-black bg-white relative flex overflow-hidden">
                    {/* Completed ground */}
                    <div
                      className="h-full bg-gray-100 border-r-4 border-black transition-all duration-200 flex items-center justify-end pr-2 shrink-0"
                      style={{ width: `${racePositions.avalancheProgress}%` }}
                    >
                      <span className="text-xl">🏃</span>
                    </div>
                    {/* The dragged weight blocks */}
                    <div className="h-full flex-1 flex transition-all duration-200 shrink-0">
                      {racePositions.avBalances.map((db) => {
                        if (db.balance <= 0) return null;
                        const currentTotalRemaining = racePositions.avRemaining || 1;
                        const relativeWidth = (db.balance / currentTotalRemaining) * 100;
                        return (
                          <div
                            key={db.id}
                            className={`h-full border-r-2 border-black flex items-center justify-center overflow-hidden transition-all duration-200 ${debtColors[db.id] || 'bg-gray-300'}`}
                            style={{ width: `${relativeWidth}%` }}
                            title={`${db.name}: ₹${db.balance.toLocaleString('en-IN')}`}
                          >
                            {relativeWidth > 15 && (
                              <span className="text-[10px] font-black uppercase truncate px-1">{db.name}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Track 2: Snowball */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-xs font-black uppercase mb-2">
                    <div className="space-y-1">
                      <div>❄️ Track B: Snowball (Smallest Balance)</div>
                      <div className="text-red-500 flex items-center gap-2">
                        <span
                          className="inline-block transition-transform duration-200 origin-bottom-left"
                          style={{
                            transform: `scale(${maxInterest > 0 ? 0.7 + racePositions.sbCumulativeInterest / maxInterest : 1})`
                          }}
                        >
                          🔥
                        </span>
                        <span>₹{(racePositions.sbCumulativeInterest || 0).toLocaleString('en-IN')} BURNED</span>
                      </div>
                    </div>
                    <span>₹{(racePositions.sbRemaining || 0).toLocaleString('en-IN')} LEFT</span>
                  </div>
                  <div className="h-14 w-full border-4 border-black bg-white relative flex overflow-hidden">
                    {/* Completed ground */}
                    <div
                      className="h-full bg-gray-100 border-r-4 border-black transition-all duration-200 flex items-center justify-end pr-2 shrink-0"
                      style={{ width: `${racePositions.snowballProgress}%` }}
                    >
                      <span className="text-xl">🏃</span>
                    </div>
                    {/* The dragged weight blocks */}
                    <div className="h-full flex-1 flex transition-all duration-200 shrink-0">
                      {racePositions.sbBalances.map((db) => {
                        if (db.balance <= 0) return null;
                        const currentTotalRemaining = racePositions.sbRemaining || 1;
                        const relativeWidth = (db.balance / currentTotalRemaining) * 100;
                        return (
                          <div
                            key={db.id}
                            className={`h-full border-r-2 border-black flex items-center justify-center overflow-hidden transition-all duration-200 ${debtColors[db.id] || 'bg-gray-300'}`}
                            style={{ width: `${relativeWidth}%` }}
                            title={`${db.name}: ₹${db.balance.toLocaleString('en-IN')}`}
                          >
                            {relativeWidth > 15 && (
                              <span className="text-[10px] font-black uppercase truncate px-1">{db.name}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </ResultsAnalysis>
          )}
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> Mathematically, the Avalanche method guarantees the lowest total interest paid.
          <br className="md:hidden" />
          However, the Snowball method secures early psychological wins, which are often the critical factor in actually
          staying the course.
        </p>
      </Footer>
    </div>
  );
}
