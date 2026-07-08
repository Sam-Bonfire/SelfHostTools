import React, { useState, useMemo } from 'react';
import { IndianRupee, Car, TrendingDown, Clock, Shield, Wrench, Fuel, CarTaxiFront, AlertCircle } from 'lucide-react';
import { Button, Card, Input, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, DownloadButtons, Footer, MetricDisplay } from '@packages/styling';
import { calculateCarOwnership } from '../lib/carOwnershipLogic';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import { usePersistedState, resetPersistedState } from '@packages/persistence';
import { macroData } from '@packages/macro-data';

export default function CarOwnershipCalculator() {
    // Inputs
    const [carPrice, setCarPrice] = usePersistedState('CarOwnershipCalculator', 'carPrice', 1500000);
    const [downPayment, setDownPayment] = usePersistedState('CarOwnershipCalculator', 'downPayment', 300000);
    const [loanInterestRate, setLoanInterestRate] = usePersistedState('CarOwnershipCalculator', 'loanInterestRate', macroData.interestRates.autoLoan);
    const [loanTermYears, setLoanTermYears] = usePersistedState('CarOwnershipCalculator', 'loanTermYears', 5);
    const [ownershipYears, setOwnershipYears] = usePersistedState('CarOwnershipCalculator', 'ownershipYears', 7);
    const [annualDepreciationRate, setAnnualDepreciationRate] = usePersistedState('CarOwnershipCalculator', 'annualDepreciationRate', 15);
    const [annualInsurance, setAnnualInsurance] = usePersistedState('CarOwnershipCalculator', 'annualInsurance', 35000);
    const [annualMaintenance, setAnnualMaintenance] = usePersistedState('CarOwnershipCalculator', 'annualMaintenance', 15000);
    const [monthlyFuel, setMonthlyFuel] = usePersistedState('CarOwnershipCalculator', 'monthlyFuel', 8000);
    const [averageRideshareCost, setAverageRideshareCost] = usePersistedState('CarOwnershipCalculator', 'averageRideshareCost', 400);

    // Calculate
    const results = useMemo(() => {
        return calculateCarOwnership({
            carPrice: Number(carPrice),
            downPayment: Number(downPayment),
            loanInterestRate: Number(loanInterestRate),
            loanTermYears: Number(loanTermYears),
            ownershipYears: Number(ownershipYears),
            annualDepreciationRate: Number(annualDepreciationRate),
            annualInsurance: Number(annualInsurance),
            annualMaintenance: Number(annualMaintenance),
            monthlyFuel: Number(monthlyFuel),
            averageRideshareCost: Number(averageRideshareCost)
        });
    }, [carPrice, downPayment, loanInterestRate, loanTermYears, ownershipYears, annualDepreciationRate, annualInsurance, annualMaintenance, monthlyFuel, averageRideshareCost]);

    const { financials, comparisons, summary } = results;

    // Formatting utility
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(val);

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <CalculatorLayout>
        <CalculatorHeader namespace="CarOwnershipCalculator"
                title="Car Ownership Realist"
                icon={<Car className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />}
                onReset={() => { resetPersistedState('CarOwnershipCalculator'); window.location.reload(); }}
                color="bg-orange-100"
            />

      <>
                {/* LEFT: Inputs */}
                <div className="lg:col-span-5 space-y-6">
                    <Card title="Purchase & Loan" icon={IndianRupee}>
                        <div className="space-y-4">
                            <Input
                                id="carPrice"
                                label="On-Road Price"
                                type="number"
                                value={carPrice}
                                onChange={(e) => setCarPrice(e.target.value)}
                                icon={Car}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="downPayment"
                                    label="Down Payment"
                                    type="number"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(e.target.value)}
                                />
                                <Input
                                    id="loanInterestRate"
                                    label="Loan Interest (%)"
                                    type="number"
                                    value={loanInterestRate}
                                    onChange={(e) => setLoanInterestRate(e.target.value)}
                                    step="0.1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="loanTermYears"
                                    label="Loan Term (Yrs)"
                                    type="number"
                                    value={loanTermYears}
                                    onChange={(e) => setLoanTermYears(e.target.value)}
                                    icon={Clock}
                                />
                                <Input
                                    id="ownershipYears"
                                    label="Ownership (Yrs)"
                                    type="number"
                                    value={ownershipYears}
                                    onChange={(e) => setOwnershipYears(e.target.value)}
                                    icon={Clock}
                                />
                            </div>

                            <Input
                                id="annualDepreciationRate"
                                label="Annual Depreciation (%)"
                                type="number"
                                value={annualDepreciationRate}
                                onChange={(e) => setAnnualDepreciationRate(e.target.value)}
                                icon={TrendingDown}
                                tooltip="Average new car loses 15-20% per year."
                            />
                        </div>
                    </Card>

                    <Card title="Running Costs" icon={Fuel}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="annualInsurance"
                                    label="Annual Insurance"
                                    type="number"
                                    value={annualInsurance}
                                    onChange={(e) => setAnnualInsurance(e.target.value)}
                                    icon={Shield}
                                />
                                <Input
                                    id="annualMaintenance"
                                    label="Annual Maintenance"
                                    type="number"
                                    value={annualMaintenance}
                                    onChange={(e) => setAnnualMaintenance(e.target.value)}
                                    icon={Wrench}
                                />
                            </div>

                            <Input
                                id="monthlyFuel"
                                label="Monthly Fuel / Charging"
                                type="number"
                                value={monthlyFuel}
                                onChange={(e) => setMonthlyFuel(e.target.value)}
                                icon={Fuel}
                            />

                            <div className="pt-4 border-t-2 border-black">
                                <Input
                                    id="averageRideshareCost"
                                    label="Avg. Uber/Ola Trip Cost"
                                    type="number"
                                    value={averageRideshareCost}
                                    onChange={(e) => setAverageRideshareCost(e.target.value)}
                                    icon={CarTaxiFront}
                                    tooltip="Used to compare car ownership against just booking cabs everywhere."
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-orange-50">
                        <DownloadButtons 
                            onDownloadPDF={() => downloadPDF({
                                inputs: { carPrice, downPayment, loanInterestRate, loanTermYears, ownershipYears, annualDepreciationRate, annualInsurance, annualMaintenance, monthlyFuel, averageRideshareCost },
                                results: { financials, comparisons, summary }
                            })}
                            onDownloadExcel={() => downloadExcel({
                                inputs: { carPrice, downPayment, loanInterestRate, loanTermYears, ownershipYears, annualDepreciationRate, annualInsurance, annualMaintenance, monthlyFuel, averageRideshareCost },
                                results: { financials, comparisons, summary }
                            })}
                        />
                    </Card>
                </div>

                {/* RIGHT: Results */}
                <div className="lg:col-span-7 space-y-6">
                    <ResultsAnalysis
                        title="True Cost of Ownership"
                        verdict={`You are paying ${formatCurrency(financials.trueMonthlyCost)} per month to own this car.`}
                        verdictColor="text-orange-600"
                    >
                        {/* The Big Number */}
                        <MetricDisplay 
                            title={`Total Sunk Cost Over ${ownershipYears} Years`}
                            value={formatCurrency(summary.trueCostOfOwnership)}
                            subtitle="This is the actual wealth destroyed by Depreciation, Interest, and Operations."
                        />

                        {/* Breakdown Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <MetricDisplay
                                title="Monthly EMI"
                                value={formatCurrency(financials.monthlyEMI)}
                                subtitle={`Paid for ${loanTermYears * 12} months`}
                            />
                            <MetricDisplay
                                title="Lost to Depreciation"
                                value={formatCurrency(financials.totalDepreciation)}
                                subtitle={`Final Car Value: ${formatCurrency(financials.finalCarValue)}`}
                            />
                        </div>

                        {/* The Waterfall Breakdown */}
                        <div className="border-4 border-black bg-white overflow-hidden mb-8">
                            <div className="bg-black text-white p-3 border-b-4 border-black">
                                <h3 className="font-black uppercase text-sm">Lifetime Wealth Destruction</h3>
                            </div>
                            
                            <div className="p-4 space-y-3 font-bold">
                                <div className="flex justify-between items-center text-lg">
                                    <span>Purchase Price</span>
                                    <span>{formatCurrency(carPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center text-rose-500 pl-4 border-l-4 border-rose-500">
                                    <span>+ Total Interest Paid</span>
                                    <span>+{formatCurrency(financials.totalInterest)}</span>
                                </div>
                                <div className="flex justify-between items-center text-rose-500 pl-4 border-l-4 border-rose-500">
                                    <span>+ Insurance, Maint, Fuel</span>
                                    <span>+{formatCurrency(financials.totalOperationalCost)}</span>
                                </div>
                                <div className="flex justify-between items-center text-green-600 pl-4 border-l-4 border-green-600">
                                    <span>- Final Sale Value</span>
                                    <span>-{formatCurrency(financials.finalCarValue)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xl pt-3 border-t-4 border-black">
                                    <span>True Cost of Ownership</span>
                                    <span className="text-black">
                                        {formatCurrency(summary.trueCostOfOwnership)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reality Note - Rideshare */}
                        <div className="p-4 bg-yellow-50 border-4 border-black text-black">
                            <h3 className="font-black uppercase flex items-center gap-2 mb-2">
                                <CarTaxiFront className="w-5 h-5 text-yellow-600" /> The Rideshare Equivalent
                            </h3>
                            <p className="text-sm font-medium">
                                Instead of owning this car, you could take <strong>{comparisons.rideshareTripsPerWeek} Uber/Ola trips every single week</strong> (at {formatCurrency(averageRideshareCost)} per trip) for {ownershipYears} years, and it would cost you the exact same amount of money.
                            </p>
                        </div>

                    </ResultsAnalysis>
                </div>
            
      </>
        </CalculatorLayout>
        <Footer>
            <p className="text-gray-600 font-medium">
                <strong>Disclaimer:</strong> A car is a depreciating liability, not an asset.
                <br className="md:hidden" />
                The true cost of ownership is hidden in depreciation and interest, not just your monthly EMI or fuel costs. Only buy what your wealth can genuinely sustain.
            </p>
        </Footer>
    </div>
    );
}
