import React from 'react';
import Checkbox from './Checkbox';

const ToggleCard = ({ title, children, isOpen, onToggle, className = '' }) => {
    return (
        <div className={`p-3 bg-white border-4 border-black transition-all duration-150
      shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
      hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
      ${className}`}>
            <label className="flex items-start gap-3 cursor-pointer select-none">
                <Checkbox
                    checked={isOpen}
                    onChange={(e) => onToggle && onToggle(e.target.checked)}
                    className="mt-1 shrink-0 bg-white"
                />
                <div className="flex-1">
                    {title}
                </div>
            </label>
            {/* 
         We use 'hidden' when not open to remove from DOM layout if needed, 
         but for animations we usually want it mounted. 
         However, for simple "expand" logic without heavy framer-motion, 
         conditional rendering is safer for performance unless we want exit animations.
         The user asked for "animating", so we use basic CSS animation classes.
      */}
            {isOpen && (
                <div className="mt-4 pt-2 border-t-2 border-dashed border-black/10 animate-in fade-in slide-in-from-top-1 duration-200 origin-top">
                    {children}
                </div>
            )}
        </div>
    );
};

export default ToggleCard;
