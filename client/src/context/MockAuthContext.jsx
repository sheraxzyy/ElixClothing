import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const mockUser = {
  id: 'mock-user',
  name: 'ELIX Customer',
  email: 'customer@elix.example',
  role: 'customer',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('elixUser');
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('elixUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('elixUser');
    }
  }, [user]);

  const handleLogin = async ({ email }) => {
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

  const handleRegister = async ({ name, email }) => {
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

export const useAuth = () => useContext(AuthContext);
