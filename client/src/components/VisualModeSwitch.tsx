import React, { useState } from 'react';
import { useVisualMode } from '../context/VisualModeContext';
import { useToast } from '../context/ToastContext';
import { Zap, Eye, Sparkles, Check, Sliders, ChevronRight } from 'lucide-react';

interface VisualModeSwitchProps {
  variant?: 'navbar' | 'dock' | 'card' | 'menu-item' | 'compact';
  onAfterToggle?: () => void;
}

export const VisualModeSwitch: React.FC<VisualModeSwitchProps> = ({ variant = 'navbar', onAfterToggle }) => {
  const { mode, isUltra, setMode, toggleMode } = useVisualMode();
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleSelectMode = (newMode: 'normal' | 'ultra') => {
    if (newMode === mode) return;
    setMode(newMode);
    if (newMode === 'ultra') {
      addToast({
        title: 'ELIX EXPERIENCE MODE Activated ✨',
        message: 'Cinematic page transitions, 3D buttons, dynamic lighting & streetwear effects enabled.',
        type: 'success',
      });
    } else {
      addToast({
        title: 'NORMAL MODE Restored',
        message: 'Clean, lightweight professional e-commerce interface active.',
        type: 'info',
      });
    }
    if (onAfterToggle) onAfterToggle();
  };

  const handleToggle = () => {
    const nextMode = isUltra ? 'normal' : 'ultra';
    handleSelectMode(nextMode);
  };

  // 1. NAVBAR PILL VARIANT
  if (variant === 'navbar') {
    return (
      <div className="visual-mode-navbar-wrap">
        <button
          type="button"
          onClick={handleToggle}
          className={`visual-mode-pill-btn ${isUltra ? 'mode-ultra-active' : 'mode-normal-active'}`}
          title={`Visual Experience: ${isUltra ? 'Ultra Graphics (Click to switch to Normal)' : 'Normal (Click to switch to Ultra Graphics)'}`}
          aria-label={`Visual Experience mode: currently ${isUltra ? 'Ultra Graphics' : 'Normal'}`}
        >
          <div className="visual-pill-indicator">
            <span className={`pill-status-dot ${isUltra ? 'dot-ultra' : 'dot-normal'}`} />
          </div>
          <div className="visual-pill-text-wrap">
            <span className="visual-pill-label">Visual Mode</span>
            <span className="visual-pill-val">
              {isUltra ? 'ELIX EXPERIENCE' : 'NORMAL MODE'}
            </span>
          </div>
          <div className="visual-pill-icon-box">
            {isUltra ? <Sparkles size={14} className="pill-ultra-sparkle" /> : <Eye size={14} className="pill-normal-eye" />}
          </div>
        </button>
      </div>
    );
  }

  // 2. MENU ITEM VARIANT (For 3-Dots and User Dropdown)
  if (variant === 'menu-item') {
    return (
      <div className="visual-mode-menu-item-container">
        <div className="visual-mode-menu-header">
          <div className="visual-mode-menu-title-row">
            <Sliders size={15} className="visual-menu-icon" />
            <span className="visual-menu-title">Visual Experience</span>
          </div>
          <span className={`visual-mode-status-tag ${isUltra ? 'ultra' : 'normal'}`}>
            {isUltra ? 'Ultra Graphics' : 'Normal'}
          </span>
        </div>
        <div className="visual-mode-toggle-group">
          <button
            type="button"
            className={`visual-toggle-segment-btn ${!isUltra ? 'active' : ''}`}
            onClick={() => handleSelectMode('normal')}
          >
            <Eye size={13} style={{ marginRight: '5px' }} />
            Normal
          </button>
          <button
            type="button"
            className={`visual-toggle-segment-btn ultra-segment ${isUltra ? 'active' : ''}`}
            onClick={() => handleSelectMode('ultra')}
          >
            <Zap size={13} style={{ marginRight: '5px' }} />
            Ultra Graphics
          </button>
        </div>
      </div>
    );
  }

  // 3. COMPACT BUTTON VARIANT
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`visual-mode-compact-btn ${isUltra ? 'ultra' : 'normal'}`}
        title={`Toggle Visual Experience: Current is ${isUltra ? 'Ultra Graphics' : 'Normal'}`}
      >
        {isUltra ? <Zap size={15} /> : <Eye size={15} />}
        <span>{isUltra ? 'Ultra Graphics' : 'Normal'}</span>
      </button>
    );
  }

  // 4. FLOATING DOCK VARIANT (Quick Access Dock at bottom-left corner)
  if (variant === 'dock') {
    return (
      <>
        <div className={`visual-mode-dock ${isUltra ? 'dock-ultra' : 'dock-normal'}`}>
          <button
            type="button"
            className="visual-mode-dock-trigger"
            onClick={handleToggle}
            title={`Visual Experience: ${isUltra ? 'Ultra Graphics' : 'Normal'} (Click to switch)`}
            aria-label="Toggle Visual Experience Mode"
          >
            <div className="dock-icon-ring">
              {isUltra ? (
                <Zap size={17} className="dock-zap-icon" />
              ) : (
                <Sliders size={17} className="dock-slider-icon" />
              )}
            </div>
            <div className="dock-label-group">
              <span className="dock-super">VISUAL EXPERIENCE</span>
              <span className="dock-sub">{isUltra ? 'Ultra Graphics' : 'Normal Mode'}</span>
            </div>
            <span className="dock-toggle-indicator">
              <span className={`dock-dot ${isUltra ? 'active-ultra' : ''}`} />
            </span>
          </button>
        </div>
      </>
    );
  }

  // 5. RICH SETTINGS CARD VARIANT (For Footer & Settings)
  return (
    <div className={`visual-mode-settings-card ${isUltra ? 'card-ultra' : 'card-normal'}`}>
      <div className="visual-card-top">
        <div className="visual-card-badge">
          <Sliders size={14} style={{ marginRight: '5px', display: 'inline' }} />
          DUAL UI SYSTEM
        </div>
        <h3 className="visual-card-title">Visual Experience</h3>
        <p className="visual-card-desc">
          Choose between our lightweight high-speed shopping interface or the high-fidelity cinematic streetwear experience.
        </p>
      </div>

      <div className="visual-card-options-grid">
        {/* Option 1: Normal Mode */}
        <div
          className={`visual-option-box ${!isUltra ? 'option-selected' : ''}`}
          onClick={() => handleSelectMode('normal')}
          role="button"
          tabIndex={0}
        >
          <div className="option-box-header">
            <div className="option-icon-wrap">
              <Eye size={18} />
            </div>
            <div className="option-title-wrap">
              <div className="option-name">Normal Mode</div>
              <div className="option-tag">Clean & Fast (Default)</div>
            </div>
            {!isUltra && <span className="option-check-badge"><Check size={14} /></span>}
          </div>
          <ul className="option-perks-list">
            <li>Lightweight animations & fast loading</li>
            <li>Subtle, clean button interactions</li>
            <li>Optimized for battery & lower-end devices</li>
            <li>Minimal visual distractions</li>
          </ul>
        </div>

        {/* Option 2: Ultra Graphics Mode */}
        <div
          className={`visual-option-box ultra-box ${isUltra ? 'option-selected' : ''}`}
          onClick={() => handleSelectMode('ultra')}
          role="button"
          tabIndex={0}
        >
          <div className="option-box-header">
            <div className="option-icon-wrap ultra-icon">
              <Zap size={18} />
            </div>
            <div className="option-title-wrap">
              <div className="option-name">Ultra Graphics</div>
              <div className="option-tag ultra-tag">Cinematic & Immersive</div>
            </div>
            {isUltra && <span className="option-check-badge ultra-check"><Check size={14} /></span>}
          </div>
          <ul className="option-perks-list">
            <li>3D tactile press buttons & gradient borders</li>
            <li>Cinematic page entrance & shutter transitions</li>
            <li>Dynamic ambient spotlight & floating particles</li>
            <li>Enhanced product gallery & 3D card tilt</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VisualModeSwitch;

