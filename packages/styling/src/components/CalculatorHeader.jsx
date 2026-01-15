import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tooltip from './Tooltip';

/**
 * Standardized Header for calculator pages.
 * Reverted to the "Previous" Banner Style as requested.
 * Includes Back Button, Icon, and Title in a yellow bar.
 */
const CalculatorHeader = ({ icon: Icon, title, backLink = "/" }) => {
    return (
        <header className="flex justify-between items-center bg-yellow-300 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
            <div className="flex items-center gap-4">
                <Tooltip content="Return to Hub" position="right">
                    <Link to={backLink} aria-label="Back" className="p-2 bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all block">
                        <ArrowLeft className="w-5 h-5 text-black" />
                    </Link>
                </Tooltip>
                <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3 uppercase">
                    {Icon && <Icon className="w-6 h-6 md:w-8 md:h-8 text-black" />} {title}
                </h1>
            </div>
        </header>
    );
};

export default CalculatorHeader;
