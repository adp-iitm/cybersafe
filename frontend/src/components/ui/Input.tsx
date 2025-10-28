import React from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  icon?: React.ReactNode; // Optional icon prop
}

const Input: React.FC<InputProps> = ({ className = '', icon, ...props }) => {
  return (
    <motion.div className="relative" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.1 }}>
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none">{icon}</div>}
      <input
        className={`w-full p-3 border border-border rounded-lg bg-background text-text placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${icon ? 'pl-12' : 'pl-3'} ${className}`}
        {...props}
      />
    </motion.div>
  );
};

export default Input;
