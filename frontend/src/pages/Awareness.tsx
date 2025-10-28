import React from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Lightbulb, Shield, BookOpen, ExternalLink, DollarSign, Mail, AlertTriangle, Eye, Lock, Smartphone, XCircle, CheckCircle } from 'lucide-react';
// import { GSAPAnimations } from '../utils/gsapAnimations'; // Not needed for Awareness page

const scamTypes = [
  {
    title: 'Phishing Scams',
    description: 'Deceptive emails or websites designed to steal your personal information.',
    icon: Lightbulb,
    color: 'text-blue-500',
    details: 'Often impersonate legitimate organizations. Look for suspicious links, generic greetings, and urgent requests.',
  },
  {
    title: 'Tech Support Scams',
    description: 'Fraudsters pretending to be tech support to gain remote access or money.',
    icon: Shield,
    color: 'text-green-500',
    details: 'They might call you unexpectedly or display pop-up warnings. Never give remote access to unsolicited callers.',
  },
  {
    title: 'Investment Fraud',
    description: 'Promises of high returns with little to no risk, often involving fake cryptocurrencies or schemes.',
    icon: DollarSign,
    color: 'text-yellow-500',
    details: 'Be wary of unsolicited investment opportunities. If it sounds too good to be true, it probably is.',
  },
  {
    title: 'Romance Scams',
    description: 'Fraudsters create fake online identities to gain a victim\'s affection and trust.',
    icon: Mail,
    color: 'text-red-500',
    details: 'They often ask for money for emergencies, travel, or medical bills. Never send money to someone you\'ve only met online.',
  },
];

const guides = [
  {
    title: 'How to Spot a Phishing Email',
    description: 'Learn the tell-tale signs of a fraudulent email and protect your inbox.',
    link: 'https://www.infosecawareness.in/phishing', // Govt. of India (MeitY) - ISEA
  },
  {
    title: 'Securing Your Online Transactions',
    description: 'Best practices for safe online shopping and financial activities.',
    link: 'https://www.infosecawareness.in/banking-financials', // Govt. of India (MeitY) - ISEA
  },
  {
    title: 'Protecting Your Personal Data',
    description: 'Tips and tricks to keep your sensitive information safe from cybercriminals.',
    link: 'https://www.infosecawareness.in/privacy', // Govt. of India (MeitY) - ISEA
  },
];

const fakeVsRealExamples = [
  {
    type: 'Email',
    fake: {
      subject: 'URGENT: Your Account Will Be Closed',
      sender: 'security@paypal-security.com',
      content: 'Click here immediately to verify your account or it will be closed within 24 hours!',
      indicators: ['Urgent language', 'Suspicious sender', 'Generic greeting']
    },
    real: {
      subject: 'Account Statement Available',
      sender: 'noreply@paypal.com',
      content: 'Your monthly statement is ready to view in your PayPal account.',
      indicators: ['Professional tone', 'Official domain', 'No urgent action required']
    }
  },
  {
    type: 'Website',
    fake: {
      url: 'www.paypal-security-verification.com',
      indicators: ['Suspicious domain', 'HTTP instead of HTTPS', 'Poor design quality']
    },
    real: {
      url: 'https://www.paypal.com',
      indicators: ['Official domain', 'HTTPS encryption', 'Professional design']
    }
  }
];

