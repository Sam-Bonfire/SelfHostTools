import React from 'react';

/**
 * Standardized Layout for calculator pages.
 * Handles the main grid and responsive spacing.
 */
const CalculatorLayout = ({ children, className = "" }) => {
    return (
        <div className={`max-w-6xl mx-auto ${className}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {children}
            </div>
        </div>
    );
};

export default CalculatorLayout;
