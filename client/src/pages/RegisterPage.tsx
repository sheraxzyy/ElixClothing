import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OAuthModal from '../components/OAuthModal';
import { User as UserIcon, Lock, Mail, Eye, EyeOff, Sparkles, AtSign } from 'lucide-react';
import { User } from '../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loading, error, setError } = useAuth();
  const { addToast } = useToast();

  const [realName, setRealName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Social OAuth Modal state
  const [oauthModalOpen, setOauthModalOpen] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('google');

  const from = location.state?.from?.pathname || '/shop';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setError) setError(null);

    if (!realName.trim() || !username.trim() || !email.trim() || !password || !repeatPassword) {
      if (setError) setError('Please fill in all 5 required fields.');
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
    });

    if (user) {
      addToast({
        title: 'Welcome to ELIX',
        message: `Your account has been saved to the database, ${user.name || user.username}! (+200 pts)`,
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
    if (sessionUser.isAdmin || sessionUser.role?.toLowerCase().includes('admin')) {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-orb-1" />
      <div className="auth-ambient-orb-2" />

      <div className="auth-card-container animate-fade-in-up">
        <div className="auth-brand-side">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.2em', fontFamily: 'var(--font-display)' }}>ELIX</span>
              <span className="brand-badge">MEMBERS CLUB</span>
            </div>
            <div className="auth-brand-quote">
              <h2>ELEVATE YOUR WARDROBE.</h2>
              <p>
                Get instant access to secret seasonal streetwear drops, early bird release notifications, and member rewards.
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
                color: 'var(--accent-cyan)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Sparkles size={14} /> PostgreSQL Database Synced
            </div>
            <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <div>• Direct PostgreSQL cloud database storage</div>
              <div>• Free Islandwide Courier on your first streetwear drop</div>
              <div>• Early 24-hour priority vault access to Limited Drops</div>
              <div>• 200–250 Welcome Points immediately added to your wallet</div>
            </div>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-nav-tabs">
            <Link to="/login" className="auth-nav-tab">
              Sign In
            </Link>
            <button type="button" className="auth-nav-tab active">
              Create Account
            </button>
          </div>

          <h1 className="auth-form-title">Join ELIX</h1>
          <p className="auth-form-subtitle">
            Create your account directly stored in our PostgreSQL database.
          </p>

          {error && (
            <div className="auth-error-banner" role="alert" style={{ marginBottom: '1.25rem' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* 1. Real Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-realname">Real Name</label>
              <div className="form-input-wrapper">
                <UserIcon size={16} className="form-input-icon" />
                <input
                  id="reg-realname"
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
              <label className="form-label" htmlFor="reg-username">Username</label>
              <div className="form-input-wrapper">
                <AtSign size={16} className="form-input-icon" />
                <input
                  id="reg-username"
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
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div className="form-input-wrapper">
                <Mail size={16} className="form-input-icon" />
                <input
                  id="reg-email"
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
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="form-input-wrapper">
                <Lock size={16} className="form-input-icon" />
                <input
                  id="reg-password"
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
              <label className="form-label" htmlFor="reg-repeat-password">Repeat Password</label>
              <div className="form-input-wrapper">
                <Lock size={16} className="form-input-icon" />
                <input
                  id="reg-repeat-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="form-control has-icon-left"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="form-checkbox-row">
              <label className="custom-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                />
                <span>I agree to the ELIX terms & privacy policy</span>
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

          <div className="social-divider">Or join in 1-click with OAuth</div>

          {/* Social OAuth Grid */}
          <div className="social-login-grid">
            <button
              type="button"
              className="social-btn"
              onClick={() => openSocialAuth('google')}
              title="Create account with Google"
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
              title="Create account with Apple ID"
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
              title="Create account with GitHub"
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

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>
              Sign In here
            </Link>
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
    </div>
  );
};

export default RegisterPage;