const safetySteps = [
  {
    step: 1,
    title: 'Verify the Source',
    description: 'Always check the sender\'s email address and website URL carefully.',
    icon: Eye,
    color: 'text-blue-500'
  },
  {
    step: 2,
    title: 'Look for Red Flags',
    description: 'Watch for urgent language, poor grammar, and suspicious links.',
    icon: AlertTriangle,
    color: 'text-yellow-500'
  },
  {
    step: 3,
    title: 'Use Two-Factor Authentication',
    description: 'Enable 2FA on all your important accounts for extra security.',
    icon: Lock,
    color: 'text-green-500'
  },
  {
    step: 4,
    title: 'Keep Software Updated',
    description: 'Regularly update your devices and apps to patch security vulnerabilities.',
    icon: Smartphone,
    color: 'text-purple-500'
  }
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

const Awareness: React.FC = () => {
  return (
    <div className="py-8 page-content">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center text-gray-800 mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 text-reveal"
      >
        Fraud & Phishing Awareness
      </motion.h1>

      {/* Scam Types Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-16"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-display font-semibold text-gray-800 mb-8 text-center"
        >
          Common Scam Types
        </motion.h2>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {scamTypes.map((scam, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <Card className="flex flex-col items-center text-center p-6">
                <div className={`p-4 rounded-full bg-opacity-10 ${scam.color.replace('text-', 'bg-')} mb-4`}>
                  <scam.icon size={40} className={scam.color} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{scam.title}</h3>
                <p className="text-gray-800-light text-sm mb-4">{scam.description}</p>
                <details className="text-left w-full">
                  <summary className="text-blue-500 cursor-pointer text-sm font-medium hover:underline">
                    Learn More
                  </summary>
                  <p className="text-gray-800-light text-xs mt-2">{scam.details}</p>
                </details>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Guides Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-16"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-display font-semibold text-gray-800 mb-8 text-center"
        >
          Guides & Resources
        </motion.h2>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {guides.map((guide, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <Card className="flex flex-col justify-between p-6">
                <div>
                  <BookOpen size={32} className="text-blue-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{guide.title}</h3>
                  <p className="text-gray-800-light text-sm mb-4">{guide.description}</p>
                </div>
                <a href={guide.link} target="_blank" rel="noopener noreferrer" className="self-start">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <span>Read Guide</span>
                    <ExternalLink size={16} />
                  </Button>
                </a>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Fake vs Real Examples */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-display font-semibold text-gray-800 mb-8 text-center text-reveal">Fake vs. Real Examples</h2>
        <div className="space-y-8">
          {fakeVsRealExamples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.2, duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Fake Example */}
              <Card className="p-6 border-red-200 bg-red-50">
                <div className="flex items-center mb-4">
                  <XCircle size={24} className="text-red-500 mr-2" />
                  <h3 className="text-xl font-semibold text-red-700">Fake {example.type}</h3>
                </div>
                {example.type === 'Email' ? (
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-red-600">Subject:</span>
                      <p className="text-red-700">{example.fake.subject}</p>
                    </div>
                    <div>
                      <span className="font-medium text-red-600">From:</span>
                      <p className="text-red-700">{example.fake.sender}</p>
                    </div>
                    <div>
                      <span className="font-medium text-red-600">Content:</span>
                      <p className="text-red-700">{example.fake.content}</p>
                    </div>
                    <div>
                      <span className="font-medium text-red-600">Red Flags:</span>
                      <ul className="list-disc list-inside text-red-600 text-sm">
                        {example.fake.indicators.map((indicator, i) => (
                          <li key={i}>{indicator}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-red-600">URL:</span>
                      <p className="text-red-700">{example.fake.url}</p>
                    </div>
                    <div>
                      <span className="font-medium text-red-600">Red Flags:</span>
                      <ul className="list-disc list-inside text-red-600 text-sm">
                        {example.fake.indicators.map((indicator, i) => (
                          <li key={i}>{indicator}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>

              {/* Real Example */}
              <Card className="p-6 border-green-200 bg-green-50">
                <div className="flex items-center mb-4">
                  <CheckCircle size={24} className="text-green-500 mr-2" />
                  <h3 className="text-xl font-semibold text-green-700">Legitimate {example.type}</h3>
                </div>
                {example.type === 'Email' ? (
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-green-600">Subject:</span>
                      <p className="text-green-700">{example.real.subject}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">From:</span>
                      <p className="text-green-700">{example.real.sender}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Content:</span>
                      <p className="text-green-700">{example.real.content}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Trust Indicators:</span>
                      <ul className="list-disc list-inside text-green-600 text-sm">
                        {example.real.indicators.map((indicator, i) => (
                          <li key={i}>{indicator}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-green-600">URL:</span>
                      <p className="text-green-700">{example.real.url}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Trust Indicators:</span>
                      <ul className="list-disc list-inside text-green-600 text-sm">
                        {example.real.indicators.map((indicator, i) => (
                          <li key={i}>{indicator}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Stay Safe Online Steps */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-display font-semibold text-gray-800 mb-8 text-center text-reveal">Stay Safe Online</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {safetySteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center"
            >
              <Card className="p-6 h-full">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.1, duration: 0.5, ease: 'easeOut' }}
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-opacity-10 ${step.color.replace('text-', 'bg-')} mb-4`}
                >
                  <step.icon size={32} className={step.color} />
                </motion.div>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${step.color.replace('text-', 'bg-')} text-white font-bold text-sm mb-3`}>
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-800-light text-sm">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="text-center"
      >
        <h2 className="text-3xl font-display font-semibold text-gray-800 mb-4">Need Immediate Help?</h2>
        <p className="text-lg text-gray-800-light mb-8">
          If you suspect you've encountered fraud or phishing, use our check tools or report it.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="lg" className="inline-flex items-center">
              Report Fraud
            </Button>
          </a>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Awareness;
