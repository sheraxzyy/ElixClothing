import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Flame,
  Truck,
  Menu,
  X,
  Volume2,
  VolumeX,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
  Ruler,
  MessageSquare,
  Home,
  Compass,
} from 'lucide-react';
import useSound from '../hooks/useSound';
import VisualModeSwitch from './VisualModeSwitch';
import SearchModal from './SearchModal';

export const NavBar: React.FC = () => {
  const { user, logout, registeredCount, isMasterAdmin } = useAuth();
  const { cartItems } = useCart();
  const { addToast } = useToast();
  const { soundEnabled, toggleSound, playClick } = useSound();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const totalItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Scroll detection for transparent to solid glass navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.mobile-menu-toggle-btn')
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    addToast({
      title: 'Signed Out',
      message: 'You have been logged out safely.',
      type: 'info',
    });
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: ShoppingBag },
    {
      label: 'Drops',
      path: '/drops',
      icon: Flame,
      badge: 'LIVE',
      badgeClass: 'nav-drop-badge',
    },
    { label: 'Track Order', path: '/track-order', icon: Truck },
  ];

  const secondaryLinks = [
    { label: 'About', path: '/about', icon: Sparkles },
    { label: 'Size Guide', path: '/size-guide', icon: Ruler },
    { label: 'Contact', path: '/contact', icon: MessageSquare },
  ];

  return (
    <>
      {/* Top Announcement Marquee Bar */}
      <div className="announcement-bar">
        <span className="announcement-badge animate-pulse">2026-LIVE</span>
        <div className="announcement-marquee">
          <span>220 GSM HEAVYWEIGHT GRAPHIC TEES // FLAT LKR 3,000 // FREE ISLANDWIDE DELIVERY OVER 8,000 LKR // WORLDWIDE DROP</span>
        </div>
      </div>

      <header
        className={`site-header elix-premium-navbar ${
          scrolled ? 'header-scrolled' : 'header-transparent'
        }`}
      >
        <div className="container header-row">
          {/* Left: ELIX Brand Logo */}
          <Link to="/" className="brand-link group" onClick={playClick} aria-label="ELIX Home">
            <span className="brand-logo-text">ELIX</span>
            <span className="brand-badge">2026</span>
          </Link>

          {/* Center: Main Navigation Links */}
          <nav className="header-nav header-nav-centered" aria-label="Primary navigation">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);
              const Icon = link.icon;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={playClick}
                >
                  <span className="nav-item-content">
                    {link.label === 'Drops' && (
                      <Icon size={14} className="text-red-500 animate-pulse" />
                    )}
                    {link.label === 'Track Order' && (
                      <Icon size={14} className="nav-link-sub-icon" />
                    )}
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className={link.badgeClass}>{link.badge}</span>
                    )}
                  </span>
                </Link>
              );
            })}

            {/* Admin Console Pill for Admin Users */}
            {isMasterAdmin && (
              <Link
                to="/admin"
                className={`nav-item nav-admin-pill ${
                  location.pathname === '/admin' ? 'active' : ''
                }`}
                onClick={playClick}
              >
                <Shield size={13} className="nav-admin-icon" /> Admin
              </Link>
            )}
          </nav>

          {/* Right: Shopping-related Actions */}
          <div className="header-actions">
            {/* Search Trigger Button */}
            <button
              type="button"
              className="action-icon-btn search-trigger-btn"
              onClick={() => {
                playClick();
                setSearchModalOpen(true);
              }}
              title="Search products (Cmd/Ctrl + K)"
              aria-label="Open search dialog"
            >
              <Search size={18} />
              <span className="search-shortcut-hint">Search</span>
            </button>

            {/* Audio Feedback Toggle */}
            <button
              type="button"
              className={`action-icon-btn sound-toggle-btn ${
                soundEnabled ? 'active' : 'muted'
              }`}
              onClick={toggleSound}
              title={
                soundEnabled
                  ? 'UI Audio: ON (Click to Mute)'
                  : 'UI Audio: MUTED (Click to Enable)'
              }
              aria-label={
                soundEnabled ? 'Mute sound effects' : 'Enable sound effects'
              }
            >
              {soundEnabled ? (
                <Volume2 size={17} className="sound-icon-on" />
              ) : (
                <VolumeX size={17} className="sound-icon-off" />
              )}
            </button>

            {/* Visual Experience Switch */}
            <div className="hidden sm:block">
              <VisualModeSwitch variant="navbar" />
            </div>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="cart-button-link group"
              aria-label={`Cart with ${totalItemsCount} items`}
              onClick={playClick}
            >
              <ShoppingBag
                size={19}
                className="cart-svg-icon transition-transform duration-300 group-hover:scale-110"
              />
              {totalItemsCount > 0 && (
                <span className="cart-badge-count animate-bounce-subtle">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Account / Profile Action */}
            {user ? (
              <div className="user-menu-wrapper" ref={userDropdownRef}>
                <button
                  type="button"
                  className="user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  title="My Account"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                        user.email
                      )}`
                    }
                    alt={user.name}
                    className="user-avatar-mini"
                  />
                  <span className="user-nav-name">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      opacity: 0.7,
                      transform: userDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-popover animate-fade-in-down">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-name">{user.name}</div>
                      <div className="user-dropdown-role">
                        {user.role || 'ELIX Member'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          marginTop: '0.2rem',
                        }}
                      >
                        {user.points
                          ? `⭐ ${user.points} Reward Points`
                          : user.email}
                      </div>
                    </div>

                    <Link
                      to="/cart"
                      className="user-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <ShoppingBag size={15} /> My Bag ({totalItemsCount})
                    </Link>
                    <Link
                      to="/track-order"
                      className="user-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Truck size={15} /> Track My Orders
                    </Link>
                    <Link
                      to="/drops"
                      className="user-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Flame size={15} className="text-red-500" /> ELIX Drops
                    </Link>

                    {isMasterAdmin && (
                      <Link
                        to="/admin"
                        className="user-dropdown-item"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ color: '#38bdf8' }}
                      >
                        <Shield size={15} /> Admin Console ({registeredCount})
                      </Link>
                    )}

                    <div className="user-dropdown-custom-section">
                      <VisualModeSwitch
                        variant="menu-item"
                        onAfterToggle={() => setUserDropdownOpen(false)}
                      />
                    </div>

                    <button
                      type="button"
                      className="user-dropdown-item"
                      onClick={handleLogout}
                      style={{ color: '#f87171' }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="desktop-signin-btn elix-btn-signin"
                onClick={playClick}
                title="Account Login"
              >
                <UserIcon size={14} style={{ marginRight: '0.35rem' }} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className={`mobile-menu-toggle-btn ${mobileMenuOpen ? 'active' : ''}`}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => {
                playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer & Backdrop */}
        {mobileMenuOpen && (
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="mobile-nav-drawer animate-slide-in-right"
              ref={mobileMenuRef}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="mobile-drawer-header">
                <Link
                  to="/"
                  className="brand-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="brand-logo-text">ELIX</span>
                  <span className="brand-badge">2026</span>
                </Link>
                <button
                  type="button"
                  className="mobile-drawer-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Search Bar Quick Trigger */}
              <div className="mobile-drawer-search">
                <button
                  type="button"
                  className="mobile-search-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                >
                  <Search size={16} />
                  <span>Search tees, drops, archive...</span>
                </button>
              </div>

              {/* Main Nav Links */}
              <div className="mobile-drawer-section">
                <div className="mobile-section-label">MAIN NAVIGATION</div>
                <nav className="mobile-drawer-links">
                  {navLinks.map((link) => {
                    const isActive =
                      link.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(link.path);
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`mobile-drawer-link ${
                          isActive ? 'active' : ''
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mobile-link-title">
                          <Icon
                            size={18}
                            className={
                              link.label === 'Drops'
                                ? 'text-red-500'
                                : 'text-neutral-400'
                            }
                          />
                          {link.label}
                        </span>
                        {link.badge ? (
                          <span className="mobile-nav-badge">{link.badge}</span>
                        ) : (
                          <span className="mobile-link-chevron">→</span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Secondary Links */}
              <div className="mobile-drawer-section">
                <div className="mobile-section-label">EXPLORE & SUPPORT</div>
                <nav className="mobile-drawer-links">
                  {secondaryLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`mobile-drawer-link secondary-link ${
                          isActive ? 'active' : ''
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mobile-link-title">
                          <Icon size={16} className="text-neutral-400" />
                          {link.label}
                        </span>
                        <span className="mobile-link-chevron">→</span>
                      </Link>
                    );
                  })}

                  {isMasterAdmin && (
                    <Link
                      to="/admin"
                      className="mobile-drawer-link admin-highlight-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="mobile-link-title">
                        <Shield size={16} className="text-sky-400" />
                        Admin Console
                      </span>
                      <span className="dots-admin-badge">
                        {registeredCount} Users
                      </span>
                    </Link>
                  )}
                </nav>
              </div>

              {/* Mobile Drawer Settings (Visual Mode + Sound) */}
              <div className="mobile-drawer-section mobile-settings-section">
                <div className="mobile-section-label">PREFERENCES</div>
                <div className="mobile-settings-row">
                  <span className="settings-row-label">Visual Interface</span>
                  <VisualModeSwitch
                    variant="menu-item"
                    onAfterToggle={() => setMobileMenuOpen(false)}
                  />
                </div>
                <div className="mobile-settings-row">
                  <span className="settings-row-label">Audio Feedback</span>
                  <button
                    type="button"
                    className="mobile-audio-toggle"
                    onClick={toggleSound}
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 size={16} className="text-cyan-400" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <>
                        <VolumeX size={16} className="text-neutral-500" />
                        <span>Muted</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Drawer Footer Account Section */}
              <div className="mobile-drawer-footer">
                {user ? (
                  <div className="mobile-user-card">
                    <img
                      src={
                        user.avatar ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                          user.email
                        )}`
                      }
                      alt={user.name}
                      className="mobile-user-avatar"
                    />
                    <div className="mobile-user-info">
                      <div className="mobile-user-name">{user.name}</div>
                      <div className="mobile-user-email">{user.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mobile-signout-btn"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="mobile-auth-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon size={16} /> Sign In or Register
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Interactive Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};

export default NavBar;
