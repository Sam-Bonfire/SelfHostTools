import React, { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Percent, Calendar, TrendingDown, TrendingUp, AlertCircle, ShoppingCart, Flame, Landmark, Table as TableIcon, ShieldCheck } from 'lucide-react';
import { Button, Card, Input, Select, MetricDisplay, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, DownloadButtons, Footer } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import SEO from './SEO';
import { calculateInflationDestroyer, HISTORICAL_REGIMES, BASKET_ITEMS } from '../lib/inflationLogic';
import { usePersistedState, resetPersistedState } from '@packages/persistence';

export default function InflationDestroyer() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "Inflation Destroyer Calculator",
    "description": "Calculate how inflation destroys purchasing power. Translate cash erosion into real-world goods equivalents and compare against investing.",
    "brand": { "@type": "Brand", "name": "Calculators Hub" },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
  };

  const [principal, setPrincipal] = usePersistedState('InflationDestroyer', 'principal', 500000);
  const [years, setYears] = usePersistedState('InflationDestroyer', 'years', 15);
  const [regimeId, setRegimeId] = usePersistedState('InflationDestroyer', 'regimeId', 'india_avg');
  const [customInflationRate, setCustomInflationRate] = usePersistedState('InflationDestroyer', 'customInflationRate', 6);
  const [investmentReturn, setInvestmentReturn] = usePersistedState('InflationDestroyer', 'investmentReturn', 12);
  const [investmentTaxRate, setInvestmentTaxRate] = usePersistedState('InflationDestroyer', 'investmentTaxRate', 10);
  const [selectedBasketId, setSelectedBasketId] = usePersistedState('InflationDestroyer', 'selectedBasketId', 'groceries');
  const [showSchedule, setShowSchedule] = usePersistedState('InflationDestroyer', 'showSchedule', false);

  const [results, setResults] = usePersistedState('InflationDestroyer', 'results', null);

  const activeRegime = HISTORICAL_REGIMES.find(r => r.id === regimeId) || HISTORICAL_REGIMES[0];
  const inflationRate = regimeId === 'custom' ? customInflationRate : activeRegime.rate;

  const calculate = useCallback(() => {
    const data = calculateInflationDestroyer({
      principal,
      inflationRate,
      years,
      investmentReturn,
      investmentTaxRate,
      selectedBasketId,
    });
    setResults(data);
  }, [principal, inflationRate, years, investmentReturn, investmentTaxRate, selectedBasketId]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const handleExportPDF = () => {
    if (!results) return;
    downloadPDF({
      inputs: {
        isInflationDestroyer: true,
        principal,
        inflationRate,
        years,
        investmentReturn,
        investmentTaxRate,
      },
      results: {
        ...results.results,
        monthlyEMI: results.results.finalPurchasingPower,
        totalInterest: results.results.erosionAmount,
        totalAmount: results.results.netInvestmentValue,
      },
      schedule: results.schedule.map(r => ({
        label: r.label,
        principal: r.cashPurchasingPower,
        interest: r.netInvestmentValue,
        balance: r.realInvestmentValue,
      })),
    });
  };

  const handleExportExcel = () => {
    if (!results) return;
    downloadExcel({
      inputs: {
        isInflationDestroyer: true,
        principal,
        inflationRate,
        years,
        investmentReturn,
        investmentTaxRate,
      },
      results: {
        ...results.results,
        monthlyEMI: results.results.finalPurchasingPower,
        totalInterest: results.results.erosionAmount,
        totalAmount: results.results.netInvestmentValue,
      },
      schedule: results.schedule.map(r => ({
        label: r.label,
        principal: r.cashPurchasingPower,
        interest: r.netInvestmentValue,
        balance: r.realInvestmentValue,
      })),
    });
  };

  const erosionBarWidth = results
    ? Math.min(100, results.results.erosionPercent)
    : 0;

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="Inflation Destroyer — Purchasing Power Decay Calculator"
        description="See how inflation silently devours your cash savings. Translate rupee erosion into tangible goods lost, and compare cash vs investing outcomes."
        keywords="inflation calculator, purchasing power calculator, inflation erosion, real value of money, India inflation, basket of goods"
        canonical={`${import.meta.env.VITE_SITE_URL}/inflation-destroyer`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/inflation_destroyer.png`}
        structuredData={structuredData}
      />

      <CalculatorLayout>
        <CalculatorHeader namespace="InflationDestroyer" icon={Flame} title="Inflation Destroyer" 
            onReset={() => { resetPersistedState('InflationDestroyer'); window.location.reload(); }} />

        {/* LEFT: Inputs */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">

          {/* 1. Core Inputs */}
          <Card title="Cash Position" icon={IndianRupee} headerColor="bg-orange-100">
            <div className="space-y-5">
              <div>
                <Input id="principal" label="Cash Amount (₹)" icon={IndianRupee} type="number" value={principal} onChange={e => setPrincipal(e.target.value)} onBlur={() => !principal && setPrincipal(0)} className="font-black" />
                <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase leading-none">Savings sitting in a fixed deposit, savings account, or under the mattress</p>
              </div>

              <div>
                <Input id="years" label="Time Horizon (Years)" icon={Calendar} type="number" value={years} onChange={e => setYears(e.target.value)} onBlur={() => !years && setYears(1)} className="font-black" />
              </div>
            </div>
          </Card>

          {/* 2. Inflation Regime Selector */}
          <Card title="Inflation Regime" icon={Flame} headerColor="bg-red-100">
            <div className="space-y-3">
              {HISTORICAL_REGIMES.map(regime => (
                <button
                  key={regime.id}
                  onClick={() => setRegimeId(regime.id)}
                  className={`w-full text-left p-3 border-2 transition-all flex items-start gap-3 ${regimeId === regime.id ? 'border-black bg-[#FFDE59] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-300 bg-white hover:border-black'}`}
                >
                  <div className={`w-4 h-4 mt-0.5 border-2 border-black flex-shrink-0 ${regimeId === regime.id ? 'bg-black' : 'bg-white'}`} />
                  <div>
                    <p className="text-xs font-black uppercase">{regime.label}</p>
                    <p className="text-[10px] text-gray-600 font-bold">{regime.desc}</p>
                  </div>
                </button>
              ))}

              {/* Custom Rate Input */}
              <AnimatePresence>
                {regimeId === 'custom' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="pt-2">
                      <Input id="customInflationRate" label="Custom Inflation Rate (%)" icon={Percent} type="number" value={customInflationRate} onChange={e => setCustomInflationRate(e.target.value)} onBlur={() => !customInflationRate && setCustomInflationRate(6)} className="font-black" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          {/* 3. Investment Comparison */}
          <Card title="Investment Comparison" icon={TrendingUp} headerColor="bg-green-100">
            <div className="space-y-4">
              <p className="text-[10px] text-gray-500 font-bold uppercase leading-tight">Compare your cash erosion against investing the same amount in a market index fund</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input id="investmentReturn" label="Expected Return (% p.a.)" icon={Percent} type="number" value={investmentReturn} onChange={e => setInvestmentReturn(e.target.value)} onBlur={() => !investmentReturn && setInvestmentReturn(0)} className="font-black" />
                </div>
                <div>
                  <Input id="investmentTaxRate" label="LTCG Tax Rate (%)" icon={Landmark} type="number" value={investmentTaxRate} onChange={e => setInvestmentTaxRate(e.target.value)} onBlur={() => !investmentTaxRate && setInvestmentTaxRate(0)} className="font-black" />
                </div>
              </div>
            </div>
          </Card>

          {/* 4. Basket of Goods Selector */}
          <Card title="Real-World Basket" icon={ShoppingCart} headerColor="bg-yellow-100">
            <div>
              <Select
                id="selectedBasket"
                label="Translate erosion into tangible goods you lose:"
                value={selectedBasketId}
                onChange={e => setSelectedBasketId(e.target.value)}
              >
                {BASKET_ITEMS.map(item => (
                  <option key={item.id} value={item.id}>{item.label} (₹{item.unitCost.toLocaleString('en-IN')})</option>
                ))}
              </Select>
            </div>
          </Card>
        </div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          {results && (
            <ResultsAnalysis>

              {/* Headline Banner */}
              <div className="bg-red-600 border-4 border-black text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-black/20 rounded-full border-2 border-black flex-shrink-0">
                    <TrendingDown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <MetricDisplay 
                      title={`Purchasing Power Lost in ${years} Years`}
                      value={`-${formatCurrency(results.results.erosionAmount)}`}
                      subtitle={`At ${inflationRate}% inflation, your ${formatCurrency(results.results.principal)} will only buy what ${formatCurrency(results.results.finalPurchasingPower)} buys today.`}
                    />
                  </div>
                </div>
              </div>

              {/* Erosion Visual Bar */}
              <div className="border-4 border-black p-5 bg-gray-50">
                <h3 className="text-xs font-black uppercase mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-600 animate-pulse" /> Purchasing Power Erosion — {results.results.erosionPercent}% Gone
                </h3>
                <div className="w-full h-8 bg-gray-200 border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex h-full">
                    <motion.div
                      animate={{ width: `${100 - erosionBarWidth}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-green-400 h-full border-r-2 border-black flex items-center px-2"
                    >
                      <span className="text-[10px] font-black uppercase whitespace-nowrap overflow-hidden">Remaining Power</span>
                    </motion.div>
                    <motion.div
                      animate={{ width: `${erosionBarWidth}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-red-500 h-full flex items-center justify-end px-2"
                    >
                      <span className="text-[10px] font-black uppercase text-white whitespace-nowrap overflow-hidden">Destroyed</span>
                    </motion.div>
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] font-bold text-green-700">{formatCurrency(results.results.finalPurchasingPower)} real value</span>
                  <span className="text-[10px] font-bold text-red-600">-{formatCurrency(results.results.erosionAmount)} lost</span>
                </div>
              </div>

              {/* Basket of Goods Translation */}
              <div className="border-4 border-black bg-[#FFDE59] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Real-World Erosion: {results.basket.label}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <MetricDisplay title="You Can Buy Today" value={results.basket.unitsToday} subtitle={results.basket.unit} />
                  </div>
                  <div className="bg-red-100 border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <MetricDisplay title="Lost to Inflation" value={`-${results.basket.unitsLost}`} subtitle={results.basket.unit} />
                  </div>
                  <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <MetricDisplay title={`Buying Power in Yr ${years}`} value={results.basket.unitsFuture} subtitle={results.basket.unit} />
                  </div>
                </div>
              </div>

              {/* Cash vs Invest Comparison */}
              <div className="border-4 border-black p-5 bg-gray-50">
                <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Cash vs Invest at {investmentReturn}% (After {investmentTaxRate}% LTCG)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-red-50 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <MetricDisplay title="Cash (No Investment)" value={formatCurrency(results.results.finalPurchasingPower)} subtitle="Real buying power after inflation" />
                  </div>
                  <div className={`p-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${results.results.isBeatingInflation ? 'bg-green-50' : 'bg-orange-50'}`}>
                    <MetricDisplay title="Invested (Real After-Tax Value)" value={formatCurrency(results.results.realInvestmentValue)} subtitle="Inflation-adjusted after tax on gains" />
                  </div>
                </div>

                {/* Verdict */}
                <div className={`p-3 border-2 border-black flex items-center gap-3 ${results.results.isBeatingInflation ? 'bg-green-100' : 'bg-red-100'}`}>
                  {results.results.isBeatingInflation
                    ? <ShieldCheck className="w-5 h-5 text-green-700 flex-shrink-0" />
                    : <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0" />
                  }
                  <div>
                    <p className="text-xs font-black uppercase">
                      {results.results.isBeatingInflation
                        ? `Investing Wins! You preserve ${formatCurrency(results.results.investmentVsCashGap)} more real wealth vs cash.`
                        : `WARNING: After tax, this investment does NOT beat ${inflationRate}% inflation. Real wealth still shrinks.`}
                    </p>
                  </div>
                </div>

                {/* Export / Download Options */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <DownloadButtons 
                    onDownloadPDF={handleExportPDF}
                    onDownloadExcel={handleExportExcel}
                  />
                </div>
              </div>

              {/* Year-by-year schedule toggle */}
              <div>
                <Tooltip content="View annual decay schedule" className="w-full">
                  <Button onClick={() => setShowSchedule(!showSchedule)} variant="outline" className="w-full flex justify-center items-center gap-2 border-4 font-black uppercase bg-gray-50">
                    <TableIcon className="w-5 h-5" />{showSchedule ? 'Hide Year-by-Year Decay' : 'View Year-by-Year Decay Table'}
                  </Button>
                </Tooltip>

                <AnimatePresence>
                  {showSchedule && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-4 border-4 border-black bg-white">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left bg-white">
                            <thead className="text-xs uppercase bg-black text-white">
                              <tr>
                                <th className="px-4 py-3">Period</th>
                                <th className="px-4 py-3">Cash Buying Power</th>
                                <th className="px-4 py-3">Invest Net Value</th>
                                <th className="px-4 py-3 text-right">Real Invest Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-gray-200">
                              {results.schedule.map(row => (
                                <tr key={row.label} className="hover:bg-yellow-50 transition-colors">
                                  <td className="px-4 py-3 font-bold">{row.label}</td>
                                  <td className="px-4 py-3 text-red-600 font-mono">{formatCurrency(row.cashPurchasingPower)}</td>
                                  <td className="px-4 py-3 text-green-600 font-mono">{formatCurrency(row.netInvestmentValue)}</td>
                                  <td className="px-4 py-3 text-right font-mono font-bold">{formatCurrency(row.realInvestmentValue)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </ResultsAnalysis>
          )}
        </div>
      </CalculatorLayout>

      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> Inflation projections are estimates based on selected regimes. Real CPI varies by household spending pattern. Investment returns are historical averages and not guaranteed.
        </p>
      </Footer>
    </div>
  );
}
