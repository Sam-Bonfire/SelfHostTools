import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tooltip from './Tooltip';

/**
 * Standardized Header for calculator pages.
 * Reverted to the "Previous" Banner Style as requested.
 * Includes Back Button, Icon, and Title in a yellow bar.
 */
const CalculatorHeader = ({ icon: Icon, title, subtitle, description, color = "bg-yellow-300", backLink = "/", onReset }) => {
    const renderIcon = () => {
        if (!Icon) return null;
        if (React.isValidElement(Icon)) {
            return Icon;
        }
        return <Icon className="w-6 h-6 md:w-8 md:h-8 text-black" />;
    };

    return (
        <header className={`flex justify-between items-center ${color} p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black`}>
            <div className="flex items-center gap-4">
                <Tooltip content="Return to Hub" position="right">
                    <Link to={backLink} aria-label="Back" className="p-2 bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all block">
                        <ArrowLeft className="w-5 h-5 text-black" />
                    </Link>
                </Tooltip>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3 uppercase">
                        {renderIcon()} {title}
                    </h1>
                    {(subtitle || description) && (
                        <p className="text-sm font-bold mt-1 opacity-80">
                            {subtitle || description}
                        </p>
                    )}
                </div>
            </div>
            {onReset && (
                <Tooltip content="Reset to defaults" position="left">
                    <button 
                        onClick={onReset} 
                        aria-label="Reset"
                        className="p-2 bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all block"
                    >
                        <RotateCcw className="w-5 h-5 text-black" />
                    </button>
                </Tooltip>
            )}
        </header>
    );
};

export default CalculatorHeader;
