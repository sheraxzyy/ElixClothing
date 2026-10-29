import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, formatPrice } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Product } from '../types';
import { Search, Heart, ShoppingBag, Sparkles, Flame, Star, RefreshCw, AlertTriangle } from 'lucide-react';

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

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
    } catch (err: any) {
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

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, 'L', 'Black');
    addToast({
      title: 'Added to Bag',
      message: `${product.name} (Size L) added to your cart.`,
      type: 'cart',
    });
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
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
    .filter((p: any) => {
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
    .sort((a: any, b: any) => {
      if (sortBy === 'price-low') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-high') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
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
            {/* Search Input with Icon */}
            <div style={{ position: 'relative', width: 'min(380px, 100%)' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <AlertTriangle size={24} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#f87171', display: 'block', marginBottom: '0.25rem' }}>
                    Database Connection Notice
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {error}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-glow luxury-hover"
                onClick={loadProducts}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} /> Retry Query
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
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(255, 255, 255, 0.1)',
                  borderTopColor: 'var(--accent-purple)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 1.25rem',
                }}
              />
              <p style={{ color: 'var(--text-muted)' }}>Fetching live streetwear pieces from database…</p>
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
                const imageSrc = (product as any).imageUrl || (product.images && (product.images[0] as any)?.url) || (product.images && product.images[0]) || '/images/products/remorse-tee.jpg';
                const productSlug = product.slug || product.id;

                return (
                  <article key={product.id} className="product-card group">
                    {/* Badge */}
                    <div className="product-badge-wrap">
                      {(product.featured || (product as any).isFeatured) && (
                        <span className="product-badge badge-featured">
                          <Sparkles size={11} style={{ marginRight: '3px' }} /> LIVE DROP
                        </span>
                      )}
                      {(product.bestSeller || (product as any).isBestSeller) && (
                        <span className="product-badge badge-bestseller">
                          <Flame size={11} style={{ marginRight: '3px' }} /> BESTSELLER
                        </span>
                      )}
                      {(product as any).priority !== undefined && (
                        <span className="product-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                          P{(product as any).priority}
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      className={`wishlist-button ${isFav ? 'active' : ''}`}
                      onClick={(e) => toggleWishlist(product.id, e)}
                      aria-label="Add to wishlist"
                    >
                      <Heart size={16} fill={isFav ? '#ec4899' : 'none'} color={isFav ? '#ec4899' : '#ffffff'} />
                    </button>

                    {/* Thumbnail Image */}
                    <Link to={`/product/${productSlug}`} className="product-image-container">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        loading="lazy"
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Content */}
                    <div className="product-card-body">
                      <div className="product-category-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{product.category || '220 GSM Streetwear'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-amber)' }}>
                          <Star size={12} fill="var(--accent-amber)" /> {product.rating || '5.0'}
                        </span>
                      </div>

                      <h3 className="product-card-title">
                        <Link to={`/product/${productSlug}`}>{product.name}</Link>
                      </h3>

                      <p className="product-card-desc">
                        {product.description}
                      </p>

                      <div className="product-card-footer">
                        <div className="product-price-tag">
                          {formatPrice(product.price)}
                        </div>

                        <button
                          type="button"
                          className="btn-quick-add luxury-hover"
                          onClick={(e) => handleQuickAdd(product, e)}
                        >
                          <ShoppingBag size={13} style={{ marginRight: '4px' }} /> Quick Add
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
};

export default ShopPage;
