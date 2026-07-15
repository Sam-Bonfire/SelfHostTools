import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  animate = true,
  title,
  icon: Icon,
  headerColor = 'bg-blue-100',
  action,
  ...props
}) => {
  const cardContent = (
    <div
      className={`bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none flex flex-col ${className}`}
      {...props}
    >
      {title && (
        <div
          className={`p-4 border-b-4 border-black flex items-center justify-between gap-2 text-black ${headerColor}`}
        >
          <div className="flex items-center gap-2">
            {Icon && (React.isValidElement(Icon) ? Icon : <Icon className="w-5 h-5 md:w-6 md:h-6" />)}
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{title}</h2>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={title ? 'p-4 md:p-6' : ''}>{children}</div>
    </div>
  );

  if (!animate) return cardContent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
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
