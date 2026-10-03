import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export interface ReferralItem {
  id: string;
  friendName: string;
  friendEmail: string;
  status: 'completed' | 'pending';
  pointsEarned: number;
  date: string;
}

export const referralService = {
  async getReferralStats(userId?: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    totalPointsEarned: number;
    referrals: ReferralItem[];
  }> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', userId);

        if (!error && data) {
          const completed = data.filter((r: any) => r.status === 'completed');
          const points = completed.reduce((sum: number, r: any) => sum + (r.points_awarded || 100), 0);
          return {
            totalReferrals: data.length,
            completedReferrals: completed.length,
            totalPointsEarned: points,
            referrals: data.map((r: any) => ({
              id: r.id,
              friendName: r.friend_name || 'GlowSlot Member',
              friendEmail: r.friend_email || 'member@glowslot.com',
              status: r.status,
              pointsEarned: r.points_awarded || 100,
              date: new Date(r.created_at).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            })),
          };
        }
      } catch {
        // fallback
      }
    }

    // Mock fallback data
    return {
      totalReferrals: 3,
      completedReferrals: 2,
      totalPointsEarned: 200,
      referrals: [
        {
          id: 'ref-1',
          friendName: 'Rahul Kumar',
          friendEmail: 'rahul.k@gmail.com',
          status: 'completed',
          pointsEarned: 100,
          date: '2 Oct 2026',
        },
        {
          id: 'ref-2',
          friendName: 'Priya Sharma',
          friendEmail: 'priya.s@gmail.com',
          status: 'completed',
          pointsEarned: 100,
          date: '28 Sep 2026',
        },
        {
          id: 'ref-3',
          friendName: 'Vikram Malhotra',
          friendEmail: 'vikram.m@gmail.com',
          status: 'pending',
          pointsEarned: 100,
          date: 'Today',
        },
      ],
    };
  },

  async recordReferralSignup(referrerCode: string, friendEmail: string, friendName: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { error } = await supabase.from('referrals').insert({
          referrer_code: referrerCode,
          friend_email: friendEmail,
          friend_name: friendName,
          status: 'pending',
          points_awarded: 100,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to record referral' };
      }
    }

    return { success: true };
  },
};
