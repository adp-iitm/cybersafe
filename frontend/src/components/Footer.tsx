import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-surface text-text-light py-8 mt-12 shadow-inner"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-border pb-8 mb-8">
          {/* Brand Info */}
          <div className="flex flex-col items-center md:items-start md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <ShieldCheck className="text-primary" size={28} />
              <span className="font-display text-xl font-bold text-text">CyberSafe AI</span>
            </Link>
            <p className="text-center md:text-left max-w-sm text-justify leading-relaxed">
              Your trusted partner in AI-powered fraud detection and cybersecurity awareness.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left md:col-span-1">
            <h3 className="text-lg font-semibold text-text mb-4">Quick Links</h3>
            <ul className="space-y-2 mb-6 leading-relaxed">
              <li><Link to="/url-check" className="hover:text-primary transition-colors">URL Check</Link></li>
              <li><Link to="/email-check" className="hover:text-primary transition-colors">Email Check</Link></li>
              <li><Link to="/transaction-check" className="hover:text-primary transition-colors">Transaction Check</Link></li>
              <li><Link to="/awareness" className="hover:text-primary transition-colors">Awareness</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Govt Resources (India) */}
          <div className="text-center md:text-left md:col-span-1">
            <h3 className="text-lg font-semibold text-text mb-4">Govt Resources (India)</h3>
            <ul className="space-y-2 leading-relaxed text-justify">
              <li>
                <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  National Cyber Crime Reporting Portal
                </a>
              </li>
              <li>
                <a href="https://www.cert-in.org.in/s2cMainServlet?pageid=PUBADVLIST" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  CERT-In Public Advisories
                </a>
              </li>
              <li>
                <a href="https://www.infosecawareness.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  InfoSec Awareness (MeitY)
                </a>
              </li>
              <li>
                <a href="https://x.com/Cyberdost" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Cyber Dost (X)
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="text-center md:text-left md:col-span-1">
            <h3 className="text-lg font-semibold text-text mb-4">Connect With Us</h3>
            <p className="mb-4 text-justify">
              <a href="mailto:2023is_devanshsharma_a@nie.ac.in" className="hover:text-primary transition-colors">2023is_devanshsharma_a@nie.ac.in</a>
            </p>
            <div className="flex justify-center md:justify-start space-x-6">
              <motion.a
                href="https://github.com/dev-sharma35"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, color: '#6e5494' }}
                whileTap={{ scale: 0.9 }}
                className="text-text-light hover:text-primary transition-colors"
              >
                <Github size={26} />
              </motion.a>
              <motion.a
                href="https://x.com/Cyberdost"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, color: '#1DA1F2' }}
                whileTap={{ scale: 0.9 }}
                className="text-text-light hover:text-primary transition-colors"
              >
                <Twitter size={26} />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/devansh-sharma-4977a6343/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, color: '#0077B5' }}
                whileTap={{ scale: 0.9 }}
                className="text-text-light hover:text-primary transition-colors"
              >
                <Linkedin size={26} />
              </motion.a>
            </div>
          </div>
        </div>

        <div className="text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CyberSafe AI. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
