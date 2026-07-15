import React from 'react';

const Button = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseStyles =
    'px-4 py-2 font-bold border-4 border-black transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50 select-none';

  // Neo-brutalism tactile effect:
  // Hover: Slight lift (shadow grows)
  // Active: Depress (translate matches shadow, shadow disappears)
  const interactionStyles =
    'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]';

  const variants = {
    primary: 'bg-[#FFDE59] text-black hover:bg-[#FFD12E]',
    secondary: 'bg-[#7EAAFF] text-black hover:bg-[#6B99FF]',
    destructive: 'bg-[#FF6B6B] text-black hover:bg-[#FF5252]',
    outline: 'bg-white text-black hover:bg-gray-100'
  };

  return (
    <button
      className={`${baseStyles} ${interactionStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
