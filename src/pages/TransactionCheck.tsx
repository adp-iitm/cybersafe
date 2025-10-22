import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AnimatedResultDisplay from '../components/AnimatedResultDisplay';
import { apiService, PredictionResponse } from '../api/apiService';

const TransactionCheck: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('');
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim() || !country.trim()) return;
    
    setLoading(true);
    setPredictionResult(null);
    setError(null);

    const transaction_data = {
      amount: parseFloat(amount),
      currency,
      country,
      merchant: 'Online Store', // Default merchant
      timestamp: new Date().toISOString(),
      user_id: 'simulated_user_123',
    };

    try {
      console.log('Checking Transaction:', transaction_data);
      const response = await apiService.checkTransaction(transaction_data);
      console.log('API Response:', response);
      setPredictionResult(response);
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to connect to the API. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getResultType = (prediction: string): 'safe' | 'fraud' | 'suspicious' => {
    if (prediction === 'fraudulent') return 'fraud';
    if (prediction === 'safe') return 'safe';
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
        className="text-4xl font-display font-bold text-center text-text mb-12 bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-500"
      >
        Transaction Fraud Analysis
      </motion.h1>

      <Card className="w-full max-w-2xl p-8 shadow-lg">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center mb-8"
        >
          <DollarSign size={48} className="text-accent mb-4" />
          <h2 className="text-2xl font-semibold text-text">Check a Transaction</h2>
          <p className="text-text-light text-sm mt-2 text-center">
            Enter transaction details to assess its fraud risk.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-text-light mb-1">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 150.75"
              required
              step="0.01"
              className="pl-10"
              icon={<DollarSign size={20} className="text-text-light absolute left-3 top-1/2 -translate-y-1/2" />}
            />
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-text-light mb-1">
              Currency
            </label>
            <Input
              id="currency"
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="e.g., USD"
              required
              className="pl-10"
              icon={<span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light font-medium">€</span>}
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-text-light mb-1">
              Country
            </label>
            <Input
              id="country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., USA"
              required
              className="pl-10"
              icon={<Info size={20} className="text-text-light absolute left-3 top-1/2 -translate-y-1/2" />}
            />
          </div>
          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="flex items-center justify-center"
              >
                <Loader2 size={20} className="mr-2" /> Analyzing...
              </motion.span>
            ) : (
              'Analyze Transaction'
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
          Our system evaluates transaction parameters like amount, location, and frequency
          against known fraud patterns to identify suspicious activities.
        </p>
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          src="https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Transaction analysis illustration"
          className="mt-8 rounded-lg shadow-md mx-auto max-w-full h-auto"
          style={{ maxWidth: '600px' }}
        />
      </motion.section>
    </motion.div>
  );
};

export default TransactionCheck;
