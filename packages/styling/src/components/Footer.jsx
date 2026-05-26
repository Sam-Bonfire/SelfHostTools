import React from 'react';

const Footer = ({ children }) => {
  return (
    <footer className="mt-20 border-t-4 border-black pt-8 text-center flex flex-col items-center">
      {children && (
        <div className="mb-6 w-full">
          {children}
        </div>
      )}
      <p className="font-bold text-gray-600">
        © {new Date().getFullYear()} Calculators Hub. Built with 
        <span className="mx-1 px-1 bg-[#FF6B6B] text-black border-2 border-black inline-block transform rotate-3">♥</span> 
        and Neo-Brutalism.
      </p>
    </footer>
  );
};

export default Footer;
