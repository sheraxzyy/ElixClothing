import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Flame, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { getProducts, formatPrice } from '../services/productService';
import useSound from '../hooks/useSound';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { playClick } = useSound();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadCatalog();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadCatalog = async () => {
    if (products.length > 0) return;
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      playClick();
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectProduct = (productId: string) => {
    playClick();
    onClose();
    navigate(`/product/${productId}`);
  };

  const popularSearches = ['Oversized Tee', 'Remorse', 'Heavyweight', 'Graphic Tee', 'Acid Wash'];

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="search-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="search-modal-header">
          <form onSubmit={handleSubmit} className="search-modal-form">
            <Search className="search-modal-icon" size={20} />
            <input
              ref={inputRef}
              type="text"
              className="search-modal-input"
              placeholder="Search ELIX collections, 220 GSM tees, drops..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="search-modal-clear"
                onClick={() => setQuery('')}
                aria-label="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </form>
          <button
            type="button"
            className="search-modal-close"
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Suggestions when empty */}
        {!query.trim() && (
          <div className="search-modal-suggestions">
            <span className="search-suggestions-label">Popular Searches:</span>
            <div className="search-tags-row">
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="search-tag-chip"
                  onClick={() => setQuery(tag)}
                >
                  <Flame size={12} className="text-red-400" />
                  {tag}
                </button>
              ))}
            </div>
            <div className="search-modal-shortcuts">
              <Link
                to="/drops"
                className="search-shortcut-card"
                onClick={() => {
                  playClick();
                  onClose();
                }}
              >
                <Flame className="search-shortcut-icon text-red-500" size={18} />
                <div>
                  <div className="search-shortcut-title">Latest Drops</div>
                  <div className="search-shortcut-desc">Explore limited edition allocations</div>
                </div>
                <ArrowRight size={14} className="search-shortcut-arrow" />
              </Link>
              <Link
                to="/shop"
                className="search-shortcut-card"
                onClick={() => {
                  playClick();
                  onClose();
                }}
              >
                <ShoppingBag className="search-shortcut-icon text-purple-400" size={18} />
                <div>
                  <div className="search-shortcut-title">All Catalog Items</div>
                  <div className="search-shortcut-desc">Browse complete 2026 streetwear range</div>
                </div>
                <ArrowRight size={14} className="search-shortcut-arrow" />
              </Link>
            </div>
          </div>
        )}

        {/* Search Results */}
        {query.trim() && (
          <div className="search-modal-results">
            {loading ? (
              <div className="search-results-loading">Searching catalog...</div>
            ) : filteredProducts.length > 0 ? (
              <div className="search-results-list">
                <div className="search-results-count">
                  Found {filteredProducts.length} matching piece{filteredProducts.length > 1 ? 's' : ''}
                </div>
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="search-result-item"
                    onClick={() => handleSelectProduct(p.id)}
                  >
                    <img
                      src={p.imageUrl || p.images?.[0] || '/images/products/remorse-tee.jpg'}
                      alt={p.name}
                      className="search-result-thumb"
                    />
                    <div className="search-result-info">
                      <div className="search-result-name">{p.name}</div>
                      <div className="search-result-category">{p.category || 'Streetwear'}</div>
                    </div>
                    <div className="search-result-price">
                      {formatPrice(p.price)}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="search-view-all-btn"
                  onClick={handleSubmit}
                >
                  View all results for "{query}" <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="search-no-results">
                <p>No pieces found matching "{query}"</p>
                <span className="search-no-results-hint">
                  Try searching for "Tee", "Remorse", "Heavyweight", or browse the full shop.
                </span>
                <button
                  type="button"
                  className="search-fallback-btn"
                  onClick={() => {
                    playClick();
                    onClose();
                    navigate('/shop');
                  }}
                >
                  Browse All Pieces
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;

