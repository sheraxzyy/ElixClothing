import api from './api';
import { Product } from '../types';

const STORAGE_KEY = 'elix_recent_views_cache';

export const getLocalRecentProductIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalRecentProductId = (productId: string): void => {
  try {
    const current = getLocalRecentProductIds();
    const filtered = current.filter((id) => id !== productId);
    const updated = [productId, ...filtered].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save recent view locally:', err);
  }
};

export const clearLocalRecentViews = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
};

export const getRecentlyViewed = async (
  isLoggedIn: boolean = false,
  allProducts: Product[] = []
): Promise<Product[]> => {
  if (isLoggedIn) {
    try {
      const res = await api.get('/recently-viewed');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((item: any) => item.product).filter(Boolean);
      }
    } catch {
      // Fallback
    }
  }

  const ids = getLocalRecentProductIds();
  if (!ids.length) return [];

  const matched = ids
    .map((id) => allProducts.find((p) => p.id === id || p.slug === id))
    .filter((p): p is Product => !!p);

  return matched;
};

export const recordRecentlyViewed = async (
  productId: string,
  isLoggedIn: boolean = false
): Promise<void> => {
  saveLocalRecentProductId(productId);

  if (isLoggedIn) {
    try {
      await api.post(`/recently-viewed/${productId}`);
    } catch {
      // Non-blocking
    }
  }
};

export const mergeGuestHistoryOnLogin = async (): Promise<void> => {
  const localIds = getLocalRecentProductIds();
  if (!localIds.length) return;

  try {
    await api.post('/recently-viewed/merge', { productIds: localIds });
  } catch (err) {
    console.warn('Guest history merge deferred:', err);
  }
};

export const clearRecentlyViewed = async (isLoggedIn: boolean = false): Promise<void> => {
  clearLocalRecentViews();
  if (isLoggedIn) {
    try {
      await api.delete('/recently-viewed');
    } catch {
      // Non-blocking
    }
  }
};

