import React, { useState } from 'react';
import { CalculatorLayout, CalculatorHeader, ResultsAnalysis, Input, Card, DownloadButtons, Footer, MetricDisplay } from '@packages/styling';
import { Users, Target, MousePointerClick, Send, IndianRupee, AlertCircle, CheckCircle2 } from 'lucide-react';
import { calculateCreatorEconomy } from '../lib/creatorEconomyLogic';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import { usePersistedState, resetPersistedState } from '@packages/components';

const CreatorEconomyCalculator = () => {
  const [inputs, setInputs] = usePersistedState('CreatorEconomyCalculator', 'inputs', {
    desiredIncome: 5000,
    audienceSize: 10000,
    reachRate: 30,
    clickThroughRate: 3,
    postsPerMonth: 4,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const results = calculateCreatorEconomy(inputs);

  const handleDownloadPDF = () => {
    downloadPDF({ inputs, results });
  };

  const handleDownloadExcel = () => {
    downloadExcel({ inputs, results });
  };

  // Preparing data for export
  const reportData = {
    title: 'Creator Economy Sponsor & Ad Quoter',
    summary: [
      { label: 'Desired Monthly Income', value: `₹${inputs.desiredIncome.toLocaleString()}` },
      { label: 'Audience Size', value: inputs.audienceSize.toLocaleString() },
      { label: 'Active Reach', value: results.activeAudience.toLocaleString() },
      { label: 'Estimated Clicks per Post', value: results.estimatedClicks.toLocaleString() },
    ],
    details: [
      ['Tier Name', 'CPM', 'Flat Rate per Post', 'Monthly Potential'],
      ...results.tiers.map(t => [
        t.name, 
        `₹${t.cpm}`, 
        `₹${t.flatRate.toFixed(2)}`, 
        `₹${t.monthlyRevenue.toFixed(2)}`
      ])
    ],
    insights: [
      { 
        label: 'Required CPM to hit goal', 
        value: `₹${results.requiredCPM.toFixed(2)}` 
      },
      { 
        label: 'Required CPC to hit goal', 
        value: `₹${results.requiredCPC.toFixed(2)}` 
      },
      { 
        label: 'Reality Check', 
        value: results.realityCheck.message 
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <CalculatorLayout>
        <CalculatorHeader 
          title="Creator Economy Quoter"
          icon={Users}
        
            onReset={() => { resetPersistedState('CreatorEconomyCalculator'); window.location.reload(); }} />

        <div className="lg:col-span-5 space-y-6">
          <Card title="The Goal">
            <Input
              id="desiredIncome"
              name="desiredIncome"
              label="Desired Monthly Income ($)"
              type="number"
              value={inputs.desiredIncome}
              onChange={handleInputChange}
              icon={IndianRupee}
            />
            <Input
              id="postsPerMonth"
              name="postsPerMonth"
              label="Sponsored Posts per Month"
              type="number"
              value={inputs.postsPerMonth}
              onChange={handleInputChange}
              icon={Send}
            />
          </Card>

          <Card title="Audience & Engagement">
            <Input
              id="audienceSize"
              name="audienceSize"
              label="Total Audience Size (Subs/Followers)"
              type="number"
              value={inputs.audienceSize}
              onChange={handleInputChange}
              icon={Users}
            />
            <Input
              id="reachRate"
              name="reachRate"
              label="Average Reach/Open Rate (%)"
              type="number"
              value={inputs.reachRate}
              onChange={handleInputChange}
              icon={Target}
            />
            <Input
              id="clickThroughRate"
              name="clickThroughRate"
              label="Click-Through Rate (%)"
              type="number"
              value={inputs.clickThroughRate}
              onChange={handleInputChange}
              icon={MousePointerClick}
              tooltip="Percentage of total audience that clicks your links"
            />
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <ResultsAnalysis aria-live="polite">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <MetricDisplay 
                title="Active Audience" 
                value={results.activeAudience.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
              />
              <MetricDisplay 
                title="Target Revenue / Post" 
                value={`₹${results.revenueNeededPerPost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
              />
            </div>

            <div className={`p-4 mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-4 ${results.realityCheck.isRealistic ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {results.realityCheck.isRealistic ? (
                <CheckCircle2 className="text-green-600 mt-1 flex-shrink-0" size={24} />
              ) : (
                <AlertCircle className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
              )}
              <div>
                <h4 className="font-black text-lg">Reality Check</h4>
                <p className="text-gray-800 font-medium">{results.realityCheck.message}</p>
                {!results.realityCheck.isRealistic && results.realityCheck.requiredAudienceToHitGoal && (
                  <p className="mt-2 text-sm font-bold text-gray-600">
                    To hit this goal at max industry rates, you need ~{results.realityCheck.requiredAudienceToHitGoal.toLocaleString()} total audience.
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <Card title="Recommended Quote Tiers">
                <div className="space-y-4">
                  {results.tiers.map((tier, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border-2 border-black hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-bold text-lg">{tier.name}</p>
                        <p className="text-sm text-gray-500 font-medium">Based on ${tier.cpm} CPM</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xl">${tier.flatRate.toLocaleString(undefined, { maximumFractionDigits: 0 })} / post</p>
                        <p className="text-sm text-gray-500 font-bold">${tier.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} / mo</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MetricDisplay 
                title="Required CPM" 
                value={`₹${results.requiredCPM.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} 
                subtitle="To hit target"
              />
              <MetricDisplay 
                title="Required CPC" 
                value={`₹${results.requiredCPC.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} 
                subtitle="Based on clicks"
              />
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
      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> Eyeballs don't pay the bills; engagement does.
          <br className="md:hidden" />
          Sponsors pay for predictable reach and clicks, not vanity follower counts. If your numbers don't add up to your desired income at standard industry CPMs, you need either a larger audience or a more expensive niche.
        </p>
      </Footer>
    </div>
  );
};

export default CreatorEconomyCalculator;
