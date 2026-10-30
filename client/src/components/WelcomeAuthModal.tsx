import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OAuthModal from './OAuthModal';

const WelcomeAuthModal: React.FC = () => {
  const { user, login, register, loading, error, setError } = useAuth();
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [formData, setFormData] = useState({
    realName: '',
    username: '',
    emailOrUsername: '',
    email: '',
    password: '',
    repeatPassword: '',
  });
  const [localError, setLocalError] = useState<string>('');

  // OAuth Modal state
  const [oauthModalOpen, setOauthModalOpen] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('google');

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('shexz_auth_prompt_dismissed');
    const storedUser = localStorage.getItem('shexzUser') || sessionStorage.getItem('shexzUser');

    if (!hasSeenPrompt && !storedUser && !user) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleDismiss = () => {
    setIsOpen(false);
        localStorage.setItem('shexz_auth_prompt_dismissed', 'true');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError('');
    if (setError) setError(null);
  };

  const handleTabSwitch = (tab: 'register' | 'login') => {
    setActiveTab(tab);
    setLocalError('');
    if (setError) setError(null);
  };

  const openSocialAuth = (provider: string) => {
    setSelectedProvider(provider);
    setOauthModalOpen(true);
  };

  const handleSocialSuccess = () => {
        localStorage.setItem('shexz_auth_prompt_dismissed', 'true');
    setIsOpen(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (setError) setError(null);

    if (activeTab === 'login') {
      if (!formData.emailOrUsername.trim() || !formData.password.trim()) {
        setLocalError('Please enter both your email/username and password.');
        return;
      }
      const loggedUser = await login({
        emailOrUsername: formData.emailOrUsername.trim(),
        password: formData.password,
        remember: true,
      });

      if (loggedUser) {
        addToast({
          title: 'Welcome Back',
          message: `Signed in as ${loggedUser.name || loggedUser.username}!`,
          type: 'success',
        });
            localStorage.setItem('shexz_auth_prompt_dismissed', 'true');
        setIsOpen(false);
      }
    } else {
      if (!formData.realName.trim()) {
        setLocalError('Please enter your real name.');
        return;
      }
      if (!formData.username.trim()) {
        setLocalError('Please choose a username.');
        return;
      }
      if (!formData.email.trim()) {
        setLocalError('Please enter your email.');
        return;
      }
      if (!formData.password || formData.password.length < 4) {
        setLocalError('Password must be at least 4 characters.');
        return;
      }
      if (formData.password !== formData.repeatPassword) {
        setLocalError('Passwords do not match.');
        return;
      }

      const newUser = await register({
        realName: formData.realName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        repeatPassword: formData.repeatPassword,
        remember: true,
      });

      if (newUser) {
        addToast({
          title: 'Account Created',
          message: `Welcome to SheXz, ${newUser.name || newUser.username}! (+200 pts)`,
          type: 'success',
        });
            localStorage.setItem('shexz_auth_prompt_dismissed', 'true');
        setIsOpen(false);
      }
    }
  };

  if (!isOpen || user) return null;

  return (
    <>
      <div className="modal-backdrop animate-fade-in" style={{ zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div
          className="glass-card glass-card-glow animate-scale-up"
          style={{
            width: '100%',
            maxWidth: '480px',
            padding: '2rem 1.75rem',
            position: 'relative',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            background: 'rgba(10, 12, 18, 0.96)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(139, 92, 246, 0.25)',
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '1.25rem',
              cursor: 'pointer',
            }}
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.2em', fontFamily: 'var(--font-display)' }}>SheXz</span>
              <span className="brand-badge">MEMBERS CLUB</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
              {activeTab === 'register' ? 'Join the SheXz Community' : 'Welcome Back'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {activeTab === 'register'
                ? 'Create an account to access drops and get +200 bonus points.'
                : 'Sign in to access your order history and member perks.'}
            </p>
          </div>

          {/* Tab buttons */}
          <div className="auth-nav-tabs" style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className={`auth-nav-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('register')}
            >
              Create Account
            </button>
            <button
              type="button"
              className={`auth-nav-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('login')}
            >
              Sign In
            </button>
          </div>

          {/* Error notice */}
          {(localError || error) && (
            <div className="auth-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
              <span>⚠️</span>
              <span>{localError || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="auth-form">
            {activeTab === 'register' ? (
              <>
                <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                  <label className="form-label">Real Name</label>
                  <input
                    type="text"
                    name="realName"
                    required
                    value={formData.realName}
                    onChange={handleInputChange}
                    placeholder="e.g. Alex Rivera"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="e.g. alex_rivera"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="At least 4 characters"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                  <label className="form-label">Repeat Password</label>
                  <input
                    type="password"
                    name="repeatPassword"
                    required
                    value={formData.repeatPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className="form-control"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">Email Address or Username</label>
                  <input
                    type="text"
                    name="emailOrUsername"
                    required
                    value={formData.emailOrUsername}
                    onChange={handleInputChange}
                    placeholder="email@example.com or username"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="form-control"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-glow btn-full luxury-hover"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading
                ? 'Connecting to Database…'
                : activeTab === 'register'
                ? 'Join & Claim 200 Points'
                : 'Sign In'}
            </button>
          </form>

          {/* 1-Click Social */}
          <div className="social-divider" style={{ margin: '1rem 0' }}>Or continue with OAuth</div>
          <div className="social-login-grid">
            <button
              type="button"
              className="social-btn"
              onClick={() => openSocialAuth('google')}
            >
              <span>Google</span>
            </button>
            <button
              type="button"
              className="social-btn"
              onClick={() => openSocialAuth('apple')}
            >
              <span>Apple</span>
            </button>
            <button
              type="button"
              className="social-btn"
              onClick={() => openSocialAuth('github')}
            >
              <span>GitHub</span>
            </button>
          </div>
        </div>
      </div>

      <OAuthModal
        isOpen={oauthModalOpen}
        provider={selectedProvider}
        onClose={() => setOauthModalOpen(false)}
        onSuccess={handleSocialSuccess}
      />
    </>
  );
};

export default WelcomeAuthModal;
