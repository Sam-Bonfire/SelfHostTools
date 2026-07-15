import { macroData } from '@packages/macro-data';
import { resetPersistedState, usePersistedState } from '@packages/persistence';
import {
  Button,
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
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  Currency,
  Hammer,
  Home,
  IndianRupee,
  Info,
  Percent,
  Plus,
  Table as TableIcon,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useCallback, useEffect } from 'react';

import { downloadExcel, downloadPDF } from '../lib/downloadUtils';
import { calculateHomeOwnerRealism, generateTimelineEvents } from '../lib/homeOwnerLogic';
import SEO from './SEO';
export default function HomeOwnerRealistCalculator() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'Home Owner Realist Calculator',
    description: 'Calculate the TRUE cost of home ownership including maintenance sinking funds and opportunity costs.',
    brand: {
      '@type': 'Brand',
      name: 'SelfHostTools'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR'
    }
  };

  // --- Inputs ---
  const [propertyPrice, setPropertyPrice] = usePersistedState('HomeOwnerRealistCalculator', 'propertyPrice', 5000000); // 50L
  const [downPayment, setDownPayment] = usePersistedState('HomeOwnerRealistCalculator', 'downPayment', 1000000); // 10L
  const [interestRate, setInterestRate] = usePersistedState(
    'HomeOwnerRealistCalculator',
    'interestRate',
    macroData.interestRates.homeLoan
  );
  const [loanTerm, setLoanTerm] = usePersistedState('HomeOwnerRealistCalculator', 'loanTerm', 20);
  const [opportunityCostRate, setOpportunityCostRate] = usePersistedState(
    'HomeOwnerRealistCalculator',
    'opportunityCostRate',
    10
  ); // Market return
  const [appreciationRate, setAppreciationRate] = usePersistedState(
    'HomeOwnerRealistCalculator',
    'appreciationRate',
    3
  );
  const [maintenanceInflation, setMaintenanceInflation] = usePersistedState(
    'HomeOwnerRealistCalculator',
    'maintenanceInflation',
    macroData.inflation.maintenance
  ); // Default maintenance inflation rate

  // --- Audit Items (The Bomb List) ---
  const [auditItems, setAuditItems] = usePersistedState('HomeOwnerRealistCalculator', 'auditItems', [
    { id: 1, name: 'Roof / Waterproofing', replacementCost: 150000, lifespanYears: 15, currentAgeYears: 10 },
    { id: 2, name: 'HVAC / AC Units', replacementCost: 120000, lifespanYears: 10, currentAgeYears: 5 },
    { id: 3, name: 'Painting (Exterior)', replacementCost: 80000, lifespanYears: 5, currentAgeYears: 3 },
    { id: 4, name: 'Plumbing Overhaul', replacementCost: 50000, lifespanYears: 20, currentAgeYears: 15 }
  ]);

  // --- Results ---
  const [results, setResults] = usePersistedState('HomeOwnerRealistCalculator', 'results', null);
  const [timelineEvents, setTimelineEvents] = usePersistedState('HomeOwnerRealistCalculator', 'timelineEvents', []);
  const [showSchedule, setShowSchedule] = usePersistedState('HomeOwnerRealistCalculator', 'showSchedule', false);

  const calculate = useCallback(() => {
    const res = calculateHomeOwnerRealism({
      propertyPrice,
      downPayment,
      interestRate: parseFloat(interestRate) || 0,
      loanTermYears: parseFloat(loanTerm) || 0,
      auditItems,
      appreciationRate: parseFloat(appreciationRate) || 0,
      opportunityCostRate: parseFloat(opportunityCostRate) || 0,
      maintenanceInflation: parseFloat(maintenanceInflation) || 0
    });
    setResults(res);

    // Generate Timeline
    const events = generateTimelineEvents(res.items, 15);
    setTimelineEvents(events);
  }, [
    propertyPrice,
    downPayment,
    interestRate,
    loanTerm,
    auditItems,
    appreciationRate,
    opportunityCostRate,
    maintenanceInflation
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const addAuditItem = () => {
    const newId = Math.max(...auditItems.map((i) => i.id), 0) + 1;
    setAuditItems([
      ...auditItems,
      { id: newId, name: 'New Item', replacementCost: 10000, lifespanYears: 10, currentAgeYears: 0 }
    ]);
  };

  const removeAuditItem = (id) => {
    setAuditItems(auditItems.filter((i) => i.id !== id));
  };

  const updateAuditItem = (id, field, value) => {
    setAuditItems(
      auditItems.map((i) => {
        if (i.id === id) {
          return { ...i, [field]: value };
        }
        return i;
      })
    );
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="Home Maintenance Sinking Fund Calculator"
        description="The hidden cost of home ownership. Calculate your required sinking fund for repairs, painting, and maintenance."
        keywords="home maintenance cost, sinking fund calculator, true cost of home ownership, house repair fund, property maintenance"
        canonical={`${import.meta.env.VITE_SITE_URL}/home-owner-realist`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/home_owner.png`}
        structuredData={structuredData}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="HomeOwnerRealistCalculator"
            icon={Home}
            title="The Home Owner Realist"

            onReset={() => {
              resetPersistedState('HomeOwnerRealistCalculator');
            }}
          />
        </div>

        {/* LEFT: INPUTS */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          {/* Property Details */}
          <Card title="Financial Inputs" icon={Currency} headerColor="bg-blue-100">
            <div className="space-y-4">
              <Input
                id="property-price"
                label="Property Price"
                icon={IndianRupee}
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(parseFloat(e.target.value) || 0)}
                className="font-black"
              />
              <Input
                id="down-payment"
                label="Down Payment"
                icon={IndianRupee}
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                className="font-black"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="interest-rate"
                  label="Interest Rate (%)"
                  icon={Percent}
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="font-black"
                />
                <Input
                  id="loan-term"
                  label="Loan Term (Yrs)"
                  icon={Calendar}
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="font-black"
                />
              </div>
              <div className="pt-4 border-t-2 border-black/10 grid grid-cols-2 gap-4">
                <Tooltip content="Return you could get if you invested the Down Payment in the market instead.">
                  <Input
                    id="opp-cost-rate"
                    label="Opp. Cost Rate (%)"
                    icon={TrendingUp}
                    type="number"
                    value={opportunityCostRate}
                    onChange={(e) => setOpportunityCostRate(e.target.value)}
                    className="font-black border-purple-200 bg-purple-50"
                  />
                </Tooltip>
                <Input
                  id="appreciation-rate"
                  label="Appreciation (%)"
                  icon={TrendingUp}
                  type="number"
                  value={appreciationRate}
                  onChange={(e) => setAppreciationRate(e.target.value)}
                  className="font-black border-green-200 bg-green-50"
                />
                <Tooltip content="Annual increase in the cost of labor and materials for repairs.">
                  <Input
                    id="maint-inflation"
                    label="Maint. Inflation (%)"
                    icon={TrendingUp}
                    type="number"
                    value={maintenanceInflation}
                    onChange={(e) => setMaintenanceInflation(e.target.value)}
                    className="font-black"
                  />
                </Tooltip>
              </div>
            </div>
          </Card>

          {/* The Audit List */}
          <Card
            title="Maintenance Audit"
            icon={Hammer}
            headerColor="bg-red-100"
            action={
              <Button
                size="sm"
                onClick={addAuditItem}
                className="bg-black text-white hover:bg-gray-800 border-2 border-white/20 text-xs uppercase font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Item
              </Button>
            }
          >
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              <p className="text-[10px] font-bold text-gray-500 uppercase">
                List major items to calculate their 'Sinking Fund' cost.
              </p>
              {auditItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 border-2 border-black bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative group"
                >
                  <button
                    onClick={() => removeAuditItem(item.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-3 pr-6">
                    <Input
                      id={`audit-name-${item.id}`}
                      icon={Hammer}
                      value={item.name}
                      onChange={(e) => updateAuditItem(item.id, 'name', e.target.value)}
                      className="font-black text-sm border-none bg-transparent focus:ring-0 placeholder-gray-400 uppercase w-full"
                      placeholder="Item Name (e.g. Roof)"
                      aria-label="Maintenance Item Name"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        id={`audit-cost-${item.id}`}
                        label="Repl. Cost"
                        icon={IndianRupee}
                        type="number"
                        value={item.replacementCost}
                        onChange={(e) => updateAuditItem(item.id, 'replacementCost', parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs font-bold"
                      />
                      <Input
                        id={`audit-lifespan-${item.id}`}
                        label="Lifespan (Yr)"
                        icon={Calendar}
                        type="number"
                        value={item.lifespanYears}
                        onChange={(e) => updateAuditItem(item.id, 'lifespanYears', parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs font-bold"
                      />
                      <Input
                        id={`audit-age-${item.id}`}
                        label="Age (Yr)"
                        icon={Calendar}
                        type="number"
                        value={item.currentAgeYears}
                        onChange={(e) => updateAuditItem(item.id, 'currentAgeYears', parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs font-bold"
                      />
                    </div>
                    {/* Warnings */}
                    {item.currentAgeYears >= item.lifespanYears && (
                      <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase flex items-center gap-2">
                        <AlertOctagon className="w-3 h-3" /> Immediate Replacement Needed!
                      </div>
                    )}
                    {item.currentAgeYears < item.lifespanYears && item.lifespanYears - item.currentAgeYears < 3 && (
                      <div className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 uppercase flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> Critical: &lt; 3 Years Left
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT: RESULTS */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <ResultsAnalysis>
            {/* 1. Main Cost Breakdown */}
            <Card className="p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col md:flex-row items-end gap-4 justify-between border-b-4 border-black pb-6 mb-6">
                <MetricDisplay
                  title="The Real Monthly Cost"
                  value={formatCurrency(results?.financials.trueMonthlyCost || 0) + '/mo'}
                />
                <div className="text-right">
                  <p className="text-xs font-black uppercase text-red-600">
                    vs Mortgage: {formatCurrency(results?.financials.monthlyMortgage || 0)}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    You are paying{' '}
                    {formatCurrency(
                      (results?.financials.trueMonthlyCost || 0) - (results?.financials.monthlyMortgage || 0)
                    )}{' '}
                    more in hidden costs
                  </p>
                </div>
              </div>

              {/* Bar Chart Breakdown */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-black uppercase">
                    <span>Mortgage</span>
                    <span>{formatCurrency(results?.financials.monthlyMortgage || 0)}</span>
                  </div>
                  <div className="h-4 bg-gray-100 border-2 border-black w-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-blue-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-black uppercase text-red-700">
                    <span className="flex items-center gap-1">
                      <Hammer className="w-3 h-3" /> Sinking Fund (Maint.)
                    </span>
                    <span>{formatCurrency(results?.financials.totalMonthlySinkingFund || 0)}</span>
                  </div>
                  <div className="h-4 bg-gray-100 border-2 border-black w-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (results?.financials.totalMonthlySinkingFund / results?.financials.trueMonthlyCost) * 300)}%`
                      }} // Exaggerate slightly for visibility if small
                      className="h-full bg-red-500"
                    />
                  </div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">
                    You must save this monthly to pay for future repairs.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-black uppercase text-purple-700">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Opportunity Cost
                    </span>
                    <span>{formatCurrency(results?.financials.monthlyOpportunityCost || 0)}</span>
                  </div>
                  <div className="h-4 bg-gray-100 border-2 border-black w-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (results?.financials.monthlyOpportunityCost / results?.financials.trueMonthlyCost) * 300)}%`
                      }}
                      className="h-full bg-purple-500"
                    />
                  </div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">
                    Lost market returns on your Down Payment ({formatCurrency(downPayment)}).
                  </p>
                </div>
              </div>
            </Card>

            {/* 2. Immediate Liability Warning */}
            {results?.financials.immediateLiability > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-600 text-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-start gap-4">
                  <AlertOctagon className="w-10 h-10 flex-shrink-0 animate-pulse" />
                  <div>
                    <h3 className="text-xl font-black uppercase mb-1">Warning: Immediate Cash Needed</h3>
                    <p className="font-bold text-red-100 mb-2">
                      Some items are past their lifespan. You need this cash UPFRONT, not in a mortgage.
                    </p>
                    <MetricDisplay
                      value={formatCurrency(results.financials.immediateLiability)}
                      className="bg-white px-2 py-1 inline-block mt-2"
                      color="text-red-600"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Wealth Projection Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-green-50">
                <MetricDisplay
                  title={`Projected Home Equity (${loanTerm}y)`}
                  value={formatCurrency(results?.financials.finalEquity || 0)}
                  subtitle="Property Value - Loan Balance"
                />
              </Card>
              <Card className="bg-purple-50">
                <MetricDisplay
                  title={`Opp. Cost Fund (${loanTerm}y)`}
                  value={formatCurrency(results?.financials.finalOppCost || 0)}
                  subtitle={`If Down Payment was invested at ${opportunityCostRate}%`}
                />
              </Card>
            </div>

            {/* EXPORT SECTION */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <DownloadButtons
                onDownloadPDF={() =>
                  downloadPDF({
                    inputs: {
                      propertyPrice,
                      downPayment,
                      interestRate,
                      loanTermYears: loanTerm,
                      opportunityCostRate,
                      appreciationRate,
                      maintenanceInflation
                    },
                    results,
                    schedule: results.schedule
                  })
                }
                onDownloadExcel={() =>
                  downloadExcel({
                    inputs: {
                      propertyPrice,
                      downPayment,
                      interestRate,
                      loanTermYears: loanTerm,
                      opportunityCostRate,
                      appreciationRate,
                      maintenanceInflation
                    },
                    results,
                    schedule: results.schedule
                  })
                }
                pdfText="Download PDF Analysis"
                excelText="Download Excel Data"
              />
            </div>

            {/* 3. Timeline of Doom */}
            <Card
              title="Timeline of Doom"
              icon={<AlertOctagon className="w-5 h-5 text-red-600" />}
              headerColor="bg-gray-100"
              action={
                <Tooltip content="When things are likely to break and hit your wallet">
                  <Info className="w-4 h-4 text-gray-400" />
                </Tooltip>
              }
            >
              <div className="relative border-l-4 border-black ml-4 space-y-8 pb-4">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative pl-8">
                    {/* The Dot */}
                    <div
                      className={`absolute -left-[14px] top-1 w-6 h-6 rounded-full border-4 border-black ${event.year === 0 ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'}`}
                    ></div>

                    <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-default group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">
                          {event.year === 0 ? 'Urgent: Year 0' : `Year ${event.year}`}
                        </span>
                        <span className="text-xs font-black text-red-600 group-hover:scale-110 transition-transform">
                          {formatCurrency(event.cost)}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-black">{event.item} Renewal</h4>
                    </div>
                  </div>
                ))}
                {timelineEvents.length === 0 && (
                  <div className="text-center py-6 text-gray-400 font-bold uppercase">
                    Great maintenance. No hits in 15 years.
                  </div>
                )}
              </div>
            </Card>

            {/* 4. Detailed Wealth Schedule */}
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full border-4 border-black font-black uppercase flex items-center justify-center gap-2 h-12"
                onClick={() => setShowSchedule(!showSchedule)}
              >
                <TableIcon className="w-4 h-4" />
                {showSchedule ? 'Hide Detailed Schedule' : 'View Year-by-Year Wealth'}
              </Button>

              {showSchedule && results?.schedule && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 border-4 border-black overflow-x-auto"
                >
                  <table className="w-full text-[10px] text-left">
                    <thead className="bg-black text-white uppercase font-black">
                      <tr>
                        <th className="p-2 text-white">Year</th>
                        <th className="p-2 text-white">Property Value</th>
                        <th className="p-2 text-white">Loan Balance</th>
                        <th className="p-2 text-white">Home Equity</th>
                        <th className="p-2 text-white">Opp. Cost Fund</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-100 bg-white">
                      {results.schedule.map((row, idx) => (
                        <tr key={idx} className="hover:bg-yellow-50">
                          <td className="p-2 font-black text-black">{row.label}</td>
                          <td className="p-2 font-bold text-black">{formatCurrency(row.propertyValue)}</td>
                          <td className="p-2 font-bold text-red-600">{formatCurrency(row.loanBalance)}</td>
                          <td className="p-2 font-black text-green-600">{formatCurrency(row.homeEquity)}</td>
                          <td className="p-2 font-black text-purple-600">
                            {formatCurrency(row.opportunityCostWealth)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </div>
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Footer>
        <p>
          Calculations are estimates based on user inputs. Maintenance costs are industry averages. Inflation is not
          applied to replacement costs in this version (yet).
        </p>
      </Footer>
    </div>
  );
}
