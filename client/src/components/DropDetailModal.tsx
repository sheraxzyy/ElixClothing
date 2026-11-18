import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Flame,
  ShieldCheck,
  Check,
  ArrowRight,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DropType, DropProductType, Product } from '../types';
import { formatPrice } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import useSound from '../hooks/useSound';

interface DropDetailModalProps {
  isOpen: boolean;
  drop: DropType | null;
  dropProduct: DropProductType | null;
  onClose: () => void;
}

export const DropDetailModal: React.FC<DropDetailModalProps> = ({
  isOpen,
  drop,
  dropProduct,
  onClose,
}) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { playClick, playAddToCart } = useSound();

  const product = dropProduct?.product;
  const isDropLive = drop?.status === 'Live' || drop?.status === 'Upcoming';
  const stock = dropProduct ? dropProduct.exclusiveStock : 0;
  const isSoldOut = stock <= 0;
  const price = dropProduct?.dropPrice ?? product?.price ?? 3000;

  const defaultSizes = product?.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
  const defaultColors =
    product?.availableColors && product.availableColors.length > 0
      ? product.availableColors
      : ['Pitch Black', 'Acid Washed Charcoal'];

  const [selectedSize, setSelectedSize] = useState<string>(defaultSizes[0] || 'L');
  const [selectedColor, setSelectedColor] = useState<string>(defaultColors[0] || 'Pitch Black');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      const img = product.imageUrl || product.images?.[0] || drop?.banner || '/images/products/remorse-tee.jpg';
      setSelectedImage(img);
      if (product.sizes?.length) setSelectedSize(product.sizes[0]);
      if (product.availableColors?.length) setSelectedColor(product.availableColors[0]);
      setQuantity(1);
      setAdded(false);
    }
  }, [product, dropProduct, drop]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !dropProduct || !product) return null;

  const imagesList = [
    product.imageUrl,
    ...(product.images || []),
  ].filter(Boolean) as string[];

  const handleAddToCart = () => {
    if (isSoldOut) return;
    playAddToCart();

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: Number(price),
        quantity,
        size: selectedSize,
        color: selectedColor,
        image: selectedImage || product.imageUrl,
        category: product.category || 'Drop Exclusive',
      },
      quantity,
      selectedSize,
      selectedColor
    );

    setAdded(true);
    addToast({
      title: 'Acquired to Bag',
      message: `${product.name} (${selectedSize} / ${selectedColor}) added to your shopping bag.`,
      type: 'cart',
    });

    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="drop-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="drop-modal-container animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="drop-modal-close"
          onClick={onClose}
          aria-label="Close drop details"
        >
          <X size={20} />
        </button>

        <div className="drop-modal-grid">
          {/* Left Column: Image Gallery */}
          <div className="drop-modal-visual">
            <div className="drop-modal-main-image-wrap">
              <img
                src={selectedImage || product.imageUrl || '/images/products/remorse-tee.jpg'}
                alt={product.name}
                className="drop-modal-main-image"
              />
              <div className="drop-modal-image-badges">
                <span className="drop-tag-pill">
                  <Flame size={12} className="text-red-400" />
                  {drop?.title || 'EXCLUSIVE RELEASE'}
                </span>
                {isSoldOut ? (
                  <span className="drop-tag-soldout">SOLD OUT</span>
                ) : (
                  <span className="drop-tag-stock">
                    {stock > 0 ? `${stock} Units Available` : 'Limited Allocation'}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {imagesList.length > 1 && (
              <div className="drop-modal-thumbs">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`drop-modal-thumb-btn ${selectedImage === img ? 'active' : ''}`}
                    onClick={() => {
                      playClick();
                      setSelectedImage(img);
                    }}
                  >
                    <img src={img} alt={`${product.name} thumb ${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product & Drop Details */}
          <div className="drop-modal-info">
            <div className="drop-modal-header">
              <div className="drop-modal-edition">
                <span>EDITION 2026</span>
                <span>•</span>
                <span>{drop?.timezone || 'COLOMBO / UTC+5:30'}</span>
              </div>
              <h2 className="drop-modal-title">{product.name}</h2>
              <div className="drop-modal-price-row">
                <span className="drop-modal-price">{formatPrice(price)}</span>
                <span className="drop-modal-shipping-tag">Free Islandwide Delivery &gt; 8,000 LKR</span>
              </div>
            </div>

            {/* Description */}
            <p className="drop-modal-description">
              {product.description ||
                drop?.description ||
                'Limited allocation bespoke piece tailored from 220 GSM heavyweight combed cotton. Custom cut-and-sew silhouette engineered for maximum drape and longevity.'}
            </p>

            {/* Fabric & Specs Badges */}
            <div className="drop-modal-specs">
              <div className="drop-spec-item">
                <span className="drop-spec-label">GSM WEIGHT</span>
                <span className="drop-spec-val">220 GSM Heavyweight</span>
              </div>
              <div className="drop-spec-item">
                <span className="drop-spec-label">FIT PROFILE</span>
                <span className="drop-spec-val">{product.fit || 'Boxy Oversized'}</span>
              </div>
              <div className="drop-spec-item">
                <span className="drop-spec-label">ALLOCATION</span>
                <span className="drop-spec-val">{stock > 0 ? `${stock} Strictly Numbered` : 'Exhausted'}</span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="drop-modal-option-group">
              <div className="drop-option-header">
                <span className="drop-option-title">SELECT SIZE</span>
                <Link to="/size-guide" className="drop-size-guide-link" onClick={onClose}>
                  Size Chart
                </Link>
              </div>
              <div className="drop-sizes-row">
                {defaultSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    disabled={isSoldOut}
                    className={`drop-size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => {
                      playClick();
                      setSelectedSize(size);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="drop-modal-option-group">
              <span className="drop-option-title">
                AVAILABLE COLORWAY: <strong className="text-white">{selectedColor}</strong>
              </span>
              <div className="drop-colors-row">
                {defaultColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    disabled={isSoldOut}
                    className={`drop-color-chip ${selectedColor === col ? 'active' : ''}`}
                    onClick={() => {
                      playClick();
                      setSelectedColor(col);
                    }}
                  >
                    {selectedColor === col && <Check size={12} className="inline mr-1" />}
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="drop-modal-actions">
              <button
                type="button"
                disabled={isSoldOut}
                className={`elix-btn-primary drop-add-to-cart-btn ${added ? 'btn-success' : ''}`}
                onClick={handleAddToCart}
              >
                {isSoldOut ? (
                  'SOLD OUT'
                ) : added ? (
                  <>
                    <Check size={18} /> ADDED TO BAG
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> ACQUIRE PIECE — {formatPrice(price)}
                  </>
                )}
              </button>

              <Link
                to={`/product/${product.id}`}
                className="elix-btn-secondary drop-view-full-btn"
                onClick={onClose}
              >
                Full Product Specifications <ExternalLink size={14} />
              </Link>
            </div>

            <div className="drop-modal-guarantee">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Authentic ELIX Atelier Archive. Guaranteed original with encrypted authenticity verification.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropDetailModal;

