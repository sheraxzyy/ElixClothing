import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../services/productService';
import { ShieldCheck, Truck, CreditCard, Banknote, Zap, ArrowRight } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('Colombo');
  const [postalCode, setPostalCode] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'mintpay'>('cod');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const isFreeShipping = subtotal >= 8000;
  const shippingCost = isFreeShipping ? 0 : 450;
  const finalTotal = subtotal + shippingCost;

  if (!cartItems.length) {
    return (
      <main className="page-shell">
        <section className="section">
          <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
            <h1 className="page-heading">Your Bag is Empty</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
              Add some oversized pieces to your cart before proceeding to checkout.
            </p>
            <Link to="/shop" className="btn btn-glow luxury-hover">
              Go to Shop →
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order dispatch latency
    await new Promise((res) => setTimeout(res, 1000));

    clearCart();
    setIsProcessing(false);
    addToast({
      title: 'Order Dispatched! 🎉',
      message: `Thank you, ${fullName}! Your tracking number has been sent to ${email}.`,
      type: 'success',
      duration: 6000,
    });
    navigate('/shop');
  };

  return (
    <main className="page-shell">
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: '2rem' }} className="animate-fade-in-up">
            <h1 className="page-heading">EXPRESS CHECKOUT</h1>
            <p className="text-muted">Fast, secure islandwide delivery across Sri Lanka.</p>
          </div>

          <div className="checkout-layout">
            {/* Form Column */}
            <div className="glass-card luxury-border-glow">
              <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={18} color="var(--accent-purple)" /> 1. Contact & Shipping Info
                  </h3>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="fullName">Full Name</label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="form-control"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@example.com"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="phone">Mobile Number</label>
                        <input
                          id="phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+94 77 123 4567"
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="address">Delivery Address</label>
                      <input
                        id="address"
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street address, Apartment / House number"
                        className="form-control"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="city">City / District</label>
                        <input
                          id="city"
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Colombo, Kandy, Galle, etc."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="postalCode">Postal Code</label>
                        <input
                          id="postalCode"
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="00100"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="var(--accent-cyan)" /> 2. Payment Method
                  </h3>

                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: paymentMethod === 'cod' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)', border: paymentMethod === 'cod' ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>Cash on Delivery (Islandwide)</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pay safely in cash when your package is delivered</div>
                      </div>
                      <Banknote size={20} color="var(--accent-emerald)" />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: paymentMethod === 'mintpay' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)', border: paymentMethod === 'mintpay' ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mintpay"
                        checked={paymentMethod === 'mintpay'}
                        onChange={() => setPaymentMethod('mintpay')}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>Mintpay / Koko (Pay in 3 Installments)</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>0% interest monthly installment plan</div>
                      </div>
                      <Zap size={20} color="var(--accent-amber)" />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: paymentMethod === 'card' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)', border: paymentMethod === 'card' ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>Credit / Debit Card</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visa, MasterCard, Amex SSL 256-bit secure gateway</div>
                      </div>
                      <CreditCard size={20} color="var(--accent-cyan)" />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-glow btn-lg btn-full luxury-hover"
                  disabled={isProcessing}
                  style={{ marginTop: '1rem' }}
                >
                  {isProcessing ? 'Confirming Order…' : `Place Order · ${formatPrice(finalTotal)}`}
                </button>
              </form>
            </div>

            {/* Sidebar Summary */}
            <aside className="glass-card luxury-border-glow" style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Your Items ({cartItems.length})</h3>

              <div style={{ display: 'grid', gap: '0.85rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.25rem' }}>
                {cartItems.map((item) => {
                  const itemImg = (item.images && item.images[0]) || (item as any).imageUrl || '/images/products/remorse-tee.jpg';
                  return (
                    <div key={item.id} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                      <img src={itemImg} alt={item.name} style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{item.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} · Size {item.size || 'L'}</div>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'grid', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Courier Delivery</span>
                  <span>{isFreeShipping ? <strong style={{ color: '#34d399' }}>FREE</strong> : formatPrice(shippingCost)}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> 256-Bit SSL Encrypted Checkout
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CheckoutPage;
