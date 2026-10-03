import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { mockSalons, mockBanners } from '../../../data/mockData';
import { Salon, FilterOptions, PromoBanner, SalonServiceItem, PackageItem, ReviewItem } from '../../../types';

export const salonService = {
  mapSalonRow(row: any): Salon {
    return {
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
      isVerified: row.is_verified ?? true,
      badgeType: row.badge_type || 'TOP RATED',
      amenities: row.amenities || ['AC', 'WiFi', 'Beverages'],
      aboutText: row.about_text || 'Premium salon offering bespoke hair, grooming, and skincare services.',
    };
  },

  async list(filters?: Partial<FilterOptions>, query?: string): Promise<Salon[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        let dbQuery = supabase.from('salons').select('*').eq('is_open', true);

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
          return data.map((row: any) => this.mapSalonRow(row));
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

  async getNearby(limit = 10): Promise<Salon[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.rpc('get_nearby_salons', { p_limit: limit });
        if (!error && data) {
          return data.map((row: any) => this.mapSalonRow(row));
        }
      } catch {}
    }
    const salons = await this.list();
    return salons.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
  },

  async getSimilarNearby(salonId: string, limit = 5): Promise<Salon[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.rpc('get_similar_salons_nearby', {
          p_salon_id: salonId,
          p_limit: limit,
        });
        if (!error && data) {
          return data.map((row: any) => this.mapSalonRow(row));
        }
      } catch {}
    }
    const salons = await this.list();
    return salons.filter((s) => s.id !== salonId).slice(0, limit);
  },

  async getVerified(limit = 10): Promise<Salon[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.from('salons').select('*').eq('is_verified', true).eq('is_open', true).limit(limit);
        if (!error && data) {
          return data.map((row: any) => this.mapSalonRow(row));
        }
      } catch {}
    }
    const salons = await this.list();
    return salons.filter((s) => s.isVerified ?? true).slice(0, limit);
  },

  async getTopRated(limit = 10): Promise<Salon[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.rpc('get_top_rated_salons', { p_limit: limit });
        if (!error && data) {
          return data.map((row: any) => this.mapSalonRow(row));
        }
      } catch {}
    }
    const salons = await this.list();
    return salons.sort((a, b) => b.rating - a.rating).slice(0, limit);
  },

  async getTrending(limit = 10): Promise<Salon[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.rpc('get_trending_salons', { p_limit: limit });
        if (!error && data) {
          return data.map((row: any) => this.mapSalonRow(row));
        }
      } catch {}
    }
    const salons = await this.list();
    return salons.filter((s) => s.isDeal || s.rating >= 4.8).slice(0, limit);
  },

  async getRecommended(userId?: string, limit = 10): Promise<Salon[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true' && userId) {
      try {
        const { data, error } = await supabase.rpc('get_recommended_salons', { p_user_id: userId, p_limit: limit });
        if (!error && data) {
          return data.map((row: any) => this.mapSalonRow(row));
        }
      } catch {}
    }
    const salons = await this.list();
    return salons.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, limit);
  },

  async getById(id: string): Promise<Salon | null> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.rpc('get_active_salon_details', { p_salon_id: id });

        if (!error && data && data.length > 0) {
          const row = data[0];
          const salon = this.mapSalonRow(row);
          salon.specialists = await this.getSpecialistsBySalon(id);
          salon.services = await this.getServicesBySalon(id);
          salon.packages = await this.getPackagesBySalon(id);
          salon.reviews = await this.getReviewsBySalon(id);
          return salon;
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
        const { data, error } = await supabase.rpc('get_active_salon_services', { p_salon_id: salonId });

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
        const { data, error } = await supabase.rpc('get_active_salon_packages', { p_salon_id: salonId });

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

  async getSpecialistsBySalon(salonId: string): Promise<any[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('specialists')
          .select('*')
          .eq('salon_id', salonId)
          .eq('is_active', true);

        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            name: s.name,
            role: s.role || 'Expert Stylist',
            photoUrl: s.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            rating: Number(s.rating) || 4.9,
            experienceYears: Number(s.experience_years) || 6,
          }));
        }
      } catch {}
    }
    const salon = mockSalons.find((s) => s.id === salonId) || mockSalons[0];
    return salon.specialists || [
      {
        id: 'spec-1',
        name: 'Vikram Mehta',
        role: 'Master Hair Stylist',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        rating: 4.9,
        experienceYears: 8,
      },
    ];
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
