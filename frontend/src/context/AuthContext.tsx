import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string) => void;
  logout: () => void;
  username: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // Initialize from localStorage
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('username');
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', String(isLoggedIn));
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
  }, [isLoggedIn, username]);

  const login = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    console.log(`User ${user} logged in (simulated).`);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    console.log('User logged out (simulated).');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, username }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
