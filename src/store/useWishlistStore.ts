import { create } from 'zustand';
import { Product } from '../types';
import { mockProducts } from '../data/mockProducts';

interface WishlistState {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  getWishlistProducts: () => Product[];
  clearWishlist: () => void;
}

const STORAGE_KEY = 'glowslot_wishlist_ids';

const safeGetStorage = (): string[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    }
  } catch {
    // Ignore
  }
  return ['prod-hair-1', 'prod-beard-1']; // initial sample wishlisted
};

const safeSetStorage = (ids: string[]) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  } catch {
    // Ignore
  }
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: safeGetStorage(),

  toggleWishlist: (productId: string) => {
    const current = get().wishlistIds;
    const exists = current.includes(productId);
    const next = exists
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    safeSetStorage(next);
    set({ wishlistIds: next });
    return !exists;
  },

  isInWishlist: (productId: string) => {
    return get().wishlistIds.includes(productId);
  },

  getWishlistProducts: () => {
    const ids = get().wishlistIds;
    return mockProducts.filter((p) => ids.includes(p.id));
  },

  clearWishlist: () => {
    safeSetStorage([]);
    set({ wishlistIds: [] });
  },
}));
