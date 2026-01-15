import React from 'react';
import Card from './Card';

/**
 * Standardized Results Analysis container for calculators.
 * Includes the branded yellow header and consistent padding.
 */
const ResultsAnalysis = ({ children, title = "Results Analysis", className = "", headerElements }) => {
    return (
        <Card className={`h-full flex flex-col ${className}`}>
            <div className="p-4 bg-[#FFDE59] border-b-4 border-black flex justify-between items-center text-black">
                <h2 className="text-lg font-bold flex items-center gap-2">{title}</h2>
                {headerElements}
            </div>

            <div className="p-4 md:p-6 space-y-6 flex-1">
                {children}
            </div>
        </Card>
    );
};

export default ResultsAnalysis;
