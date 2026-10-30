import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import * as authService from '../services/authService';
import { User } from '../types';

export const MASTER_ADMIN_PASSKEYS = ['March3@2211'];

export interface LoginParams {
  emailOrUsername?: string;
  email?: string;
  username?: string;
  password?: string;
  remember?: boolean;
}

export interface RegisterParams {
  realName?: string;
  name?: string;
  username: string;
  email: string;
  password?: string;
  repeatPassword?: string;
  phone?: string;
  remember?: boolean;
  autoLogin?: boolean;
}

export interface OAuthParams {
  provider: string;
  name: string;
  email: string;
  avatar?: string;
  remember?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  isMasterAdmin: boolean;
  login: (params: LoginParams) => Promise<User | null>;
  loginWithAdminKey: (passkey: string) => Promise<User | null>;
  loginWithOAuth: (params: OAuthParams) => Promise<{ user: User; isNew: boolean } | null>;
  register: (params: RegisterParams) => Promise<User | null>;
  logout: () => void;
  registeredCount: number;
  usersList: User[];
  loadUsersList: () => Promise<void>;
  adminAddUser: (userData: any) => Promise<any>;
  adminUpdateUser: (id: string, userData: any) => Promise<any>;
  adminDeleteUser: (id: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('shexzUser') || sessionStorage.getItem('shexzUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to extract clean error message from Axios / Server responses
  const getErrorMessage = (err: any, fallback: string): string => {
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
      return 'Cannot connect to database server. Please ensure the backend server is running and PostgreSQL is accessible.';
    }
    return err.message || fallback;
  };

  // Helper to save active session token & user
  const saveSession = (userData: any, token?: string | null, remember: boolean = true): User => {
    const sessionUser: User = {
      id: userData.id || userData._id,
      name: userData.realName || userData.name || userData.username || 'SheXz Member',
      realName: userData.realName || userData.name,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      isAdmin: userData.role === 'admin' || userData.role === 'owner',
      isOwner: userData.role === 'owner',
      provider: userData.provider || 'email',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.email || userData.username || 'shexz')}`,
      points: userData.points ?? 200,
      phone: userData.phone || '',
    };

    setUser(sessionUser);

    if (token) {
      if (remember) {
        localStorage.setItem('shexzToken', token);
        localStorage.setItem('shexzUser', JSON.stringify(sessionUser));
        sessionStorage.removeItem('shexzToken');
        sessionStorage.removeItem('shexzUser');
      } else {
        sessionStorage.setItem('shexzToken', token);
        sessionStorage.setItem('shexzUser', JSON.stringify(sessionUser));
        localStorage.removeItem('shexzToken');
        localStorage.removeItem('shexzUser');
      }
    }
    return sessionUser;
  };

  const clearSession = () => {
    setUser(null);
    localStorage.removeItem('shexzToken');
    localStorage.removeItem('shexzUser');
    sessionStorage.removeItem('shexzToken');
    sessionStorage.removeItem('shexzUser');
  };

  // Verify stored session with PostgreSQL on mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('shexzToken') || sessionStorage.getItem('shexzToken');
      if (!token) return;

      try {
        const profile = await authService.fetchProfile();
        if (profile) {
          saveSession(profile, null, Boolean(localStorage.getItem('shexzToken')));
        }
      } catch (err: any) {
        console.warn('Session verification failed, logging out:', err.message);
        clearSession();
      }
    };

    verifySession();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  //  User Login (via PostgreSQL database)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleLogin = async ({
    emailOrUsername,
    email,
    username,
    password,
    remember = true,
  }: LoginParams): Promise<User | null> => {
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
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to sign in. Please verify your credentials.');
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  User Registration (via PostgreSQL database)
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
  }: RegisterParams): Promise<User | null> => {
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
    } catch (err: any) {
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
  const loginWithOAuth = async ({
    provider,
    name,
    email,
    avatar,
    remember = true,
  }: OAuthParams): Promise<{ user: User; isNew: boolean } | null> => {
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
      return { user: sessionUser, isNew: Boolean(data.isNew) };
    } catch (err: any) {
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
  const handleAdminKeyLogin = async (passkey: string): Promise<User | null> => {
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
      const data = await authService.login({
        emailOrUsername: 'admin@elix.lk',
        password: cleanKey,
      });

      if (data && data.token) {
        const sessionUser = saveSession(data, data.token, true);
        return sessionUser;
      }
      throw new Error('Invalid Master Passkey.');
    } catch (err: any) {
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
    } catch (err: any) {
      console.warn('Could not fetch users list from database:', err.message);
    }
  }, []);

  const adminAddUser = async (userData: any) => {
    const res = await authService.createUserAdmin(userData);
    await loadUsersList();
    return res;
  };

  const adminUpdateUser = async (id: string, userData: any) => {
    const res = await authService.updateUserAdmin(id, userData);
    await loadUsersList();
    return res;
  };

  const adminDeleteUser = async (id: string) => {
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
