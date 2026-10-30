import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User } from '../types';

interface OAuthModalProps {
  isOpen: boolean;
  provider: string;
  onClose: () => void;
  onSuccess?: (user: User) => void;
}

interface SocialProfile {
  name: string;
  email: string;
  avatar: string;
  subtext: string;
}

export const OAuthModal: React.FC<OAuthModalProps> = ({ isOpen, provider, onClose, onSuccess }) => {
  const { loginWithOAuth, loading } = useAuth();
  const { addToast } = useToast();

  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [appleHideEmail, setAppleHideEmail] = useState<boolean>(false);
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [authStage, setAuthStage] = useState<'select' | 'verifying' | 'custom'>('select');

  const defaultProfiles: Record<string, SocialProfile[]> = {
    google: [
      {
        name: 'Kasun Silva',
        email: 'kasun.silva98@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        subtext: 'Personal Google Account',
      },
      {
        name: 'Amara Weerasinghe',
        email: 'amara.drops@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        subtext: 'Connected via Chrome',
      },
    ],
    apple: [
      {
        name: 'Dilan Jayawardena',
        email: 'dilan.j@icloud.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        subtext: 'Primary Apple ID (iCloud)',
      },
    ],
    github: [
      {
        name: 'Sahan Dev',
        email: 'sahan.coder@github.com',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
        subtext: 'github.com/sahandev',
      },
    ],
  };

  useEffect(() => {
    if (isOpen) {
      setCustomMode(false);
      setAuthStage('select');
      if (provider === 'google') {
        setNameInput('Kasun Silva');
        setEmailInput('kasun.silva98@gmail.com');
      } else if (provider === 'apple') {
        setNameInput('Dilan Jayawardena');
        setEmailInput('dilan.j@icloud.com');
      } else if (provider === 'github') {
        setNameInput('Sahan Dev');
        setEmailInput('sahan.coder@github.com');
      }
    }
  }, [isOpen, provider]);

  if (!isOpen) return null;

  const currentProvider = (provider || 'google').toLowerCase();

  const getProviderTitle = (): string => {
    if (currentProvider === 'google') return 'Google';
    if (currentProvider === 'apple') return 'Apple ID';
    if (currentProvider === 'github') return 'GitHub';
    return 'Social';
  };

  const handleSelectQuickProfile = async (profile: SocialProfile) => {
    setAuthStage('verifying');
    try {
      const res = await loginWithOAuth({
        provider: currentProvider,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        remember: true,
      });

      if (res && res.user) {
        addToast({
          title: res.isNew ? 'Account Created' : 'Welcome Back',
          message: res.isNew
            ? `New account created via ${getProviderTitle()} for ${res.user.name} (+250 pts)`
            : `Signed in via ${getProviderTitle()} as ${res.user.name}`,
          type: 'success',
        });
        if (onSuccess) onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setAuthStage('select');
      addToast({
        title: 'Authentication Failed',
        message: err.message || 'Unable to authenticate.',
        type: 'error',
      });
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setAuthStage('verifying');
    try {
      let finalEmail = emailInput.trim().toLowerCase();
      if (currentProvider === 'apple' && appleHideEmail) {
        const randomHash = Math.random().toString(36).substring(2, 8);
        finalEmail = `priv_${randomHash}@privaterelay.appleid.com`;
      }

      const generatedAvatar =
        avatarUrl.trim() ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalEmail)}`;

      const res = await loginWithOAuth({
        provider: currentProvider,
        name: nameInput.trim() || `${getProviderTitle()} User`,
        email: finalEmail,
        avatar: generatedAvatar,
        remember: true,
      });

      if (res && res.user) {
        addToast({
          title: res.isNew ? 'Account Created' : 'Welcome Back',
          message: res.isNew
            ? `New account created via ${getProviderTitle()} for ${res.user.name} (+250 pts)`
            : `Signed in via ${getProviderTitle()} as ${res.user.name}`,
          type: 'success',
        });
        if (onSuccess) onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setAuthStage('custom');
      addToast({
        title: 'Authentication Failed',
        message: err.message || 'Unable to authenticate.',
        type: 'error',
      });
    }
  };

  const getProviderIcon = () => {
    if (currentProvider === 'google') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
      );
    }
    if (currentProvider === 'apple') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.93.04-2.02.62-2.67 1.39-.58.67-1.09 1.76-.95 2.82 1.04.08 2.06-.51 2.68-1.28z" />
        </svg>
      );
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    );
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <div
        className="oauth-modal-window animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: currentProvider === 'apple' ? '#000000' : '#10131d',
          border:
            currentProvider === 'google'
              ? '1px solid rgba(66, 133, 244, 0.4)'
              : currentProvider === 'apple'
              ? '1px solid rgba(255, 255, 255, 0.25)'
              : '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '20px',
          padding: '2.2rem 2rem',
          position: 'relative',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(139, 92, 246, 0.15)',
          color: '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#a1a1aa',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            transition: 'background 0.2s',
          }}
          aria-label="Close dialog"
        >
          ✕
        </button>

        {/* Provider Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: currentProvider === 'apple' ? '#1c1c1e' : 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            }}
          >
            {getProviderIcon()}
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
            {currentProvider === 'google' && 'Sign in with Google'}
            {currentProvider === 'apple' && 'Sign in with Apple'}
            {currentProvider === 'github' && 'Authorize via GitHub'}
          </h3>

          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0, lineHeight: 1.4 }}>
            {currentProvider === 'google' && 'Continue to SheXz Streetwear Atelier to access drops and member rewards.'}
            {currentProvider === 'apple' && 'Use your Apple ID to sign in securely with Touch ID, Face ID or Passkey.'}
            {currentProvider === 'github' && 'Authorize SheXz to authenticate your developer credentials.'}
          </p>
        </div>

        {/* Verifying Spinner State */}
        {authStage === 'verifying' ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255, 255, 255, 0.1)',
                borderTopColor: 'var(--accent-purple, #8b5cf6)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1.25rem',
              }}
            />
            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#f8fafc' }}>
              Authenticating with {getProviderTitle()}...
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.35rem' }}>
              Establishing real-time session & sync with Admin Atelier
            </div>
          </div>
        ) : !customMode ? (
          <div>
            {/* Quick 1-Click Profile Selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '0.75rem' }}>
                Select {getProviderTitle()} Account
              </div>

              {(defaultProfiles[currentProvider] || []).map((prof, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectQuickProfile(prof)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    marginBottom: '0.6rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <img
                    src={prof.avatar}
                    alt={prof.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{prof.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prof.email}
                    </div>
                  </div>
                  <span style={{ color: 'var(--accent-purple, #8b5cf6)', fontSize: '1rem' }}>→</span>
                </button>
              ))}

              {/* Custom Input Switch */}
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: '#cbd5e1',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>➕</span>
                <span>Use another {getProviderTitle()} account / Custom email</span>
              </button>
            </div>

            {/* Apple Private Relay Notice if Apple */}
            {currentProvider === 'apple' && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  marginTop: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <span>🛡️</span>
                <span>Apple ID Protects your email with End-to-End Relay Encryption.</span>
              </div>
            )}
          </div>
        ) : (
          /* Custom Credentials Mode */
          <form onSubmit={handleCustomSubmit} style={{ display: 'grid', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                {getProviderTitle()} Profile Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Kasun Silva"
                className="form-control"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                {getProviderTitle()} Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={
                  currentProvider === 'google'
                    ? 'user@gmail.com'
                    : currentProvider === 'apple'
                    ? 'user@icloud.com'
                    : 'user@github.com'
                }
                className="form-control"
                style={{ width: '100%' }}
                required
              />
            </div>

            {currentProvider === 'apple' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer', margin: '0.2rem 0' }}>
                <input
                  type="checkbox"
                  checked={appleHideEmail}
                  onChange={(e) => setAppleHideEmail(e.target.checked)}
                />
                <span>Hide My Email (Forward via Apple Private Relay)</span>
              </label>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCustomMode(false)}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-glow"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                {loading ? 'Connecting…' : `Verify & Join`}
              </button>
            </div>
          </form>
        )}

        {/* Security Trust Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
          🔒 Verified OAuth 2.0 Security · 256-Bit SSL · Instant Admin Sync
        </div>
      </div>
    </div>
  );
};

export default OAuthModal;
