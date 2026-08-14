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
  Select,
  Tooltip
} from '@packages/styling';
import { Car, CarTaxiFront, Clock, Fuel, IndianRupee, Map, Zap } from 'lucide-react';
import { useMemo } from 'react';

import { calculateCarOwnership } from '../lib/carOwnershipLogic';
import { downloadExcel, downloadPDF } from '../lib/downloadUtils';

export default function CarOwnershipCalculator() {
  // Common Inputs
  const [carPrice, setCarPrice] = usePersistedState('CarOwnershipCalculator', 'carPrice', 1500000);
  const [downPayment, setDownPayment] = usePersistedState('CarOwnershipCalculator', 'downPayment', 300000);
  const [loanInterestRate, setLoanInterestRate] = usePersistedState(
    'CarOwnershipCalculator',
    'loanInterestRate',
    macroData.interestRates.autoLoan
  );
  const [loanTermYears, setLoanTermYears] = usePersistedState('CarOwnershipCalculator', 'loanTermYears', 5);
  const [ownershipYears, setOwnershipYears] = usePersistedState('CarOwnershipCalculator', 'ownershipYears', 7);
  const [expectedResaleValue, setExpectedResaleValue] = usePersistedState(
    'CarOwnershipCalculator',
    'expectedResaleValue',
    600000
  );
  const [annualInsurance, setAnnualInsurance] = usePersistedState('CarOwnershipCalculator', 'annualInsurance', 35000);
  const [averageRideshareCost, setAverageRideshareCost] = usePersistedState(
    'CarOwnershipCalculator',
    'averageRideshareCost',
    macroData.microCosts.rideshareCostPerTrip
  );

  // Mode Toggle
  const [isAdvanced, setIsAdvanced] = usePersistedState('CarOwnershipCalculator', 'isAdvanced', false);

  // Simple Mode Inputs
  const [annualMaintenance, setAnnualMaintenance] = usePersistedState(
    'CarOwnershipCalculator',
    'annualMaintenance',
    15000
  );
  const [monthlyFuel, setMonthlyFuel] = usePersistedState('CarOwnershipCalculator', 'monthlyFuel', 8000);

  // Advanced Mode Inputs
  const [usageKMs, setUsageKMs] = usePersistedState('CarOwnershipCalculator', 'usageKMs', 800);
  const [usageType, setUsageType] = usePersistedState('CarOwnershipCalculator', 'usageType', 'monthly');
  const [fuelEfficiency, setFuelEfficiency] = usePersistedState('CarOwnershipCalculator', 'fuelEfficiency', 15);
  const [fuelPrice, setFuelPrice] = usePersistedState(
    'CarOwnershipCalculator',
    'fuelPrice',
    macroData.fuelPrices.petrol
  );
  const [annualServicing, setAnnualServicing] = usePersistedState(
    'CarOwnershipCalculator',
    'annualServicing',
    macroData.microCosts.carServicingAnnual
  );
  const [tireReplacementFund, setTireReplacementFund] = usePersistedState(
    'CarOwnershipCalculator',
    'tireReplacementFund',
    macroData.microCosts.carTireFundAnnual
  );
  const [monthlyCleaning, setMonthlyCleaning] = usePersistedState(
    'CarOwnershipCalculator',
    'monthlyCleaning',
    macroData.microCosts.carCleaningMonthly
  );
  const [annualFines, setAnnualFines] = usePersistedState(
    'CarOwnershipCalculator',
    'annualFines',
    macroData.microCosts.carFinesAnnual
  );
  const [monthlyTolls, setMonthlyTolls] = usePersistedState(
    'CarOwnershipCalculator',
    'monthlyTolls',
    macroData.microCosts.carTollsMonthly
  );
  const [monthlyParking, setMonthlyParking] = usePersistedState(
    'CarOwnershipCalculator',
    'monthlyParking',
    macroData.microCosts.carParkingMonthly
  );
  const [annualRepairs, setAnnualRepairs] = usePersistedState(
    'CarOwnershipCalculator',
    'annualRepairs',
    macroData.microCosts.carRepairsAnnual
  );

  // Trip Simulator State
  const [tripDistance, setTripDistance] = usePersistedState('CarOwnershipCalculator', 'tripDistance', 15);
  const [tripTolls, setTripTolls] = usePersistedState('CarOwnershipCalculator', 'tripTolls', 0);
  const [tripParking, setTripParking] = usePersistedState('CarOwnershipCalculator', 'tripParking', 50);
  const [cabFare, setCabFare] = usePersistedState(
    'CarOwnershipCalculator',
    'cabFare',
    macroData.microCosts.rideshareCostPerTrip
  );

  // Calculate
  const results = useMemo(() => {
    return calculateCarOwnership({
      isAdvanced,
      carPrice: Number(carPrice),
      downPayment: Number(downPayment),
      loanInterestRate: Number(loanInterestRate),
      loanTermYears: Number(loanTermYears),
      ownershipYears: Number(ownershipYears),
      expectedResaleValue: Number(expectedResaleValue),
      annualInsurance: Number(annualInsurance),
      annualMaintenance: Number(annualMaintenance),
      monthlyFuel: Number(monthlyFuel),
      averageRideshareCost: Number(averageRideshareCost),
      usageKMs: Number(usageKMs),
      usageType,
      fuelEfficiency: Number(fuelEfficiency),
      fuelPrice: Number(fuelPrice),
      annualServicing: Number(annualServicing),
      tireReplacementFund: Number(tireReplacementFund),
      monthlyCleaning: Number(monthlyCleaning),
      annualFines: Number(annualFines),
      monthlyTolls: Number(monthlyTolls),
      monthlyParking: Number(monthlyParking),
      annualRepairs: Number(annualRepairs)
    });
  }, [
    isAdvanced,
    carPrice,
    downPayment,
    loanInterestRate,
    loanTermYears,
    ownershipYears,
    expectedResaleValue,
    annualInsurance,
    annualMaintenance,
    monthlyFuel,
    averageRideshareCost,
    usageKMs,
    usageType,
    fuelEfficiency,
    fuelPrice,
    annualServicing,
    tireReplacementFund,
    monthlyCleaning,
    annualFines,
    monthlyTolls,
    monthlyParking,
    annualRepairs
  ]);

  const { financials, comparisons, summary } = results;

  // Formatting utility
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);

  // Trip Simulator Logic
  const simCarCost = Number(tripDistance) * financials.runningCostPerKm + Number(tripTolls) + Number(tripParking);
  const simCabCost = Number(cabFare);
  const simDifference = Math.abs(simCarCost - simCabCost);
  const simWinner = simCarCost <= simCabCost ? 'Car' : 'Cab';

  const exportData = {
    inputs: {
      isAdvanced,
      carPrice,
      downPayment,
      loanInterestRate,
      loanTermYears,
      ownershipYears,
      expectedResaleValue,
      annualInsurance,
      averageRideshareCost,
      annualMaintenance,
      monthlyFuel,
      usageKMs,
      usageType,
      fuelEfficiency,
      fuelPrice,
      annualServicing,
      tireReplacementFund,
      monthlyCleaning,
      annualFines,
      monthlyTolls,
      monthlyParking,
      annualRepairs
    },
    results: { financials, comparisons, summary }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="CarOwnershipCalculator"
            title="Car Ownership Realist"
            icon={<Car className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />}
            onReset={() => {
              resetPersistedState('CarOwnershipCalculator');
            }}
            color="bg-orange-100"
          />
        </div>

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
                icon={IndianRupee}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="downPayment"
                  label="Down Payment"
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  icon={IndianRupee}
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
                id="expectedResaleValue"
                label="Expected Resale Value"
                type="number"
                value={expectedResaleValue}
                onChange={(e) => setExpectedResaleValue(e.target.value)}
                icon={IndianRupee}
                tooltip="What you realistically expect to sell the car for at the end of your ownership."
              />
            </div>
          </Card>

          <Card title="Running Costs" icon={Fuel} headerColor="bg-orange-100">
            <div className="space-y-4">
              <Tooltip
                content="Toggle between basic monthly averages and granular real-world expenses"
                className="w-full mb-4"
              >
                <Button onClick={() => setIsAdvanced(!isAdvanced)} variant="secondary" className="w-full">
                  {isAdvanced ? 'Switch to Simple Mode' : 'Switch to Advanced Mode'}
                </Button>
              </Tooltip>

              <Input
                id="annualInsurance"
                label="Annual Insurance"
                type="number"
                value={annualInsurance}
                onChange={(e) => setAnnualInsurance(e.target.value)}
                icon={IndianRupee}
              />

              {!isAdvanced ? (
                <div className="space-y-4">
                  <Input
                    id="annualMaintenance"
                    label="Annual Maintenance"
                    type="number"
                    value={annualMaintenance}
                    onChange={(e) => setAnnualMaintenance(e.target.value)}
                    icon={IndianRupee}
                  />
                  <Input
                    id="monthlyFuel"
                    label="Monthly Fuel / Charging"
                    type="number"
                    value={monthlyFuel}
                    onChange={(e) => setMonthlyFuel(e.target.value)}
                    icon={IndianRupee}
                  />
                </div>
              ) : (
                <div className="space-y-6 pt-4 border-t-2 border-black border-dashed">
                  <div>
                    <h4 className="font-bold text-sm mb-3">Usage & Fuel</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        id="usageKMs"
                        label={`KMs per ${usageType === 'monthly' ? 'Month' : 'Year'}`}
                        type="number"
                        value={usageKMs}
                        onChange={(e) => setUsageKMs(e.target.value)}
                      />
                      <Select
                        id="usageType"
                        value={usageType}
                        onChange={(e) => setUsageType(e.target.value)}
                        label="Usage Frequency"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </Select>
                      <Input
                        id="fuelEfficiency"
                        label="Mileage (KM/L)"
                        type="number"
                        value={fuelEfficiency}
                        onChange={(e) => setFuelEfficiency(e.target.value)}
                      />
                      <Input
                        id="fuelPrice"
                        label="Fuel/Unit Price"
                        type="number"
                        value={fuelPrice}
                        onChange={(e) => setFuelPrice(e.target.value)}
                        icon={IndianRupee}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm mb-3">Granular Overheads</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        id="annualServicing"
                        label="Servicing / Yr"
                        type="number"
                        value={annualServicing}
                        onChange={(e) => setAnnualServicing(e.target.value)}
                        icon={IndianRupee}
                      />
                      <Input
                        id="annualRepairs"
                        label="Unexpected Repairs / Yr"
                        type="number"
                        value={annualRepairs}
                        onChange={(e) => setAnnualRepairs(e.target.value)}
                        icon={IndianRupee}
                      />
                      <Input
                        id="tireReplacementFund"
                        label="Tire Fund / Yr"
                        type="number"
                        value={tireReplacementFund}
                        onChange={(e) => setTireReplacementFund(e.target.value)}
                        icon={IndianRupee}
                        tooltip="Cost of 4 tires divided by their lifespan in years."
                      />
                      <Input
                        id="annualFines"
                        label="Traffic Fines / Yr"
                        type="number"
                        value={annualFines}
                        onChange={(e) => setAnnualFines(e.target.value)}
                        icon={IndianRupee}
                      />
                      <Input
                        id="monthlyCleaning"
                        label="Washing / Mo"
                        type="number"
                        value={monthlyCleaning}
                        onChange={(e) => setMonthlyCleaning(e.target.value)}
                        icon={IndianRupee}
                      />
                      <Input
                        id="monthlyTolls"
                        label="Tolls (FASTag) / Mo"
                        type="number"
                        value={monthlyTolls}
                        onChange={(e) => setMonthlyTolls(e.target.value)}
                        icon={IndianRupee}
                      />
                      <Input
                        id="monthlyParking"
                        label="Parking / Mo"
                        type="number"
                        value={monthlyParking}
                        onChange={(e) => setMonthlyParking(e.target.value)}
                        icon={IndianRupee}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t-2 border-black">
                <Input
                  id="averageRideshareCost"
                  label="Avg. Uber/Ola Trip Cost"
                  type="number"
                  value={averageRideshareCost}
                  onChange={(e) => setAverageRideshareCost(e.target.value)}
                  icon={IndianRupee}
                  tooltip="Used to compare car ownership against just booking cabs everywhere."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-7 space-y-6">
          <ResultsAnalysis
            title="True Cost of Ownership"
            verdict={`You are paying ${formatCurrency(financials.trueMonthlyCost)} per month to own this car.`}
            verdictColor="text-orange-600"
          >
            {/* Cost Per KM Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {financials.trueCostPerKm > 0 && (
                <div className="bg-red-50 border-4 border-black p-4">
                  <p className="text-xs font-bold uppercase text-red-600 mb-1">True Cost Per KM</p>
                  <p className="text-3xl font-black text-black">
                    ₹{financials.trueCostPerKm.toFixed(1)} <span className="text-lg font-bold text-gray-500">/km</span>
                  </p>
                  <p className="text-xs mt-2 font-medium">Includes Sunk Costs (EMI, Depreciation, Insurance)</p>
                </div>
              )}
              {financials.runningCostPerKm > 0 && (
                <div className="bg-green-50 border-4 border-black p-4">
                  <p className="text-xs font-bold uppercase text-green-700 mb-1">Running Cost Per KM</p>
                  <p className="text-3xl font-black text-black">
                    ₹{financials.runningCostPerKm.toFixed(1)}{' '}
                    <span className="text-lg font-bold text-gray-500">/km</span>
                  </p>
                  <p className="text-xs mt-2 font-medium">Only Marginal Costs (Fuel, Wear & Tear, Tolls)</p>
                </div>
              )}
            </div>

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
                  <span className="text-black">{formatCurrency(summary.trueCostOfOwnership)}</span>
                </div>
              </div>
            </div>

            {/* Reality Note - Rideshare */}
            <Card title="The Rideshare Reality" icon={CarTaxiFront} headerColor="bg-yellow-200" className="mb-6">
              <p className="text-sm font-medium">
                Instead of owning this car, you could take{' '}
                <strong>{comparisons.rideshareTripsPerWeek} Uber/Ola trips every single week</strong> (at{' '}
                {formatCurrency(averageRideshareCost)} per trip) for {ownershipYears} years, and it would cost you the
                exact same amount of money.
              </p>
            </Card>

            {/* Trip Simulator */}
            {financials.runningCostPerKm > 0 && (
              <Card title="Trip Simulator (Cab vs Own Car)" icon={Map} headerColor="bg-indigo-100">
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-600">
                    You already own the car. EMI and insurance are sunk costs. Let's see what's cheaper for a specific
                    trip today.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input
                      id="tripDistance"
                      label="Trip (KMs)"
                      type="number"
                      value={tripDistance}
                      onChange={(e) => setTripDistance(e.target.value)}
                    />
                    <Input
                      id="tripTolls"
                      label="Tolls (₹)"
                      type="number"
                      value={tripTolls}
                      onChange={(e) => setTripTolls(e.target.value)}
                      icon={IndianRupee}
                    />
                    <Input
                      id="tripParking"
                      label="Parking (₹)"
                      type="number"
                      value={tripParking}
                      onChange={(e) => setTripParking(e.target.value)}
                      icon={IndianRupee}
                    />
                    <Input
                      id="cabFare"
                      label="Cab Fare (₹)"
                      type="number"
                      value={cabFare}
                      onChange={(e) => setCabFare(e.target.value)}
                      icon={IndianRupee}
                    />
                  </div>

                  <div className="mt-4 p-4 border-2 border-black flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50">
                    <div className="flex-1 text-center border-r-0 md:border-r-2 border-black pb-4 md:pb-0">
                      <p className="text-xs font-bold uppercase mb-1">Your Car (Running Cost)</p>
                      <p className={`text-2xl font-black ${simWinner === 'Car' ? 'text-green-600' : 'text-rose-600'}`}>
                        {formatCurrency(simCarCost)}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold mt-1">Marginal Cost + Tolls/Park</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-xs font-bold uppercase mb-1">Cab Booking</p>
                      <p className={`text-2xl font-black ${simWinner === 'Cab' ? 'text-green-600' : 'text-rose-600'}`}>
                        {formatCurrency(simCabCost)}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold mt-1">Total Fare Estimate</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-indigo-50 text-indigo-900 p-2 font-bold text-sm border-2 border-indigo-200">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    Verdict: Taking the {simWinner} is {formatCurrency(simDifference)} cheaper.
                  </div>
                </div>
              </Card>
            )}

            <DownloadButtons
              onDownloadPDF={() => downloadPDF(exportData)}
              onDownloadExcel={() => downloadExcel(exportData)}
            />
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>
      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> A car is a depreciating liability, not an asset.
          <br className="md:hidden" />
          The true cost of ownership is hidden in depreciation and interest, not just your monthly EMI or fuel costs.
          Only buy what your wealth can genuinely sustain.
        </p>
      </Footer>
    </div>
  );
}
