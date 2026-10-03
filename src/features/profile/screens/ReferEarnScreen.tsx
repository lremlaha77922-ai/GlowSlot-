import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';
import { Button } from '../../../components/Button';
import { referralService, ReferralItem } from '../services/referralService';
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
} from 'lucide-react';
import { Share } from '@capacitor/share';

interface ReferEarnScreenProps {
  onBack: () => void;
}

export const ReferEarnScreen: React.FC<ReferEarnScreenProps> = ({ onBack }) => {
  const { user, updatePoints } = useSessionStore();
  const { showToast } = useUIStore();

  const referralCode = user?.referralCode || `GLOW-${(user?.name || 'FRIEND').toUpperCase().replace(/\s+/g, '').slice(0, 4)}100`;
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

  // States for entering a referral code later (REF-5, REF-8)
  const [inputReferralCode, setInputReferralCode] = useState('');
  const [inputError, setInputError] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(() => {
    return localStorage.getItem(`glowslot_applied_code_${user?.id || 'guest'}`);
  });

  useEffect(() => {
    const loadStats = async () => {
      const data = await referralService.getReferralStats(user?.id);
      setStats(data);
    };
    loadStats();
  }, [user?.id]);

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

    // Call service to record referral signup
    const res = await referralService.recordReferralSignup(
      code,
      user?.email || 'new.user@glowslot.com',
      user?.name || 'GlowSlot User'
    );

    if (res.success) {
      localStorage.setItem(`glowslot_applied_code_${user?.id || 'guest'}`, code);
      setAppliedCode(code);
      showToast(`Referral code ${code} applied successfully!`);
    } else {
      setInputError(res.error || 'Failed to apply referral code.');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedType('code');
    showToast(`Referral code ${referralCode} copied!`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedType('link');
    showToast('Unique referral link copied to clipboard!');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleNativeShare = async () => {
    const shareText = `Use my invite code ${referralCode} to get flat Rs.100 off your first grooming booking on GlowSlot! Join here: ${referralLink}`;
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
          // Cancelled
        }
      } else {
        navigator.clipboard.writeText(shareText);
        showToast('Invite link copied to clipboard!');
      }
    }
  };

  // Simulate verifying and awarding points for a pending referral
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
    updatePoints(currentPts + 100);
    showToast('Referral verified! +100 points credited to both parties.');
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-bold text-text">Refer & Earn Dashboard</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Hero Card */}
        <div className="w-full rounded-card bg-gradient-to-br from-teal-700 via-primary to-indigo-800 text-white p-5 shadow-level-2 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-3">
            <Gift size={32} className="text-deal" />
          </div>

          <h2 className="text-lg font-extrabold">Invite Friends, Earn Rs.100</h2>
          <p className="text-xs text-white/85 max-w-xs mt-1 leading-relaxed">
            Give your friends flat Rs.100 off their first booking. You earn 100 Glow Points instantly when they complete their first visit.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mt-4 pt-4 border-t border-white/20 text-xs">
            <div>
              <span className="text-white/70 block text-[10px] uppercase font-semibold">Total Referred</span>
              <span className="text-base font-bold font-mono">{stats.totalReferrals} Friends</span>
            </div>
            <div>
              <span className="text-white/70 block text-[10px] uppercase font-semibold">Total Earned</span>
              <span className="text-base font-bold font-mono">{stats.totalPointsEarned} Pts</span>
            </div>
          </div>
        </div>

        {/* Unique Code & Link Box */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-3.5">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            Your Unique Referral Code & Link
          </span>

          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-11 rounded-button bg-primary-soft border border-dashed border-primary flex items-center justify-center font-mono font-extrabold text-primary text-sm tracking-wider">
              {referralCode}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="h-11 px-3 text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              {copiedType === 'code' ? <CheckCircle2 size={16} className="text-success" /> : <Copy size={16} />}
              <span>{copiedType === 'code' ? 'Copied' : 'Copy Code'}</span>
            </Button>
          </div>

          {/* Unique URL Link */}
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-10 rounded-button bg-bg border border-border px-3 flex items-center gap-2 text-xs font-mono text-muted truncate">
              <LinkIcon size={14} className="text-primary shrink-0" />
              <span className="truncate">{referralLink}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-10 px-3 text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              {copiedType === 'link' ? <CheckCircle2 size={16} className="text-success" /> : <Copy size={16} />}
              <span>{copiedType === 'link' ? 'Copied' : 'Copy Link'}</span>
            </Button>
          </div>

          {/* Share CTA */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 mt-1 shadow-xs font-extrabold"
          >
            <Share2 size={16} />
            <span>Share Invite via WhatsApp / Socials</span>
          </Button>
        </div>

        {/* Have a Referral Code card (REF-5) */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
            <Gift size={15} className="text-primary" /> Have a Referral Code?
          </h3>
          <p className="text-[11px] text-muted leading-relaxed">
            If you skipped entering a code during signup, you can apply it here before your first booking to unlock rewards.
          </p>

          {appliedCode ? (
            <div className="h-11 rounded-button bg-success/15 border border-success/30 px-3 flex items-center gap-2 text-xs text-success font-semibold">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Applied Code: <span className="font-mono font-bold tracking-wider">{appliedCode}</span></span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
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
                  Apply Code
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

        {/* Referred Friends Tracking List */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Users size={15} className="text-primary" /> Tracked Friend Signups ({stats.referrals.length})
            </h3>
            <span className="text-[11px] text-muted font-medium">Auto-verified database</span>
          </div>

          <div className="flex flex-col gap-2.5 divide-y divide-border/60">
            {stats.referrals.map((ref) => {
              const isCompleted = ref.status === 'completed';
              return (
                <div key={ref.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-text">{ref.friendName}</h4>
                    <span className="text-[10px] text-muted block font-mono">{ref.friendEmail} • {ref.date}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-chip border border-emerald-200">
                        <CheckCircle2 size={12} /> +{ref.pointsEarned} Pts Credited
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-chip border border-amber-200">
                          <Clock size={12} /> Pending Visit
                        </span>
                        <button
                          onClick={() => handleVerifyReferral(ref.id)}
                          className="text-[10px] font-bold bg-primary text-white px-2 py-1 rounded-chip hover:bg-primary-hover cursor-pointer"
                        >
                          Verify & Award
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider">
            How Referrals & Auto-Points Work
          </h3>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <div>
                <span className="font-bold text-text block">Share Your Link</span>
                <p className="text-muted text-[11px] mt-0.5">Send your unique invite link via WhatsApp, SMS, or social media.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <span className="font-bold text-text block">Friend Joins & Books</span>
                <p className="text-muted text-[11px] mt-0.5">Your friend gets flat Rs.100 off their first salon appointment.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <span className="font-bold text-text block">Automatic Points Grant</span>
                <p className="text-muted text-[11px] mt-0.5">Upon visit verification, 100 points are automatically credited to both parties.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
