import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

function NavBar() {
  const { user, logout, registeredCount, isMasterAdmin } = useAuth();
  const { cartItems } = useCart();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [dotsMenuOpen, setDotsMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dotsMenuRef = useRef(null);
  const userDropdownRef = useRef(null);

  const totalItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dotsMenuRef.current && !dotsMenuRef.current.contains(event.target)) {
        setDotsMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDotsMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    addToast({
      title: 'Signed Out',
      message: 'You have been logged out safely.',
      type: 'info',
    });
    setUserDropdownOpen(false);
    setDotsMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Top Announcement Marquee Bar */}
      <div className="announcement-bar">
        <span className="announcement-badge">2026-LIVE</span>
        <span>220 GSM HEAVYWEIGHT GRAPHIC TEES // FLAT LKR 3,000 // FREE ISLANDWIDE DELIVERY OVER 8,000 LKR</span>
      </div>

      <header className="site-header">
        <div className="container header-row">
          {/* Brand Logo */}
          <Link to="/" className="brand-link">
            <span>ELIX</span>
            <span className="brand-badge">2026</span>
          </Link>

          {/* Desktop Primary Nav */}
          <nav className="header-nav" aria-label="Primary navigation">
            <Link
              to="/"
              className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`nav-item ${location.pathname === '/shop' ? 'active' : ''}`}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}
            >
              About
            </Link>
            <Link
              to="/size-guide"
              className={`nav-item ${location.pathname === '/size-guide' ? 'active' : ''}`}
            >
              Size Guide
            </Link>
            <Link
              to="/contact"
              className={`nav-item ${location.pathname === '/contact' ? 'active' : ''}`}
            >
              Contact
            </Link>
            {isMasterAdmin && (
              <Link
                to="/admin"
                className={`nav-item nav-admin-pill ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                <span className="nav-admin-icon">🛡️</span> Admin Console
              </Link>
            )}
          </nav>

          {/* Header Actions (Cart, User, 3-Dots Menu) */}
          <div className="header-actions">
            {/* Cart Icon Button */}
            <Link
              to="/cart"
              className="cart-button-link"
              aria-label={`Cart with ${totalItemsCount} items`}
            >
              <span>🛍️</span>
              {totalItemsCount > 0 && (
                <span className="cart-badge-count">{totalItemsCount}</span>
              )}
            </Link>

            {/* User Auth Profile / Login Button */}
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
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`}
                    alt={user.name}
                    className="user-avatar-mini"
                  />
                  <span className="user-nav-name">{user.name.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>▾</span>
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-popover">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-name">{user.name}</div>
                      <div className="user-dropdown-role">{user.role || 'ELIX Member'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {user.points ? `⭐ ${user.points} Reward Points` : user.email}
                      </div>
                    </div>

                    <Link
                      to="/cart"
                      className="user-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span>🛍️</span> My Bag ({totalItemsCount})
                    </Link>
                    <Link
                      to="/shop"
                      className="user-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span>🔥</span> Exclusive Drops
                    </Link>
                    {isMasterAdmin && (
                      <Link
                        to="/admin"
                        className="user-dropdown-item"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ color: '#38bdf8' }}
                      >
                        <span>🛡️</span> Admin Console ({registeredCount})
                      </Link>
                    )}
                    <button
                      type="button"
                      className="user-dropdown-item"
                      onClick={handleLogout}
                      style={{ color: '#f87171' }}
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm desktop-signin-btn">
                <span>👤</span> Sign In
              </Link>
            )}

            {/* 3-Dots Corner Menu Button */}
            <div className="dots-menu-wrapper" ref={dotsMenuRef}>
              <button
                type="button"
                className={`dots-menu-toggle-btn ${dotsMenuOpen ? 'active' : ''}`}
                aria-label="Toggle navigation menu"
                aria-expanded={dotsMenuOpen}
                aria-haspopup="true"
                onClick={() => setDotsMenuOpen(!dotsMenuOpen)}
                title="Navigation Menu"
              >
                <span className="dots-icon-symbol">⋮</span>
              </button>

              {/* 3-Dots Dropdown Popover Menu */}
              {dotsMenuOpen && (
                <div className="dots-menu-popover" role="menu">
                  {/* Top Branding Section */}
                  <div className="dots-menu-header">
                    <div>
                      <div className="dots-menu-title">ELIX</div>
                      <div className="dots-menu-sub">STREETWEAR ATELIER</div>
                    </div>
                    <span className="dots-edition-badge">2026-LIVE</span>
                  </div>

                  {/* Primary Navigation Links */}
                  <nav className="dots-menu-links">
                    <Link
                      to="/"
                      className={`dots-menu-link ${location.pathname === '/' ? 'active' : ''}`}
                      onClick={() => setDotsMenuOpen(false)}
                    >
                      <span className="dots-link-label">
                        <span className="dots-link-icon">🏠</span> Home
                      </span>
                      <span className="dots-link-arrow">→</span>
                    </Link>

                    <Link
                      to="/shop"
                      className={`dots-menu-link ${location.pathname === '/shop' ? 'active' : ''}`}
                      onClick={() => setDotsMenuOpen(false)}
                    >
                      <span className="dots-link-label">
                        <span className="dots-link-icon">🔥</span> Shop All Collections
                      </span>
                      <span className="dots-link-arrow">→</span>
                    </Link>

                    <Link
                      to="/about"
                      className={`dots-menu-link ${location.pathname === '/about' ? 'active' : ''}`}
                      onClick={() => setDotsMenuOpen(false)}
                    >
                      <span className="dots-link-label">
                        <span className="dots-link-icon">⚡</span> About ELIX
                      </span>
                      <span className="dots-link-arrow">→</span>
                    </Link>

                    <Link
                      to="/size-guide"
                      className={`dots-menu-link ${location.pathname === '/size-guide' ? 'active' : ''}`}
                      onClick={() => setDotsMenuOpen(false)}
                    >
                      <span className="dots-link-label">
                        <span className="dots-link-icon">📏</span> Size Guide
                      </span>
                      <span className="dots-link-arrow">→</span>
                    </Link>

                    <Link
                      to="/contact"
                      className={`dots-menu-link ${location.pathname === '/contact' ? 'active' : ''}`}
                      onClick={() => setDotsMenuOpen(false)}
                    >
                      <span className="dots-link-label">
                        <span className="dots-link-icon">💬</span> Contact & Support
                      </span>
                      <span className="dots-link-arrow">→</span>
                    </Link>

                    <Link
                      to="/cart"
                      className={`dots-menu-link ${location.pathname === '/cart' ? 'active' : ''}`}
                      onClick={() => setDotsMenuOpen(false)}
                    >
                      <span className="dots-link-label">
                        <span className="dots-link-icon">🛍️</span> Shopping Bag
                      </span>
                      {totalItemsCount > 0 ? (
                        <span className="dots-cart-badge">{totalItemsCount}</span>
                      ) : (
                        <span className="dots-link-arrow">→</span>
                      )}
                    </Link>

                    {/* Admin Panel Link (Only visible to Admin) */}
                    {isMasterAdmin && (
                      <>
                        <div className="dots-menu-divider" />
                        <Link
                          to="/admin"
                          className={`dots-menu-link admin-highlight-link ${location.pathname === '/admin' ? 'active' : ''}`}
                          onClick={() => setDotsMenuOpen(false)}
                        >
                          <span className="dots-link-label">
                            <span className="dots-link-icon">🛡️</span> Admin Console
                          </span>
                          <span className="dots-admin-badge">{registeredCount} Users</span>
                        </Link>
                      </>
                    )}
                  </nav>

                  {/* Account / User Section in 3-Dots Menu */}
                  <div className="dots-user-footer">
                    {user ? (
                      <div className="dots-user-card">
                        <div className="dots-user-info">
                          <img
                            src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`}
                            alt={user.name}
                            className="dots-user-avatar"
                          />
                          <div className="dots-user-text">
                            <div className="dots-user-name">{user.name}</div>
                            <div className="dots-user-role">{user.role || 'ELIX Member'}</div>
                            {user.points && (
                              <div className="dots-user-points">⭐ {user.points} pts</div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="dots-signout-btn"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="dots-auth-actions">
                        <Link
                          to="/login"
                          className="btn btn-primary btn-sm btn-full"
                          onClick={() => setDotsMenuOpen(false)}
                        >
                          Sign In / Register
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default NavBar;
