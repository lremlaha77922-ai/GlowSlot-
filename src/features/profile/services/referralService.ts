import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export interface ReferralItem {
  id: string;
  friendName: string;
  friendEmail: string;
  status: 'completed' | 'pending';
  pointsEarned: number;
  date: string;
}

export interface LeaderboardReferrer {
  rank: number;
  userId: string;
  name: string;
  referralCode: string;
  completedReferrals: number;
  totalPointsEarned: number;
  tierBadge: string;
  avatarUrl?: string;
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

  async applyReferral(referralCode: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { error } = await supabase.rpc('apply_referral', { p_referral_code: referralCode.trim() });
        if (error) {
          console.error('[REFERRAL] apply_referral RPC failed:', error.message);
          return { success: false, error: error.message };
        }
        console.log('[REFERRAL] Referral applied successfully!');
        return { success: true };
      } catch (err: any) {
        console.error('[REFERRAL] apply_referral RPC exception:', err);
        return { success: false, error: err?.message || 'Failed to apply referral' };
      }
    }
    return { success: true };
  },

  async getTopReferrers(limit: number = 5): Promise<LeaderboardReferrer[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('referral_leaderboard')
          .select('*')
          .order('completed_referrals', { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          return data.map((item: any, idx: number) => ({
            rank: idx + 1,
            userId: item.user_id || `user-${idx + 1}`,
            name: item.user_name || 'Community Member',
            referralCode: item.referral_code || `GLOW-VIP${idx + 1}`,
            completedReferrals: item.completed_referrals || 0,
            totalPointsEarned: item.total_points || (item.completed_referrals || 0) * 100,
            tierBadge:
              idx === 0
                ? 'Diamond Champion'
                : idx === 1
                ? 'Platinum Influencer'
                : idx === 2
                ? 'Gold Ambassador'
                : idx === 3
                ? 'Silver Star'
                : 'Rising Advocate',
          }));
        }
      } catch {
        // Fallback to community mock data
      }
    }

    // Community mock leaderboard (top 5 GlowSlot referrers)
    const communityTopReferrers: LeaderboardReferrer[] = [
      {
        rank: 1,
        userId: 'top-1',
        name: 'Ananya Verma',
        referralCode: 'GLOW-ANAN100',
        completedReferrals: 28,
        totalPointsEarned: 2800,
        tierBadge: 'Diamond Champion',
      },
      {
        rank: 2,
        userId: 'top-2',
        name: 'Rohan Mehta',
        referralCode: 'GLOW-ROHA100',
        completedReferrals: 21,
        totalPointsEarned: 2100,
        tierBadge: 'Platinum Influencer',
      },
      {
        rank: 3,
        userId: 'top-3',
        name: 'Sneha Kapoor',
        referralCode: 'GLOW-SNEH100',
        completedReferrals: 17,
        totalPointsEarned: 1700,
        tierBadge: 'Gold Ambassador',
      },
      {
        rank: 4,
        userId: 'top-4',
        name: 'Arjun Patel',
        referralCode: 'GLOW-ARJU100',
        completedReferrals: 12,
        totalPointsEarned: 1200,
        tierBadge: 'Silver Star',
      },
      {
        rank: 5,
        userId: 'top-5',
        name: 'Pooja Nair',
        referralCode: 'GLOW-POOJ100',
        completedReferrals: 9,
        totalPointsEarned: 900,
        tierBadge: 'Rising Advocate',
      },
    ];

    return communityTopReferrers.slice(0, limit);
  }
};
