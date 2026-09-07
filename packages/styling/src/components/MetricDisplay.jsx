import React from 'react';

const MetricDisplay = ({ title, value, subtitle, color = 'text-black', className = '' }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {title && <span className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-80">{title}</span>}
      <p className={`text-3xl md:text-4xl font-black tracking-tighter leading-none break-words ${color}`}>{value}</p>
      {subtitle && <span className="text-sm font-bold mt-1 opacity-80">{subtitle}</span>}
    </div>
  );
};

export default MetricDisplay;
