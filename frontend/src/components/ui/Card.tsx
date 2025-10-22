import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      className={`bg-surface rounded-xl shadow-sm border border-border ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
