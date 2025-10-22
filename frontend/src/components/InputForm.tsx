import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GSAPAnimations } from '../utils/gsapAnimations';

interface InputFormProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  buttonText: string;
}

const InputForm: React.FC<InputFormProps> = ({
  title,
  description,
  children,
  onSubmit,
  isLoading,
  buttonText,
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      GSAPAnimations.animateFormInputs();
    }
  }, []);

  return (
    <motion.form
      ref={formRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-800 text-reveal">{title}</h2>
      <p className="text-gray-600 text-reveal">{description}</p>
      <div className="relative">
        {children}
        <div className="input-glow absolute inset-0 rounded-lg bg-primary/20 opacity-0 pointer-events-none"></div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold text-lg
                   hover:bg-primary-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
        disabled={isLoading}
      >
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
        {isLoading && (
          <motion.span
            className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {buttonText}
      </motion.button>
    </motion.form>
  );
};

export default InputForm;
