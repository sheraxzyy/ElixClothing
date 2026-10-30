import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OAuthModal from '../components/OAuthModal';
import { User as UserIcon, Lock, Mail, Eye, EyeOff, Shield, Crown, Sparkles, AtSign } from 'lucide-react';
import { User } from '../types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithAdminKey, register, loading, error, setError } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [emailOrUsername, setEmailOrUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Register form state (5 required fields)
  const [realName, setRealName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Social OAuth Modal State
  const [oauthModalOpen, setOauthModalOpen] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('google');

  // Forgot Password Modal
  const [forgotModalOpen, setForgotModalOpen] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSubmitted, setForgotSubmitted] = useState<boolean>(false);

  // Store Owner Passkey Modal
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [adminKeyInput, setAdminKeyInput] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');

  const from = location.state?.from?.pathname || '/shop';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setError) setError(null);

    if (!emailOrUsername.trim() || !loginPassword) {
      if (setError) setError('Please fill in both your email/username and password.');
      return;
    }

    const user = await login({
      emailOrUsername: emailOrUsername.trim(),
      password: loginPassword,
      remember: rememberMe,
    });

    if (user) {
      addToast({
        title: 'Welcome to SheXz',
        message: `Signed in successfully as ${user.name || user.username}`,
        type: 'success',
      });
      if (user.isAdmin || user.role?.toLowerCase().includes('admin') || user.role === 'owner') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setError) setError(null);

    if (!realName.trim() || !username.trim() || !email.trim() || !password || !repeatPassword) {
      if (setError) setError('Please provide all 5 fields: Real Name, Username, Email, Password, and Repeat Password.');
      return;
    }

    if (password !== repeatPassword) {
      if (setError) setError('Password and Repeat Password do not match.');
      return;
    }

    const user = await register({
      realName: realName.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      repeatPassword,
      remember: rememberMe,
    });

    if (user) {
      addToast({
        title: 'Account Created',
        message: `Welcome to SheXz, ${user.name || user.username}! (+200 pts)`,
        type: 'success',
      });
      navigate(from, { replace: true });
    }
  };

  const openSocialAuth = (provider: string) => {
    setSelectedProvider(provider);
    setOauthModalOpen(true);
  };

  const handleSocialSuccess = (sessionUser: User) => {
    if (sessionUser.isAdmin || sessionUser.role?.toLowerCase().includes('admin') || sessionUser.role === 'owner') {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleAdminKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    try {
      const res = await loginWithAdminKey(adminKeyInput);
      if (res) {
        addToast({
          title: 'Store Owner Authenticated',
          message: 'Master Admin clearance granted.',
          type: 'success',
        });
        setAdminModalOpen(false);
        navigate('/admin', { replace: true });
      } else {
        setAdminError(error || 'Invalid Master Passkey.');
      }
    } catch (err: any) {
      setAdminError(err.message || 'Authentication error.');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-orb-1" />
      <div className="auth-ambient-orb-2" />

      <div className="auth-card-container animate-fade-in-up">
        {/* Left Side: Brand Narrative */}
        <div className="auth-brand-side">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.2em', fontFamily: 'var(--font-display)' }}>SheXz</span>
              <span className="brand-badge">2026-LIVE</span>
            </div>
            <div className="auth-brand-quote">
              <h2>DIRECT POSTGRESQL CLOUD SYNC.</h2>
              <p>
                Access your private VIP vault, track orders in real-time, and manage limited streetwear drops directly with our PostgreSQL database.
              </p>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginTop: '2rem',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--accent-purple)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Sparkles size={14} /> Database Powered Auth
            </div>
            <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <div>• Secure password hashing with bcryptjs</div>
              <div>• Zero local fallback mocks: always PostgreSQL verified</div>
              <div>• Store Admin & Owner access control</div>
              <div>• 200 Reward Points automatically credited</div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-side">
          {/* Tab Switcher */}
          <div className="auth-nav-tabs">
            <button
              type="button"
              className={`auth-nav-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                if (setError) setError(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-nav-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                if (setError) setError(null);
              }}
            >
              Create Account
            </button>
          </div>

          <h1 className="auth-form-title">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="auth-form-subtitle">
            {activeTab === 'login'
              ? 'Enter your email or username to access your SheXz account.'
              : 'Fill in your details to create your SheXz VIP account.'}
          </p>

          {/* Error Banner */}
          {error && (
            <div className="auth-error-banner" role="alert" style={{ marginBottom: '1.25rem' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-identifier">
                  Email Address or Username
                </label>
                <div className="form-input-wrapper">
                  <UserIcon size={16} className="form-input-icon" />
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="email@example.com or username"
                    className="form-control has-icon-left"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(emailOrUsername);
                      setForgotSubmitted(false);
                      setForgotModalOpen(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-purple)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="form-input-wrapper">
                  <Lock size={16} className="form-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="form-control has-icon-left has-icon-right"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="form-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-checkbox-row">
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-glow btn-full luxury-hover"
                disabled={loading}
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? 'Connecting to Database…' : 'Sign In to Vault'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              {/* 1. Real Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="tab-reg-realname">
                  Real Name
                </label>
                <div className="form-input-wrapper">
                  <UserIcon size={16} className="form-input-icon" />
                  <input
                    id="tab-reg-realname"
                    type="text"
                    required
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="form-control has-icon-left"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* 2. Username */}
              <div className="form-group">
                <label className="form-label" htmlFor="tab-reg-username">
                  Username
                </label>
                <div className="form-input-wrapper">
                  <AtSign size={16} className="form-input-icon" />
                  <input
                    id="tab-reg-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="e.g. alex_rivera"
                    className="form-control has-icon-left"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* 3. Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="tab-reg-email">
                  Email Address
                </label>
                <div className="form-input-wrapper">
                  <Mail size={16} className="form-input-icon" />
                  <input
                    id="tab-reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="form-control has-icon-left"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* 4. Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="tab-reg-password">
                  Password
                </label>
                <div className="form-input-wrapper">
                  <Lock size={16} className="form-input-icon" />
                  <input
                    id="tab-reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="form-control has-icon-left has-icon-right"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="form-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* 5. Repeat Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="tab-reg-repeat-password">
                  Repeat Password
                </label>
                <div className="form-input-wrapper">
                  <Lock size={16} className="form-input-icon" />
                  <input
                    id="tab-reg-repeat-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="form-control has-icon-left"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="form-checkbox-row">
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-glow btn-full luxury-hover"
                disabled={loading}
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? 'Connecting to Database…' : 'Register Account (+200 Points)'}
              </button>
            </form>
          )}

          {/* Social Divider */}
          <div className="social-divider">Or continue with 1-click OAuth</div>

          {/* Social Buttons */}
          <div className="social-login-grid">
            <button
              type="button"
              className="social-btn"
              onClick={() => openSocialAuth('google')}
              title="Continue with Google"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={() => openSocialAuth('apple')}
              title="Continue with Apple ID"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF" style={{ flexShrink: 0 }}>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.93.04-2.02.62-2.67 1.39-.58.67-1.09 1.76-.95 2.82 1.04.08 2.06-.51 2.68-1.28z" />
              </svg>
              <span>Apple</span>
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={() => openSocialAuth('github')}
              title="Continue with GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF" style={{ flexShrink: 0 }}>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Store Owner Clearance Link */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setAdminKeyInput('');
                setAdminError('');
                setAdminModalOpen(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Crown size={14} color="var(--accent-amber)" /> Store Owner & Admin Portal Access
            </button>
          </div>
        </div>
      </div>

      {/* Real-time OAuth Modal */}
      <OAuthModal
        isOpen={oauthModalOpen}
        provider={selectedProvider}
        onClose={() => setOauthModalOpen(false)}
        onSuccess={handleSocialSuccess}
      />

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="glass-card animate-scale-up" style={{ maxWidth: '420px', width: '90%', padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Password Recovery</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Enter your registered email address. Password reset instructions will be sent.
            </p>

            {forgotSubmitted ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✉️</div>
                <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Check your inbox</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  If an account exists for {forgotEmail}, a reset link has been dispatched.
                </p>
                <button
                  type="button"
                  className="btn btn-glow btn-full"
                  onClick={() => setForgotModalOpen(false)}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotEmail.trim()) {
                    setForgotSubmitted(true);
                  }
                }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="forgot-email">Account Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="form-control"
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setForgotModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-glow" style={{ flex: 1 }}>
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Store Owner Passkey Modal */}
      {adminModalOpen && (
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 9999 }}>
          <div
            className="glass-card animate-scale-up"
            style={{
              maxWidth: '440px',
              width: '90%',
              padding: '2rem',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              background: 'rgba(12, 14, 24, 0.98)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Crown size={36} color="var(--accent-amber)" style={{ margin: '0 auto 0.5rem' }} />
              <h3 style={{ fontSize: '1.3rem', letterSpacing: '0.05em' }}>Store Owner Atelier Access</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Enter the authorized master password to enter the administrative console.
              </p>
            </div>

            {adminError && (
              <div className="auth-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
                <span>⚠️</span>
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminKeySubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-passkey">Master Passkey</label>
                <input
                  id="admin-passkey"
                  type="password"
                  required
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  placeholder="Enter master password"
                  className="form-control"
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setAdminModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-glow"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Verifying…' : 'Unlock Atelier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
