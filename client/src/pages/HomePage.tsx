import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, formatPrice } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Product } from '../types';
import { Sparkles, Heart, ShoppingBag, ArrowRight, ShieldCheck, Flame, Star, Layers, Scissors, CheckCircle2 } from 'lucide-react';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProducts();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Failed to load products:', err);
      }
    };
    load();
  }, []);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, 'L', 'Black');
    addToast({
      title: 'Added to Bag',
      message: `${product.name} (Size L) added to your cart.`,
      type: 'cart',
    });
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = !wishlist[productId];
    setWishlist((prev) => ({ ...prev, [productId]: isLiked }));
    if (isLiked) {
      addToast({
        title: 'Saved to Wishlist',
        message: 'Item saved to your personal collection.',
        type: 'info',
      });
    }
  };

  const categories = ['All', 'Best Sellers', 'New Drops', 'Oversized'];

  const filteredProducts = products.filter((p: any) => {
    if (activeCategory === 'Best Sellers') return Boolean(p.isBestSeller || p.bestSeller);
    if (activeCategory === 'New Drops') return Boolean(p.isFeatured || p.featured);
    if (activeCategory === 'Oversized') return p.category === 'T-Shirts' || !p.category;
    return true;
  });

  const featuredHeroProduct = products[0] || {
    name: 'REMORSE Graphic Tee',
    price: 3000,
    slug: 'elix-remorse-tee',
    images: ['/images/products/remorse-tee.jpg'],
  };

  const heroImageSrc = (featuredHeroProduct as any).imageUrl ||
    (featuredHeroProduct.images && (featuredHeroProduct.images[0] as any)?.url) ||
    (featuredHeroProduct.images && featuredHeroProduct.images[0]) ||
    '/images/products/remorse-tee.jpg';

  return (
    <main>
      {/* Hero Section */}
      <section className="section hero-wrapper">
        <div className="container">
          <div className="hero-grid">
            {/* Left Copy */}
            <div className="animate-fade-in-up">
              <div className="hero-badge-live">
                <span className="pulse-dot" />
                <span className="font-mono">2026-LIVE ATELIER</span>
              </div>

              <h1 className="hero-heading">
                WEAR YOUR <span className="gradient-text luxury-shimmer">ATTITUDE.</span>
              </h1>

              <p className="hero-desc">
                ELIX redefines island streetwear with uncompromising 220 GSM heavyweight combed cotton t-shirts, tailored oversized silhouettes, and high-impact graphic art crafted for the bold.
              </p>

              <div className="hero-cta-group">
                <Link to="/shop" className="btn btn-glow btn-lg luxury-hover">
                  Explore T-Shirts Collection <ArrowRight size={18} style={{ marginLeft: '0.4rem', display: 'inline-block' }} />
                </Link>
                <Link to="/about" className="btn btn-outline btn-lg luxury-hover">
                  The Atelier
                </Link>
              </div>

              {/* Live Metric Counter */}
              <div className="hero-stats-row">
                <div className="stat-item">
                  <h4>220 GSM</h4>
                  <p>Combed Heavyweight Cotton</p>
                </div>
                <div className="stat-item">
                  <h4>100%</h4>
                  <p>Pure T-Shirt Label</p>
                </div>
                <div className="stat-item">
                  <h4 style={{ color: 'var(--accent-cyan)' }}>LKR 3,000</h4>
                  <p>Flat Exclusive Pricing</p>
                </div>
              </div>
            </div>

            {/* Right Visual 3D Tilt Card */}
            <div className="hero-visual-card animate-float">
              <div className="hero-image-wrap luxury-glow-card">
                <img
                  src={heroImageSrc}
                  alt="ELIX 2026-Live Exclusive Streetwear Tee"
                />
                <div className="hero-image-gradient" />
                <div className="hero-card-floating-badge">
                  <Sparkles size={14} style={{ marginRight: '0.35rem' }} />
                  <span>2026-LIVE DROP</span>
                </div>
                <div className="hero-card-bottom-info">
                  <div>
                    <div className="hero-card-tag">Heavyweight 220 GSM</div>
                    <h3 className="hero-card-title">{featuredHeroProduct.name}</h3>
                    <div className="hero-card-price">{formatPrice(featuredHeroProduct.price || 3000)}</div>
                  </div>
                  <Link
                    to={`/product/${featuredHeroProduct.slug || 'elix-remorse-tee'}`}
                    className="btn btn-primary btn-sm luxury-hover"
                  >
                    View Drop
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee Ticker Strip */}
      <section className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          {[...Array(2)].map((_, groupIdx) => (
            <React.Fragment key={groupIdx}>
              <span className="marquee-item">
                HEAVYWEIGHT 220 GSM <span className="marquee-separator">✦</span>
              </span>
              <span className="marquee-item">
                100% COMBED COTTON TEES <span className="marquee-separator">✦</span>
              </span>
              <span className="marquee-item">
                2026-LIVE DROP <span className="marquee-separator">✦</span>
              </span>
              <span className="marquee-item">
                OVERSIZED SILHOUETTE <span className="marquee-separator">✦</span>
              </span>
              <span className="marquee-item">
                ISLANDWIDE DELIVERY <span className="marquee-separator">✦</span>
              </span>
              <span className="marquee-item">
                FLAT LKR 3,000 <span className="marquee-separator">✦</span>
              </span>
              <span className="marquee-item">
                WEAR YOUR ATTITUDE <span className="marquee-separator">✦</span>
              </span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Featured Collection Grid */}
      <section className="section" id="featured">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Exclusive 2026-Live Drops
              </div>
              <h2 className="section-title">HEAVYWEIGHT T-SHIRTS</h2>
            </div>
            <Link to="/shop" className="btn btn-outline btn-sm luxury-hover">
              View All T-Shirts ({products.length}) →
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="product-grid">
            {filteredProducts.map((product) => {
              const pImg = (product as any).imageUrl ||
                (product.images && (product.images[0] as any)?.url) ||
                (product.images && product.images[0]) ||
                '/images/products/remorse-tee.jpg';

              return (
                <article key={product.id} className="product-card group">
                  <div className="product-image-container">
                    {(product.bestSeller || (product as any).isBestSeller) && (
                      <span className="product-card-badge">
                        <Flame size={12} style={{ display: 'inline', marginRight: '3px' }} /> BESTSELLER
                      </span>
                    )}
                    <button
                      type="button"
                      className={`wishlist-button ${wishlist[product.id] ? 'active' : ''}`}
                      onClick={(e) => toggleWishlist(product.id, e)}
                      aria-label="Save to wishlist"
                    >
                      <Heart size={16} fill={wishlist[product.id] ? '#ec4899' : 'none'} color={wishlist[product.id] ? '#ec4899' : '#ffffff'} />
                    </button>
                    <Link to={`/product/${product.slug || product.id}`}>
                      <img
                        src={pImg}
                        alt={product.name}
                        loading="lazy"
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </div>

                  <div className="product-card-body">
                    <div className="product-category-label">220 GSM Heavyweight Tee</div>
                    <Link to={`/product/${product.slug || product.id}`}>
                      <h3 className="product-card-title">{product.name}</h3>
                    </Link>
                    <p className="product-card-desc">{product.description}</p>

                    <div className="product-card-footer">
                      <div className="product-price-tag">
                        {formatPrice(product.price)}
                      </div>
                      <button
                        type="button"
                        className="btn-quick-add luxury-hover"
                        onClick={(e) => handleQuickAdd(product, e)}
                      >
                        <ShoppingBag size={14} style={{ marginRight: '4px' }} /> Quick Add
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lookbook / Streetwear Craft Banner */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="lookbook-banner luxury-border-glow">
            <div className="lookbook-grid">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  The Architecture of Fit
                </div>
                <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '1.2rem' }}>
                  220 GSM COMBED COTTON. CRAFTED TO DRAPE.
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  Every ELIX graphic t-shirt starts with custom-milled 220 GSM 100% combed cotton. We engineer drop-shoulder seams and calibrated boxy silhouettes that hold their bold form wash after wash in island weather.
                </p>

                <div className="spec-list">
                  <div className="spec-item">
                    <div className="spec-icon">
                      <Layers size={22} color="var(--accent-purple)" />
                    </div>
                    <div className="spec-text">
                      <h4>220 GSM Combed Cotton</h4>
                      <p>Ultra-dense, breathable heavyweight weave built for all-day streetwear drape and tropical comfort.</p>
                    </div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-icon">
                      <Scissors size={22} color="var(--accent-cyan)" />
                    </div>
                    <div className="spec-text">
                      <h4>Engineered Oversized Proportion</h4>
                      <p>Dropped shoulders, wider chest girth, and calibrated body length for clean streetwear drape.</p>
                    </div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-icon">
                      <ShieldCheck size={22} color="var(--accent-pink)" />
                    </div>
                    <div className="spec-text">
                      <h4>High-Density Screen Prints</h4>
                      <p>Silicone and high-definition screen prints tested to endure 100+ machine washes without peeling or fading.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '420px', border: '1px solid var(--border-medium)' }}>
                <img
                  src="/images/products/sinner-tee.jpg"
                  alt="Streetwear Lookbook Details"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Reviews Grid */}
      <section className="section" style={{ background: 'rgba(10, 12, 18, 0.6)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Word On The Street
            </div>
            <h2 className="section-title">VERIFIED COLLECTORS</h2>
            <p className="section-subtitle" style={{ margin: '0.5rem auto 0' }}>
              Real feedback on our 220 GSM heavyweight t-shirts across Sri Lanka.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
            {[
              {
                name: 'Dinuka Senanayake',
                role: 'Verified Buyer · Colombo',
                review: 'The 220 GSM cotton weight is perfect. Best oversized graphic tee fit in Sri Lanka. Holds its collar and structure completely.',
                item: 'REMORSE Graphic Tee (Black / XL)',
              },
              {
                name: 'Sarah Mendis',
                role: 'Verified Buyer · Kandy',
                review: 'Super clean packaging and arrived in 48 hours! The graphic details on the SINNER tee are phenomenal.',
                item: 'SINNER Gothic Angel Tee (Black / M)',
              },
              {
                name: 'Rohan Jayawardena',
                role: 'Verified Buyer · Galle',
                review: 'The 220 GSM fabric thickness is 10/10. Flat LKR 3,000 price for this quality is unbeatable.',
                item: 'ARACHNID Tribal Spider Tee (White / L)',
              },
            ].map((rev, i) => (
              <div key={i} className="glass-card luxury-card-interactive" style={{ padding: '1.75rem' }}>
                <div style={{ color: 'var(--accent-amber)', display: 'flex', gap: '2px', marginBottom: '0.75rem' }}>
                  {[...Array(5)].map((_, sIdx) => (
                    <Star key={sIdx} size={16} fill="var(--accent-amber)" color="var(--accent-amber)" />
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                  "{rev.review}"
                </p>
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {rev.name} <CheckCircle2 size={13} color="var(--accent-cyan)" />
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rev.role}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {rev.item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Early Access CTA Section */}
      <section className="section">
        <div className="container">
          <div className="glass-card glass-card-glow luxury-border-glow" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <span className="hero-badge-live" style={{ margin: '0 auto 1.25rem' }}>
              <Sparkles size={14} style={{ marginRight: '0.35rem' }} /> 2026-LIVE VIP PASS
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', marginBottom: '1rem' }}>
              GET ACCESS TO 2026-LIVE DROPS
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '36rem', margin: '0 auto 2rem', fontSize: '1.05rem', lineHeight: 1.8 }}>
              Sign in or create your ELIX account to unlock secret drops, accumulate reward points, and checkout faster.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-glow btn-lg luxury-hover">
                Sign In / Create Account
              </Link>
              <Link to="/shop" className="btn btn-outline btn-lg luxury-hover">
                Browse T-Shirts Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
