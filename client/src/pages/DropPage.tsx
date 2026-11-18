import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicDrops } from '../services/dropService';
import { formatPrice } from '../services/productService';
import { DropType, DropProductType } from '../types';
import {
  Flame,
  Clock,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Eye,
  Layers,
  ShoppingBag,
  Bell,
  RefreshCw,
} from 'lucide-react';
import useSound from '../hooks/useSound';
import DropDetailModal from '../components/DropDetailModal';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeLeft(targetIso: string): TimeLeft {
  const diff = new Date(targetIso).getTime() - new Date().getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

export const DropPage: React.FC = () => {
  const [activeDrops, setActiveDrops] = useState<DropType[]>([]);
  const [upcomingDrops, setUpcomingDrops] = useState<DropType[]>([]);
  const [previousDrops, setPreviousDrops] = useState<DropType[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'previous'>('active');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [countdowns, setCountdowns] = useState<Record<string, TimeLeft>>({});

  // Quick View Modal state
  const [selectedDrop, setSelectedDrop] = useState<DropType | null>(null);
  const [selectedDropProduct, setSelectedDropProduct] = useState<DropProductType | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { playClick } = useSound();

  useEffect(() => {
    loadDrops();
  }, []);

  const loadDrops = async () => {
    setLoading(true);
    try {
      const data = await getPublicDrops();
      setActiveDrops(data.active || []);
      setUpcomingDrops(data.upcoming || []);
      setPreviousDrops(data.previous || []);

      // If active drops is empty but upcoming has drops, default to upcoming tab
      if ((!data.active || data.active.length === 0) && data.upcoming && data.upcoming.length > 0) {
        setActiveTab('upcoming');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load drops');
    } finally {
      setLoading(false);
    }
  };

  // 1-second interval for countdown tickers
  useEffect(() => {
    const allDrops = [...activeDrops, ...upcomingDrops];
    if (allDrops.length === 0) return;

    const updateTimers = () => {
      const newCountdowns: Record<string, TimeLeft> = {};
      allDrops.forEach((d) => {
        newCountdowns[d.id] = calculateTimeLeft(d.scheduledAt);
      });
      setCountdowns(newCountdowns);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [activeDrops, upcomingDrops]);

  const handleOpenDropProduct = (drop: DropType, dropProduct: DropProductType) => {
    playClick();
    setSelectedDrop(drop);
    setSelectedDropProduct(dropProduct);
    setModalOpen(true);
  };

  const renderCountdownTimer = (dropId: string, label: string = 'LAUNCH COUNTDOWN') => {
    const timer = countdowns[dropId];
    if (!timer) return null;

    if (timer.isPast) {
      return (
        <div className="drop-status-pill live-pill">
          <span className="drop-status-dot pulse" />
          <span>RELEASE EVENT IS LIVE</span>
        </div>
      );
    }

    return (
      <div className="drop-countdown-container">
        <span className="drop-countdown-label">
          <Clock size={12} className="text-red-400" />
          {label}
        </span>
        <div className="drop-countdown-ticker">
          <div className="drop-ticker-unit">
            <span className="drop-ticker-val">{String(timer.days).padStart(2, '0')}</span>
            <span className="drop-ticker-dim">DAYS</span>
          </div>
          <span className="drop-ticker-sep">:</span>
          <div className="drop-ticker-unit">
            <span className="drop-ticker-val">{String(timer.hours).padStart(2, '0')}</span>
            <span className="drop-ticker-dim">HRS</span>
          </div>
          <span className="drop-ticker-sep">:</span>
          <div className="drop-ticker-unit">
            <span className="drop-ticker-val">{String(timer.minutes).padStart(2, '0')}</span>
            <span className="drop-ticker-dim">MIN</span>
          </div>
          <span className="drop-ticker-sep">:</span>
          <div className="drop-ticker-unit">
            <span className="drop-ticker-val">{String(timer.seconds).padStart(2, '0')}</span>
            <span className="drop-ticker-dim">SEC</span>
          </div>
        </div>
      </div>
    );
  };

  // Featured Drop for Hero artwork
  const featuredDrop = activeDrops[0] || upcomingDrops[0] || null;

  return (
    <div className="drop-page-wrapper">
      {/* SECTION A: HERO SECTION */}
      <section className="drop-hero-section">
        <div className="container">
          <div className="drop-hero-card">
            {/* Ambient Background Blur Glows */}
            <div className="drop-hero-ambient-glow" />
            
            <div className="drop-hero-content">
              <div className="drop-hero-badge">
                <Flame size={14} className="text-red-500 animate-pulse" />
                <span>ELIX LIMITED ARCHIVE // 2026 RELEASE</span>
              </div>

              <h1 className="drop-hero-title">
                LIMITED <span className="drop-title-gradient">DROPS</span>
              </h1>

              <p className="drop-hero-description">
                Strictly numbered collections, exclusive colorways, and rare archival streetwear. Engineered in 220 GSM heavyweight combed cotton. Once an allocation is exhausted, it will never be restocked.
              </p>

              {/* Hero Call to Action Buttons */}
              <div className="drop-hero-actions">
                {activeDrops.length > 0 ? (
                  <button
                    type="button"
                    className="elix-btn-primary"
                    onClick={() => {
                      playClick();
                      setActiveTab('active');
                      const el = document.getElementById('drop-releases-view');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Flame size={16} /> Explore Live Drop ({activeDrops.length})
                  </button>
                ) : (
                  <button
                    type="button"
                    className="elix-btn-primary"
                    onClick={() => {
                      playClick();
                      setActiveTab('upcoming');
                      const el = document.getElementById('drop-releases-view');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Clock size={16} /> Preview Upcoming Drops
                  </button>
                )}

                <Link to="/shop" className="elix-btn-secondary" onClick={playClick}>
                  Browse All Streetwear <ArrowRight size={14} />
                </Link>
              </div>

              {/* Status Stats Row */}
              <div className="drop-hero-stats-row">
                <div className="drop-hero-stat">
                  <span className="drop-stat-val">{activeDrops.length}</span>
                  <span className="drop-stat-label">Live Drops</span>
                </div>
                <div className="drop-hero-stat-divider" />
                <div className="drop-hero-stat">
                  <span className="drop-stat-val">{upcomingDrops.length}</span>
                  <span className="drop-stat-label">Scheduled Releases</span>
                </div>
                <div className="drop-hero-stat-divider" />
                <div className="drop-hero-stat">
                  <span className="drop-stat-val">220 GSM</span>
                  <span className="drop-stat-label">Heavyweight Spec</span>
                </div>
                <div className="drop-hero-stat-divider" />
                <div className="drop-hero-stat">
                  <span className="drop-stat-val">100%</span>
                  <span className="drop-stat-label">Limited Edition</span>
                </div>
              </div>
            </div>

            {/* Featured Hero Artwork Preview */}
            {featuredDrop && (
              <div className="drop-hero-visual-card">
                <div className="drop-visual-image-wrap">
                  <img
                    src={
                      featuredDrop.banner ||
                      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200'
                    }
                    alt={featuredDrop.title}
                    className="drop-visual-image"
                  />
                  <div className="drop-visual-overlay" />
                  <div className="drop-visual-meta">
                    <span className="drop-visual-tag">
                      {featuredDrop.status === 'Live' ? 'NOW ACTIVE' : 'UPCOMING SPOTLIGHT'}
                    </span>
                    <h3 className="drop-visual-title">{featuredDrop.title}</h3>
                    <p className="drop-visual-desc">{featuredDrop.description}</p>
                    {renderCountdownTimer(
                      featuredDrop.id,
                      featuredDrop.status === 'Live' ? 'CLOSES IN' : 'STARTS IN'
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION B: RELEASES CATALOG & NAVIGATION TABS */}
      <section className="drop-catalog-section" id="drop-releases-view">
        <div className="container">
          {/* Navigation Filter Tabs */}
          <div className="drop-tabs-nav-bar">
            <div className="drop-tabs-group" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'active'}
                onClick={() => {
                  playClick();
                  setActiveTab('active');
                }}
                className={`drop-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              >
                <span className="drop-tab-indicator live-dot" />
                <span>Live Drops</span>
                <span className="drop-tab-count">{activeDrops.length}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'upcoming'}
                onClick={() => {
                  playClick();
                  setActiveTab('upcoming');
                }}
                className={`drop-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              >
                <Clock size={14} />
                <span>Upcoming</span>
                <span className="drop-tab-count">{upcomingDrops.length}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'previous'}
                onClick={() => {
                  playClick();
                  setActiveTab('previous');
                }}
                className={`drop-tab-btn ${activeTab === 'previous' ? 'active' : ''}`}
              >
                <Calendar size={14} />
                <span>Archived Drops</span>
                <span className="drop-tab-count">{previousDrops.length}</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="drop-loading-state">
              <RefreshCw className="drop-loading-spinner" size={28} />
              <p className="drop-loading-text">SYNCHRONIZING DROP CATALOG...</p>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="drop-error-banner">
              <AlertTriangle size={20} className="text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* MAIN CONTENT AREA */}
          {!loading && !error && (
            <>
              {/* TAB 1: ACTIVE DROPS */}
              {activeTab === 'active' && (
                <div className="drop-tab-panel">
                  {activeDrops.length === 0 ? (
                    /* SECTION F: BEAUTIFUL EMPTY STATE */
                    <div className="drop-empty-state-card">
                      <div className="drop-empty-icon-wrap">
                        <Sparkles size={32} className="text-neutral-400" />
                      </div>
                      <h3 className="drop-empty-title">NO ACTIVE DROPS AT THIS MOMENT</h3>
                      <p className="drop-empty-desc">
                        All recent release allocations have concluded or sold out. We are currently finalizing our next strictly limited capsule. Check upcoming releases to preview pieces before they drop.
                      </p>
                      <div className="drop-empty-actions">
                        <button
                          type="button"
                          className="elix-btn-primary"
                          onClick={() => {
                            playClick();
                            setActiveTab('upcoming');
                          }}
                        >
                          View Scheduled Upcoming Drops <ArrowRight size={14} />
                        </button>
                        <Link to="/shop" className="elix-btn-secondary" onClick={playClick}>
                          Browse Available Streetwear
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="drop-releases-list">
                      {activeDrops.map((drop) => (
                        <div key={drop.id} className="drop-release-block">
                          {/* Drop Banner & Header */}
                          <div className="drop-release-banner">
                            <img
                              src={
                                drop.banner ||
                                'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200'
                              }
                              alt={drop.title}
                              className="drop-release-banner-img"
                            />
                            <div className="drop-release-banner-overlay" />

                            <div className="drop-release-banner-top">
                              <span className="drop-status-pill live-pill">
                                <span className="drop-status-dot pulse" />
                                <span>LIVE NOW</span>
                              </span>
                              <span className="drop-edition-code">
                                DROP REF: {drop.slug?.toUpperCase() || drop.id.substring(0, 8)}
                              </span>
                            </div>

                            <div className="drop-release-banner-bottom">
                              <div className="drop-release-info">
                                <h2 className="drop-release-title">{drop.title}</h2>
                                <p className="drop-release-desc">{drop.description}</p>
                              </div>
                              <div className="drop-release-timer-wrap">
                                {renderCountdownTimer(drop.id, 'RELEASE EVENT CLOSES IN')}
                              </div>
                            </div>
                          </div>

                          {/* Drop Products Grid */}
                          <div className="drop-products-shelf">
                            <div className="drop-shelf-header">
                              <div className="drop-shelf-title">
                                <ShieldCheck size={16} className="text-red-500" />
                                <span>OFFICIAL DROP PIECES & ALLOCATIONS</span>
                              </div>
                              <span className="drop-shelf-count">
                                {drop.products?.length || 0} Piece
                                {drop.products?.length === 1 ? '' : 's'} Allocated
                              </span>
                            </div>

                            <div className="drop-products-grid">
                              {drop.products && drop.products.length > 0 ? (
                                drop.products.map((dp) => {
                                  const prod = dp.product;
                                  const price = dp.dropPrice ?? prod?.price ?? 3000;
                                  const stock = dp.exclusiveStock;
                                  const isSoldOut = stock <= 0;

                                  return (
                                    <div key={dp.id} className="drop-product-card group">
                                      {/* Product Image */}
                                      <div
                                        className="drop-product-img-wrap"
                                        onClick={() => handleOpenDropProduct(drop, dp)}
                                      >
                                        <img
                                          src={
                                            prod?.imageUrl ||
                                            prod?.images?.[0] ||
                                            'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600'
                                          }
                                          alt={prod?.name || 'Drop Product'}
                                          className="drop-product-img"
                                        />

                                        {/* Status badges */}
                                        <div className="drop-product-badges">
                                          {isSoldOut ? (
                                            <span className="drop-card-badge sold-out">
                                              SOLD OUT
                                            </span>
                                          ) : (
                                            <span className="drop-card-badge stock-remaining">
                                              {stock} Remaining
                                            </span>
                                          )}
                                        </div>

                                        {/* Quick View Hover Pill */}
                                        <div className="drop-card-hover-overlay">
                                          <span className="drop-quick-view-btn">
                                            <Eye size={14} /> Quick View
                                          </span>
                                        </div>
                                      </div>

                                      {/* Product Info */}
                                      <div className="drop-product-details">
                                        <div className="drop-product-edition-label">
                                          {drop.title}
                                        </div>
                                        <h3
                                          className="drop-product-name"
                                          onClick={() => handleOpenDropProduct(drop, dp)}
                                        >
                                          {prod?.name || 'Exclusive Streetwear Piece'}
                                        </h3>

                                        <div className="drop-product-pricing">
                                          <span className="drop-product-price">
                                            {formatPrice(price)}
                                          </span>
                                          <span className="drop-product-spec">220 GSM Combed</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="drop-product-actions">
                                          <button
                                            type="button"
                                            disabled={isSoldOut}
                                            className={`elix-btn-primary drop-card-action-btn ${
                                              isSoldOut ? 'disabled' : ''
                                            }`}
                                            onClick={() => handleOpenDropProduct(drop, dp)}
                                          >
                                            {isSoldOut ? (
                                              'Sold Out'
                                            ) : (
                                              <>
                                                <ShoppingBag size={14} /> View Drop
                                              </>
                                            )}
                                          </button>

                                          {prod?.id && (
                                            <Link
                                              to={`/product/${prod.id}`}
                                              className="elix-btn-secondary drop-card-icon-btn"
                                              title="View Full Product Page"
                                              onClick={playClick}
                                            >
                                              <ArrowRight size={14} />
                                            </Link>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="drop-no-pieces-text">
                                  Drop pieces are being calibrated. Check back shortly.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: UPCOMING DROPS */}
              {activeTab === 'upcoming' && (
                <div className="drop-tab-panel">
                  {upcomingDrops.length === 0 ? (
                    <div className="drop-empty-state-card">
                      <div className="drop-empty-icon-wrap">
                        <Clock size={32} className="text-neutral-400" />
                      </div>
                      <h3 className="drop-empty-title">NO SCHEDULED RELEASES</h3>
                      <p className="drop-empty-desc">
                        All upcoming drops have either completed or are currently in design atelier. Subscribe or visit our catalog to explore our current range.
                      </p>
                      <Link to="/shop" className="elix-btn-primary" onClick={playClick}>
                        Explore Available Collections
                      </Link>
                    </div>
                  ) : (
                    <div className="drop-upcoming-list">
                      {upcomingDrops.map((drop) => (
                        <div key={drop.id} className="drop-upcoming-card">
                          <div className="drop-upcoming-grid">
                            <div className="drop-upcoming-banner-col">
                              <img
                                src={
                                  drop.banner ||
                                  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'
                                }
                                alt={drop.title}
                                className="drop-upcoming-img"
                              />
                              <div className="drop-upcoming-tag-pos">
                                <span className="drop-status-pill upcoming-pill">
                                  <Clock size={12} />
                                  <span>UPCOMING RELEASE</span>
                                </span>
                              </div>
                            </div>

                            <div className="drop-upcoming-body">
                              <div>
                                <div className="drop-upcoming-schedule-meta">
                                  <Calendar size={13} className="text-neutral-400" />
                                  <span>
                                    Scheduled: {new Date(drop.scheduledAt).toLocaleDateString()} at{' '}
                                    {new Date(drop.scheduledAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}{' '}
                                    ({drop.timezone || 'UTC+5:30'})
                                  </span>
                                </div>
                                <h3 className="drop-upcoming-title">{drop.title}</h3>
                                <p className="drop-upcoming-desc">{drop.description}</p>
                              </div>

                              <div className="drop-upcoming-footer">
                                {renderCountdownTimer(drop.id, 'COUNTDOWN TO LAUNCH')}

                                <div className="drop-upcoming-footer-actions">
                                  <span className="drop-allocation-count-tag">
                                    {drop.products?.length || 0} Exclusive Pieces
                                  </span>
                                  <Link
                                    to="/shop"
                                    className="elix-btn-secondary"
                                    onClick={playClick}
                                  >
                                    View Full Shop
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ARCHIVED DROPS */}
              {activeTab === 'previous' && (
                <div className="drop-tab-panel">
                  {previousDrops.length === 0 ? (
                    <div className="drop-empty-state-card">
                      <div className="drop-empty-icon-wrap">
                        <Calendar size={32} className="text-neutral-400" />
                      </div>
                      <h3 className="drop-empty-title">THE VAULT IS CURRENTLY EMPTY</h3>
                      <p className="drop-empty-desc">
                        Concluded and archival streetwear collections will be cataloged here once release events finish.
                      </p>
                    </div>
                  ) : (
                    <div className="drop-archive-grid">
                      {previousDrops.map((drop) => (
                        <div key={drop.id} className="drop-archive-card group">
                          <div className="drop-archive-img-wrap">
                            <img
                              src={
                                drop.banner ||
                                'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600'
                              }
                              alt={drop.title}
                              className="drop-archive-img"
                            />
                            <div className="drop-archive-badge">
                              <span className="drop-status-pill archived-pill">
                                <span>ARCHIVED VAULT</span>
                              </span>
                            </div>
                          </div>

                          <div className="drop-archive-body">
                            <span className="drop-archive-date">
                              Released {new Date(drop.scheduledAt).toLocaleDateString()}
                            </span>
                            <h4 className="drop-archive-title">{drop.title}</h4>
                            <p className="drop-archive-desc">{drop.description}</p>

                            <div className="drop-archive-footer">
                              <span>{drop.products?.length || 0} Pieces Released</span>
                              <span className="drop-archive-ended-tag">CONCLUDED</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Interactive Drop Detail Quick View Modal */}
      <DropDetailModal
        isOpen={modalOpen}
        drop={selectedDrop}
        dropProduct={selectedDropProduct}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default DropPage;
