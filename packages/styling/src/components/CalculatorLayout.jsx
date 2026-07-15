import React from 'react';

/**
 * Standardized Layout for calculator pages.
 * Handles the main grid and responsive spacing.
 */
const CalculatorLayout = ({ children, className = '' }) => {
  return (
    <main className={`max-w-6xl mx-auto ${className}`} role="main">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">{children}</div>
    </main>
  );
};

export default CalculatorLayout;
