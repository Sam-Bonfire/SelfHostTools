import React from 'react';
import Tooltip from './Tooltip';

const Select = ({ className = '', children, label, icon: Icon, tooltip, ...props }) => {
  // SVG Chevron encoded for background
  const chevronUrl =
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='3' stroke='black'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E";

  const selectElement = (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none flex items-center justify-center">
          {React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4" />}
        </div>
      )}
      <select
        className={`w-full appearance-none px-3 py-2 bg-white border-4 border-black transition-all duration-150
        font-bold cursor-pointer pr-10
        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-[1px] focus:-translate-y-[1px]
        focus-visible:ring-4 focus-visible:ring-black/10
        ${Icon ? 'pl-9' : ''}
        ${className}`}
        {...props}
      >
        {children}
      </select>
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60"
        style={{
          backgroundImage: `url("${chevronUrl}")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />
    </div>
  );

  const content = label ? (
    <div className="w-full">
      <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black" htmlFor={props.id}>
        {label}
      </label>
      {selectElement}
    </div>
  ) : (
    selectElement
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} className={label ? 'w-full' : 'w-full inline-block'}>
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default Select;
