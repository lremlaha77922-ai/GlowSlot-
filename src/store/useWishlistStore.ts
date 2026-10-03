import { create } from 'zustand';
import { Product } from '../types';
import { mockProducts } from '../data/mockProducts';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface WishlistState {
  wishlistIds: string[];
  toggleWishlist: (productId: string, userId?: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  getWishlistProducts: () => Product[];
  loadUserWishlist: (userId: string) => Promise<void>;
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
  return ['prod-hair-1', 'prod-beard-1'];
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

  toggleWishlist: (productId: string, userId?: string) => {
    const current = get().wishlistIds;
    const exists = current.includes(productId);
    const next = exists
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    safeSetStorage(next);
    set({ wishlistIds: next });

    // Background sync to Supabase wishlist table
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      if (exists) {
        supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId);
      } else {
        supabase.from('wishlist').insert({ user_id: userId, product_id: productId });
      }
    }

    return !exists;
  },

  isInWishlist: (productId: string) => {
    return get().wishlistIds.includes(productId);
  },

  getWishlistProducts: () => {
    const ids = get().wishlistIds;
    return mockProducts.filter((p) => ids.includes(p.id));
  },

  loadUserWishlist: async (userId: string) => {
    if (!isSupabaseConfigured() || import.meta.env.VITE_USE_MOCK_DATA === 'true') return;
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', userId);

      if (!error && data) {
        const ids = data.map((d: any) => d.product_id);
        safeSetStorage(ids);
        set({ wishlistIds: ids });
      }
    } catch {
      // Ignore
    }
  },

  clearWishlist: () => {
    safeSetStorage([]);
    set({ wishlistIds: [] });
  },
}));
