import React from 'react';

const Select = ({ className = '', children, ...props }) => {
    // SVG Chevron encoded for background
    const chevronUrl = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='3' stroke='black'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E";

    return (
        <div className="relative w-full">
            <select
                className={`w-full appearance-none px-3 py-2 bg-white border-4 border-black transition-all duration-150
        font-bold cursor-pointer pr-10
        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-[1px] focus:-translate-y-[1px]
        focus-visible:ring-4 focus-visible:ring-black/10
        ${className}`}
                {...props}
            >
                {children}
            </select>
            <div
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60"
                style={{ backgroundImage: `url("${chevronUrl}")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
            />
        </div>
    );
};

export default Select;
