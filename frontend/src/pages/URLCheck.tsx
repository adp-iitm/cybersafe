import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LinkIcon, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AnimatedResultDisplay from '../components/AnimatedResultDisplay';
import { apiService, PredictionResponse } from '../api/apiService';

const URLCheck: React.FC = () => {
  const [url, setUrl] = useState('');
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return; // Prevent double submission
    
    setLoading(true);
    setPredictionResult(null);
    setError(null);

    try {
      console.log('Checking URL:', url);
      const response = await apiService.checkURL(url);
      console.log('API Response:', response);
      setPredictionResult(response);
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to connect to the API. Please try again.');
    } finally {
      setLoading(false);
      // Clear the form after processing (success or error)
      setUrl('');
    }
  };

  const getResultType = (prediction: string): 'safe' | 'fraud' | 'suspicious' => {
    const pred = prediction.toLowerCase();
    if (pred === 'fraudulent') return 'fraud';
    if (pred === 'safe') return 'safe';
    return 'suspicious';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="py-8 flex flex-col items-center"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-display font-bold text-center text-text mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
      >
        URL Phishing Checker
      </motion.h1>

      <Card className="w-full max-w-2xl p-8 shadow-lg">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center mb-8"
        >
          <LinkIcon size={48} className="text-primary mb-4" />
          <h2 className="text-2xl font-semibold text-text">Analyze a URL</h2>
          <p className="text-text-light text-sm mt-2 text-center">
            Enter any URL to check if it's a potential phishing or malicious link.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url-input" className="sr-only">
              URL to check
            </label>
            <Input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://malicious-site.com/login"
              required
              icon={<LinkIcon size={20} className="text-text-light" />}
            />
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="flex items-center justify-center"
              >
                <Loader2 size={20} className="mr-2" /> Checking...
              </motion.span>
            ) : (
              'Check URL'
            )}
          </Button>
        </form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center space-x-2"
              role="alert"
            >
              <XCircle size={20} />
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}

                {predictionResult && (
                  <AnimatedResultDisplay
                    result={getResultType(predictionResult.prediction)}
                    confidence={predictionResult.confidence * 100}
                    details={predictionResult.details}
                    recommendations={predictionResult.recommendations}
                    risk_score={predictionResult.risk_score}
                    suspicious_factors={predictionResult.suspicious_factors}
                  />
                )}
        </motion.div>
      </Card>

      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-16 text-center max-w-xl"
      >
        <h2 className="text-3xl font-display font-semibold text-text mb-4">How it Works</h2>
        <p className="text-lg text-text-light mb-6">
          Our AI model analyzes various features of the URL, including domain reputation,
          URL structure, and content patterns, to determine its legitimacy.
        </p>
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="URL analysis illustration"
          className="mt-8 rounded-lg shadow-md mx-auto max-w-full h-auto"
          style={{ maxWidth: '600px' }}
        />
      </motion.section>
    </motion.div>
  );
};

export default URLCheck;
