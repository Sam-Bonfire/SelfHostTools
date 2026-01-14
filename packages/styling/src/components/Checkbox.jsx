import React from 'react';

const Checkbox = ({ className = '', ...props }) => {
  return (
    <input
      type="checkbox"
      className={`w-5 h-5 appearance-none border-4 border-black bg-white checked:bg-black checked:after:content-['✓'] checked:after:text-white checked:after:flex checked:after:justify-center checked:after:items-center checked:after:h-full checked:after:text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50 ${className}`}
      {...props}
    />
  );
};

export default Checkbox;