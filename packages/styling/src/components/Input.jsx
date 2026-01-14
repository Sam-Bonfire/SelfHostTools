import React from 'react';

const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full px-3 py-2 bg-white border-4 border-black transition-all duration-150 
      placeholder:text-gray-500 font-bold
      shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
      hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
      focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-[1px] focus:-translate-y-[1px]
      focus-visible:ring-4 focus-visible:ring-black/10
      ${className}`}
      {...props}
    />
  );
};

export default Input;
