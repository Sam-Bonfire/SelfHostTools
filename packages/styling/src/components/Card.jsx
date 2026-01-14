import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', animate = true, ...props }) => {
  const cardContent = (
    <div className={`bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none ${className}`} {...props}>
      {children}
    </div>
  );

  if (!animate) return cardContent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.3
      }}
    >
      {cardContent}
    </motion.div>
  );
};

export default Card;
