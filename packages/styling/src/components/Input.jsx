import React from 'react';
import Tooltip from './Tooltip';

const Input = ({ className = '', label, icon: Icon, tooltip, ...props }) => {
  const inputElement = (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none flex items-center justify-center">
          {React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4" />}
        </div>
      )}
      <input
        className={`w-full px-3 py-2 bg-white border-4 border-black transition-all duration-150 
        placeholder:text-gray-500 font-bold
        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-[1px] focus:-translate-y-[1px]
        focus-visible:ring-4 focus-visible:ring-black/10
        ${Icon ? 'pl-9' : ''}
        ${className}`}
        {...props}
      />
    </div>
  );

  const content = label ? (
    <div className="w-full">
      <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black" htmlFor={props.id}>
        {label}
      </label>
      {inputElement}
    </div>
  ) : (
    inputElement
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

export default Input;
