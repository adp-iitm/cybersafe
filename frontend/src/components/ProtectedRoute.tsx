import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import { motion } from 'framer-motion'; // Comment out

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Temporarily remove motion.div wrapper to debug blank pages
  return (
    // <motion.div
    //   initial={{ opacity: 0, y: 20 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   exit={{ opacity: 0, y: -20 }}
    //   transition={{ duration: 0.3 }}
    //   className="flex-grow"
    // >
      children // Corrected: Directly render children
    // </motion.div>
  );
};

export default ProtectedRoute;
