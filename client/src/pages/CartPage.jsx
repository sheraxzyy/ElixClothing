import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../services/productService';

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const FREE_SHIPPING_THRESHOLD = 8000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const discountAmount = (subtotal * discountPercent) / 100;
  const shippingCost = isFreeShipping ? 0 : (cartItems.length ? 450 : 0);
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.trim().toUpperCase() === 'ELIX15') {
      setDiscountPercent(15);
      setAppliedCoupon('ELIX15');
      addToast({
        title: 'Coupon Applied!',
        message: '15% VIP discount applied to your order.',
        type: 'success',
      });
      setCouponCode('');
    } else {
      addToast({
        title: 'Invalid Coupon',
        message: 'Try using code "ELIX15" for 15% off.',
        type: 'error',
      });
    }
  };

  const handleRemove = (id, name) => {
    removeFromCart(id);
    addToast({
      title: 'Item Removed',
      message: `${name} removed from your bag.`,
      type: 'info',
    });
  };

  if (!cartItems.length) {
    return (
      <main className="page-shell">
        <section className="section">
          <div className="container" style={{ textAlign: 'center', padding: '4.5rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛍️</div>
            <h1 className="page-heading">Your Bag is Empty</h1>
            <p className="text-muted" style={{ maxWidth: '420px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
              Looks like you haven't added any oversized streetwear to your bag yet.
            </p>
            <Link to="/shop" className="btn btn-glow btn-lg">
              Explore Collection →
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="section">
        <div className="container">
          <h1 className="page-heading">SHOPPING BAG ({cartItems.length})</h1>

          <div className="cart-layout-grid">
            {/* Items List */}
            <div>
              {/* Free Shipping Progress Indicator */}
              <div className="shipping-progress-bar">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>
                    {isFreeShipping ? '🎉 You have unlocked FREE Express Delivery!' : `Add ${formatPrice(shippingRemaining)} more to get Free Delivery`}
                  </span>
                  <span style={{ color: 'var(--accent-purple)' }}>{Math.round(shippingProgress)}%</span>
                </div>
                <div className="shipping-bar-track">
                  <div className="shipping-bar-fill" style={{ width: `${shippingProgress}%` }} />
                </div>
              </div>

              {/* Items Card List */}
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img src={item.images[0]} alt={item.name} className="cart-item-img" />

                  <div className="cart-item-info">
                    <Link to={`/product/${item.slug || item.id}`}>
                      <h3>{item.name}</h3>
                    </Link>
                    <div className="cart-item-meta">
                      {item.category} · Oversized Fit
                    </div>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        className="qty-step-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        type="button"
                        className="qty-step-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      {formatPrice(item.price)} each
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id, item.name)}
                      style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.82rem', cursor: 'pointer', marginTop: '0.75rem', textDecoration: 'underline' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <aside className="cart-summary-box">
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Order Summary</h2>

              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="coupon-input-row">
                <input
                  type="text"
                  placeholder="Promo code (e.g. ELIX15)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="form-control"
                  style={{ padding: '0.7rem 0.9rem', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-outline btn-sm">
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: '#6ee7b7', marginBottom: '1rem' }}>
                  <span>Code <strong>{appliedCoupon}</strong> applied</span>
                  <button
                    type="button"
                    onClick={() => { setDiscountPercent(0); setAppliedCoupon(''); }}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gap: '0.85rem', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                    <span>VIP Discount (15%)</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Courier Delivery</span>
                  <span>{isFreeShipping ? <strong style={{ color: '#34d399' }}>FREE</strong> : formatPrice(shippingCost)}</span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-medium)', margin: '0.5rem 0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  <span>Estimated Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-glow btn-full btn-lg"
                style={{ marginTop: '1.75rem' }}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout →
              </button>

              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                🔒 256-Bit SSL Encrypted Checkout · Cash on Delivery Available
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CartPage;
