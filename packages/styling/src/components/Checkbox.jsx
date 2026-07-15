import React from 'react';
import Tooltip from './Tooltip';

const Checkbox = ({ className = '', label, tooltip, ...props }) => {
  const checkboxElement = (
    <input
      type="checkbox"
      className={`w-5 h-5 shrink-0 appearance-none border-4 border-black bg-white checked:bg-black checked:after:content-['✓'] checked:after:text-white checked:after:flex checked:after:justify-center checked:after:items-center checked:after:h-full checked:after:text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50 ${className}`}
      {...props}
    />
  );

  const content = label ? (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      {checkboxElement}
      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-black">{label}</span>
    </label>
  ) : (
    checkboxElement
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} className={label ? '' : 'inline-block'}>
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default Checkbox;
