import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

function Footer() {
  const { addToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    addToast({
      title: 'VIP Access Granted!',
      message: 'Use code ELIX15 at checkout for 15% off your first order.',
      type: 'success',
    });
    setNewsletterEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & Newsletter Column */}
          <div className="footer-brand">
            <h3>ELIX</h3>
            <p>
              Engineered in Sri Lanka. Bold oversized silhouettes, 220 GSM heavyweight combed cotton, and unapologetic streetwear attitude.
            </p>

            <form onSubmit={handleNewsletter} style={{ marginTop: '1.5rem', maxWidth: '360px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
                Join the ELIX VIP Club
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="form-control"
                  style={{ padding: '0.7rem 1rem', fontSize: '0.88rem' }}
                />
                <button type="submit" className="btn btn-glow btn-sm" style={{ flexShrink: 0 }}>
                  Join
                </button>
              </div>
              {subscribed && (
                <div style={{ color: 'var(--accent-cyan)', fontSize: '0.78rem', marginTop: '0.4rem' }}>
                  ✓ You're on the early access drop list!
                </div>
              )}
            </form>
          </div>

          {/* Shop Links */}
          <div className="footer-col">
            <h4>Collections</h4>
            <ul className="footer-links">
              <li><Link to="/shop">All Streetwear</Link></li>
              <li><Link to="/shop">Oversized Heavy Tees</Link></li>
              <li><Link to="/shop">Shadow Editions</Link></li>
              <li><Link to="/shop">Limited Drops</Link></li>
              <li><Link to="/size-guide">Fit & Size Guide</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul className="footer-links">
              <li><Link to="/contact">Islandwide Courier</Link></li>
              <li><Link to="/contact">Track Order</Link></li>
              <li><Link to="/contact">Returns & Exchange</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
              <li><Link to="/login">My Account</Link></li>
            </ul>
          </div>

          {/* Brand & Community */}
          <div className="footer-col">
            <h4>Atelier</h4>
            <ul className="footer-links">
              <li><Link to="/about">Our Story & Craft</Link></li>
              <li><Link to="/about">Fabric & Sustainability</Link></li>
              <li><a href="#featured" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Lookbook 2026</a></li>
              <li><Link to="/login">VIP Member Perks</Link></li>
              <li><Link to="/admin" style={{ color: '#38bdf8' }}>🛡️ Admin Panel</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} ELIX Streetwear Atelier. All rights reserved.
          </div>
          <div className="footer-badges">
            <span className="footer-badge-pill">🔒 SSL Secured</span>
            <span className="footer-badge-pill">🚚 Islandwide Delivery</span>
            <span className="footer-badge-pill">🔄 14-Day Exchanges</span>
          </div>
          <div>
            <button
              type="button"
              onClick={scrollToTop}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
