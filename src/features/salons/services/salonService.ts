import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { mockSalons, mockBanners } from '../../../data/mockData';
import { Salon, FilterOptions, PromoBanner, SalonServiceItem, PackageItem, ReviewItem } from '../../../types';

export const salonService = {
  async list(filters?: Partial<FilterOptions>, query?: string): Promise<Salon[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        let dbQuery = supabase.from('salons').select('*');

        if (filters?.gender && filters.gender !== 'all') {
          dbQuery = dbQuery.or(`gender.eq.${filters.gender},gender.eq.unisex`);
        }

        if (filters?.rating4PlusOnly) {
          dbQuery = dbQuery.gte('rating', 4.0);
        }

        if (filters?.openNowOnly) {
          dbQuery = dbQuery.eq('is_open', true);
        }

        if (query && query.trim()) {
          dbQuery = dbQuery.ilike('name', `%${query.trim()}%`);
        }

        const { data, error } = await dbQuery;

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            name: row.name,
            address: row.address || '',
            area: row.area || 'Bengaluru',
            city: row.city || 'Bengaluru',
            rating: Number(row.rating) || 4.8,
            reviewCount: Number(row.review_count) || 120,
            distanceKm: Number(row.distance_km) || 1.5,
            startingPrice: Number(row.starting_price) || 14900,
            images: row.images || [
              'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80',
            ],
            gender: row.gender || 'unisex',
            categories: row.categories || ['Haircut', 'Shave & Beard'],
            isOpen: row.is_open ?? true,
            openingHours: row.operating_hours || row.opening_hours || '09:00 AM - 09:00 PM',
            isDeal: row.is_deal ?? false,
            amenities: row.amenities || ['AC', 'WiFi', 'Beverages'],
            aboutText: row.about_text || 'Premium salon offering bespoke hair, grooming, and skincare services.',
          }));
        }
      } catch {
        // Fallback to mock data
      }
    }

    // Mock data filter
    let result = [...mockSalons];

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.categories.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (filters) {
      if (filters.gender && filters.gender !== 'all') {
        result = result.filter(
          (s) => s.gender === filters.gender || s.gender === 'unisex'
        );
      }

      if (filters.category && filters.category !== 'All') {
        result = result.filter((s) => s.categories.includes(filters.category!));
      }

      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        result = result.filter(
          (s) => s.startingPrice >= filters.minPrice! && s.startingPrice <= filters.maxPrice!
        );
      }

      if (filters.openNowOnly) {
        result = result.filter((s) => s.isOpen);
      }

      if (filters.rating4PlusOnly) {
        result = result.filter((s) => s.rating >= 4.0);
      }

      if (filters.offersOnly) {
        result = result.filter((s) => !!s.isDeal);
      }

      if (filters.sortBy) {
        if (filters.sortBy === 'distance') {
          result.sort((a, b) => a.distanceKm - b.distanceKm);
        } else if (filters.sortBy === 'rating') {
          result.sort((a, b) => b.rating - a.rating);
        } else if (filters.sortBy === 'price') {
          result.sort((a, b) => a.startingPrice - b.startingPrice);
        }
      }
    }

    return result;
  },

  async getById(id: string): Promise<Salon | null> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('salons')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            address: data.address,
            area: data.area,
            city: data.city,
            rating: Number(data.rating),
            reviewCount: Number(data.review_count),
            distanceKm: Number(data.distance_km),
            startingPrice: Number(data.starting_price),
            images: data.images,
            gender: data.gender,
            categories: data.categories,
            isOpen: data.is_open,
            openingHours: data.operating_hours || data.opening_hours || '09:00 AM - 09:00 PM',
            isDeal: data.is_deal,
            amenities: data.amenities,
            aboutText: data.about_text,
          };
        }
      } catch {
        // fallback
      }
    }

    const found = mockSalons.find((s) => s.id === id);
    return found || mockSalons[0];
  },

  async get(id: string): Promise<Salon | null> {
    return this.getById(id);
  },

  async getBanners(): Promise<PromoBanner[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('promo_banners')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((b: any) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            tag: b.tag,
            bgGradient: b.gradient || 'from-primary to-accent',
            link: b.action_url,
          }));
        }
      } catch {
        // fallback
      }
    }
    return mockBanners;
  },

  async getServicesBySalon(salonId: string): Promise<SalonServiceItem[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('salon_id', salonId);

        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            description: s.description,
            durationMin: Number(s.duration_min),
            basePrice: Number(s.base_price),
            gender: s.gender,
          }));
        }
      } catch {
        // fallback
      }
    }

    const salon = mockSalons.find((s) => s.id === salonId) || mockSalons[0];
    return salon.services || [];
  },

  async getPackagesBySalon(salonId: string): Promise<PackageItem[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('salon_id', salonId);

        if (!error && data && data.length > 0) {
          return data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            durationMin: Number(p.duration_min),
            price: Number(p.price),
            inclusions: p.included_services || [],
          }));
        }
      } catch {
        // fallback
      }
    }

    const salon = mockSalons.find((s) => s.id === salonId) || mockSalons[0];
    return salon.packages || [];
  },

  async getReviewsBySalon(salonId: string): Promise<ReviewItem[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*, profiles(full_name, avatar_url)')
          .eq('salon_id', salonId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((r: any) => ({
            id: r.id,
            authorName: r.profiles?.full_name || 'GlowSlot User',
            rating: Number(r.rating),
            date: new Date(r.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
            }),
            tags: r.tags || ['Verified Visit'],
            comment: r.comment || '',
          }));
        }
      } catch {
        // fallback
      }
    }

    const salon = mockSalons.find((s) => s.id === salonId) || mockSalons[0];
    return salon.reviews || [];
  },
};
