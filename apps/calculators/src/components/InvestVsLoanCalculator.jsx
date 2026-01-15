import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, IndianRupee, Percent, TrendingUp, TrendingDown, Trash2, Plus, Info, Landmark, PiggyBank, Scale, ChevronDown, ChevronUp, Download, FileText, FileSpreadsheet, Table as TableIcon } from 'lucide-react';
import { Button, Card, Input, Checkbox, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, Select } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateInvestVsLoan } from '../lib/investVsLoanLogic';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import Footer from './Footer';
import SEO from './SEO';

export default function App() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": "Invest vs Pay Off Loan Calculator",
        "description": "Visualize whether you should invest your surplus cash or pay off your debt early.",
        "brand": {
            "@type": "Brand",
            "name": "Calculators Hub"
        }
    };

    // --- State ---
    const [loans, setLoans] = useState([
        { id: 1, name: 'Home Loan', principal: 5000000, rate: 8.5, minPayment: 45000, isTaxDeductible: true, remainingInterest: 0 },
        { id: 2, name: 'Car Loan', principal: 800000, rate: 10.5, minPayment: 15000, isTaxDeductible: false, remainingInterest: 0 }
    ]);

    const [surplus, setSurplus] = useState(20000);
    const [investmentReturn, setInvestmentReturn] = useState(12);
    const [investmentTaxRate, setInvestmentTaxRate] = useState(10);
    const [userTaxBracket, setUserTaxBracket] = useState(30);

    const [results, setResults] = useState(null);
    const [showSchedule, setShowSchedule] = useState(false);

    // --- Handlers ---
    const addLoan = () => {
        const nextId = Math.max(...loans.map(l => l.id), 0) + 1;
        setLoans([...loans, { id: nextId, name: `Loan ${nextId}`, principal: 0, rate: 10, minPayment: 0, isTaxDeductible: false, remainingInterest: 0 }]);
    };

    const removeLoan = (id) => {
        if (loans.length > 1) {
            setLoans(loans.filter(l => l.id !== id));
        }
    };

    const updateLoan = (id, field, value) => {
        setLoans(loans.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const calculate = useCallback(() => {
        const res = calculateInvestVsLoan({
            loans,
            surplus,
            investmentReturn,
            investmentTaxRate,
            userTaxBracket
        });
        setResults(res);
    }, [loans, surplus, investmentReturn, investmentTaxRate, userTaxBracket]);

    useEffect(() => {
        calculate();
    }, [calculate]);

    const prepareDownloadData = () => {
        if (!results) return null;
        const yearlySchedule = results.results.investStrategy.history
            .filter((_, i) => i % 12 === 11)
            .map((row, i) => {
                const payoffRow = results.results.payoffStrategy.history[i * 12 + 11];
                const payoffNW = payoffRow ? payoffRow.netWorth : 0;
                return {
                    label: `Year ${row.year}`,
                    investNW: row.netWorth,
                    payoffNW: payoffNW,
                    diff: payoffNW - row.netWorth
                };
            });

        return {
            inputs: { loans, surplus, investmentReturn, investmentTaxRate, userTaxBracket },
            results,
            schedule: yearlySchedule
        };
    };

    // --- Formatters ---
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8">
            <SEO
                title="Invest vs Pay Off Debt Calculator"
                description="Should you invest or pay off loans? Use our calculator to simulate net worth outcomes with tax and inflation adjustments."
                keywords="invest vs debt, loan payoff calculator, debt snowball vs investing, mortgage payoff vs invest"
                canonical={`${import.meta.env.VITE_SITE_URL}/invest-vs-payoff`}
                ogImage={`${import.meta.env.VITE_SITE_URL}/og/invest_vs_payoff.png`}
                structuredData={structuredData}
            />

            <CalculatorLayout>
                <div className="lg:col-span-12">
                    <CalculatorHeader
                        icon={Scale}
                        title="Invest or Pay Off Debt?"
                        description="The eternal financial dilemma, solved with math."
                    />
                </div>

                {/* Inputs */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6">

                    {/* Investment Profile */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-green-100 p-4 border-b-4 border-black">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <PiggyBank className="w-5 h-5" />
                                The Surplus Engine
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <label htmlFor="monthly-surplus" className="block font-bold">Monthly Surplus Cash</label>
                                    <Tooltip content="The extra amount you can afford to allocate each month, AFTER paying all minimum loan EMIs and living expenses." />
                                </div>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                                    <Input
                                        id="monthly-surplus"
                                        type="number"
                                        value={surplus}
                                        onChange={e => setSurplus(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">This amount fuels either your Investments or Debt Repayment.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label htmlFor="investment-return" className="block font-bold text-sm">Exp. Return (%)</label>
                                        <Tooltip content="Annual expected return from your investments (e.g., Equity Mutual Funds often ~12%)." />
                                    </div>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                                        <Input
                                            id="investment-return"
                                            type="number"
                                            value={investmentReturn}
                                            onChange={e => setInvestmentReturn(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label htmlFor="investment-tax" className="block font-bold text-sm">Tax on Gains (%)</label>
                                        <Tooltip content="Estimated tax on investment profits (LTCG). Currently ~12.5% for equity in India (>1.25L)." />
                                    </div>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                                        <Input
                                            id="investment-tax"
                                            type="number"
                                            value={investmentTaxRate}
                                            onChange={e => setInvestmentTaxRate(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Loans List */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-red-100 p-4 border-b-4 border-black flex justify-between items-center">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Landmark className="w-5 h-5" />
                                Your Loans
                            </h2>
                            <Button onClick={addLoan} variant="outline" className="text-xs px-2 py-1 h-auto flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add Loan
                            </Button>
                        </div>
                        <div className="p-4 space-y-6">
                            {loans.map((loan, idx) => (
                                <div key={loan.id} className="relative p-4 bg-gray-50 border-2 border-black rounded-sm">
                                    {loans.length > 1 && (
                                        <button
                                            onClick={() => removeLoan(loan.id)}
                                            className="absolute -top-3 -right-3 bg-red-400 border-2 border-black p-1 hover:bg-red-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            aria-label={`Remove Loan ${loan.name}`}
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </button>
                                    )}

                                    <div className="mb-3">
                                        <Input
                                            id={`loan-name-${loan.id}`}
                                            value={loan.name}
                                            onChange={e => updateLoan(loan.id, 'name', e.target.value)}
                                            className="font-bold border-b-2 border-t-0 border-x-0 rounded-none bg-transparent px-0 focus:ring-0"
                                            placeholder="Loan Name"
                                            aria-label="Loan Name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label htmlFor={`loan-principal-${loan.id}`} className="text-xs font-bold block mb-1">Remaining Principal</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 z-10" />
                                                <Input
                                                    id={`loan-principal-${loan.id}`}
                                                    type="number"
                                                    value={loan.principal}
                                                    onChange={e => updateLoan(loan.id, 'principal', e.target.value)}
                                                    className="h-8 text-sm pl-6"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor={`loan-rate-${loan.id}`} className="text-xs font-bold block mb-1">Rate (%)</label>
                                            <div className="relative">
                                                <Percent className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 z-10" />
                                                <Input
                                                    id={`loan-rate-${loan.id}`}
                                                    type="number"
                                                    value={loan.rate}
                                                    onChange={e => updateLoan(loan.id, 'rate', e.target.value)}
                                                    className="h-8 text-sm pl-6"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 items-end mb-3">
                                        <div>
                                            <label htmlFor={`loan-payment-${loan.id}`} className="text-xs font-bold block mb-1">Min Payment</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 z-10" />
                                                <Input
                                                    id={`loan-payment-${loan.id}`}
                                                    type="number"
                                                    value={loan.minPayment}
                                                    onChange={e => updateLoan(loan.id, 'minPayment', e.target.value)}
                                                    className="h-8 text-sm pl-6"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 h-8">
                                            <Checkbox
                                                id={`tax-${loan.id}`}
                                                checked={loan.isTaxDeductible}
                                                onChange={e => updateLoan(loan.id, 'isTaxDeductible', e.target.checked)}
                                            />
                                            <label htmlFor={`tax-${loan.id}`} className="text-xs font-bold cursor-pointer">
                                                Tax Deductible?
                                            </label>
                                        </div>
                                    </div>

                                    {/* Optional Remaining Interest Input */}
                                    <div className="mb-2">
                                        <label htmlFor={`loan-interest-${loan.id}`} className="text-[10px] font-bold block mb-1 text-gray-500">Remaining Interest (Optional)</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 z-10" />
                                            <Input
                                                id={`loan-interest-${loan.id}`}
                                                type="number"
                                                value={loan.remainingInterest || ''}
                                                placeholder="Calc automatically"
                                                onChange={e => updateLoan(loan.id, 'remainingInterest', e.target.value)}
                                                className="h-8 text-sm pl-6 bg-gray-50"
                                            />
                                        </div>
                                        {loan.remainingInterest > 0 && (
                                            <div className="text-[9px] text-gray-500 mt-1">
                                                Total Payoff: {formatCurrency(Number(loan.principal) + Number(loan.remainingInterest))}
                                            </div>
                                        )}
                                    </div>

                                    {loan.isTaxDeductible && (
                                        <div className="mt-2 text-xs bg-blue-100 p-1 border border-blue-300">
                                            Effective Rate: <strong>{(loan.rate * (1 - userTaxBracket / 100)).toFixed(2)}%</strong> (assuming {userTaxBracket}% bracket)
                                        </div>
                                    )}

                                </div>
                            ))}

                            <div className="bg-blue-50 p-3 border-2 border-blue-900 rounded-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="income-tax-bracket" className="text-sm font-bold text-blue-900 block">Your Income Tax Bracket (%)</label>
                                    <Tooltip content="Used to calculate the effective interest rate of tax-deductible loans (like Home Loans)." />
                                </div>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-800" />
                                    <Input
                                        id="income-tax-bracket"
                                        type="number"
                                        value={userTaxBracket}
                                        onChange={e => setUserTaxBracket(e.target.value)}
                                        className="pl-9 border-blue-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Results */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <ResultsAnalysis>
                        {results && (
                            <>
                                {/* Verdict Card */}
                                <div className={`border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 text-white text-center transform rotate-1
                        ${results.results.winner === 'Payoff' ? 'bg-red-500' : results.results.winner === 'Invest' ? 'bg-green-600' : 'bg-gray-600'}`}>
                                    <h3 className="text-2xl font-black uppercase tracking-widest mb-1">Recommendation</h3>
                                    <p className="text-4xl font-extrabold mb-2">
                                        {results.results.winner === 'Payoff' ? 'PAY OFF DEBT' : results.results.winner === 'Invest' ? 'INVEST IT' : 'IT\'S A TIE'}
                                    </p>
                                    <p className="font-bold opacity-90">
                                        {results.results.winner === 'Payoff'
                                            ? `You'll be richer by ${formatCurrency(results.results.netWorthDifference)}`
                                            : results.results.winner === 'Invest'
                                                ? `Investing beats debt by ${formatCurrency(results.results.netWorthDifference)}`
                                                : `Both strategies yield similar results.`}
                                    </p>
                                </div>

                                {/* Comparison Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Invest Strategy Card */}
                                    <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <h4 className="font-black text-lg text-green-700 bg-green-100 px-2 py-1 inline-block border-2 border-black mb-4">Invest Strategy</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Final Net Worth</p>
                                                <p className="text-2xl font-black">{formatCurrency(results.results.investStrategy.finalNetWorth)}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="font-bold text-gray-500">Debt Free In</p>
                                                    <p className="font-bold">{Math.floor(results.results.investStrategy.debtFreeMonth / 12)}y {results.results.investStrategy.debtFreeMonth % 12}m</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-500">Interest Paid</p>
                                                    <p className="font-bold text-red-600">{formatCurrency(results.results.investStrategy.totalInterestPaid)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payoff Strategy Card */}
                                    <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <h4 className="font-black text-lg text-red-700 bg-red-100 px-2 py-1 inline-block border-2 border-black mb-4">Payoff Strategy</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Final Net Worth</p>
                                                <p className="text-2xl font-black">{formatCurrency(results.results.payoffStrategy.finalNetWorth)}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="font-bold text-gray-500">Debt Free In</p>
                                                    <p className="font-bold">{Math.floor(results.results.payoffStrategy.debtFreeMonth / 12)}y {results.results.payoffStrategy.debtFreeMonth % 12}m</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-500">Interest Paid</p>
                                                    <p className="font-bold text-red-600">{formatCurrency(results.results.payoffStrategy.totalInterestPaid)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reality Check Banner */}
                                <div className="mt-8 bg-yellow-200 border-4 border-black p-4 flex gap-4 items-start">
                                    <Info className="flex-shrink-0 w-6 h-6" />
                                    <div className="text-xs md:text-sm font-medium">
                                        <strong>Computed Reality Check:</strong>
                                        <ul className="list-disc ml-4 space-y-1 mt-1">
                                            <li>We considered your <strong>{userTaxBracket}%</strong> tax bracket for loan deductions.</li>
                                            <li>Inflation reduces the "Real Value" of your future wealth. The numbers above are nominal (today's currency value).</li>
                                            <li><strong>Risk Note:</strong> Paying off debt is a guaranteed {Math.max(...loans.map(l => l.rate * (l.isTaxDeductible ? (1 - userTaxBracket / 100) : 1)), 0).toFixed(2)}% return. Investing {investmentReturn}% is volatile.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* EXPORT SECTION - Moved here to match HomeOwnerRealistCalculator style */}
                                <div className="flex flex-col md:flex-row gap-4 mt-8">
                                    <Button
                                        variant="secondary"
                                        className="flex-1 border-4 border-black font-black uppercase"
                                        onClick={() => downloadPDF(prepareDownloadData())}
                                    >
                                        Download PDF Analysis
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1 border-4 border-black font-black uppercase"
                                        onClick={() => downloadExcel(prepareDownloadData())}
                                    >
                                        Download Excel Data
                                    </Button>
                                </div>

                                {/* Comparison Table (Accordion) - Styled to match HomeOwnerRealistCalculator */}
                                <div className="mt-6">
                                    <Button
                                        variant="outline"
                                        className="w-full border-4 border-black font-black uppercase flex items-center justify-center gap-2 h-12"
                                        onClick={() => setShowSchedule(!showSchedule)}
                                    >
                                        <TableIcon className="w-4 h-4" />
                                        {showSchedule ? 'Hide Detailed Schedule' : 'View Year-by-Year Wealth'}
                                    </Button>

                                    {showSchedule && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 border-4 border-black overflow-x-auto"
                                        >
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-black text-white uppercase font-black">
                                                        <tr>
                                                            <th className="p-3 text-white border-r border-gray-700">Year</th>
                                                            <th className="p-3 text-white border-r border-gray-700 bg-green-900">Invest Strategy</th>
                                                            <th className="p-3 text-white border-r border-gray-700 bg-red-900">Payoff Strategy</th>
                                                            <th className="p-3 text-white">Difference</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y-2 divide-gray-100 bg-white">
                                                        {results.results.investStrategy.history.filter((_, i) => i % 12 === 11).map((row, i) => {
                                                            const payoffRow = results.results.payoffStrategy.history[i * 12 + 11];
                                                            const payoffNW = payoffRow ? payoffRow.netWorth : 0;
                                                            const diff = payoffNW - row.netWorth;
                                                            return (
                                                                <tr key={i} className="hover:bg-yellow-50">
                                                                    <td className="p-3 font-black text-black border-r border-gray-200">Year {row.year}</td>
                                                                    <td className="p-3 font-bold text-black border-r border-gray-200">{formatCurrency(row.netWorth)}</td>
                                                                    <td className="p-3 font-bold text-black border-r border-gray-200">{formatCurrency(payoffNW)}</td>
                                                                    <td className={`p-3 font-black ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                        {formatCurrency(Math.abs(diff))} {diff > 0 ? '(Payoff Win)' : '(Invest Win)'}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                            </>
                        )}
                    </ResultsAnalysis>
                </div>

            </CalculatorLayout>

            <Footer />
        </div>
    );
}
