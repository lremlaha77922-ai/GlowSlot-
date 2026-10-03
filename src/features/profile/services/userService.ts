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
            points: Number(t.points),
            type: t.type as PointsTransaction['type'],
            date: new Date(t.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          }));
        }
      } catch {
        // fallback
      }
    }

    return [
      {
        id: 'tx-1',
        title: 'Completed Haircut & Beard Grooming',
        points: 50,
        type: 'booking_reward',
        date: 'Today, 11:30 AM',
      },
      {
        id: 'tx-2',
        title: 'Referral bonus from Rahul K.',
        points: 30,
        type: 'referral',
        date: 'Yesterday, 04:15 PM',
      },
      {
        id: 'tx-3',
        title: 'Redeemed on Salon Checkout',
        points: -40,
        type: 'redemption',
        date: '28 Sep 2026',
      },
      {
        id: 'tx-4',
        title: 'Welcome bonus on signup',
        points: 100,
        type: 'signup_bonus',
        date: '15 Sep 2026',
      },
    ];
  },
};
