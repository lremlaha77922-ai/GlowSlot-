import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';
import { Button } from '../../../components/Button';
import { referralService, ReferralItem } from '../services/referralService';
import { ReferralLeaderboard } from './ReferralLeaderboard';
import {
  ArrowLeft,
  Gift,
  Copy,
  Share2,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Award,
  RefreshCw,
  TrendingUp,
  Check,
  Zap,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { Share } from '@capacitor/share';

export interface ReferralDashboardProps {
  onBack?: () => void;
  embedded?: boolean;
  customUserId?: string;
  onPointsUpdated?: (newPoints: number) => void;
}

export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({
  onBack,
  embedded = false,
  customUserId,
  onPointsUpdated,
}) => {
  const { user, updatePoints } = useSessionStore();
  const { showToast } = useUIStore();

  // Generate unique code based on user name or fallback
  const defaultCode = user?.referralCode || `GLOW-${(user?.name || 'USER').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'VIP'}100`;
  const storageKey = `glowslot_referral_code_${customUserId || user?.id || 'guest'}`;
  const [referralCode, setReferralCode] = useState<string>(() => {
    return localStorage.getItem(storageKey) || defaultCode;
  });
  const [customAlias, setCustomAlias] = useState<string>('');
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  // Invite link generated from referral code
  const referralLink = `https://glowslot.app/invite?ref=${referralCode}`;

  const [stats, setStats] = useState<{
    totalReferrals: number;
    completedReferrals: number;
    totalPointsEarned: number;
    referrals: ReferralItem[];
  }>({
    totalReferrals: 0,
    completedReferrals: 0,
    totalPointsEarned: 0,
    referrals: [],
  });

  const [copiedType, setCopiedType] = useState<'code' | 'link' | null>(null);

  // Entering someone else's referral code
  const [inputReferralCode, setInputReferralCode] = useState('');
  const [inputError, setInputError] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(() => {
    return localStorage.getItem(`glowslot_applied_code_${customUserId || user?.id || 'guest'}`);
  });

  useEffect(() => {
    const loadStats = async () => {
      const data = await referralService.getReferralStats(customUserId || user?.id);
      setStats(data);
    };
    loadStats();
  }, [customUserId, user?.id]);

  // Handle regenerating / customizing unique invite link
  const handleGenerateCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customAlias.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
    if (!cleaned || cleaned.length < 3) {
      showToast('Custom code must be at least 3 characters.');
      return;
    }
    const newCode = `GLOW-${cleaned}`;
    setReferralCode(newCode);
    localStorage.setItem(storageKey, newCode);
    setIsCustomizing(false);
    setCustomAlias('');
    showToast(`New unique invite code generated: ${newCode}!`);
  };

  const handleResetToDefaultCode = () => {
    setReferralCode(defaultCode);
    localStorage.removeItem(storageKey);
    setIsCustomizing(false);
    showToast('Reset to default unique referral code.');
  };

  const handleCopyCode = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(referralCode);
    }
    setCopiedType('code');
    showToast(`Referral code ${referralCode} copied!`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(referralLink);
    }
    setCopiedType('link');
    showToast('Unique invite link copied to clipboard!');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleNativeShare = async () => {
    const shareText = `Use my invite code ${referralCode} to get flat Rs.100 off your first salon appointment on GlowSlot! Join and book here: ${referralLink}`;
    try {
      await Share.share({
        title: 'GlowSlot Referral Invite',
        text: shareText,
        url: referralLink,
        dialogTitle: 'Share GlowSlot Invite',
      });
      showToast('Invite shared successfully!');
    } catch {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'GlowSlot Referral Invite',
            text: shareText,
            url: referralLink,
          });
          showToast('Invite shared successfully!');
        } catch {
          // User cancelled
        }
      } else {
        if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(shareText);
        }
        showToast('Invite message copied to clipboard!');
      }
    }
  };

  // Simulate verifying a pending friend booking and granting bonus loyalty points
  const handleVerifyReferral = (refId: string) => {
    setStats((prev) => {
      const updated = prev.referrals.map((r) =>
        r.id === refId ? { ...r, status: 'completed' as const } : r
      );
      const newCompleted = updated.filter((r) => r.status === 'completed').length;
      const newPoints = newCompleted * 100;
      return {
        ...prev,
        completedReferrals: newCompleted,
        totalPointsEarned: newPoints,
        referrals: updated,
      };
    });

    const currentPts = user?.points || 250;
    const newTotalPoints = currentPts + 100;
    updatePoints(newTotalPoints);
    if (onPointsUpdated) {
      onPointsUpdated(newTotalPoints);
    }
    showToast('Friend booking completed! +100 Bonus Loyalty Points credited!');
  };

  const handleApplyReferralCode = async () => {
    setInputError('');
    const code = inputReferralCode.trim().toUpperCase();

    if (!code) {
      setInputError('Please enter a referral code.');
      return;
    }

    if (code === referralCode) {
      setInputError('You cannot refer yourself (Abuse Protection).');
      return;
    }

    if (code.length < 6) {
      setInputError('Invalid referral code length.');
      return;
    }

    const res = await referralService.recordReferralSignup(
      code,
      user?.email || 'new.user@glowslot.com',
      user?.name || 'GlowSlot User'
    );

    if (res.success) {
      localStorage.setItem(`glowslot_applied_code_${customUserId || user?.id || 'guest'}`, code);
      setAppliedCode(code);
      showToast(`Referral code ${code} applied successfully!`);
    } else {
      setInputError(res.error || 'Failed to apply referral code.');
    }
  };

  // Milestone calculation
  const nextMilestoneCount = stats.completedReferrals < 1 ? 1 : stats.completedReferrals < 3 ? 3 : 5;
  const bookingsNeededForMilestone = Math.max(0, nextMilestoneCount - stats.completedReferrals);

  return (
    <div className={`text-text ${embedded ? 'w-full' : 'min-h-screen bg-bg pb-28'}`}>
      {/* Top Header if not embedded */}
      {!embedded && onBack && (
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-sm font-bold text-text">Referral Dashboard</h1>
          </div>
          <div className="flex items-center gap-1 bg-deal/10 text-deal font-bold text-xs px-2.5 py-1 rounded-chip border border-deal/20">
            <Sparkles size={13} />
            <span>100 Pts / Booking</span>
          </div>
        </header>
      )}

      <div className={`flex flex-col gap-4 ${embedded ? 'w-full' : 'p-4 max-w-lg mx-auto w-full'}`}>
        {/* Hero Rewards Card */}
        <div className="w-full rounded-card bg-gradient-to-br from-teal-700 via-primary to-indigo-800 text-white p-5 shadow-level-2 text-center flex flex-col items-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-3 shadow-inner">
            <Gift size={30} className="text-deal" />
          </div>

          <h2 className="text-lg font-extrabold tracking-tight">Refer Friends, Earn Loyalty Points</h2>
          <p className="text-xs text-white/90 max-w-xs mt-1.5 leading-relaxed">
            Share your unique invite link. When friends complete their first appointment, you earn{' '}
            <strong className="text-deal font-black">+100 Bonus Loyalty Points</strong>, and they get{' '}
            <strong className="text-deal font-black">₹100 Off</strong>.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-4 border-t border-white/20 text-xs">
            <div className="flex flex-col items-center">
              <span className="text-white/70 text-[10px] uppercase font-semibold">Total Invited</span>
              <span className="text-base font-black font-mono mt-0.5">{stats.totalReferrals}</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/15">
              <span className="text-white/70 text-[10px] uppercase font-semibold">Bookings Completed</span>
              <span className="text-base font-black font-mono mt-0.5 text-deal">{stats.completedReferrals}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white/70 text-[10px] uppercase font-semibold">Bonus Points</span>
              <span className="text-base font-black font-mono mt-0.5">{stats.totalPointsEarned} Pts</span>
            </div>
          </div>
        </div>

        {/* Unique Invite Link Generator Card */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon size={14} className="text-primary" /> Your Unique Invite Link &amp; Code
            </span>
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={11} className={isCustomizing ? 'rotate-180 transition-transform' : ''} />
              <span>{isCustomizing ? 'Cancel' : 'Customize Code'}</span>
            </button>
          </div>

          {/* Custom Code Input Form */}
          {isCustomizing && (
            <form onSubmit={handleGenerateCustomCode} className="p-3 bg-bg rounded-card border border-border flex flex-col gap-2">
              <label className="text-[11px] font-bold text-text">
                Generate Custom Referral Tag:
              </label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-surface border border-border rounded-button px-2.5 focus-within:border-primary">
                  <span className="text-xs font-mono font-bold text-muted pr-1">GLOW-</span>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="MYNAME"
                    maxLength={10}
                    className="w-full py-2 bg-transparent text-xs font-mono font-bold uppercase focus:outline-none"
                  />
                </div>
                <Button variant="primary" size="sm" type="submit" className="text-xs font-bold px-3">
                  Set Link
                </Button>
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted">
                <span>Alphanumeric, 3-10 chars</span>
                <button
                  type="button"
                  onClick={handleResetToDefaultCode}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Reset default
                </button>
              </div>
            </form>
          )}

          {/* Referral Code Box with Copy */}
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-11 rounded-button bg-primary-soft/60 border border-dashed border-primary flex items-center justify-between px-3">
              <span className="text-[10px] uppercase font-bold text-muted">Code:</span>
              <span className="font-mono font-black text-primary text-sm tracking-wider">
                {referralCode}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="h-11 px-3 text-xs font-bold flex items-center gap-1.5 shrink-0"
              aria-label="Copy referral code"
            >
              {copiedType === 'code' ? (
                <>
                  <Check size={15} className="text-success" />
                  <span className="text-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>

          {/* Unique Link Box with Copy */}
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-10 rounded-button bg-bg border border-border px-3 flex items-center gap-2 text-xs font-mono text-muted truncate">
              <LinkIcon size={13} className="text-primary shrink-0" />
              <span className="truncate">{referralLink}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-10 px-3 text-xs font-bold flex items-center gap-1.5 shrink-0"
              aria-label="Copy invite link"
            >
              {copiedType === 'link' ? (
                <>
                  <Check size={14} className="text-success" />
                  <span className="text-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>

          {/* Direct WhatsApp / Social Share Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 mt-0.5 font-black shadow-xs"
          >
            <Share2 size={16} />
            <span>Share Invite via WhatsApp / Socials</span>
          </Button>
        </div>

        {/* Milestone Booster Card */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-deal" /> Referral Rewards Milestone
            </span>
            <span className="text-[11px] font-extrabold text-primary font-mono">
              {stats.completedReferrals} / {nextMilestoneCount} Completed
            </span>
          </div>

          {/* Visual Milestone Progress */}
          <div className="w-full h-2 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min(100, (stats.completedReferrals / nextMilestoneCount) * 100)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted">
            {bookingsNeededForMilestone === 0 ? (
              <span className="text-deal font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Target unlocked! Next VIP tier active!
              </span>
            ) : (
              <span>
                Need <strong className="text-text font-black">{bookingsNeededForMilestone} more friend booking{bookingsNeededForMilestone > 1 ? 's' : ''}</strong> to hit milestone bonus
              </span>
            )}
            <span className="text-[10px] font-bold text-primary font-mono">
              +{nextMilestoneCount * 100} pts milestone
            </span>
          </div>
        </div>

        {/* Tracked Friend Bookings List */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-1.5">
              <Users size={15} className="text-primary" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                Tracked Referrals ({stats.referrals.length})
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-muted">Live Auto-Reward System</span>
          </div>

          {stats.referrals.length === 0 ? (
            <div className="py-6 text-center flex flex-col items-center justify-center text-muted">
              <Users size={24} className="opacity-40 mb-1" />
              <p className="text-xs font-medium">No referrals yet.</p>
              <p className="text-[11px] text-muted/80">Share your invite link above to start earning loyalty points!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 divide-y divide-border/60">
              {stats.referrals.map((ref) => {
                const isCompleted = ref.status === 'completed';
                return (
                  <div key={ref.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-text flex items-center gap-1">
                        {ref.friendName}
                      </h4>
                      <span className="text-[10px] text-muted block font-mono">
                        {ref.friendEmail} • {ref.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 px-2 py-1 rounded-chip border border-emerald-200 shadow-2xs">
                          <CheckCircle2 size={12} /> +{ref.pointsEarned} Pts Credited
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 px-2 py-1 rounded-chip border border-amber-200">
                            <Clock size={11} /> Pending Booking
                          </span>
                          <button
                            onClick={() => handleVerifyReferral(ref.id)}
                            className="text-[10px] font-bold bg-primary text-white px-2 py-1 rounded-chip hover:bg-primary-hover active:scale-95 transition-all cursor-pointer shadow-2xs"
                            title="Simulate friend completed appointment and award points"
                          >
                            Verify &amp; Award
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Community Referral Leaderboard */}
        <ReferralLeaderboard
          currentUserId={user?.id || customUserId}
          currentUserCode={referralCode}
          currentUserCompletedCount={stats.completedReferrals}
          currentUserPoints={stats.totalPointsEarned}
          onInviteAction={handleNativeShare}
        />

        {/* Enter Someone Else's Invite Code */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-2.5">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
            <Gift size={14} className="text-primary" /> Have a Friend's Invite Code?
          </h3>
          <p className="text-[11px] text-muted leading-relaxed">
            Enter a friend's unique code to get ₹100 discount coupon applied to your first appointment.
          </p>

          {appliedCode ? (
            <div className="h-10 rounded-button bg-success/15 border border-success/30 px-3 flex items-center gap-2 text-xs text-success font-semibold">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>
                Applied Code: <strong className="font-mono font-black">{appliedCode}</strong>
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. GLOW-RAHU100"
                  value={inputReferralCode}
                  onChange={(e) => {
                    setInputReferralCode(e.target.value.toUpperCase());
                    setInputError('');
                  }}
                  className="flex-1 h-10 px-3 rounded-button border border-border bg-bg text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-primary"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyReferralCode}
                  className="h-10 px-4 text-xs font-bold shrink-0"
                >
                  Apply
                </Button>
              </div>
              {inputError && (
                <span className="text-[10px] text-error font-semibold pl-1">
                  {inputError}
                </span>
              )}
            </div>
          )}
        </div>

        {/* How Referral & Loyalty Points Work */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={14} className="text-muted" /> How Bonus Loyalty Points Work
          </h3>

          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                1
              </span>
              <div>
                <span className="font-bold text-text block">Generate &amp; Share</span>
                <p className="text-muted text-[11px] leading-tight">Send your unique invite link to friends via WhatsApp or social apps.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                2
              </span>
              <div>
                <span className="font-bold text-text block">Friend Books &amp; Gets ₹100 Off</span>
                <p className="text-muted text-[11px] leading-tight">Your friend receives an instant ₹100 discount coupon on their appointment.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                3
              </span>
              <div>
                <span className="font-bold text-text block">+100 Bonus Loyalty Points Credited</span>
                <p className="text-muted text-[11px] leading-tight">The moment their salon appointment is completed, 100 points land in your wallet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
