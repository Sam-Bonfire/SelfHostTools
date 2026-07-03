import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Settings2, PackageOpen } from 'lucide-react';
import { Footer, CalculatorLayout, CalculatorHeader, Card } from '@packages/styling';
import { SEO } from '@packages/components';

export default function AssetJarVisualizer() {
  const [assets, setAssets] = useState({
    stocks: { value: 60, color: '#f59e0b', label: 'Stocks', density: 1 },
    bonds: { value: 30, color: '#3b82f6', label: 'Bonds', density: 2 },
    cash: { value: 10, color: '#10b981', label: 'Cash', density: 3 }
  });

  const [isShaking, setIsShaking] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  
  const targetAllocation = {
    stocks: 60,
    bonds: 30,
    cash: 10
  };

  const handleShock = () => {
    setIsShaking(true);
    setTimeout(() => {
      setAssets(prev => {
        const currentStocks = prev.stocks.value;
        const currentBonds = prev.bonds.value;
        const currentCash = prev.cash.value;
        
        const newStocks = currentStocks * 0.6; 
        const newBonds = currentBonds * 1.05; 
        const newCash = currentCash;
        
        const total = newStocks + newBonds + newCash;
        
        return {
          stocks: { ...prev.stocks, value: (newStocks / total) * 100 },
          bonds: { ...prev.bonds, value: (newBonds / total) * 100 },
          cash: { ...prev.cash, value: (newCash / total) * 100 },
        };
      });
      setIsShaking(false);
    }, 600);
  };

  const handleRebalance = () => {
    setIsRebalancing(true);
    setTimeout(() => {
      setAssets(prev => ({
        stocks: { ...prev.stocks, value: targetAllocation.stocks },
        bonds: { ...prev.bonds, value: targetAllocation.bonds },
        cash: { ...prev.cash, value: targetAllocation.cash },
      }));
      setIsRebalancing(false);
    }, 600);
  };

  const handleSliderChange = (key, newValue) => {
    setAssets(prev => {
      const otherKeys = Object.keys(prev).filter(k => k !== key);
      const remainingValue = 100 - newValue;
      const otherTotal = otherKeys.reduce((acc, k) => acc + prev[k].value, 0);
      
      const newAssets = { ...prev };
      newAssets[key] = { ...newAssets[key], value: newValue };
      
      otherKeys.forEach(k => {
        const proportion = otherTotal === 0 ? (1 / otherKeys.length) : (prev[k].value / otherTotal);
        newAssets[k] = { ...newAssets[k], value: remainingValue * proportion };
      });
      
      return newAssets;
    });
  };

  const sortedAssets = Object.entries(assets).sort((a, b) => a[1].density - b[1].density);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black p-4 md:p-8 font-['Outfit']">
      <SEO 
        title="Asset Allocation Jar" 
        description="Visualize your asset allocation and the impact of market shocks with this interactive density jar." 
      />
      
      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            icon={PackageOpen}
            title="Asset Allocation Jar"
            subtitle="Visualize your portfolio density and market shocks"
          />
        </div>

        <div className="lg:col-span-12 flex flex-col md:flex-row gap-12 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-8">
        
        <div className="flex-1 flex flex-col items-center justify-end h-[500px]">
          <div 
            className={`relative w-64 h-96 border-8 border-black border-t-0 rounded-b-3xl bg-neutral-100 overflow-hidden shadow-inner ${isShaking ? 'animate-shake' : ''} ${isRebalancing ? 'animate-pulse' : ''}`}
            style={{ 
              animation: isShaking ? 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both infinite' : 'none'
            }}
          >
            <div className="absolute top-0 left-3 w-6 h-full bg-white opacity-30 rounded-full z-10 pointer-events-none mix-blend-overlay"></div>
            
            <div className="absolute bottom-0 w-full flex flex-col justify-end h-full">
              {sortedAssets.map(([key, asset]) => (
                <div 
                  key={key}
                  className="w-full relative group transition-all duration-700 ease-in-out border-t-4 border-black/20"
                    style={{ 
                      height: `${asset.value}%`, 
                      backgroundColor: asset.color,
                    }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm z-20">
                    <span className="text-white font-black text-2xl drop-shadow-md">{Math.round(asset.value)}%</span>
                  </div>
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 mix-blend-overlay">
                    <div className="w-3 h-3 rounded-full bg-white absolute bottom-1 left-1/4 animate-bounce"></div>
                    <div className="w-4 h-4 rounded-full bg-white absolute bottom-3 left-2/4 animate-bounce delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-white absolute bottom-2 left-3/4 animate-bounce delay-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 font-black text-2xl tracking-tight text-black uppercase border-b-4 border-black pb-1">The Density Jar</div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h2 className="text-4xl font-black mb-3 uppercase tracking-tight">Portfolio Physics</h2>
            <p className="text-neutral-600 mb-2 font-medium text-lg leading-snug">
              Observe how market volatility affects your asset densities and easily drag sliders to rebalance.
            </p>
          </div>

          <Card title="Drag to Rebalance" icon={Settings2} headerColor="bg-[#ffde59]">
            
            <div className="flex flex-col gap-6">
              {Object.entries(assets).map(([key, asset]) => (
                <div key={key}>
                  <div className="flex justify-between font-bold mb-2 text-lg">
                    <span className="uppercase tracking-tight bg-white px-2 py-0.5 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" style={{ color: asset.color }}>
                      {asset.label}
                    </span>
                    <span className="font-black bg-white px-2 py-0.5 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {Math.round(asset.value)}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={asset.value}
                    onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                    className="w-full h-4 bg-white rounded-full appearance-none cursor-pointer border-2 border-black"
                    style={{
                      accentColor: asset.color,
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-4 mt-auto">
            <button 
              onClick={handleShock}
              disabled={isShaking || isRebalancing}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white font-black text-xl py-4 px-2 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              <Zap size={24} strokeWidth={3} /> Shock
            </button>
            
            <button 
              onClick={handleRebalance}
              disabled={isShaking || isRebalancing}
              className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-black text-xl py-4 px-2 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              <RefreshCw size={24} strokeWidth={3} className={isRebalancing ? 'animate-spin' : ''} /> Reset
            </button>
          </div>

          </div>
        </div>
      </CalculatorLayout>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: translate3d(-4px, 0, 0) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translate3d(4px, 0, 0) rotate(2deg); }
        }
      `}} />
    
      <Footer />
    </div>
  );
}
