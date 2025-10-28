import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ShieldCheck, Mail, LinkIcon, DollarSign, BarChart2, Bell, BookOpen, LogIn, LogOut, UserPlus } from 'lucide-react';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: BarChart2, protected: true },
  { name: 'Home', path: '/home', icon: ShieldCheck, guestOnly: true },
  { name: 'URL Check', path: '/url-check', icon: LinkIcon },
  { name: 'Email Check', path: '/email-check', icon: Mail },
  { name: 'Transaction Check', path: '/transaction-check', icon: DollarSign },
  { name: 'Awareness', path: '/awareness', icon: BookOpen },
  { name: 'Notifications', path: '/notifications', icon: Bell, protected: true },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isLoggedIn, logout, displayName } = useAuth(); // Use auth context

  const handleLogout = () => {
    logout();
    setIsOpen(false); // Close mobile menu on logout
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
      className="bg-surface shadow-md sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <ShieldCheck className="text-primary" size={32} />
          </motion.div>
          <span className="font-display text-2xl font-bold text-text">CyberSafe AI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            // Show protected links only when logged in; hide guest-only links when logged in
            (!link.protected || isLoggedIn) && !(link.guestOnly && isLoggedIn) && (
              <Link
                key={link.name}
                to={link.path}
                className={`relative text-text-light hover:text-primary font-medium transition-colors duration-200 group ${
                  location.pathname === link.path ? 'text-primary' : ''
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.span
                    layoutId="underline"
                    className="absolute left-0 right-0 h-[2px] bg-primary bottom-[-5px]"
                  />
                )}
              </Link>
            )
          ))}
          {isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <span className="text-text-light text-sm">Hi, {displayName}!</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut size={18} className="mr-1" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  <UserPlus size={18} className="mr-1" /> Create Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <LogIn size={18} className="mr-1" /> Login
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden absolute top-full left-0 w-full bg-surface shadow-lg pb-4"
        >
          <div className="flex flex-col items-center space-y-4">
            {navLinks.map((link) => (
              (!link.protected || isLoggedIn) && !(link.guestOnly && isLoggedIn) && (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-text-light hover:text-primary font-medium text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <link.icon size={20} />
                    <span>{link.name}</span>
                  </div>
                </Link>
              )
            ))}
            {isLoggedIn ? (
              <>
                <span className="text-text-light text-sm">Hi, {displayName}!</span>
                <Button variant="outline" size="md" className="w-3/4" onClick={handleLogout}>
                  <LogOut size={20} className="mr-2" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/signup" className="w-3/4" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    <UserPlus size={20} className="mr-2" /> Create Free Account
                  </Button>
                </Link>
                <Link to="/login" className="w-3/4" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    <LogIn size={20} className="mr-2" /> Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
