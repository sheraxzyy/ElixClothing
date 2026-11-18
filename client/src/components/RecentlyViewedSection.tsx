import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import * as recentlyViewedService from '../services/recentlyViewedService';
import * as productService from '../services/productService';
import { Eye, Trash2, ArrowRight } from 'lucide-react';

interface RecentlyViewedSectionProps {
  currentProductId?: string;
  className?: string;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  currentProductId,
  className = '',
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRecentItems = async () => {
    try {
      const allProds = await productService.getProducts();
      const recent = await recentlyViewedService.getRecentlyViewed(!!user, allProds);
      const filtered = currentProductId
        ? recent.filter((p) => p.id !== currentProductId && p.slug !== currentProductId)
        : recent;
      setItems(filtered);
    } catch (err) {
      console.warn('Could not load recently viewed products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentItems();
  }, [user, currentProductId]);

  const handleClear = async () => {
    await recentlyViewedService.clearRecentlyViewed(!!user);
    setItems([]);
  };

  if (loading || items.length === 0) return null;

  return (
    <section className={`py-12 border-t border-[#1f1f1f] ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#d4ff00]" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-white">
              RECENTLY VIEWED PIECES
            </h2>
          </div>

          <button
            onClick={handleClear}
            className="text-xs font-mono text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1.5"
            title="Clear browsing history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            CLEAR HISTORY
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.slice(0, 5).map((product) => {
            const hasStock = product.inStock !== false;
            const imageSrc =
              product.imageUrl || product.images?.[0] || '/images/products/remorse-tee.jpg';

            return (
              <Link
                key={product.id}
                to={`/product/${product.slug || product.id}`}
                className="group rounded-2xl bg-[#121212] border border-[#222] hover:border-[#d4ff00]/40 overflow-hidden flex flex-col justify-between transition-all"
              >
                <div className="relative aspect-square overflow-hidden bg-[#181818]">
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {!hasStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-[10px] font-mono uppercase bg-red-600/90 text-white px-2 py-0.5 rounded font-bold">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 space-y-1">
                  <p className="text-xs font-mono font-bold text-white truncate group-hover:text-[#d4ff00] transition-colors uppercase">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#d4ff00] font-bold">
                      LKR {product.price?.toLocaleString()}
                    </span>
                    <span className={hasStock ? 'text-gray-400' : 'text-red-400'}>
                      {hasStock ? 'AVAILABLE' : 'OUT OF STOCK'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedSection;

