import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion'; // Comment out
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

// Comment out pageVariants and pageTransition
/*
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};
*/

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // const location = useLocation(); // No longer needed if AnimatePresence is removed

  return (
    <div className="flex flex-col min-h-screen bg-background text-text font-body">
      <Navbar />
      <main className="flex-grow container mx-auto px-4">
        {/* Temporarily render children directly to debug blank pages */}
        {/* <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="flex-grow"
          > */}
            {children}
          {/* </motion.div>
        </AnimatePresence> */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
