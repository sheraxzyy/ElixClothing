import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, getProductBySlug } from '../services/productService';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductBySlug(id);
        if (data) {
          setProduct(data);
          if (data.sizes?.length) {
            setSelectedSize(data.sizes[0].size || 'L');
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Failed to load product from database:', err);
        setError(
          err.response?.data?.message ||
          'Failed to load product details from PostgreSQL database.'
        );
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="page-shell">
        <section className="section">
          <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <p className="text-muted">Loading product from PostgreSQL database…</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="page-shell">
        <section className="section">
          <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
            <h1 className="page-heading">Product Not Found</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
              {error || "The streetwear piece you're looking for is either sold out or no longer available in the database."}
            </p>
            <Link to="/shop" className="btn btn-glow">
              Explore All Drops
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // Aggregate images: primary imageUrl first, then additional images
  const allImages = [
    product.imageUrl,
    ...(product.images || []).map((img) => (typeof img === 'string' ? img : img.url)),
  ].filter(Boolean);

  const currentImage = allImages[selectedImg] || allImages[0] || '/assets/placeholder-1.jpg';

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    addToast({
      title: 'Added to Bag',
      message: `${quantity}x ${product.name} (Size ${selectedSize}) added to your bag.`,
      type: 'cart',
    });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize);
    navigate('/checkout');
  };

  const availableSizes = product.sizes && product.sizes.length > 0
    ? product.sizes.map((s) => s.size)
    : ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <main className="page-shell">
      <section className="section">
        <div className="container">
          {/* Breadcrumbs */}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
            <Link to="/" style={{ color: 'var(--text-dim)' }}>Home</Link> /
            <Link to="/shop" style={{ color: 'var(--text-dim)' }}>Shop</Link> /
            <span style={{ color: '#fff' }}>{product.name}</span>
          </div>

          <div className="product-detail-grid">
            {/* Gallery Column */}
            <div className="product-gallery-side">
              <div className="product-main-img-wrap">
                <img
                  src={currentImage}
                  alt={product.name}
                />
              </div>

              {allImages.length > 1 && (
                <div className="product-thumbs-row">
                  {allImages.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`product-thumb-btn ${selectedImg === index ? 'active' : ''}`}
                      onClick={() => setSelectedImg(index)}
                    >
                      <img src={imgUrl} alt={`${product.name} thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Column */}
            <div className="product-content-side">
              <div className="product-header-meta">
                <span className="brand-badge">2026-LIVE DROP</span>
                {product.priority !== undefined && (
                  <span className="brand-badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    PRIORITY #{product.priority}
                  </span>
                )}
                <span className="product-rating">★ {product.rating || '5.0'} ({product.numReviews || 12} reviews)</span>
              </div>

              <h1 className="product-main-title">{product.name}</h1>
              <div className="product-main-price">{formatPrice(product.price)}</div>

              <p className="product-main-desc">
                {product.description}
              </p>

              {/* Size Selector */}
              <div className="product-option-block">
                <div className="option-header">
                  <span className="option-title">Select Size:</span>
                  <button
                    type="button"
                    className="size-guide-trigger"
                    onClick={() => setSizeGuideOpen(true)}
                  >
                    📏 Size Chart
                  </button>
                </div>

                <div className="size-pill-grid">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`size-pill ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="product-option-block">
                <span className="option-title">Quantity:</span>
                <div className="quantity-counter">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="product-actions-group">
                <button
                  type="button"
                  className="btn btn-glow btn-full"
                  onClick={handleAddToCart}
                >
                  Add to Bag
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={handleBuyNow}
                >
                  Buy Now — Fast Checkout
                </button>
              </div>

              {/* Tabs for specs */}
              <div className="product-tabs-wrap" style={{ marginTop: '2rem' }}>
                <div className="product-tabs-nav">
                  <button
                    type="button"
                    className={`product-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('specs')}
                  >
                    Garment Specs
                  </button>
                  <button
                    type="button"
                    className={`product-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
                    onClick={() => setActiveTab('care')}
                  >
                    Care Instructions
                  </button>
                  <button
                    type="button"
                    className={`product-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shipping')}
                  >
                    Shipping & Returns
                  </button>
                </div>

                <div className="product-tab-content">
                  {activeTab === 'specs' && (
                    <div className="tab-pane">
                      <p>• <strong>Fabric:</strong> 220 GSM 100% Combed Compact Cotton</p>
                      <p>• <strong>Fit:</strong> Signature Boxy Oversized Silhouette with dropped shoulders</p>
                      <p>• <strong>Collar:</strong> 1.25" thick ribbed lycra collar that won't sag</p>
                      <p>• <strong>Print:</strong> High-density puff screen print / breathable pigment</p>
                      <p>• <strong>Origin:</strong> Precision engineered in Sri Lanka</p>
                    </div>
                  )}
                  {activeTab === 'care' && (
                    <div className="tab-pane">
                      <p>• Cold machine wash inside out (30°C max)</p>
                      <p>• Do not tumble dry — hang dry in shade</p>
                      <p>• Iron inside-out on low heat; avoid direct contact with graphic artwork</p>
                      <p>• Do not bleach or dry clean</p>
                    </div>
                  )}
                  {activeTab === 'shipping' && (
                    <div className="tab-pane">
                      <p>• <strong>Colombo & Suburbs:</strong> Next-day delivery</p>
                      <p>• <strong>Islandwide:</strong> 2–3 business days via prompt courier</p>
                      <p>• <strong>Returns:</strong> 7-day hassle-free size exchange</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="glass-card" style={{ maxWidth: '580px', width: '90%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>220 GSM Oversized Tee Size Chart (Inches)</h3>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <table className="size-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '0.75rem' }}>Size</th>
                  <th style={{ padding: '0.75rem' }}>Chest</th>
                  <th style={{ padding: '0.75rem' }}>Length</th>
                  <th style={{ padding: '0.75rem' }}>Shoulder</th>
                  <th style={{ padding: '0.75rem' }}>Sleeve</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>S</td>
                  <td style={{ padding: '0.75rem' }}>42"</td>
                  <td style={{ padding: '0.75rem' }}>28"</td>
                  <td style={{ padding: '0.75rem' }}>20"</td>
                  <td style={{ padding: '0.75rem' }}>8.5"</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>M</td>
                  <td style={{ padding: '0.75rem' }}>44"</td>
                  <td style={{ padding: '0.75rem' }}>29"</td>
                  <td style={{ padding: '0.75rem' }}>21"</td>
                  <td style={{ padding: '0.75rem' }}>9.0"</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>L</td>
                  <td style={{ padding: '0.75rem' }}>46"</td>
                  <td style={{ padding: '0.75rem' }}>30"</td>
                  <td style={{ padding: '0.75rem' }}>22"</td>
                  <td style={{ padding: '0.75rem' }}>9.5"</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>XL</td>
                  <td style={{ padding: '0.75rem' }}>48"</td>
                  <td style={{ padding: '0.75rem' }}>31"</td>
                  <td style={{ padding: '0.75rem' }}>23"</td>
                  <td style={{ padding: '0.75rem' }}>10.0"</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>XXL</td>
                  <td style={{ padding: '0.75rem' }}>50"</td>
                  <td style={{ padding: '0.75rem' }}>32"</td>
                  <td style={{ padding: '0.75rem' }}>24"</td>
                  <td style={{ padding: '0.75rem' }}>10.5"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProductPage;
