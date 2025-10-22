import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { LogIn as LogInIcon } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simulate login logic
    if (username && password) {
      // In a real app, you'd send these to your backend for verification
      // For this simulation, any non-empty username/password works
      login(username);
      navigate('/dashboard'); // Redirect to dashboard after simulated login
    } else {
      setError('Please enter both username and password.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center min-h-[calc(100vh-150px)] py-12"
    >
      <Card className="w-full max-w-md p-8 shadow-lg">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center mb-8"
        >
          <LogInIcon size={48} className="text-primary mb-4" />
          <h1 className="text-3xl font-display font-bold text-text">Welcome Back!</h1>
          <p className="text-text-light text-sm mt-2">Sign in to access your CyberSafe AI dashboard.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-light mb-1">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-light mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full">
            <motion.span
              initial={{ x: -5 }}
              animate={{ x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              Login
            </motion.span>
          </Button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-text-light mt-6"
        >
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign Up
          </Link>
        </motion.p>
      </Card>
    </motion.div>
  );
};

export default Login;
