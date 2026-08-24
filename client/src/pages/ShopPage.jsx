import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, formatPrice } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('priority');
  const [wishlist, setWishlist] = useState({});

  const { addToCart } = useCart();
  const { addToast } = useToast();

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load products from database:', err);
      setError(
        err.response?.data?.message ||
        'Cannot connect to PostgreSQL database. Please ensure backend server is running and database is accessible.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleQuickAdd = (product, e) => {
    e.stopPropagation();
    addToCart(product, 1);
    addToast({
      title: 'Added to Bag',
      message: `${product.name} added to your cart.`,
      type: 'cart',
    });
  };

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const updated = !prev[id];
      if (updated) {
        addToast({
          title: 'Wishlist Updated',
          message: 'Saved item to your favorites.',
          type: 'info',
        });
      }
      return { ...prev, [id]: updated };
    });
  };

  const categories = ['All T-Shirts', 'Best Sellers', '2026-Live Drops'];

  // Filter & Sort logic
  const filteredProducts = products
    .filter((p) => {
      const name = p.name || '';
      const desc = p.description || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCat = true;
      if (selectedCategory === 'Best Sellers') matchesCat = Boolean(p.isBestSeller || p.bestSeller);
      if (selectedCategory === '2026-Live Drops') matchesCat = Boolean(p.isFeatured || p.featured);

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-high') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      // Default: priority ascending (1 is top priority), then newest
      return (Number(a.priority) || 0) - (Number(b.priority) || 0);
    });

  return (
    <main className="page-shell">
      {/* Header Banner */}
      <section className="section" style={{ paddingBottom: '1.5rem' }}>
        <div className="container">
          <div style={{ maxWidth: '720px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              2026-LIVE COLLECTION
            </div>
            <h1 className="page-heading">220 GSM HEAVYWEIGHT T-SHIRTS</h1>
            <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
              Explore our pure collection of oversized streetwear graphic tees. Synchronized live from our PostgreSQL database with custom boxy drape, priority ordering, and high-density artwork.
            </p>
          </div>

          {/* Search and Sort Toolbar */}
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: 'min(380px, 100%)' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Search t-shirts, graphics, sizes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.8rem' }}
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map((cat) => {
                const isActive = (cat === 'All T-Shirts' && selectedCategory === 'All') || selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat === 'All T-Shirts' ? 'All' : cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-control"
                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="priority">Priority Order</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Database Error Banner */}
      {error && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <strong style={{ color: '#f87171', display: 'block', marginBottom: '0.25rem' }}>
                  ⚠️ Database Connection Issue
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {error}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-glow"
                onClick={loadProducts}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
              >
                🔄 Retry Database Query
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <p style={{ color: 'var(--text-muted)' }}>Fetching live streetwear pieces from PostgreSQL database…</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👕</div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Streetwear Found</h2>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                {error ? 'Could not load products from database.' : 'Try adjusting your search query or filters.'}
              </p>
              {error ? (
                <button type="button" className="btn btn-glow" onClick={loadProducts}>
                  Retry Connection
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-glow"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const isFav = wishlist[product.id];
                const imageSrc = product.imageUrl || (product.images && product.images[0]?.url) || (product.images && product.images[0]) || '/assets/placeholder-1.jpg';
                const productSlug = product.slug || product.id;

                return (
                  <article key={product.id} className="product-card">
                    {/* Badge */}
                    <div className="product-badge-wrap">
                      {product.isFeatured && <span className="product-badge badge-featured">LIVE DROP</span>}
                      {product.isBestSeller && <span className="product-badge badge-bestseller">BESTSELLER</span>}
                      {product.priority !== undefined && (
                        <span className="product-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                          P{product.priority}
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      className={`wishlist-btn ${isFav ? 'active' : ''}`}
                      onClick={(e) => toggleWishlist(product.id, e)}
                      aria-label="Add to wishlist"
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>

                    {/* Thumbnail Image */}
                    <Link to={`/product/${productSlug}`} className="product-img-wrap">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        loading="lazy"
                      />
                    </Link>

                    {/* Content */}
                    <div className="product-info">
                      <div className="product-meta">
                        <span className="product-category">{product.category || '220 GSM Streetwear'}</span>
                        <span className="product-rating">★ {product.rating || '5.0'}</span>
                      </div>

                      <h3 className="product-title">
                        <Link to={`/product/${productSlug}`}>{product.name}</Link>
                      </h3>

                      <p className="product-description-snippet">
                        {product.description}
                      </p>

                      <div className="product-footer">
                        <div className="product-price">
                          {formatPrice(product.price)}
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => handleQuickAdd(product, e)}
                        >
                          Quick Add
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ShopPage;
