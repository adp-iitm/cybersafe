import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ShieldCheck, LinkIcon, Mail, DollarSign, BookOpen, BarChart2 } from 'lucide-react';
import { GSAPAnimations } from '../utils/gsapAnimations';


const featureCards = [
  {
    icon: LinkIcon,
    title: 'URL Phishing Check',
    description: 'Instantly verify if a URL is safe or a phishing attempt.',
    link: '/url-check',
    color: 'text-blue-500',
  },
  {
    icon: Mail,
    title: 'Email Scam Detector',
    description: 'Analyze suspicious emails for common scam indicators.',
    link: '/email-check',
    color: 'text-green-500',
  },
  {
    icon: DollarSign,
    title: 'Transaction Fraud Analysis',
    description: 'Assess the risk of financial transactions in real-time.',
    link: '/transaction-check',
    color: 'text-yellow-500',
  },
  {
    icon: BookOpen,
    title: 'Awareness & Education',
    description: 'Learn about common fraud types and how to protect yourself.',
    link: '/awareness',
    color: 'text-purple-500',
  },
  {
    icon: BarChart2,
    title: 'Dashboard & Analytics',
    description: 'Track fraud trends and monitor your security posture.',
    link: '/dashboard',
    color: 'text-green-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Home: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    GSAPAnimations.init();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden">
      {/* Animated Background Waves */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="hero-bg-wave absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
        <div className="hero-bg-wave-2 absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl"></div>
        <div className="parallax-bg absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background z-10"></div>

      {/* Content Wrapper */}
      <div className="relative z-20 w-full flex flex-col items-center py-12 px-4 page-content">
        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16 max-w-4xl mt-16 md:mt-24"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="hero-icon inline-block p-3 rounded-full bg-primary-light bg-opacity-10 mb-4"
          >
            <ShieldCheck size={48} className="text-blue-500" />
          </motion.div>
          <h1 className="hero-title text-5xl md:text-6xl font-bold text-gray-800 leading-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Your Shield Against Cyber Threats
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Leverage AI-powered fraud detection for URLs, emails, and transactions. Stay safe, stay informed.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="hero-buttons flex justify-center space-x-4"
          >
            <Link to="/url-check">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
            <Link to="/awareness">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16 w-full max-w-6xl"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-display font-bold text-center text-gray-800 mb-12"
          >
            Key Features
          </motion.h2>
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featureCards.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                className="feature-card"
              >
                <Link to={feature.link}>
                  <Card className="flex flex-col items-center text-center p-6 h-full">
                    <div className={`p-4 rounded-full bg-opacity-10 ${feature.color.replace('text-', 'bg-')} mb-4 card-icon`}>
                      <feature.icon size={40} className={feature.color} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-800-light text-sm flex-grow">{feature.description}</p>
                    <Button variant="ghost" className="mt-4">
                      Explore
                    </Button>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center max-w-3xl"
        >
          <h2 className="text-4xl font-display font-bold text-gray-800 mb-4">Ready to Protect Yourself?</h2>
          <p className="text-lg text-gray-800-light mb-8">
            Join thousands of users who trust CyberSafe AI to keep their digital lives secure.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/signup">
              <Button variant="primary" size="lg">
                Create Free Account
              </Button>
            </Link>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;
