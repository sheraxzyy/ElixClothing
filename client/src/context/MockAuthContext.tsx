import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';

interface MockAuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (args: { email?: string }) => Promise<User | null>;
  register: (args: { name?: string; email?: string }) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<MockAuthContextType | null>(null);

const mockUser: User = {
  id: 'mock-user',
  name: 'ELIX Customer',
  email: 'customer@elix.example',
  role: 'customer',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('elixUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('elixUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('elixUser');
    }
  }, [user]);

  const handleLogin = async ({ email }: { email?: string }): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const loggedIn = { ...mockUser, email: email || mockUser.email };
      setUser(loggedIn);
      return loggedIn;
    } catch (err) {
      setError('Unable to login.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ name, email }: { name?: string; email?: string }): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const registered = { ...mockUser, name: name || mockUser.name, email: email || mockUser.email };
      setUser(registered);
      return registered;
    } catch (err) {
      setError('Unable to register.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login: handleLogin, register: handleRegister, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
