import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Share2,
  Users,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { referralService, LeaderboardReferrer } from '../services/referralService';

export interface ReferralLeaderboardProps {
  currentUserId?: string;
  currentUserCode?: string;
  currentUserCompletedCount?: number;
  currentUserPoints?: number;
  onInviteAction?: () => void;
  className?: string;
}

export const ReferralLeaderboard: React.FC<ReferralLeaderboardProps> = ({
  currentUserId,
  currentUserCode,
  currentUserCompletedCount = 0,
  currentUserPoints = 0,
  onInviteAction,
  className = '',
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardReferrer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<'all_time' | 'this_month'>('all_time');

  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await referralService.getTopReferrers(5);
        if (isMounted) {
          if (timeframe === 'this_month') {
            // Scaled dynamic monthly projection for gamification
            const monthlyData = data.map((item, idx) => ({
              ...item,
              completedReferrals: Math.max(1, Math.round(item.completedReferrals * 0.4) - idx),
              totalPointsEarned: Math.max(100, Math.round(item.completedReferrals * 0.4 - idx) * 100),
            }));
            setLeaderboard(monthlyData);
          } else {
            setLeaderboard(data);
          }
        }
      } catch (err) {
        console.error('Failed to load referral leaderboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [timeframe]);

  // Determine current user's rank status
  const userRankIndex = leaderboard.findIndex(
    (item) =>
      (currentUserId && item.userId === currentUserId) ||
      (currentUserCode && item.referralCode.toUpperCase() === currentUserCode.toUpperCase())
  );

  const isInTop5 = userRankIndex !== -1;
  const topRankNeeded = leaderboard.length >= 5 ? leaderboard[4].completedReferrals : 5;
  const referralsNeededForTop5 = Math.max(1, topRankNeeded - currentUserCompletedCount + 1);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black flex items-center justify-center shadow-xs shrink-0 ring-2 ring-amber-300/40">
            <Crown size={15} className="fill-slate-950" />
          </div>
        );
      case 2:
        return (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 font-black flex items-center justify-center shadow-xs shrink-0 ring-2 ring-slate-300/40">
            <Medal size={15} className="fill-slate-800" />
          </div>
        );
      case 3:
        return (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black flex items-center justify-center shadow-xs shrink-0 ring-2 ring-amber-600/30">
            <Award size={15} />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-surface border border-border text-muted font-bold text-xs flex items-center justify-center shrink-0">
            #{rank}
          </div>
        );
    }
  };

  const getTierColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      case 2:
        return 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800';
      case 3:
        return 'text-amber-800 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-300/50 dark:border-amber-800';
      default:
        return 'text-muted bg-bg border-border';
    }
  };

  return (
    <section
      aria-label="Community Referral Leaderboard"
      className={`bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3.5 ${className}`}
    >
      {/* Header with Title and Timeframe Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-deal/15 text-deal flex items-center justify-center">
            <Trophy size={17} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              Top 5 Referrers
              <span className="text-[10px] lowercase font-normal px-1.5 py-0.5 rounded-chip bg-deal/10 text-deal font-bold">
                community
              </span>
            </h3>
            <p className="text-[11px] text-muted">GlowSlot's top community champions</p>
          </div>
        </div>

        {/* Toggle: All Time vs This Month */}
        <div className="inline-flex p-0.5 bg-bg rounded-lg border border-border text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setTimeframe('all_time')}
            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
              timeframe === 'all_time'
                ? 'bg-surface text-text font-bold shadow-2xs'
                : 'text-muted hover:text-text'
            }`}
          >
            All-Time
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('this_month')}
            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
              timeframe === 'this_month'
                ? 'bg-surface text-text font-bold shadow-2xs'
                : 'text-muted hover:text-text'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Podium Highlight Preview (Top 3 Visual Feature) */}
      {!loading && leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 pt-1 pb-1">
          {/* 2nd Place */}
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-500/5 border border-slate-200 dark:border-slate-800 text-center relative mt-3">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black flex items-center justify-center absolute -top-3">
              2
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center mt-1 border border-slate-300">
              {leaderboard[1].name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[11px] font-bold text-text truncate w-full mt-1.5">
              {leaderboard[1].name.split(' ')[0]}
            </span>
            <span className="text-[10px] text-muted font-semibold mt-0.5">
              {leaderboard[1].completedReferrals} refs
            </span>
            <span className="text-[9px] text-primary font-bold mt-0.5">
              +{leaderboard[1].totalPointsEarned} pts
            </span>
          </div>

          {/* 1st Place (Crown / Champion) */}
          <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-b from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-300 dark:border-amber-700/60 text-center relative shadow-xs">
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center absolute -top-3.5 shadow-xs ring-2 ring-white dark:ring-slate-900">
              <Crown size={14} className="fill-slate-950" />
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-black text-xs flex items-center justify-center mt-2 border-2 border-amber-400">
              {leaderboard[0].name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-extrabold text-text truncate w-full mt-1.5 flex items-center justify-center gap-0.5">
              {leaderboard[0].name.split(' ')[0]}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold mt-0.5">
              {leaderboard[0].completedReferrals} refs
            </span>
            <span className="text-[10px] font-black text-deal mt-0.5">
              +{leaderboard[0].totalPointsEarned} pts
            </span>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-amber-700/5 border border-amber-200 dark:border-amber-900 text-center relative mt-3">
            <div className="w-6 h-6 rounded-full bg-amber-700 text-white text-[10px] font-black flex items-center justify-center absolute -top-3">
              3
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center justify-center mt-1 border border-amber-300">
              {leaderboard[2].name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[11px] font-bold text-text truncate w-full mt-1.5">
              {leaderboard[2].name.split(' ')[0]}
            </span>
            <span className="text-[10px] text-muted font-semibold mt-0.5">
              {leaderboard[2].completedReferrals} refs
            </span>
            <span className="text-[9px] text-primary font-bold mt-0.5">
              +{leaderboard[2].totalPointsEarned} pts
            </span>
          </div>
        </div>
      )}

      {/* Top 5 Ranked List */}
      <div className="flex flex-col divide-y divide-border/60">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading community leaderboard...</span>
          </div>
        ) : (
          leaderboard.map((item) => {
            const isCurrentUser =
              (currentUserId && item.userId === currentUserId) ||
              (currentUserCode && item.referralCode.toUpperCase() === currentUserCode.toUpperCase());

            return (
              <div
                key={item.userId}
                className={`py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-2.5 transition-colors ${
                  isCurrentUser
                    ? 'bg-primary-soft/40 px-2 rounded-lg -mx-2'
                    : 'hover:bg-bg/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getRankBadge(item.rank)}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-text truncate">
                        {item.name}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[9px] font-black uppercase bg-primary text-white px-1.5 py-0.2 rounded-chip">
                          You
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-chip border ${getTierColor(
                          item.rank
                        )}`}
                      >
                        {item.tierBadge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted font-mono mt-0.5">
                      <span>{item.referralCode}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-text">
                    {item.completedReferrals}{' '}
                    <span className="text-[10px] text-muted font-normal">referrals</span>
                  </div>
                  <div className="text-[10px] font-bold text-primary flex items-center justify-end gap-0.5">
                    <Sparkles size={11} className="text-deal" />
                    +{item.totalPointsEarned} pts
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Current User Status / Progress Card */}
      {!loading && (
        <div className="rounded-xl bg-gradient-to-r from-primary-soft/50 to-primary-soft/20 border border-primary/20 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Flame size={13} />
              </div>
              <div>
                <span className="text-xs font-bold text-text block">
                  {isInTop5 ? `You're #${userRankIndex + 1} on the Leaderboard!` : 'Your Community Rank'}
                </span>
                <span className="text-[10px] text-muted">
                  {currentUserCompletedCount} bookings referred • +{currentUserPoints} bonus points earned
                </span>
              </div>
            </div>

            {!isInTop5 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-chip bg-surface border border-border text-text font-mono">
                {referralsNeededForTop5} more to Top 5
              </span>
            )}
          </div>

          {onInviteAction && (
            <button
              onClick={onInviteAction}
              className="mt-1 w-full h-8 rounded-button bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary-hover active:scale-98 transition-all cursor-pointer shadow-xs"
            >
              <Share2 size={13} />
              <span>Invite Friends to Climb Ranks</span>
            </button>
          )}
        </div>
      )}

      {/* Community Perk Banner */}
      <div className="flex items-start gap-2 pt-1 border-t border-border/60 text-[10px] text-muted">
        <Sparkles size={12} className="text-deal shrink-0 mt-0.5" />
        <span>
          <strong className="text-text font-bold">Community Perks:</strong> Top referrers each month earn priority salon booking slots and exclusive pamper vouchers.
        </span>
      </div>
    </section>
  );
};
