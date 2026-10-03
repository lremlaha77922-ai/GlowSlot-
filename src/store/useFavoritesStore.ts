import { create } from 'zustand';
import { Salon } from '../types';
import { mockSalons } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface FavoritesState {
  favoriteSalonIds: string[];
  toggleFavorite: (salonId: string, userId?: string) => boolean;
  isFavorite: (salonId: string) => boolean;
  getFavoriteSalons: () => Salon[];
  loadUserFavorites: (userId: string) => Promise<void>;
  clearFavorites: () => void;
}

const STORAGE_KEY = 'glowslot_favorite_salons';

const safeGetStorage = (): string[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    }
  } catch {
    // Ignore
  }
  return ['sal-1', 'sal-2']; // seed favorites
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

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteSalonIds: safeGetStorage(),

  toggleFavorite: (salonId: string, userId?: string) => {
    const current = get().favoriteSalonIds;
    const exists = current.includes(salonId);
    const next = exists
      ? current.filter((id) => id !== salonId)
      : [...current, salonId];

    safeSetStorage(next);
    set({ favoriteSalonIds: next });

    // Background sync to Supabase favorites table
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      if (exists) {
        supabase.from('favorites').delete().eq('user_id', userId).eq('salon_id', salonId);
      } else {
        supabase.from('favorites').insert({ user_id: userId, salon_id: salonId });
      }
    }

    return !exists;
  },

  isFavorite: (salonId: string) => {
    return get().favoriteSalonIds.includes(salonId);
  },

  getFavoriteSalons: () => {
    const ids = get().favoriteSalonIds;
    return mockSalons.filter((s) => ids.includes(s.id));
  },

  loadUserFavorites: async (userId: string) => {
    if (!isSupabaseConfigured() || import.meta.env.VITE_USE_MOCK_DATA === 'true') return;
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('salon_id')
        .eq('user_id', userId);

      if (!error && data) {
        const ids = data.map((d: any) => d.salon_id);
        safeSetStorage(ids);
        set({ favoriteSalonIds: ids });
      }
    } catch {
      // Ignore
    }
  },

  clearFavorites: () => {
    safeSetStorage([]);
    set({ favoriteSalonIds: [] });
  },
}));
