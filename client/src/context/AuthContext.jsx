import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const MASTER_ADMIN_PASSKEYS = ['March3@2211'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('elixUser') || sessionStorage.getItem('elixUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to extract clean error message from Axios / Server responses
  const getErrorMessage = (err, fallback) => {
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
      return 'Cannot connect to database server. Please ensure the backend server is running and PostgreSQL is accessible.';
    }
    return err.message || fallback;
  };

  // Helper to save active session token & user
  const saveSession = (userData, token, remember = true) => {
    const sessionUser = {
      id: userData.id || userData._id,
      name: userData.realName || userData.name,
      realName: userData.realName || userData.name,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      isAdmin: userData.role === 'admin' || userData.role === 'owner',
      isOwner: userData.role === 'owner',
      provider: userData.provider || 'email',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.email || userData.username)}`,
      points: userData.points ?? 200,
      phone: userData.phone || '',
    };

    setUser(sessionUser);

    if (token) {
      if (remember) {
        localStorage.setItem('elixToken', token);
        localStorage.setItem('elixUser', JSON.stringify(sessionUser));
        sessionStorage.removeItem('elixToken');
        sessionStorage.removeItem('elixUser');
      } else {
        sessionStorage.setItem('elixToken', token);
        sessionStorage.setItem('elixUser', JSON.stringify(sessionUser));
        localStorage.removeItem('elixToken');
        localStorage.removeItem('elixUser');
      }
    }
    return sessionUser;
  };

  const clearSession = () => {
    setUser(null);
    localStorage.removeItem('elixToken');
    localStorage.removeItem('elixUser');
    sessionStorage.removeItem('elixToken');
    sessionStorage.removeItem('elixUser');
  };

  // Verify stored session with PostgreSQL on mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('elixToken') || sessionStorage.getItem('elixToken');
      if (!token) return;

      try {
        const profile = await authService.fetchProfile();
        if (profile) {
          saveSession(profile, null, Boolean(localStorage.getItem('elixToken')));
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        clearSession();
      }
    };

    verifySession();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  //  User Login (via PostgreSQL database)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleLogin = async ({ emailOrUsername, email, username, password, remember = true }) => {
    setLoading(true);
    setError(null);

    const identifier = (emailOrUsername || email || username || '').trim();
    const cleanPassword = (password || '').trim();

    if (!identifier) {
      const msg = 'Please enter your email address or username.';
      setError(msg);
      setLoading(false);
      return null;
    }
    if (!cleanPassword) {
      const msg = 'Please enter your password.';
      setError(msg);
      setLoading(false);
      return null;
    }

    try {
      const data = await authService.login({
        emailOrUsername: identifier,
        password: cleanPassword,
      });

      if (!data || !data.token) {
        throw new Error('Invalid authentication response from database server.');
      }

      const sessionUser = saveSession(data, data.token, remember);
      return sessionUser;
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to sign in. Please verify your credentials.');
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  User Registration (via PostgreSQL database)
  //  Requires: realName, username, email, password, repeatPassword
  // ─────────────────────────────────────────────────────────────────────────────
  const handleRegister = async ({
    realName,
    name,
    username,
    email,
    password,
    repeatPassword,
    phone = '',
    remember = true,
  }) => {
    setLoading(true);
    setError(null);

    const finalRealName = (realName || name || '').trim();
    const finalUsername = (username || '').trim().toLowerCase().replace(/\s+/g, '_');
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanRepeatPassword = (repeatPassword || '').trim();

    if (!finalRealName) {
      const msg = 'Please enter your real name.';
      setError(msg);
      setLoading(false);
      return null;
    }
    if (!finalUsername) {
      const msg = 'Please choose a username.';
      setError(msg);
      setLoading(false);
      return null;
    }
    if (!cleanEmail) {
      const msg = 'Please enter your email address.';
      setError(msg);
      setLoading(false);
      return null;
    }
    if (!cleanPassword) {
      const msg = 'Please enter a password.';
      setError(msg);
      setLoading(false);
      return null;
    }
    if (cleanRepeatPassword && cleanPassword !== cleanRepeatPassword) {
      const msg = 'Passwords do not match.';
      setError(msg);
      setLoading(false);
      return null;
    }
    if (cleanPassword.length < 4) {
      const msg = 'Password must be at least 4 characters long.';
      setError(msg);
      setLoading(false);
      return null;
    }

    try {
      const data = await authService.register({
        realName: finalRealName,
        username: finalUsername,
        email: cleanEmail,
        password: cleanPassword,
        repeatPassword: cleanRepeatPassword || cleanPassword,
        phone,
      });

      if (!data || !data.token) {
        throw new Error('Registration failed: no authentication token received from database server.');
      }

      const sessionUser = saveSession(data, data.token, remember);
      return sessionUser;
    } catch (err) {
      const msg = getErrorMessage(err, 'Unable to create account in database.');
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  OAuth Social Login (via PostgreSQL database)
  // ─────────────────────────────────────────────────────────────────────────────
  const loginWithOAuth = async ({ provider, name, email, avatar, remember = true }) => {
    setLoading(true);
    setError(null);

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      const msg = 'Valid email required for OAuth authentication.';
      setError(msg);
      setLoading(false);
      return null;
    }

    try {
      const data = await authService.oauthLogin({
        name: name || `${provider} Member`,
        email: cleanEmail,
        provider: provider || 'google',
        avatar,
      });

      if (!data || !data.token) {
        throw new Error('Social authentication failed on database server.');
      }

      const sessionUser = saveSession(data, data.token, remember);
      return { user: sessionUser, isNew: data.isNew || false };
    } catch (err) {
      const msg = getErrorMessage(err, 'Social authentication failed.');
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  Admin Passkey Login
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAdminKeyLogin = async (passkey) => {
    setLoading(true);
    setError(null);

    const cleanKey = (passkey || '').trim();
    if (!cleanKey) {
      const msg = 'Please enter the master passkey.';
      setError(msg);
      setLoading(false);
      return null;
    }

    try {
      // Authenticate against PostgreSQL for the store owner or admin account
      const data = await authService.login({
        emailOrUsername: 'admin@elix.lk',
        password: cleanKey,
      });

      if (data && data.token) {
        const sessionUser = saveSession(data, data.token, true);
        return sessionUser;
      }
      throw new Error('Invalid Master Passkey.');
    } catch (err) {
      // Also try Store Owner email
      try {
        const data = await authService.login({
          emailOrUsername: 'sheranadeesha39@gmail.com',
          password: cleanKey,
        });
        if (data && data.token) {
          const sessionUser = saveSession(data, data.token, true);
          return sessionUser;
        }
      } catch {}

      const msg = getErrorMessage(err, 'Invalid Master Passkey.');
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  Admin Database User Management
  // ─────────────────────────────────────────────────────────────────────────────
  const loadUsersList = useCallback(async () => {
    try {
      const data = await authService.fetchUsers();
      if (Array.isArray(data)) {
        setUsersList(data);
      }
    } catch (err) {
      console.warn('Could not fetch users list from database:', err.message);
    }
  }, []);

  const adminAddUser = async (userData) => {
    const res = await authService.createUserAdmin(userData);
    await loadUsersList();
    return res;
  };

  const adminUpdateUser = async (id, userData) => {
    const res = await authService.updateUserAdmin(id, userData);
    await loadUsersList();
    return res;
  };

  const adminDeleteUser = async (id) => {
    const res = await authService.deleteUserAdmin(id);
    await loadUsersList();
    return res;
  };

  const isMasterAdmin = Boolean(
    user &&
      (user.isAdmin ||
        user.isOwner ||
        user.role === 'admin' ||
        user.role === 'owner' ||
        user.email?.toLowerCase() === 'sheranadeesha39@gmail.com' ||
        user.email?.toLowerCase() === 'admin@elix.lk')
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        isMasterAdmin,
        login: handleLogin,
        loginWithAdminKey: handleAdminKeyLogin,
        loginWithOAuth,
        register: handleRegister,
        logout,
        registeredCount: usersList.length,
        usersList,
        loadUsersList,
        adminAddUser,
        adminUpdateUser,
        adminDeleteUser,
      }}
    >
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
