import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useVisualMode } from '../context/VisualModeContext';
import useSound from '../hooks/useSound';
import { formatPrice, getProductBySlug } from '../services/productService';
import { Product } from '../types';
import {
  Ruler,
  ShoppingBag,
  Zap,
  Shield,
  Sparkles,
  Star,
  ChevronRight,
  Truck,
  RotateCcw,
  Check,
  ZoomIn,
  X,
  ChevronLeft,
  Info,
  Clock,
  Layers,
  Flame,
  AlertCircle,
  Share2,
} from 'lucide-react';

// Color map for visual color swatches
const COLOR_PALETTE: Record<string, { bg: string; border: string; text: string }> = {
  'Pitch Black': { bg: '#0b0c10', border: 'rgba(255,255,255,0.25)', text: '#fff' },
  'Black': { bg: '#0b0c10', border: 'rgba(255,255,255,0.25)', text: '#fff' },
  'Chalk White': { bg: '#f5f5f7', border: 'rgba(0,0,0,0.3)', text: '#000' },
  'White': { bg: '#f5f5f7', border: 'rgba(0,0,0,0.3)', text: '#000' },
  'Vintage Charcoal': { bg: '#2b2d35', border: 'rgba(255,255,255,0.2)', text: '#fff' },
  'Vintage Smoke': { bg: '#363a45', border: 'rgba(255,255,255,0.2)', text: '#fff' },
  'Toxic Olive': { bg: '#253021', border: 'rgba(52,211,153,0.3)', text: '#fff' },
  'Default': { bg: '#181a24', border: 'rgba(255,255,255,0.2)', text: '#fff' },
};

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { isUltra } = useVisualMode();
  const { playClick, playAddToCart, playSuccess } = useSound();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery & Zoom states
  const [selectedImg, setSelectedImg] = useState<number>(0);
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoomCoords, setZoomCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  // Selection states
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [selectedColor, setSelectedColor] = useState<string>('Pitch Black');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeError, setSizeError] = useState<boolean>(false);

  // Modal & Tabs
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);
  const [sizeUnit, setSizeUnit] = useState<'inches' | 'cm'>('inches');
  const [activeTab, setActiveTab] = useState<'specs' | 'fabric' | 'shipping' | 'care'>('specs');
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  const mainImageRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getProductBySlug(id);
        if (data) {
          setProduct(data);
          if (data.sizes && data.sizes.length > 0) {
            const firstSize = typeof data.sizes[0] === 'string' ? data.sizes[0] : (data.sizes[0] as any).size || 'L';
            setSelectedSize(firstSize);
          }
          if (data.availableColors && data.availableColors.length > 0) {
            setSelectedColor(data.availableColors[0]);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err: any) {
        console.error('Failed to load product details:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Handle sticky mobile bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!actionsRef.current) return;
      const rect = actionsRef.current.getBoundingClientRect();
      if (rect.bottom < 0) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Image zoom lens tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomCoords({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  if (loading) {
    return (
      <main className="page-shell">
        <section className="section">
          <div className="container" style={{ padding: '4rem 0' }}>
            <div className="product-skeleton-grid">
              <div className="skeleton-box skeleton-gallery" />
              <div className="skeleton-details">
                <div className="skeleton-box" style={{ width: '40%', height: '24px', marginBottom: '1.5rem' }} />
                <div className="skeleton-box" style={{ width: '80%', height: '40px', marginBottom: '1rem' }} />
                <div className="skeleton-box" style={{ width: '30%', height: '32px', marginBottom: '2rem' }} />
                <div className="skeleton-box" style={{ width: '100%', height: '80px', marginBottom: '2rem' }} />
                <div className="skeleton-box" style={{ width: '100%', height: '56px', marginBottom: '1rem' }} />
              </div>
            </div>
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
            <h1 className="page-heading">Piece Not Found</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
              {error || "The streetwear drop you're looking for is either sold out or no longer active."}
            </p>
            <Link to="/shop" className="btn btn-glow luxury-hover" onClick={playClick}>
              Explore All Drops →
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // Aggregate images
  const allImages: string[] = [
    (product as any).imageUrl,
    ...(product.images || []).map((img: any) => (typeof img === 'string' ? img : img.url)),
  ].filter(Boolean);

  if (allImages.length === 0) {
    allImages.push('/images/products/remorse-tee.jpg');
  }

  const currentImage = allImages[selectedImg] || allImages[0];

  const availableSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes.map((s: any) => (typeof s === 'string' ? s : s.size || 'L'))
      : ['S', 'M', 'L', 'XL', 'XXL'];

  const availableColors =
    product.availableColors && product.availableColors.length > 0
      ? product.availableColors
      : ['Pitch Black'];

  const handleSizeSelect = (size: string) => {
    playClick();
    setSelectedSize(size);
    setSizeError(false);
  };

  const handleColorSelect = (color: string) => {
    playClick();
    setSelectedColor(color);
  };

  const handleQuantityChange = (delta: number) => {
    playClick();
    setQuantity((q) => Math.max(1, Math.min(10, q + delta)));
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      addToast({
        title: 'Size Required',
        message: 'Please select a size (S, M, L, XL, XXL) before adding to bag.',
        type: 'warning',
      });
      return;
    }

    playAddToCart();
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);

    addToast({
      title: 'Added to Bag ✨',
      message: `${quantity}x ${product.name} (Size ${selectedSize}, ${selectedColor}) placed in your bag.`,
      type: 'cart',
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      addToast({
        title: 'Size Required',
        message: 'Please choose your size before continuing to checkout.',
        type: 'warning',
      });
      return;
    }

    playSuccess();
    addToCart(product, quantity, selectedSize, selectedColor);
    navigate('/checkout');
  };

  const handleShare = () => {
    playClick();
    if (navigator.share) {
      navigator
        .share({
          title: `${product.name} — ELIX Streetwear`,
          text: product.description,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        title: 'Link Copied',
        message: 'Product link copied to clipboard.',
        type: 'info',
      });
    }
  };

  return (
    <main className="page-shell">
      <section className="section product-details-section">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="product-breadcrumb animate-fade-in" aria-label="Breadcrumb">
            <Link to="/" onClick={playClick}>Home</Link>
            <ChevronRight size={13} className="breadcrumb-arrow" />
            <Link to="/shop" onClick={playClick}>Shop</Link>
            <ChevronRight size={13} className="breadcrumb-arrow" />
            <span className="breadcrumb-current">{product.name}</span>
          </nav>

          <div className="product-detail-layout">
            {/* Gallery Column */}
            <div className="product-gallery-container">
              {/* Main Image with Hover Zoom */}
              <div
                ref={mainImageRef}
                className={`product-main-stage luxury-glow-card ${isZooming ? 'is-zoomed' : ''} ${isUltra ? 'ultra-main-stage' : 'normal-main-stage'}`}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                onClick={() => {
                  playClick();
                  setLightboxOpen(true);
                }}
                role="button"
                tabIndex={0}
                aria-label="Click to enlarge image"
              >
                <img
                  src={currentImage}
                  alt={product.name}
                  className={`product-main-img ${isUltra ? 'ultra-img-transition' : ''}`}
                  style={{
                    transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                  }}
                  loading="eager"
                />

                {/* Ultra Mode Cyber HUD Reticle */}
                {isUltra && isZooming && (
                  <div
                    className="ultra-reticle-overlay"
                    style={{
                      left: `${zoomCoords.x}%`,
                      top: `${zoomCoords.y}%`,
                    }}
                    aria-hidden="true"
                  >
                    <div className="reticle-ring" />
                    <div className="reticle-coords">
                      X:{Math.round(zoomCoords.x)} Y:{Math.round(zoomCoords.y)}
                    </div>
                  </div>
                )}

                {/* Badges on Gallery */}
                <div className="gallery-badges">
                  <span className={`gallery-badge-drop ${isUltra ? 'ultra-badge-pulse' : ''}`}>
                    <Sparkles size={11} /> 2026-LIVE ATELIER
                  </span>
                  {product.bestSeller && (
                    <span className="gallery-badge-hot">
                      <Flame size={11} /> BESTSELLER
                    </span>
                  )}
                </div>

                {/* Zoom Hint Icon */}
                <div className={`gallery-zoom-trigger ${isUltra ? 'ultra-zoom-pill' : ''}`}>
                  <ZoomIn size={16} />
                  <span>{isUltra ? 'CINEMATIC INSPECTION' : 'Click to Expand'}</span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className={`product-thumb-carousel ${isUltra ? 'ultra-thumb-strip' : ''}`}>
                  {allImages.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`product-thumb-pill ${selectedImg === index ? 'active' : ''} ${isUltra ? 'ultra-thumb-btn' : ''}`}
                      onClick={() => {
                        playClick();
                        setSelectedImg(index);
                      }}
                      aria-label={`View image angle ${index + 1}`}
                    >
                      <img src={imgUrl} alt={`${product.name} preview ${index + 1}`} />
                      {selectedImg === index && <span className={`thumb-active-dot ${isUltra ? 'ultra-dot-glow' : ''}`} />}
                    </button>
                  ))}
                </div>
              )}

              {/* Gallery Trust Guarantees */}
              <div className="gallery-trust-strip">
                <div className="trust-item">
                  <Truck size={16} className="trust-icon cyan" />
                  <div>
                    <strong>Islandwide Courier</strong>
                    <span>24–48h Colombo / 2–3d Islandwide</span>
                  </div>
                </div>
                <div className="trust-item">
                  <RotateCcw size={16} className="trust-icon purple" />
                  <div>
                    <strong>7-Day Size Exchange</strong>
                    <span>Hassle-free size swaps with tags</span>
                  </div>
                </div>
                <div className="trust-item">
                  <Shield size={16} className="trust-icon emerald" />
                  <div>
                    <strong>220 GSM Combed Cotton</strong>
                    <span>Pre-shrunk heavyweight drape</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Content Column */}
            <div className="product-info-container">
              {/* Header Meta */}
              <div className="product-meta-header">
                <div className="product-drop-tag">
                  <span className="pulse-indicator" />
                  <span>HEAVYWEIGHT GRAPHIC DROP</span>
                </div>

                <button
                  type="button"
                  className="product-share-btn"
                  onClick={handleShare}
                  title="Share this product"
                  aria-label="Share product"
                >
                  <Share2 size={16} />
                </button>
              </div>

              <h1 className="product-title-luxury">{product.name}</h1>

              {/* Rating & Review Counter */}
              <div className="product-rating-row">
                <div className="stars-cluster">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="var(--accent-amber)"
                      color="var(--accent-amber)"
                    />
                  ))}
                </div>
                <span className="rating-score">{product.rating || 4.9}</span>
                <span className="rating-divider">•</span>
                <span className="rating-count">
                  {product.reviews || 78} verified reviews
                </span>
                <span className="rating-badge">100% Authentic ELIX</span>
              </div>

              {/* Price Row with Original Price and Savings */}
              <div className="product-price-container">
                <span className="product-current-price">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="product-original-price">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="product-discount-pill">
                      SAVE LKR {Number(product.originalPrice - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Editorial Description */}
              <p className="product-description-editorial">
                {product.description}
              </p>

              {/* Stock Status Indicator */}
              <div className="product-stock-banner">
                <div className="stock-pulse-wrap">
                  <span className="stock-dot pulse-animation" />
                  <span className="stock-label">
                    In Stock — Ready for Islandwide Dispatch
                  </span>
                </div>
                <div className="stock-fast-dispatch">
                  <Clock size={13} />
                  <span>Orders before 1 PM dispatch today</span>
                </div>
              </div>

              {/* Interactive Color Selector */}
              <div className="product-option-section">
                <div className="option-label-bar">
                  <span className="option-heading">
                    Color: <strong className="option-selected-text">{selectedColor}</strong>
                  </span>
                </div>

                <div className={`color-swatch-cluster ${isUltra ? 'ultra-color-cluster' : ''}`}>
                  {availableColors.map((color) => {
                    const palette = COLOR_PALETTE[color] || COLOR_PALETTE['Default'];
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        className={`color-swatch-btn ${isSelected ? 'active' : ''} ${isUltra ? 'ultra-swatch-btn' : ''}`}
                        onClick={() => handleColorSelect(color)}
                        title={color}
                        aria-label={`Select color ${color}`}
                      >
                        <span
                          className={`swatch-color-circle ${isUltra ? 'ultra-circle-ring' : ''}`}
                          style={{
                            backgroundColor: palette.bg,
                            border: `1px solid ${palette.border}`,
                          }}
                        >
                          {isSelected && <Check size={13} color={palette.text} />}
                          {isUltra && isSelected && <span className="ultra-swatch-halo" />}
                        </span>
                        <span className="swatch-name-label">{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Size Selector with Error Feedback */}
              <div className={`product-option-section ${sizeError ? 'size-error-shake' : ''}`}>
                <div className="option-label-bar">
                  <span className="option-heading">
                    Select Size:{' '}
                    <strong className="option-selected-text">
                      {selectedSize ? `Size ${selectedSize}` : 'Please Choose'}
                    </strong>
                  </span>

                  <button
                    type="button"
                    className="size-guide-modal-trigger"
                    onClick={() => {
                      playClick();
                      setSizeGuideOpen(true);
                    }}
                  >
                    <Ruler size={14} /> Size Chart (Inches/cm)
                  </button>
                </div>

                {sizeError && (
                  <div className="size-alert-banner animate-fade-in">
                    <AlertCircle size={14} />
                    <span>Please select your size below before proceeding.</span>
                  </div>
                )}

                <div className={`size-selection-grid ${isUltra ? 'ultra-size-grid' : ''}`}>
                  {availableSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        className={`size-tile-btn ${isSelected ? 'active' : ''} ${isUltra ? 'ultra-size-tile' : ''}`}
                        onClick={() => handleSizeSelect(size)}
                        aria-label={`Select size ${size}`}
                      >
                        <span className="size-tile-label">{size}</span>
                        {isSelected && (
                          <span className="size-tile-check">
                            <Check size={11} />
                          </span>
                        )}
                        <span className="size-tile-sub">Oversized</span>
                        {isUltra && isSelected && <span className="ultra-tile-glow-border" />}
                      </button>
                    );
                  })}
                </div>

                <div className="size-fit-tip">
                  <Info size={13} />
                  <span>
                    Crafted with our signature dropped shoulder & boxy silhouette. Order your normal size for oversized drape.
                  </span>
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="product-option-section">
                <span className="option-heading">Quantity:</span>
                <div className="quantity-controller-wrap">
                  <div className={`quantity-stepper ${isUltra ? 'ultra-stepper' : ''}`}>
                    <button
                      type="button"
                      className="quantity-step-btn"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="quantity-display-value">{quantity}</span>
                    <button
                      type="button"
                      className="quantity-step-btn"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="quantity-note">Max 10 per order</span>
                </div>
              </div>

              {/* Action Buttons Group */}
              <div ref={actionsRef} className={`product-cta-group ${isUltra ? 'ultra-cta-group' : ''}`}>
                <button
                  type="button"
                  className={`btn btn-glow btn-lg btn-add-bag luxury-hover ${addedAnimation ? 'btn-success-state' : ''} ${isUltra ? 'ultra-3d-btn ultra-add-bag-btn' : ''}`}
                  onClick={handleAddToCart}
                >
                  {isUltra && <span className="ultra-btn-shimmer-sweep" />}
                  {addedAnimation ? (
                    <>
                      <Check size={20} className="cta-icon-animate" /> Added to Your Bag!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} /> Add to Bag • {formatPrice(product.price * quantity)}
                    </>
                  )}
                  {isUltra && addedAnimation && <span className="ultra-burst-ring" />}
                </button>

                <button
                  type="button"
                  className={`btn btn-secondary btn-lg btn-buy-now luxury-hover ${isUltra ? 'ultra-3d-btn ultra-buy-btn' : ''}`}
                  onClick={handleBuyNow}
                >
                  {isUltra && <span className="ultra-btn-shimmer-sweep" />}
                  <Zap size={20} /> Buy Now — Instant Checkout
                </button>
              </div>

              {/* Comprehensive Accordion Tabs */}
              <div className="product-specs-accordion">
                <div className="specs-tab-header">
                  <button
                    type="button"
                    className={`specs-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                    onClick={() => {
                      playClick();
                      setActiveTab('specs');
                    }}
                  >
                    Garment Specs
                  </button>
                  <button
                    type="button"
                    className={`specs-tab-btn ${activeTab === 'fabric' ? 'active' : ''}`}
                    onClick={() => {
                      playClick();
                      setActiveTab('fabric');
                    }}
                  >
                    Fabric & Craft
                  </button>
                  <button
                    type="button"
                    className={`specs-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                    onClick={() => {
                      playClick();
                      setActiveTab('shipping');
                    }}
                  >
                    Shipping & Delivery
                  </button>
                  <button
                    type="button"
                    className={`specs-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
                    onClick={() => {
                      playClick();
                      setActiveTab('care');
                    }}
                  >
                    Care Instructions
                  </button>
                </div>

                <div className="specs-tab-body">
                  {activeTab === 'specs' && (
                    <div className="specs-pane animate-fade-in">
                      <ul className="specs-list">
                        <li>
                          <strong>Fabric Weight:</strong> 220 GSM heavyweight combed cotton single jersey
                        </li>
                        <li>
                          <strong>Silhouette:</strong> Authentic boxy streetwear cut with dropped shoulder drape
                        </li>
                        <li>
                          <strong>Collar:</strong> 1.25" thick reinforced ribbed lycra collar (anti-sag engineered)
                        </li>
                        <li>
                          <strong>Print Technology:</strong> High-density breathable puff & pigment screenprint
                        </li>
                        <li>
                          <strong>Stitching:</strong> Twin-needle hem and sleeve finish with reinforced shoulder tape
                        </li>
                        <li>
                          <strong>Origin:</strong> Precision engineered in Sri Lanka with zero chemical wash odors
                        </li>
                      </ul>
                    </div>
                  )}

                  {activeTab === 'fabric' && (
                    <div className="specs-pane animate-fade-in">
                      <p>
                        We specifically custom-comb each cotton yarn to eliminate short fibers and impurities, resulting in an exceptionally smooth face for artwork clarity and heavyweight longevity.
                      </p>
                      <div className="fabric-features-grid">
                        <div className="fabric-card">
                          <Layers size={16} />
                          <strong>220 GSM Weave</strong>
                          <span>Dense, structured drape that doesn't cling</span>
                        </div>
                        <div className="fabric-card">
                          <Sparkles size={16} />
                          <strong>Pre-Shrunk</strong>
                          <span>Maintains exact dimensions after wash</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'shipping' && (
                    <div className="specs-pane animate-fade-in">
                      <ul className="specs-list">
                        <li>
                          <strong>Colombo & Suburbs:</strong> Next-day delivery (24–48 hours)
                        </li>
                        <li>
                          <strong>Islandwide (All 25 Districts):</strong> 2–3 business days via prompt courier
                        </li>
                        <li>
                          <strong>Shipping Cost:</strong> Flat LKR 450 islandwide • <strong>FREE SHIPPING on orders LKR 8,000+</strong>
                        </li>
                        <li>
                          <strong>Doorstep Tracking:</strong> Live SMS & WhatsApp tracking sent upon dispatch
                        </li>
                        <li>
                          <strong>7-Day Size Exchange:</strong> Unworn garments with tags can be exchanged hassle-free
                        </li>
                      </ul>
                    </div>
                  )}

                  {activeTab === 'care' && (
                    <div className="specs-pane animate-fade-in">
                      <ul className="specs-list">
                        <li>• Machine wash cold inside out (30°C max) with similar darks</li>
                        <li>• Do not tumble dry — hang dry in natural shade to preserve graphics</li>
                        <li>• Iron inside-out on low heat; avoid direct contact with printed artwork</li>
                        <li>• Do not bleach, soak, or dry clean</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile Add to Bag Bar */}
      {showStickyBar && (
        <div className={`mobile-sticky-bar animate-slide-up ${isUltra ? 'ultra-sticky-bar' : ''}`}>
          <div className="mobile-sticky-info">
            <span className="sticky-title">{product.name}</span>
            <span className="sticky-price">{formatPrice(product.price)}</span>
          </div>
          <button
            type="button"
            className={`btn btn-glow btn-sm luxury-hover ${isUltra ? 'ultra-3d-btn' : ''}`}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={15} /> Add to Bag ({selectedSize})
          </button>
        </div>
      )}

      {/* Interactive Size Guide Modal with Inches/CM Toggle */}
      {sizeGuideOpen && (
        <div
          className={`modal-backdrop animate-fade-in ${isUltra ? 'ultra-modal-backdrop' : ''}`}
          style={{ zIndex: 10000 }}
          onClick={() => setSizeGuideOpen(false)}
        >
          <div
            className={`glass-card size-guide-modal-card animate-scale-up ${isUltra ? 'ultra-modal-card' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-title-row">
              <div>
                <h3 className="modal-heading">220 GSM Oversized Fit Guide</h3>
                <span className="modal-subheading">Signature boxy streetwear drop</span>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => {
                  playClick();
                  setSizeGuideOpen(false);
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Units Toggle */}
            <div className="unit-toggle-bar">
              <span className="unit-label">Measurement Unit:</span>
              <div className="unit-buttons">
                <button
                  type="button"
                  className={`unit-btn ${sizeUnit === 'inches' ? 'active' : ''}`}
                  onClick={() => {
                    playClick();
                    setSizeUnit('inches');
                  }}
                >
                  Inches (in)
                </button>
                <button
                  type="button"
                  className={`unit-btn ${sizeUnit === 'cm' ? 'active' : ''}`}
                  onClick={() => {
                    playClick();
                    setSizeUnit('cm');
                  }}
                >
                  Centimeters (cm)
                </button>
              </div>
            </div>

            {/* Measurements Table */}
            <div className="size-table-wrapper">
              <table className="size-chart-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest Width</th>
                    <th>Garment Length</th>
                    <th>Shoulder Width</th>
                    <th>Sleeve Length</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>S</strong></td>
                    <td>{sizeUnit === 'inches' ? '42"' : '107 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '28"' : '71 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '20"' : '51 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '8.5"' : '22 cm'}</td>
                  </tr>
                  <tr>
                    <td><strong>M</strong></td>
                    <td>{sizeUnit === 'inches' ? '44"' : '112 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '29"' : '74 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '21"' : '53 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '9.0"' : '23 cm'}</td>
                  </tr>
                  <tr className="highlight-row">
                    <td><strong>L (Popular)</strong></td>
                    <td>{sizeUnit === 'inches' ? '46"' : '117 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '30"' : '76 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '22"' : '56 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '9.5"' : '24 cm'}</td>
                  </tr>
                  <tr>
                    <td><strong>XL</strong></td>
                    <td>{sizeUnit === 'inches' ? '48"' : '122 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '31"' : '79 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '23"' : '58 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '10.0"' : '25 cm'}</td>
                  </tr>
                  <tr>
                    <td><strong>XXL</strong></td>
                    <td>{sizeUnit === 'inches' ? '50"' : '127 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '32"' : '81 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '24"' : '61 cm'}</td>
                    <td>{sizeUnit === 'inches' ? '10.5"' : '27 cm'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Fit Advice */}
            <div className="fit-advice-box">
              <strong>Fit Advice:</strong> All ELIX t-shirts are designed with a boxy, dropped-shoulder streetwear fit. If you want an authentic oversized aesthetic, stick to your regular size. If you prefer a tailored or regular fit, size down by one size.
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen High-Resolution Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="lightbox-backdrop animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => {
                playClick();
                setLightboxOpen(false);
              }}
              aria-label="Close Lightbox"
            >
              <X size={24} />
            </button>

            <img
              src={currentImage}
              alt={product.name}
              className="lightbox-img animate-scale-up"
            />

            {allImages.length > 1 && (
              <div className="lightbox-nav-row">
                <button
                  type="button"
                  className="lightbox-nav-btn"
                  onClick={() => {
                    playClick();
                    setSelectedImg((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={22} />
                </button>
                <span className="lightbox-counter">
                  {selectedImg + 1} / {allImages.length}
                </span>
                <button
                  type="button"
                  className="lightbox-nav-btn"
                  onClick={() => {
                    playClick();
                    setSelectedImg((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductPage;
