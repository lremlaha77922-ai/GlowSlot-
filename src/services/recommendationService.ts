import { bookingService } from '../features/bookings/services/bookingService';
import { Booking } from '../types';

export interface SmartRecommendationItem {
  id: string;
  title: string;
  category: string;
  suggestedSalon: string;
  salonId?: string;
  pricePaise: number;
  durationMin: number;
  reason: string;
  tag: string;
  trendScore?: number;
  stylistTip?: string;
}

export interface RecommendationResponse {
  success: boolean;
  source: 'gemini-ai' | 'smart-engine';
  recommendations: SmartRecommendationItem[];
}

const FALLBACK_STYLES: SmartRecommendationItem[] = [
  {
    id: 'rec-1',
    title: 'Textured Crop & Low Skin Fade',
    category: 'Hair',
    suggestedSalon: 'Luxe Cut & Style Studio',
    salonId: 'salon-1',
    pricePaise: 14900,
    durationMin: 35,
    reason: 'Top trending style this season. Low maintenance with modern sharp texture.',
    tag: 'TRENDING #1',
    trendScore: 98,
    stylistTip: 'Ask for matte styling paste for natural non-greasy volume.',
  },
  {
    id: 'rec-2',
    title: 'Beard Sculpting & Charcoal Spa',
    category: 'Beard',
    suggestedSalon: 'GlowSlot At-Home Pro',
    salonId: 'salon-2',
    pricePaise: 11900,
    durationMin: 30,
    reason: 'Pairs well with sharp haircuts. Activated charcoal deeply cleanses beard follicles.',
    tag: 'POPULAR COMBO',
    trendScore: 95,
    stylistTip: 'Follow up with argan beard oil daily to lock in moisture.',
  },
  {
    id: 'rec-3',
    title: 'Aromatic Scalp Detox & Head Massage',
    category: 'Spa',
    suggestedSalon: 'Urban Glow Unisex Lounge',
    salonId: 'salon-3',
    pricePaise: 22900,
    durationMin: 45,
    reason: 'Ideal 3 weeks after your haircut to rejuvenate roots and release screen stress.',
    tag: 'TIME TO REFRESH',
    trendScore: 92,
    stylistTip: 'Leaves scalp residue-free; perfect after heavy outdoor pollution exposure.',
  },
  {
    id: 'rec-4',
    title: 'Hydra-Facial Quick Glow & Exfoliation',
    category: 'Skin',
    suggestedSalon: 'Crown & Blade Barbershop',
    salonId: 'salon-4',
    pricePaise: 29900,
    durationMin: 40,
    reason: 'Fast 40-minute de-tan & hydration session trending for weekend events.',
    tag: 'INSTANT GLOW',
    trendScore: 96,
    stylistTip: 'Avoid direct harsh sunlight for 24 hours post-treatment for best results.',
  },
];

export const recommendationService = {
  async getRecommendations(params: {
    userId?: string;
    userName?: string;
    categoryFilter?: string;
    gender?: string;
    forceRefresh?: boolean;
  }): Promise<RecommendationResponse> {
    try {
      // 1. Fetch user's previous booking history to provide real context
      let history: Booking[] = [];
      try {
        history = await bookingService.getBookings(params.userId);
      } catch {
        history = [];
      }

      // 2. Call server-side /api/recommendations
      const endpoint =
        typeof window !== 'undefined'
          ? '/api/recommendations'
          : 'http://localhost:3000/api/recommendations';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: params.userId,
          userName: params.userName || 'GlowSlot Member',
          bookingHistory: history.slice(0, 5), // last 5 bookings
          categoryFilter: params.categoryFilter || 'all',
          gender: params.gender || 'all',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        return {
          success: true,
          source: data.source || 'smart-engine',
          recommendations: data.recommendations,
        };
      }

      throw new Error('Invalid recommendations array');
    } catch (error) {
      console.warn('[GlowSlot] Fetch /api/recommendations failed, using client heuristic engine:', error);

      // Client heuristic personalization fallback
      let filtered = [...FALLBACK_STYLES];
      if (params.categoryFilter && params.categoryFilter !== 'all') {
        const match = filtered.filter(
          (s) => s.category.toLowerCase() === params.categoryFilter?.toLowerCase()
        );
        if (match.length > 0) filtered = match;
      }

      return {
        success: true,
        source: 'smart-engine',
        recommendations: filtered,
      };
    }
  },
};
