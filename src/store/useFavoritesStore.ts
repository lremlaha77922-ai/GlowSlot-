import { create } from 'zustand';
import { Salon, SalonServiceItem } from '../types';
import { mockSalons } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface FavoriteServiceItem {
  salonId: string;
  salonName: string;
  service: SalonServiceItem;
}

interface FavoritesState {
  favoriteSalonIds: string[];
  favoriteServices: FavoriteServiceItem[];
  toggleFavorite: (salonId: string, userId?: string) => boolean;
  isFavorite: (salonId: string) => boolean;
  getFavoriteSalons: () => Salon[];
  toggleFavoriteService: (salonId: string, salonName: string, service: SalonServiceItem) => boolean;
  isFavoriteService: (serviceId: string, salonId: string) => boolean;
  getFavoriteServices: () => FavoriteServiceItem[];
  loadUserFavorites: (userId: string) => Promise<void>;
  clearFavorites: () => void;
}

const STORAGE_KEY = 'glowslot_favorite_salons';
const SERVICES_STORAGE_KEY = 'glowslot_favorite_services';

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

const safeGetServiceStorage = (): FavoriteServiceItem[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = window.localStorage.getItem(SERVICES_STORAGE_KEY);
      if (data) return JSON.parse(data);
    }
  } catch {
    // Ignore
  }
  return [
    {
      salonId: 'sal-1',
      salonName: 'Luxe Cut & Style Studio',
      service: {
        id: 'srv-1',
        name: 'Signature Precision Haircut',
        category: 'Hair',
        gender: 'male',
        durationMin: 30,
        basePrice: 14900,
        isPopular: true,
        description: 'Customized haircut consultation, professional shampoo, styling & finish.',
      },
    },
  ];
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

const safeSetServiceStorage = (services: FavoriteServiceItem[]) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    }
  } catch {
    // Ignore
  }
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteSalonIds: safeGetStorage(),
  favoriteServices: safeGetServiceStorage(),

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

  toggleFavoriteService: (salonId: string, salonName: string, service: SalonServiceItem) => {
    const current = get().favoriteServices;
    const exists = current.some((item) => item.salonId === salonId && item.service.id === service.id);
    const next = exists
      ? current.filter((item) => !(item.salonId === salonId && item.service.id === service.id))
      : [...current, { salonId, salonName, service }];

    safeSetServiceStorage(next);
    set({ favoriteServices: next });
    return !exists;
  },

  isFavoriteService: (serviceId: string, salonId: string) => {
    return get().favoriteServices.some(
      (item) => item.salonId === salonId && item.service.id === serviceId
    );
  },

  getFavoriteServices: () => {
    return get().favoriteServices;
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
    safeSetServiceStorage([]);
    set({ favoriteSalonIds: [], favoriteServices: [] });
  },
}));
