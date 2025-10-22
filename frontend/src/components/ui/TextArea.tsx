import React from 'react';
import { motion } from 'framer-motion';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  icon?: React.ReactNode; // Optional icon prop
}

const TextArea: React.FC<TextAreaProps> = ({ className = '', icon, ...props }) => {
  return (
    <motion.div className="relative" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.1 }}>
      {icon && <div className="absolute left-3 top-3 text-text-light">{icon}</div>}
      <textarea
        className={`w-full p-3 border border-border rounded-lg bg-background text-text placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${icon ? 'pl-10' : 'pl-3'} ${className}`}
        {...props}
      />
    </motion.div>
  );
};

export default TextArea;
