import { macroData } from '@packages/macro-data';
import { resetPersistedState, usePersistedState } from '@packages/persistence';
import {
  CalculatorHeader,
  CalculatorLayout,
  Card,
  DownloadButtons,
  Footer,
  Input,
  MetricDisplay,
  ResultsAnalysis,
  Tooltip
} from '@packages/styling';
import {
  Briefcase,
  Calendar,
  Coins,
  GraduationCap,
  Heart,
  IndianRupee,
  Info,
  Landmark,
  Percent,
  PieChart as PieChartIcon,
  ShieldCheck,
  TrendingUp,
  Umbrella
} from 'lucide-react';
import { useCallback, useEffect } from 'react';

import { downloadExcel, downloadPDF } from '../lib/downloadUtils';
import { calculateLifeInsurance, generateLifeInsuranceSchedule } from '../lib/lifeInsuranceLogic';
import SEO from './SEO';
export default function LifeInsuranceCalculator() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'Life Insurance (HLV) Calculator',
    description:
      'Calculate your true Life Insurance needs based on Human Life Value (HLV), liabilities, and future goals.',
    brand: { '@type': 'Brand', name: 'Calculators Hub' }
  };

  // --- INPUTS ---
  const [monthlyExpense, setMonthlyExpense] = usePersistedState('LifeInsuranceCalculator', 'monthlyExpense', 50000);
  const [yearsToReplace, setYearsToReplace] = usePersistedState('LifeInsuranceCalculator', 'yearsToReplace', 25);
  const [inflationRate, setInflationRate] = usePersistedState(
    'LifeInsuranceCalculator',
    'inflationRate',
    macroData.inflation.general
  );
  const [investmentReturn, setInvestmentReturn] = usePersistedState('LifeInsuranceCalculator', 'investmentReturn', 7); // Safe debt return
  const [personalShare, setPersonalShare] = usePersistedState('LifeInsuranceCalculator', 'personalShare', 20); // Self-consumption deduction %

  // --- LIABILITIES ---
  const [liabilities, setLiabilities] = usePersistedState('LifeInsuranceCalculator', 'liabilities', 5000000); // e.g. Home Loan

  // --- GOALS ---
  const [futureGoals, setGoals] = usePersistedState('LifeInsuranceCalculator', 'futureGoals', [
    { id: 1, name: 'Child Education', amount: 2000000, yearsAway: 15 },
    { id: 2, name: 'Child Marriage', amount: 1500000, yearsAway: 20 }
  ]);

  // --- EXISTING ASSETS ---
  const [existingAssets, setAssets] = usePersistedState('LifeInsuranceCalculator', 'existingAssets', 1000000);
  const [currentInsurance, setCurrentInsurance] = usePersistedState(
    'LifeInsuranceCalculator',
    'currentInsurance',
    2500000
  );

  // --- RESULTS ---
  const [results, setResults] = usePersistedState('LifeInsuranceCalculator', 'results', {
    expenseCover: 0,
    goalCover: 0,
    totalRequired: 0,
    gap: 0,
    isAdequate: false
  });

  const calculate = useCallback(() => {
    const calcResults = calculateLifeInsurance({
      monthlyExpense,
      yearsToReplace,
      inflationRate,
      investmentReturn,
      personalShare,
      liabilities,
      futureGoals,
      existingAssets,
      currentInsurance
    });

    setResults(calcResults);
  }, [
    monthlyExpense,
    yearsToReplace,
    inflationRate,
    investmentReturn,
    personalShare,
    liabilities,
    futureGoals,
    existingAssets,
    currentInsurance
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const updateGoal = (id, field, val) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: val } : g)));
  };

  const addGoal = (name, amount, yearsAway) => {
    const newId = Math.max(...futureGoals.map((g) => g.id), 0) + 1;
    setGoals([...futureGoals, { id: newId, name, amount, yearsAway }]);
  };

  const removeGoal = (id) => {
    setGoals(futureGoals.filter((g) => g.id !== id));
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const checkExports = (type) => {
    const schedule = generateDrawdown();
    const data = {
      inputs: {
        monthlyExpense,
        yearsToReplace,
        inflationRate,
        liabilities,
        futureGoals,
        existingAssets,
        currentInsurance
      },
      results,
      schedule
    };

    if (type === 'pdf') {
      downloadPDF(data);
    } else {
      downloadExcel(data);
    }
  };

  const generateDrawdown = () => {
    return generateLifeInsuranceSchedule({
      expenseCover: results.expenseCover,
      familyMonthlyNeed: results.familyMonthlyNeed,
      yearsToReplace,
      investmentReturn,
      inflationRate
    });
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="Human Life Value (HLV) Calculator"
        description="Calculate how much life insurance coverage you actually need based on your income, liabilities, and family goals."
        keywords="life insurance calculator, human life value, insurance coverage, hlv calculator, term insurance planner, life cover india"
        canonical={`${import.meta.env.VITE_SITE_URL}/life-insurance-calculator`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/life_insurance.png`}
        structuredData={structuredData}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="LifeInsuranceCalculator"
            icon={Umbrella}
            title="Life Cover (HLV)"

            onReset={() => {
              resetPersistedState('LifeInsuranceCalculator');
            }}
          />
        </div>

        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <Card
            title="Financial Profile"
            icon={Briefcase}
            headerColor="bg-blue-100"
            className="p-0 border-4 border-black"
          >
            <div className="p-4 space-y-4">
              <div>
                <Tooltip
                  content="Expenses needed for family survival (Groceries, bills, fees, etc.)"
                  className="w-full"
                >
                  <Input
                    label="Monthly Household Expenses"
                    icon={IndianRupee}
                    id="monthlyExpense"
                    type="number"
                    value={monthlyExpense}
                    onChange={(e) => setMonthlyExpense(e.target.value)}
                    onBlur={() => !monthlyExpense && setMonthlyExpense(0)}
                    className="font-black w-full"
                  />
                </Tooltip>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Tooltip content="Years your family needs support (e.g. until youngest child starts earning)">
                    <Input
                      label="Years to Replace"
                      icon={Calendar}
                      id="yearsToReplace"
                      type="number"
                      value={yearsToReplace}
                      onChange={(e) => setYearsToReplace(e.target.value)}
                      onBlur={() => !yearsToReplace && setYearsToReplace(0)}
                      className="font-black"
                    />
                  </Tooltip>
                </div>
                <div>
                  <Tooltip content="Expected annual price rise (Standard is 6%)">
                    <Input
                      label="Avg. Inflation (%)"
                      icon={Percent}
                      id="inflationRate"
                      type="number"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(e.target.value)}
                      onBlur={() => !inflationRate && setInflationRate(0)}
                      className="font-black"
                    />
                  </Tooltip>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t-2 border-black/10 pt-4 mt-2">
                <div>
                  <Tooltip content="Safe return on the insurance money (e.g. FD/Debt Fund)">
                    <Input
                      label="Expected Return (%)"
                      icon={Percent}
                      id="investmentReturn"
                      type="number"
                      value={investmentReturn}
                      onChange={(e) => setInvestmentReturn(e.target.value)}
                      onBlur={() => !investmentReturn && setInvestmentReturn(0)}
                      className="font-black"
                    />
                  </Tooltip>
                </div>
                <div>
                  <Tooltip content="% of expense that is purely for YOU (stopped after death)">
                    <Input
                      label="Self-Spend (%)"
                      icon={Percent}
                      id="personalShare"
                      type="number"
                      value={personalShare}
                      onChange={(e) => setPersonalShare(e.target.value)}
                      onBlur={() => !personalShare && setPersonalShare(0)}
                      className="font-black"
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="Future Big Goals"
            icon={GraduationCap}
            headerColor="bg-orange-50"
            className="p-0 border-4 border-black"
          >
            <div className="p-4 space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                <button
                  onClick={() => addGoal('Child Education', 2000000, 15)}
                  className="whitespace-nowrap px-2 py-1 text-[9px] font-black border-2 border-black bg-blue-100 hover:bg-blue-200 uppercase flex items-center gap-1"
                >
                  <GraduationCap className="w-3 h-3" /> + Edu
                </button>
                <button
                  onClick={() => addGoal('Child Marriage', 1500000, 20)}
                  className="whitespace-nowrap px-2 py-1 text-[9px] font-black border-2 border-black bg-orange-100 hover:bg-orange-200 uppercase flex items-center gap-1"
                >
                  <Heart className="w-3 h-3" /> + Marriage
                </button>
                <button
                  onClick={() => addGoal('Home Renovation', 1000000, 10)}
                  className="whitespace-nowrap px-2 py-1 text-[9px] font-black border-2 border-black bg-green-100 hover:bg-green-200 uppercase flex items-center gap-1"
                >
                  <Landmark className="w-3 h-3" /> + Reno
                </button>
                <button
                  onClick={() => addGoal('Car/Asset', 800000, 5)}
                  className="whitespace-nowrap px-2 py-1 text-[9px] font-black border-2 border-black bg-purple-100 hover:bg-purple-200 uppercase flex items-center gap-1"
                >
                  <Coins className="w-3 h-3" /> + Asset
                </button>
              </div>

              {futureGoals.map((g) => (
                <div key={g.id} className="p-3 border-2 border-black bg-white space-y-2 relative group">
                  <button
                    onClick={() => removeGoal(g.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${g.name}`}
                  >
                    ×
                  </button>
                  <Input
                    id={`goal-name-${g.id}`}
                    value={g.name}
                    onChange={(e) => updateGoal(g.id, 'name', e.target.value)}
                    className="h-6 text-[10px] font-black border-none uppercase p-0 focus:ring-0"
                    aria-label={`Goal Name ${g.id}`}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Tooltip content="Current cost of this goal">
                        <Input
                          icon={IndianRupee}
                          id={`goal-amount-${g.id}`}
                          aria-label={`Cost for ${g.name}`}
                          type="number"
                          value={g.amount}
                          onChange={(e) => updateGoal(g.id, 'amount', e.target.value)}
                          onBlur={() => !g.amount && updateGoal(g.id, 'amount', 0)}
                          className="h-8 text-xs border-black font-black"
                        />
                      </Tooltip>
                    </div>
                    <div>
                      <Tooltip content="Years remaining until this goal is due">
                        <Input
                          icon={Calendar}
                          id={`goal-years-${g.id}`}
                          aria-label={`Years away for ${g.name}`}
                          type="number"
                          value={g.yearsAway}
                          onChange={(e) => updateGoal(g.id, 'yearsAway', e.target.value)}
                          onBlur={() => !g.yearsAway && updateGoal(g.id, 'yearsAway', 0)}
                          className="h-8 text-xs border-black font-black"
                          placeholder="Yrs"
                        />
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Liabilities & Assets"
            icon={Landmark}
            headerColor="bg-red-50"
            className="p-0 border-4 border-black"
          >
            <div className="p-4 space-y-4">
              <div>
                <Tooltip content="Outstanding principal on all loans" className="w-full">
                  <Input
                    label="Total Loans (Home/Car/Edu)"
                    icon={IndianRupee}
                    id="liabilities"
                    type="number"
                    value={liabilities}
                    onChange={(e) => setLiabilities(e.target.value)}
                    onBlur={() => !liabilities && setLiabilities(0)}
                    className="font-black w-full"
                  />
                </Tooltip>
              </div>
              <div>
                <Tooltip content="Money available immediately. Do NOT include property." className="w-full">
                  <Input
                    label="Current Liquid Assets (Fds/Gold/MF)"
                    icon={IndianRupee}
                    id="existingAssets"
                    type="number"
                    value={existingAssets}
                    onChange={(e) => setAssets(e.target.value)}
                    onBlur={() => !existingAssets && setAssets(0)}
                    className="font-black w-full"
                  />
                </Tooltip>
              </div>
              <div className="pt-2 border-t-2 border-black/10">
                <Tooltip content="Sum Assured of all current Term/LIC policies" className="w-full">
                  <Input
                    label="Existing Life Insurance Policy"
                    icon={ShieldCheck}
                    id="currentInsurance"
                    type="number"
                    value={currentInsurance}
                    onChange={(e) => setCurrentInsurance(e.target.value)}
                    onBlur={() => !currentInsurance && setCurrentInsurance(0)}
                    className="border-blue-600 font-black text-blue-700 w-full"
                  />
                </Tooltip>
              </div>
            </div>
          </Card>

          <Card title="The Logic" icon={Info} headerColor="bg-yellow-50" className="p-0 border-4 border-black">
            <div className="p-4 text-sm space-y-2 text-black">
              <p>
                Your family needs <strong>{formatCurrency(results.familyMonthlyNeed)}/mo</strong> (adjusted for
                inflation) for <strong>{yearsToReplace} years</strong>.
              </p>
              <p>
                We calculate the corpus needed TODAY which, if invested at <strong>{investmentReturn}%</strong>, will
                generate this rising income stream for them.
              </p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <ResultsAnalysis
            title="Protection Analysis"
            headerElements={
              <span
                className={`text-xs font-black px-2 py-1 border-2 border-black text-white ${results.isAdequate ? 'bg-green-500' : 'bg-red-500'}`}
              >
                {results.isAdequate ? 'ADEQUATE' : 'UNDER-INSURED'}
              </span>
            }
          >
            <div className="bg-yellow-300 text-black p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <MetricDisplay
                title="Recommended Total Cover"
                value={formatCurrency(results.totalRequired)}
                subtitle="Amount your family needs if you are not around"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Income Protection</p>
                <p className="text-xl font-black text-black">{formatCurrency(results.expenseCover)}</p>
                <p className="text-[9px] font-bold text-gray-400 italic mt-1">
                  Generates {formatCurrency(results.familyMonthlyNeed)}/mo
                </p>
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Goals & Liabilities</p>
                <p className="text-xl font-black text-black">
                  {formatCurrency(results.goalCover + (parseFloat(liabilities) || 0))}
                </p>
                <p className="text-[9px] font-bold text-gray-400 italic mt-1">Future goals + Loan repayment</p>
              </div>
              <div className="bg-blue-50 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                <p className="text-[10px] font-black text-blue-800 uppercase mb-1">Existing Assets</p>
                <p className="text-xl font-black text-blue-900">{formatCurrency(existingAssets)}</p>
                <p className="text-[9px] font-bold text-blue-700 italic mt-1">Reduces insurance need</p>
              </div>
              <div
                className={`border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${results.isAdequate ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <p
                  className={`text-[10px] font-black uppercase mb-1 ${results.isAdequate ? 'text-green-800' : 'text-red-900'}`}
                >
                  {results.isAdequate ? 'Surplus Cover' : 'Net Insurance Gap'}
                </p>
                <p className={`text-xl font-black ${results.isAdequate ? 'text-green-700' : 'text-red-600'}`}>
                  {formatCurrency(results.gap)}
                </p>
                <p
                  className={`text-[9px] font-bold italic mt-1 ${results.isAdequate ? 'text-green-600' : 'text-red-700'}`}
                >
                  {results.isAdequate ? 'You are fully protected.' : 'Additional cover required.'}
                </p>
              </div>
            </div>

            <div className="border-4 border-black p-6 bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 uppercase text-black">
                <PieChartIcon className="w-5 h-5" /> Coverage Breakdown
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase text-gray-500">Gross Requirement</span>
                  <span className="font-bold text-black">
                    {formatCurrency(results.expenseCover + results.goalCover + (parseFloat(liabilities) || 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase text-blue-800">Less: Assets & Investments</span>
                  <span className="font-bold text-blue-900">-{formatCurrency(existingAssets)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase text-blue-800">Less: Current Insurance</span>
                  <span className="font-bold text-blue-800">-{formatCurrency(currentInsurance)}</span>
                </div>
              </div>
            </div>

            {results.expenseCover > 0 && (
              <div className="border-4 border-black p-6 bg-white">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 uppercase text-black">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> Corpus Projection
                </h2>
                <p className="text-xs text-gray-600 mb-4 font-medium">
                  How your <strong>{formatCurrency(results.expenseCover)}</strong> Income Fund lasts for{' '}
                  {yearsToReplace} years:
                </p>
                <div className="overflow-x-auto border-2 border-black">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-yellow-300 text-black uppercase font-black border-b-2 border-black">
                      <tr>
                        <th className="p-2 border-r-2 border-black text-black">Year</th>
                        <th className="p-2 border-r-2 border-black text-black">Balance (Start)</th>
                        <th className="p-2 border-r-2 border-black text-black">Withdrawal</th>
                        <th className="p-2 text-black">Balance (End)</th>
                      </tr>
                    </thead>
                    <tbody className="text-black">
                      {generateDrawdown().map((row, idx) => (
                        <tr key={idx} className="border-b-2 border-black/10 hover:bg-yellow-50 transition-colors">
                          <td className="p-2 border-r-2 border-black/10 font-bold uppercase">Year {row.year}</td>
                          <td className="p-2 border-r-2 border-black/10 font-mono">{formatCurrency(row.start)}</td>
                          <td className="p-2 border-r-2 border-black/10 text-red-600 font-bold font-mono">
                            -{formatCurrency(row.withdrawal)}
                          </td>
                          <td className="p-2 font-bold text-green-700 font-mono">{formatCurrency(row.end)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border-4 border-black p-6 text-black">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4 uppercase">
                <ShieldCheck className="w-5 h-5 text-blue-700" /> Smart Buyer's Checklist
              </h2>
              <ul className="space-y-2 text-xs font-bold text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">
                    ✓
                  </div>
                  Claim Settlement Ratio (CSR) &gt; 97%
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">
                    ✓
                  </div>
                  Solvency Ratio &gt; 1.5 (Checks financial health)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">
                    ✓
                  </div>
                  Detailed Medical Declartion (Don't hide habits!)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">
                    ✓
                  </div>
                  Add{' '}
                  <a
                    href="https://www.tataaia.com/blogs/life-insurance/a-complete-guide-to-married-womens-property-act-mwpa.html#:~:text=What%20is%20the%20MWPA%20in%20Insurance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    MWPA (Married Women's Property Act)
                  </a>{' '}
                  addendum
                </li>
              </ul>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <DownloadButtons
                onDownloadPDF={() => checkExports('pdf')}
                onDownloadExcel={() => checkExports('excel')}
              />
            </div>
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> Human Life Value ensures your dependents maintain their lifestyle, but it is not
          an investment.
          <br className="md:hidden" />
          Always separate insurance from investments (avoid ULIPs/Endowments)—buy pure term insurance and invest the
          rest.
        </p>
      </Footer>
    </div>
  );
}
