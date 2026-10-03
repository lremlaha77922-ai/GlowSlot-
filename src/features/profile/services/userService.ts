import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { PointsTransaction } from '../../../types';

export const userService = {
  async getWalletTransactions(userId?: string): Promise<PointsTransaction[]> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((t: any) => ({
            id: t.id,
            title: t.description || 'Glow Points Adjustment',
            description: t.description || 'Glow Points Adjustment',
            rewardType: t.type === 'booking_reward' ? 'booking' : t.type === 'signup_bonus' ? 'signup_bonus' : t.type,
            salonName: t.salon_name || 'GlowSlot Salon Partner',
            points: Number(t.points),
            type: t.type as PointsTransaction['type'],
            date: new Date(t.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            status: t.status as PointsTransaction['status'],
          }));
        }
      } catch {
        // fallback
      }
    }

    return [
      {
        id: 'tx-1',
        title: 'Partner QR Scan Cashback',
        description: 'Earned 10% cashback points on partner salon scan bill.',
        rewardType: 'qr_payment',
        salonName: 'Luxe Cut & Style Studio',
        date: 'Today, 11:30 AM',
        qrBillPaise: 149000, // ₹1,490 QR bill
        points: 150,
        status: 'completed',
        type: 'qr_payment',
      },
      {
        id: 'tx-2',
        title: 'Completed Haircut & Beard Grooming',
        description: 'App booking reward points earned upon service completion.',
        rewardType: 'booking',
        salonName: 'Toni & Guy Koramangala',
        date: '2 Oct 2026',
        points: 50,
        status: 'completed',
        type: 'booking_reward',
      },
      {
        id: 'tx-3',
        title: 'Referral Bonus (Rahul K.)',
        description: 'Friend completed their first salon appointment.',
        rewardType: 'referral',
        salonName: 'GlowSlot Network',
        date: '1 Oct 2026',
        points: 100,
        status: 'completed',
        type: 'referral',
      },
      {
        id: 'tx-4',
        title: 'Redeemed on Salon Checkout',
        description: 'Points redeemed for discount on bill.',
        rewardType: 'redemption',
        salonName: 'Enrich Salon Indiranagar',
        date: '28 Sep 2026',
        points: -120,
        status: 'completed',
        type: 'redemption',
      },
      {
        id: 'tx-5',
        title: 'Partner QR Scan Cashback (Pending)',
        description: 'Pending verification for partner salon QR scan.',
        rewardType: 'qr_payment',
        salonName: 'Bounce Salon Jayanagar',
        date: '25 Sep 2026',
        qrBillPaise: 85000,
        points: 85,
        status: 'pending',
        type: 'qr_payment',
      },
      {
        id: 'tx-6',
        title: 'Welcome Bonus on Signup',
        description: 'GlowSlot new user registration bonus.',
        rewardType: 'signup_bonus',
        salonName: 'GlowSlot Platform',
        date: '15 Sep 2026',
        points: 100,
        status: 'expired',
        type: 'signup_bonus',
      },
    ];
  },

  async getPointsSummary(userId: string): Promise<{
    currentBalance: number;
    lifetimeEarned: number;
    lifetimeRedeemed: number;
    pendingPoints: number;
    expiredPoints: number;
  }> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.rpc('get_user_points_summary', {
          p_user_id: userId,
        });

        if (!error && data) {
          const res = Array.isArray(data) ? data[0] : data;
          if (res) {
            return {
              currentBalance: Number(res.current_balance) || 0,
              lifetimeEarned: Number(res.lifetime_earned) || 0,
              lifetimeRedeemed: Number(res.lifetime_redeemed) || 0,
              pendingPoints: Number(res.pending_points) || 0,
              expiredPoints: Number(res.expired_points) || 0,
            };
          }
        }
      } catch {}
    }

    // Default mock totals
    return {
      currentBalance: 280,
      lifetimeEarned: 400,
      lifetimeRedeemed: 120,
      pendingPoints: 85,
      expiredPoints: 100,
    };
  },

  async earnQrPaymentReward(userId: string, salonName: string, qrBillPaise: number): Promise<{
    success: boolean;
    pointsCredited: number;
  }> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.rpc('earn_qr_payment_reward', {
          p_user_id: userId,
          p_salon_name: salonName,
          p_qr_bill_paise: qrBillPaise,
        });

        if (!error && data) {
          const res = Array.isArray(data) ? data[0] : data;
          if (res) {
            return {
              success: res.success,
              pointsCredited: Number(res.points_credited) || 0,
            };
          }
        }
      } catch {}
    }

    return {
      success: true,
      pointsCredited: Math.floor(qrBillPaise / 1000),
    };
  },

  async processSecureQrPaymentRewards(params: {
    userId: string;
    salonId: string;
    billAmountPaise: number;
    transactionReference: string;
  }): Promise<{
    success: boolean;
    pointsEarned: number;
    error?: string;
  }> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.rpc('process_secure_qr_payment_rewards', {
          p_user_id: params.userId,
          p_salon_id: params.salonId,
          p_bill_amount_paise: params.billAmountPaise,
          p_transaction_reference: params.transactionReference,
        });

        if (!error && data) {
          const res = Array.isArray(data) ? data[0] : data;
          if (res) {
            return {
              success: res.success,
              pointsEarned: Number(res.points_earned) || 0,
              error: res.error_message,
            };
          }
        }
      } catch (err: any) {
        return { success: false, pointsEarned: 0, error: err?.message };
      }
    }

    return {
      success: true,
      pointsEarned: Math.floor(params.billAmountPaise / 1000),
    };
  },

  async getUserNavigationIndicators(userId: string): Promise<{
    currentPoints: number;
    unreadNotificationsCount: number;
    pendingBookingsCount: number;
    upcomingBookingsCount: number;
  }> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.rpc('get_user_navigation_indicators', {
          p_user_id: userId,
        });

        if (!error && data) {
          const res = Array.isArray(data) ? data[0] : data;
          if (res) {
            return {
              currentPoints: Number(res.current_points) || 0,
              unreadNotificationsCount: Number(res.unread_notifications_count) || 0,
              pendingBookingsCount: Number(res.pending_bookings_count) || 0,
              upcomingBookingsCount: Number(res.upcoming_bookings_count) || 0,
            };
          }
        }
      } catch {}
    }

    return {
      currentPoints: 280,
      unreadNotificationsCount: 2,
      pendingBookingsCount: 0,
      upcomingBookingsCount: 1,
    };
  },

  async earnReferralReward(referrerId: string, refereeId: string, points: number): Promise<boolean> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data } = await supabase.rpc('earn_referral_reward', {
          p_referrer_id: referrerId,
          p_referee_id: refereeId,
          p_points: points,
        });
        return !!data;
      } catch {
        return false;
      }
    }
    return true;
  },
};
