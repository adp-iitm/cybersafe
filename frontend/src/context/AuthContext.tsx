import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, name?: string) => void;
  logout: () => void;
  username: string | null;
  displayName: string | null;
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
  const [displayName, setDisplayName] = useState<string | null>(() => {
    return localStorage.getItem('displayName');
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', String(isLoggedIn));
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
    if (displayName) {
      localStorage.setItem('displayName', displayName);
    } else {
      localStorage.removeItem('displayName');
    }
  }, [isLoggedIn, username, displayName]);

  const login = (user: string, name?: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    setDisplayName(name && name.trim() ? name : user);
    console.log(`User ${name || user} logged in (simulated).`);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    setDisplayName(null);
    console.log('User logged out (simulated).');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, username, displayName }}>
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
