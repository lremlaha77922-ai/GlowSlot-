import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { mockCoupons } from '../../../data/mockCoupons';
import { Coupon } from '../../../types';

export const couponService = {
  async getCoupons(): Promise<Coupon[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true);

        if (!error && data && data.length > 0) {
          return data.map((c: any) => ({
            code: c.code,
            title: c.title,
            description: c.description,
            discountType: c.discount_type as 'percentage' | 'flat',
            discountValue: Number(c.discount_value),
            minOrderPaise: Number(c.min_order_paise),
            maxDiscountPaise: c.max_discount_paise ? Number(c.max_discount_paise) : undefined,
            isExpired: c.is_expired ?? false,
          }));
        }
      } catch {
        // fallback
      }
    }

    return mockCoupons;
  },

  async validateCoupon(code: string, subtotalPaise: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
    const coupons = await this.getCoupons();
    const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

    if (!found) {
      return { valid: false, error: 'Invalid coupon code.' };
    }

    if (found.isExpired) {
      return { valid: false, error: 'This coupon has expired.' };
    }

    if (subtotalPaise < found.minOrderPaise) {
      return {
        valid: false,
        error: `Minimum order amount for this coupon is ₹${found.minOrderPaise / 100}.`,
      };
    }

    return { valid: true, coupon: found };
  },
};
