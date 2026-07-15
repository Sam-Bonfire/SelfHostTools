import { resetPersistedState, usePersistedState } from '@packages/persistence';
import {
  ActionEngine,
  CalculatorHeader,
  CalculatorLayout,
  Card,
  DownloadButtons,
  Footer,
  Input,
  MetricDisplay,
  ResultsAnalysis
} from '@packages/styling';
import { AlertCircle, Coins, Flame, IndianRupee, Sunrise, TrendingUp } from 'lucide-react';
import { useCallback, useEffect } from 'react';

import { generateActions } from '../lib/actionEngine';
import { downloadExcel, downloadPDF } from '../lib/downloadUtils';
import { calculateFIRE } from '../lib/fireLogic';
import SEO from './SEO';

export default function FIRECalculator() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'FIRE Calculator',
    description: 'Calculate your path to financial freedom/retirement, accounting for inflation and returns.',
    brand: { '@type': 'Brand', name: 'Calculators Hub' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }
  };

  // --- INPUTS ---
  const [currentAge, setCurrentAge] = usePersistedState('FIRECalculator', 'currentAge', 30);
  const [retirementAge, setRetirementAge] = usePersistedState('FIRECalculator', 'retirementAge', 50);
  const [currentMonthlyExpenses, setExpenses] = usePersistedState('FIRECalculator', 'currentMonthlyExpenses', 50000);
  const [currentSavings, setSavings] = usePersistedState('FIRECalculator', 'currentSavings', 2000000); // Current Corpus
  const [monthlyInvestment, setMonthlyInv] = usePersistedState('FIRECalculator', 'monthlyInvestment', 50000); // SIP

  // --- REALITY FACTORS ---
  const [inflationRate, setInflation] = usePersistedState('FIRECalculator', 'inflationRate', 6);
  const [medicalInflation, setMedicalInflation] = usePersistedState('FIRECalculator', 'medicalInflation', 12); // Healthcare inflation > General
  const [preRetirementReturn, setPreReturn] = usePersistedState('FIRECalculator', 'preRetirementReturn', 12);
  const [postRetirementReturn, setPostReturn] = usePersistedState('FIRECalculator', 'postRetirementReturn', 8);
  const [lifestyleInflation, setLifestyleInflation] = usePersistedState('FIRECalculator', 'lifestyleInflation', 2); // New: Lifestyle inflation rate

  // --- RESULTS ---
  const [results, setResults] = usePersistedState('FIRECalculator', 'results', {
    requiredCorpus: 0,
    estimatedCorpusAtRetirement: 0,
    shortfall: 0,
    canRetire: false,
    yearsToFIRE: 0,
    monthlyExpensesAtRetirement: 0,
    supportableMonthlyIncome: 0,
    surplusCorpus: 0
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const calculate = useCallback(() => {
    const { results: calcResults } = calculateFIRE({
      currentAge,
      retirementAge,
      currentMonthlyExpenses,
      currentSavings,
      monthlyInvestment,
      inflationRate,
      medicalInflation,
      preRetirementReturn,
      postRetirementReturn,
      lifestyleInflation
    });

    setResults(calcResults);
  }, [
    currentAge,
    retirementAge,
    currentMonthlyExpenses,
    currentSavings,
    monthlyInvestment,
    inflationRate,
    medicalInflation,
    preRetirementReturn,
    postRetirementReturn,
    lifestyleInflation
  ]);

  const generateSchedule = useCallback(() => {
    const { schedule } = calculateFIRE({
      currentAge,
      retirementAge,
      currentMonthlyExpenses,
      currentSavings,
      monthlyInvestment,
      inflationRate,
      medicalInflation,
      preRetirementReturn,
      postRetirementReturn,
      lifestyleInflation
    });
    return schedule;
  }, [
    currentAge,
    retirementAge,
    currentMonthlyExpenses,
    currentSavings,
    monthlyInvestment,
    inflationRate,
    medicalInflation,
    preRetirementReturn,
    postRetirementReturn,
    lifestyleInflation
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const actions = generateActions(
    'FIRECalculator',
    { lifestyleInflation, preRetirementReturn, monthlyInvestment, currentMonthlyExpenses },
    results
  );

  const checkExports = (type) => {
    const data = {
      inputs: {
        currentAge,
        retirementAge,
        currentMonthlyExpenses,
        currentSavings,
        monthlyInvestment,
        inflationRate,
        medicalInflation,
        preRetirementReturn,
        postRetirementReturn,
        lifestyleInflation
      },
      results,
      schedule: generateSchedule()
    };

    if (type === 'pdf') {
      downloadPDF(data);
    } else {
      downloadExcel(data);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="FIRE & Retirement Planner"
        description="Calculate your path to financial independence. Factor in inflation, taxes, and healthcare to find your true freedom number."
        keywords="fire calculator, financial independence retire early, retirement calculator, fire movement, retirement planning india, early retirement"
        canonical={`${import.meta.env.VITE_SITE_URL}/fire-calculator`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/fire_calculator.png`}
        structuredData={structuredData}
      />

      <CalculatorLayout>
        <CalculatorHeader
          icon={Flame}
          title="FIRE Calculator"

          onReset={() => {
            resetPersistedState('FIRECalculator');
          }}
        />

        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <Card title="The Accumulation Phase" icon={Sunrise} headerColor="bg-blue-100">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="currentAge"
                  label="Current Age"
                  icon={<span className="text-[10px] font-black">Yr</span>}
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(e.target.value)}
                  onBlur={() => !currentAge && setCurrentAge(0)}
                  className="font-black"
                />
                <Input
                  id="retirementAge"
                  label="FIRE Age"
                  icon={<span className="text-[10px] font-black text-orange-600">Yr</span>}
                  type="number"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(e.target.value)}
                  onBlur={() => !retirementAge && setRetirementAge(0)}
                  className="border-orange-600 font-black text-orange-600"
                />
              </div>
              <Input
                id="expenses"
                label="Monthly Expenses (Today)"
                icon={IndianRupee}
                type="number"
                value={currentMonthlyExpenses}
                onChange={(e) => setExpenses(e.target.value)}
                onBlur={() => !currentMonthlyExpenses && setExpenses(0)}
                className="font-black"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="currentSavings"
                  label="Current Corpus"
                  icon={IndianRupee}
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setSavings(e.target.value)}
                  onBlur={() => !currentSavings && setSavings(0)}
                  className="font-black"
                />
                <Input
                  id="monthlyInvestment"
                  label="Monthly SIP"
                  icon={IndianRupee}
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInv(e.target.value)}
                  onBlur={() => !monthlyInvestment && setMonthlyInv(0)}
                  className="font-black"
                />
              </div>
            </div>
          </Card>

          <Card title="Reality Factors" icon={AlertCircle} headerColor="bg-red-50">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="inflationRate"
                  label="Standard Inflation (%)"
                  icon={Flame}
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflation(e.target.value)}
                  onBlur={() => !inflationRate && setInflation(0)}
                  className="font-black"
                />
                <Input
                  id="medicalInflation"
                  label="Medical Inflation (%)"
                  tooltip="Healthcare costs rise faster than standard CPI. Standard is 12-14%."
                  icon={<Flame className="w-3 h-3 text-red-600" />}
                  type="number"
                  value={medicalInflation}
                  onChange={(e) => setMedicalInflation(e.target.value)}
                  onBlur={() => !medicalInflation && setMedicalInflation(0)}
                  className="border-red-700 font-black text-red-700"
                />

                <div className="col-span-2 md:col-span-1 pt-4 border-t-2 border-black/10">
                  <div className="flex gap-2 mb-3" role="group" aria-label="Lifestyle Inflation Presets">
                    <button
                      aria-pressed={lifestyleInflation == 0}
                      onClick={() => setLifestyleInflation(0)}
                      className={`flex-1 py-1 text-[8px] font-black border-2 border-black uppercase ${lifestyleInflation == 0 ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                    >
                      Minimal
                    </button>
                    <button
                      aria-pressed={lifestyleInflation == 2}
                      onClick={() => setLifestyleInflation(2)}
                      className={`flex-1 py-1 text-[8px] font-black border-2 border-black uppercase ${lifestyleInflation == 2 ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                    >
                      Standard
                    </button>
                    <button
                      aria-pressed={lifestyleInflation == 5}
                      onClick={() => setLifestyleInflation(5)}
                      className={`flex-1 py-1 text-[8px] font-black border-2 border-black uppercase ${lifestyleInflation == 5 ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                    >
                      High
                    </button>
                  </div>
                  <Input
                    id="lifestyleInflation"
                    label="Lifestyle Inflation (%)"
                    icon={<TrendingUp className="w-4 h-4 text-purple-400" />}
                    type="number"
                    value={lifestyleInflation}
                    onChange={(e) => setLifestyleInflation(e.target.value)}
                    onBlur={() => !lifestyleInflation && setLifestyleInflation(0)}
                    className="font-black border-purple-200"
                  />
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 leading-tight">
                    Tendency to spend more as you earn more. 2-3% is standard.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="preRetirementReturn"
                  label="Pre-FIRE Return (%)"
                  icon={<span className="text-[10px] font-black">%</span>}
                  type="number"
                  value={preRetirementReturn}
                  onChange={(e) => setPreReturn(e.target.value)}
                  onBlur={() => !preRetirementReturn && setPreReturn(0)}
                  className="font-black"
                />
                <Input
                  id="postRetirementReturn"
                  label="Post-FIRE Return (%)"
                  icon={<span className="text-[10px] font-black">%</span>}
                  type="number"
                  value={postRetirementReturn}
                  onChange={(e) => setPostReturn(e.target.value)}
                  onBlur={() => !postRetirementReturn && setPostReturn(0)}
                  className="font-black"
                />
              </div>
            </div>
          </Card>
        </div>

        <div role="region" aria-live="polite" aria-atomic="true" className="lg:col-span-12 xl:col-span-7 space-y-6">
          <ResultsAnalysis
            title="Freedom Analysis"
            headerElements={
              <span
                className={`text-xs font-black px-2 py-1 border-2 border-black ${results.canRetire ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}
              >
                {results.canRetire ? 'ON TRACK' : 'WORK IN PROGRESS'}
              </span>
            }
          >
            <div className="bg-black text-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,222,89,1)]">
              <MetricDisplay
                title="Required FIRE Corpus"
                value={formatCurrency(results.requiredCorpus)}
                subtitle={`Needed to sustain ${formatCurrency(results.monthlyExpensesAtRetirement)}/mo forever`}
                color="text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Projected Savings</p>
                <p className="text-xl font-black">{formatCurrency(results.estimatedCorpusAtRetirement)}</p>
                <p className="text-[9px] font-bold text-gray-400 italic mt-1">At age {retirementAge}</p>
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Funding Shortfall</p>
                <p className="text-xl font-black text-red-600">{formatCurrency(results.shortfall)}</p>
                <p className="text-[9px] font-bold text-gray-400 italic mt-1">
                  Gap to fill in {results.yearsToFIRE} years
                </p>
              </div>
            </div>

            <div className="border-4 border-black p-6 bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 uppercase tracking-tight">
                <Sunrise className="w-5 h-5 text-blue-600" /> Life at Age {retirementAge} (Current Plan)
              </h2>
              <div className="space-y-4">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Based on your current savings rate, you will be able to afford:
                </p>
                <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase">Standard Expenses/mo</span>
                  <span className="font-bold">{formatCurrency(results.supportableMonthlyIncome * 0.8)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase text-red-800">Medical Buffer/mo</span>
                  <span className="font-bold text-red-800">
                    {formatCurrency(results.supportableMonthlyIncome * 0.2)}
                  </span>
                </div>
                <div className="p-3 bg-blue-100 border-2 border-black">
                  <p className="text-[9px] font-black uppercase text-blue-800 mb-1">Reality Check</p>
                  <div className="flex justify-between items-center text-sm font-black text-blue-900">
                    <span>Projected Income:</span>
                    <span>{formatCurrency(results.supportableMonthlyIncome)}/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-blue-800/60 mt-1">
                    <span>Desired Income:</span>
                    <span>{formatCurrency(results.monthlyExpensesAtRetirement)}/mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GOAL CARD */}
            {!results.canRetire && (
              <div className="border-4 border-black p-6 bg-[#FFDE59]">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6 uppercase tracking-tight text-black">
                  <Coins className="w-5 h-5" /> To Achieve Full Freedom
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[9px] font-black uppercase text-gray-500 mb-1">Required Monthly SIP</p>
                      <p className="text-xl font-black">{formatCurrency(results.totalSIPRequired)}</p>
                    </div>
                    <div className="p-3 bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[9px] font-black uppercase text-yellow-300 mb-1">Extra SIP Needed</p>
                      <p className="text-xl font-black">+{formatCurrency(results.extraSIPNeeded)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-black border-dashed">
                    <p className="text-xs font-black uppercase mb-3">If Goal Achieved, You Get:</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-xs font-black uppercase">Standard Expenses/mo</span>
                        <span className="font-bold">{formatCurrency(results.monthlyExpensesAtRetirement * 0.8)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-xs font-black uppercase text-red-800">Medical Buffer/mo</span>
                        <span className="font-bold text-red-800">
                          {formatCurrency(results.monthlyExpensesAtRetirement * 0.2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <DownloadButtons
                onDownloadPDF={() => checkExports('pdf')}
                onDownloadExcel={() => checkExports('excel')}
              />
            </div>
          </ResultsAnalysis>

          <ActionEngine calculatorId="FIRECalculator" actions={actions} />
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>The 4% Rule:</strong> Standard retirement planning assumes a 4% withdrawal rate. However, in India,
          due to higher inflation, a 3% or lower withdrawal rate is safer for a longer retirement.
        </p>
      </Footer>
    </div>
  );
}
