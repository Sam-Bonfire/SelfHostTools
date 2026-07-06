import React, { useState, useMemo } from 'react';
import { ShieldAlert, DollarSign, Activity, Briefcase, Plus, HeartPulse } from 'lucide-react';
import { CalculatorLayout, CalculatorHeader, ResultsAnalysis, Input, Card, DownloadButtons, Footer, MetricDisplay } from '@packages/styling';
import { calculateEmergencyFund } from '../lib/emergencyFundLogic.js';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import { usePersistedState, resetPersistedState } from '@packages/components';

export default function EmergencyFundCalculator() {
  const [inputs, setInputs] = usePersistedState('EmergencyFundCalculator', 'inputs', {
    coreExpenses: 3000,
    discretionaryExpenses: 1500,
    discretionaryRetention: 20,
    expenseVolatility: 500,
    jobSearchDuration: 6,
    healthDeductible: 2000,
    propertyDeductible: 1000
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const results = useMemo(() => calculateEmergencyFund(inputs), [inputs]);

  const handleDownloadPDF = () => {
    downloadPDF({ inputs, results });
  };

  const handleDownloadExcel = () => {
    downloadExcel({ inputs, results });
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <CalculatorLayout>
      <div className="lg:col-span-12 mb-8">
        <CalculatorHeader 
        title="Emergency Fund & Income Shock"
        description="Calculate your multi-tiered cushion based on volatility, job loss, and deductibles."
        icon={<ShieldAlert size={32} className="text-white" 
            onReset={() => { resetPersistedState('EmergencyFundCalculator'); window.location.reload(); }} />}
      />
      </div>
      
        <div className="lg:col-span-8 space-y-8">
          <Card title="Monthly Expenses" icon={DollarSign}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Core Living Expenses"
                id="coreExpenses"
                name="coreExpenses"
                type="number"
                value={inputs.coreExpenses}
                onChange={handleInputChange}
                icon={<DollarSign size={18} />}
              />
              <Input
                label="Discretionary Expenses"
                id="discretionaryExpenses"
                name="discretionaryExpenses"
                type="number"
                value={inputs.discretionaryExpenses}
                onChange={handleInputChange}
                icon={<DollarSign size={18} />}
              />
              <Input
                label="Keep Discretionary (%)"
                id="discretionaryRetention"
                name="discretionaryRetention"
                type="number"
                value={inputs.discretionaryRetention}
                onChange={handleInputChange}
                icon={<Activity size={18} />}
              />
              <Input
                label="Expense Volatility Buffer"
                id="expenseVolatility"
                name="expenseVolatility"
                type="number"
                value={inputs.expenseVolatility}
                onChange={handleInputChange}
                icon={<Plus size={18} />}
              />
            </div>
          </Card>

          <Card title="Income Shock & Lump Sums" icon={Briefcase}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Search Duration (Months)"
                id="jobSearchDuration"
                name="jobSearchDuration"
                type="number"
                value={inputs.jobSearchDuration}
                onChange={handleInputChange}
                icon={<Briefcase size={18} />}
              />
              <Input
                label="Max Health Deductible"
                id="healthDeductible"
                name="healthDeductible"
                type="number"
                value={inputs.healthDeductible}
                onChange={handleInputChange}
                icon={<HeartPulse size={18} />}
              />
              <Input
                label="Max Property/Car Deductible"
                id="propertyDeductible"
                name="propertyDeductible"
                type="number"
                value={inputs.propertyDeductible}
                onChange={handleInputChange}
                icon={<ShieldAlert size={18} />}
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <ResultsAnalysis aria-live="polite">
            <div className="text-center mb-6">
              <MetricDisplay 
                title="Total Fund Needed" 
                value={`$${results.totalFund.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
                subtitle={`Based on $${results.monthlyBurnRate.toLocaleString()} monthly burn rate.`} 
              />
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <h5 className="font-bold text-sm">Tier 1: Immediate Cash</h5>
                <p className="text-xs text-gray-600 mb-1">Checking / Cash (1 month)</p>
                <div className="text-xl font-bold">${results.tiers.tier1Cash.toLocaleString()}</div>
              </div>
              
              <div className="p-4 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <h5 className="font-bold text-sm">Tier 2: Bank (HYSA/FD)</h5>
                <p className="text-xs text-gray-600 mb-1">High Yield Savings (1-2 days)</p>
                <div className="text-xl font-bold">${results.tiers.tier2Bank.toLocaleString()}</div>
              </div>
              
              <div className="p-4 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <h5 className="font-bold text-sm">Tier 3: Investments</h5>
                <p className="text-xs text-gray-600 mb-1">Liquid Mutual Funds (3-7 days)</p>
                <div className="text-xl font-bold">${results.tiers.tier3Investments.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mt-8">
              <DownloadButtons 
                onDownloadPDF={handleDownloadPDF} 
                onDownloadExcel={handleDownloadExcel} 
              />
            </div>
          </ResultsAnalysis>
        </div>
      
    </CalculatorLayout>
    <Footer />
    </div>
    );
}
