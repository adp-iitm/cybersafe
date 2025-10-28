// frontend/src/pages/TransactionCheck.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, XCircle, Loader2, Hash, Store, Globe, User } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AnimatedResultDisplay from '../components/AnimatedResultDisplay';
import { apiService, PredictionResponse } from '../api/apiService';

// Currency & Country Options
const currencyOptions = [
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'AUD', name: 'Australian Dollar (A$)' },
  { code: 'CAD', name: 'Canadian Dollar (C$)' },
];

const countryOptions = [
  'India', 'United States', 'United Kingdom', 'Germany', 'France', 'Canada',
  'Australia', 'Japan', 'China', 'Singapore', 'United Arab Emirates',
  'Brazil', 'South Africa', 'Nigeria', 'Russia',
];

// Map full name to ISO 2-letter code
const countryCodeMap: Record<string, string> = {
  'India': 'IN',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Germany': 'DE',
  'France': 'FR',
  'Canada': 'CA',
  'Australia': 'AU',
  'Japan': 'JP',
  'China': 'CN',
  'Singapore': 'SG',
  'United Arab Emirates': 'AE',
  'Brazil': 'BR',
  'South Africa': 'ZA',
  'Nigeria': 'NG',
  'Russia': 'RU',
};

const TransactionCheck: React.FC = () => {
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [merchantName, setMerchantName] = useState('');
  const [merchantCountry, setMerchantCountry] = useState('');
  const [customerCountry, setCustomerCountry] = useState('');
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim() || !merchantName.trim() || !merchantCountry.trim() || !customerCountry.trim()) {
      setError('Amount, Merchant Name, and both countries are required.');
      return;
    }

    setLoading(true);
    setPredictionResult(null);
    setError(null);

    const transaction_data = {
      amount: parseFloat(amount),
      currency,
      merchant_name: merchantName.trim(),
      merchant_country: countryCodeMap[merchantCountry] || 'IN',
      customer_country: countryCodeMap[customerCountry] || 'IN',
      device_type: "desktop",
      card_type: "credit",
      is_manual_entry: false,
      transaction_type: "purchase"
    };

    try {
      console.log('Sending to backend:', transaction_data);
      const response = await apiService.checkTransaction(transaction_data);
      setPredictionResult(response);

      // Reset form
      setTransactionId('');
      setAmount('');
      setMerchantName('');
      setMerchantCountry('');
      setCustomerCountry('');
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to analyze transaction.');
    } finally {
      setLoading(false);
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
          {/* Transaction ID */}
          <div>
            <label htmlFor="transactionId" className="block text-sm font-medium text-text-light mb-1">
              Transaction ID <span className="text-text-lighter">(optional)</span>
            </label>
            <Input
              id="transactionId"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g., TXN-12345"
              icon={<Hash size={20} className="text-text-light" />}
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-text-light mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 150.75"
              required
              step="0.01"
              min="0.01"
              icon={<span className="text-text-light font-medium">₹</span>}
            />
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-text-light mb-1">
              Currency
            </label>
            <div className="relative">
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-text focus:ring-2 focus:ring-accent focus:outline-none appearance-none"
              >
                {currencyOptions.map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Merchant Name */}
          <div>
            <label htmlFor="merchantName" className="block text-sm font-medium text-text-light mb-1">
              Merchant Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="merchantName"
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g., Amazon, Flipkart"
              required
              icon={<Store size={20} className="text-text-light" />}
            />
          </div>

          {/* Merchant Country */}
          <div>
            <label htmlFor="merchantCountry" className="block text-sm font-medium text-text-light mb-1">
              Merchant Country <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="merchantCountry"
                value={merchantCountry}
                onChange={(e) => setMerchantCountry(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-text focus:ring-2 focus:ring-accent focus:outline-none appearance-none"
              >
                <option value="">Select merchant country</option>
                {countryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c} ({countryCodeMap[c]})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Customer Country */}
          <div>
            <label htmlFor="customerCountry" className="block text-sm font-medium text-text-light mb-1">
              Customer Country <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="customerCountry"
                value={customerCountry}
                onChange={(e) => setCustomerCountry(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-text focus:ring-2 focus:ring-accent focus:outline-none appearance-none"
              >
                <option value="">Select customer country</option>
                {countryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c} ({countryCodeMap[c]})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
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

        {/* Error / Result */}
        <motion.div className="mt-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center space-x-2"
            >
              <XCircle size={20} />
              <span>{error}</span>
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

      {/* How it Works */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-16 text-center max-w-xl"
      >
        <h2 className="text-3xl font-display font-semibold text-text mb-4">How it Works</h2>
        <p className="text-lg text-text-light mb-6">
          Our AI evaluates amount, merchant, and location mismatch in real-time to detect fraud.
        </p>
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          src="https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Transaction analysis"
          className="mt-8 rounded-lg shadow-md mx-auto max-w-full h-auto"
          style={{ maxWidth: '600px' }}
        />
      </motion.section>
    </motion.div>
  );
};

export default TransactionCheck;