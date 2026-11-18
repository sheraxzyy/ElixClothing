import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as stockNotificationService from '../services/stockNotificationService';
import { Bell, X, Check, Mail, AlertTriangle } from 'lucide-react';

interface BackInStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    price: number;
  };
  selectedSize: string;
  selectedColor?: string;
}

export const BackInStockModal: React.FC<BackInStockModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedSize,
  selectedColor,
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState<string>(user?.email || '');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await stockNotificationService.subscribeStockAlert({
        email,
        productId: product.id,
        size: selectedSize,
        color: selectedColor,
      });

      setSubscribed(true);
      addToast({
        title: 'Restock Subscription Active',
        message: `We will email ${email} the instant ${product.name} (${selectedSize}) is replenished.`,
        type: 'success',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register subscription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#111] border border-[#2a2a2a] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1c1c1c] text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1c1c] text-[11px] font-mono text-[#d4ff00]">
            <Bell className="w-3.5 h-3.5" />
            RESTOCK DISPATCH ALERT
          </div>
          <h3 className="text-xl font-bold font-mono text-white uppercase">
            NOTIFY ME WHEN AVAILABLE
          </h3>
          <p className="text-xs text-gray-400">
            Be the first to access this piece when our warehouse receives replenishment units.
          </p>
        </div>

        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#0a0a0a] border border-[#222]">
          <img
            src={product.imageUrl || '/images/products/remorse-tee.jpg'}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-xl bg-[#181818]"
          />
          <div className="flex-1 min-w-0 font-mono text-xs">
            <p className="font-bold text-white truncate uppercase">{product.name}</p>
            <p className="text-gray-400">
              Size: <span className="text-[#d4ff00] font-bold">{selectedSize}</span>
              {selectedColor ? ` • Color: ${selectedColor}` : ''}
            </p>
            <p className="text-gray-500">LKR {product.price.toLocaleString()}</p>
          </div>
        </div>

        {subscribed ? (
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-800 text-center space-y-3">
            <Check className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-mono text-sm font-bold text-emerald-300 uppercase">
              SUBSCRIPTION CONFIRMED
            </h4>
            <p className="text-xs text-emerald-200">
              An alert will be dispatched to <strong>{email}</strong> the moment this size is
              restocked. You can unsubscribe anytime directly from the email alert.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 rounded-xl bg-emerald-500 text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 transition-colors"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-widest block">
                Notification Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-[#080808] border border-[#282828] rounded-xl pl-11 pr-4 py-3 text-white text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-[#d4ff00] transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[#d4ff00] text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#bce400] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'RECORDING SUBSCRIPTION...' : 'NOTIFY ME ON RESTOCK'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BackInStockModal;

