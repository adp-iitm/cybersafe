import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Shield, Zap } from 'lucide-react';
import { GSAPAnimations } from '../utils/gsapAnimations';

interface AnimatedResultDisplayProps {
  result: 'safe' | 'fraud' | 'suspicious';
  confidence: number;
  details: string;
  recommendations?: string[];
}

const AnimatedResultDisplay: React.FC<AnimatedResultDisplayProps> = ({
  result,
  confidence,
  details,
  recommendations = []
}) => {
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultRef.current) {
      GSAPAnimations.animateResult(result);
    }
  }, [result]);

  const getResultConfig = () => {
    switch (result) {
      case 'safe':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Safe',
          description: 'This appears to be legitimate and safe to proceed.'
        };
      case 'fraud':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Fraudulent',
          description: 'This has been identified as potentially fraudulent. Proceed with caution.'
        };
      case 'suspicious':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Suspicious',
          description: 'This shows some suspicious characteristics. Review carefully before proceeding.'
        };
      default:
        return {
          icon: Shield,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Unknown',
          description: 'Unable to determine the safety of this item.'
        };
    }
  };

  const config = getResultConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      ref={resultRef}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'back.out(1.7)' }}
      className={`result-display p-6 rounded-xl border-2 ${config.bgColor} ${config.borderColor} shadow-lg`}
    >
      {/* Header with animated icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: 'back.out(1.7)' }}
        className="flex items-center justify-center mb-4"
      >
        <div className={`p-4 rounded-full ${config.bgColor} shadow-md`}>
          <IconComponent size={48} className={config.color} />
        </div>
      </motion.div>

      {/* Result title with typewriter effect */}
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className={`text-2xl font-bold text-center mb-2 ${config.color}`}
      >
        {config.title}
      </motion.h3>

      {/* Confidence meter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mb-4"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Confidence Level</span>
          <span className={`text-sm font-bold ${config.color}`}>{confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ delay: 0.8, duration: 1.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              result === 'safe' ? 'bg-green-500' : 
              result === 'fraud' ? 'bg-red-500' : 'bg-yellow-500'
            }`}
          />
        </div>
      </motion.div>

      {/* Details */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-gray-700 text-center mb-4"
      >
        {details}
      </motion.p>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-4"
        >
          <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
            <Zap size={16} className="mr-2" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {recommendations.map((rec, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                className="text-sm text-gray-600 flex items-start"
              >
                <span className="text-primary mr-2">•</span>
                {rec}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Animated border effect */}
      <motion.div
        className="absolute inset-0 rounded-xl border-2 border-transparent"
        style={{
          background: `linear-gradient(45deg, ${config.color.replace('text-', '')}, transparent, ${config.color.replace('text-', '')})`,
          backgroundSize: '200% 200%'
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </motion.div>
  );
};

export default AnimatedResultDisplay;
