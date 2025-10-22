import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import Card from './ui/Card';

interface PredictionResult {
  prediction: string;
  confidence: number;
}

interface ResultDisplayProps {
  results: PredictionResult[] | PredictionResult | null;
  loading: boolean;
  error: string | null;
  title: string;
}

const getStatusIcon = (prediction: string) => {
  if (prediction === 'legit') {
    return <CheckCircle className="text-secondary" size={24} />;
  } else if (prediction === 'phishing' || prediction === 'fraudulent') {
    return <XCircle className="text-red-500" size={24} />;
  }
  return <AlertCircle className="text-accent" size={24} />;
};

const getStatusColor = (prediction: string) => {
  if (prediction === 'legit') {
    return 'text-secondary';
  } else if (prediction === 'phishing' || prediction === 'fraudulent') {
    return 'text-red-500';
  }
  return 'text-accent';
};

const ResultItem: React.FC<{ result: PredictionResult }> = ({ result }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
  >
    <div className="flex items-center space-x-3">
      {getStatusIcon(result.prediction)}
      <span className={`font-semibold capitalize ${getStatusColor(result.prediction)}`}>
        {result.prediction}
      </span>
    </div>
    <span className="text-sm text-text-light">
      Confidence: {(result.confidence * 100).toFixed(2)}%
    </span>
  </motion.div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ results, loading, error, title }) => {
  if (loading) {
    return (
      <Card className="flex items-center justify-center p-8">
        <Loader className="animate-spin text-primary mr-3" size={28} />
        <p className="text-lg text-text-light">Analyzing your input...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200 text-red-700 p-6">
        <div className="flex items-center space-x-3">
          <XCircle size={24} />
          <h3 className="font-semibold text-lg">Error</h3>
        </div>
        <p className="mt-2">{error}</p>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="p-6 text-center text-text-light">
        <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
        <p className="text-lg">Enter your data above to get a {title} prediction.</p>
        <p className="text-sm mt-2">
          <span className="font-semibold text-primary">Note:</span> This application uses simulated API responses for demonstration purposes.
        </p>
      </Card>
    );
  }

  const resultsArray = Array.isArray(results) ? results : [results];

  return (
    <Card className="p-6">
      <h3 className="text-2xl font-display font-bold text-text mb-4">{title} Results</h3>
      <div className="space-y-4">
        {resultsArray.map((result, index) => (
          <ResultItem key={index} result={result} />
        ))}
      </div>
    </Card>
  );
};

export default ResultDisplay;
