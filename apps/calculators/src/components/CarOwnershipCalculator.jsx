import React, { useState, useMemo } from 'react';
import { IndianRupee, Car, TrendingDown, Clock, Shield, Wrench, Fuel, CarTaxiFront, AlertCircle } from 'lucide-react';
import { Button, Card, Input, Tooltip, ResultsAnalysis, CalculatorHeader, CalculatorLayout, DownloadButtons, Footer } from '@packages/styling';
import { calculateCarOwnership } from '../lib/carOwnershipLogic';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';

export default function CarOwnershipCalculator() {
    // Inputs
    const [carPrice, setCarPrice] = useState(1500000);
    const [downPayment, setDownPayment] = useState(300000);
    const [loanInterestRate, setLoanInterestRate] = useState(9.0);
    const [loanTermYears, setLoanTermYears] = useState(5);
    const [ownershipYears, setOwnershipYears] = useState(7);
    const [annualDepreciationRate, setAnnualDepreciationRate] = useState(15);
    const [annualInsurance, setAnnualInsurance] = useState(35000);
    const [annualMaintenance, setAnnualMaintenance] = useState(15000);
    const [monthlyFuel, setMonthlyFuel] = useState(8000);
    const [averageRideshareCost, setAverageRideshareCost] = useState(400);

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
        <CalculatorLayout>
            <CalculatorHeader
                title="Car Ownership Realist"
                description="Buying a car is emotional. Let's make it mathematical. Expose the hidden costs of depreciation, interest, and maintenance."
                icon={<Car className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />}
                color="bg-orange-100"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Inputs */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                        <h2 className="text-xl font-black uppercase flex items-center gap-2 mb-6 border-b-4 border-black pb-4">
                            <IndianRupee className="w-6 h-6" /> Purchase & Loan
                        </h2>

                        <div className="space-y-4">
                            <Input
                                id="carPrice"
                                label="On-Road Price"
                                type="number"
                                value={carPrice}
                                onChange={(e) => setCarPrice(e.target.value)}
                                icon={<Car className="w-5 h-5 text-gray-500" />}
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
                                    icon={<Clock className="w-5 h-5 text-gray-500" />}
                                />
                                <Input
                                    id="ownershipYears"
                                    label="Ownership (Yrs)"
                                    type="number"
                                    value={ownershipYears}
                                    onChange={(e) => setOwnershipYears(e.target.value)}
                                    icon={<Clock className="w-5 h-5 text-gray-500" />}
                                />
                            </div>

                            <Input
                                id="annualDepreciationRate"
                                label="Annual Depreciation (%)"
                                type="number"
                                value={annualDepreciationRate}
                                onChange={(e) => setAnnualDepreciationRate(e.target.value)}
                                icon={<TrendingDown className="w-5 h-5 text-gray-500" />}
                                tooltip="Average new car loses 15-20% per year."
                            />
                        </div>
                    </Card>

                    <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                        <h2 className="text-xl font-black uppercase flex items-center gap-2 mb-6 border-b-4 border-black pb-4">
                            <Fuel className="w-6 h-6" /> Running Costs
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="annualInsurance"
                                    label="Annual Insurance"
                                    type="number"
                                    value={annualInsurance}
                                    onChange={(e) => setAnnualInsurance(e.target.value)}
                                    icon={<Shield className="w-5 h-5 text-gray-500" />}
                                />
                                <Input
                                    id="annualMaintenance"
                                    label="Annual Maintenance"
                                    type="number"
                                    value={annualMaintenance}
                                    onChange={(e) => setAnnualMaintenance(e.target.value)}
                                    icon={<Wrench className="w-5 h-5 text-gray-500" />}
                                />
                            </div>

                            <Input
                                id="monthlyFuel"
                                label="Monthly Fuel / Charging"
                                type="number"
                                value={monthlyFuel}
                                onChange={(e) => setMonthlyFuel(e.target.value)}
                                icon={<Fuel className="w-5 h-5 text-gray-500" />}
                            />

                            <div className="pt-4 border-t-2 border-black">
                                <Input
                                    id="averageRideshareCost"
                                    label="Avg. Uber/Ola Trip Cost"
                                    type="number"
                                    value={averageRideshareCost}
                                    onChange={(e) => setAverageRideshareCost(e.target.value)}
                                    icon={<CarTaxiFront className="w-5 h-5 text-gray-500" />}
                                    tooltip="Used to compare car ownership against just booking cabs everywhere."
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-orange-50">
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
                        <div className="mb-8 p-6 bg-white border-4 border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-sm font-black uppercase text-gray-500 mb-2 tracking-widest">Total Sunk Cost Over {ownershipYears} Years</p>
                            <p className="text-4xl md:text-5xl font-black text-black">
                                {formatCurrency(summary.trueCostOfOwnership)}
                            </p>
                            <p className="text-xs font-bold text-gray-500 mt-4">
                                This is the actual wealth destroyed by Depreciation, Interest, and Operations.
                            </p>
                        </div>

                        {/* Breakdown Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="p-4 border-4 border-black bg-gray-50">
                                <p className="text-xs font-bold text-gray-600 uppercase mb-1">Monthly EMI</p>
                                <p className="text-2xl font-black">{formatCurrency(financials.monthlyEMI)}</p>
                                <p className="text-xs text-gray-500 mt-1 font-bold">Paid for {loanTermYears * 12} months</p>
                            </div>

                            <div className="p-4 border-4 border-black bg-orange-50">
                                <p className="text-xs font-bold text-orange-600 uppercase mb-1 flex items-center justify-between">
                                    Lost to Depreciation <TrendingDown className="w-4 h-4" />
                                </p>
                                <p className="text-2xl font-black text-orange-600">{formatCurrency(financials.totalDepreciation)}</p>
                                <p className="text-xs text-gray-500 mt-1 font-bold">Final Car Value: {formatCurrency(financials.finalCarValue)}</p>
                            </div>
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
            
      <Footer />
    </div>
        </CalculatorLayout>
    );
}
