import React from 'react';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';
import { Button } from '../../../components/Button';
import { ArrowLeft, Gift, Copy, Share2, Users, CheckCircle, Award } from 'lucide-react';

interface ReferEarnScreenProps {
  onBack: () => void;
}

export const ReferEarnScreen: React.FC<ReferEarnScreenProps> = ({ onBack }) => {
  const { user } = useSessionStore();
  const { showToast } = useUIStore();

  const referralCode = `GLOW-${(user?.name || 'FRIEND').toUpperCase().slice(0, 4)}100`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    showToast(`Referral code ${referralCode} copied to clipboard!`);
  };

  // O10 Native Share Trigger per scope
  const handleNativeShare = async () => {
    const shareText = `Use my code ${referralCode} to get Rs.100 off on your first salon appointment with GlowSlot! Download here: https://glowslot.app`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GlowSlot Referral',
          text: shareText,
          url: 'https://glowslot.app',
        });
        showToast('Invite shared!');
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(shareText);
      showToast('Invite link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
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
          <h1 className="text-sm font-bold text-text">Refer & Earn (S27)</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Hero Card */}
        <div className="w-full rounded-card bg-gradient-to-r from-teal-700 via-primary to-indigo-800 text-white p-5 shadow-level-2 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-3">
            <Gift size={32} className="text-deal" />
          </div>

          <h2 className="text-lg font-bold">Invite Friends, Earn Rs.100</h2>
          <p className="text-xs text-white/80 max-w-xs mt-1 leading-relaxed">
            Give your friends flat Rs.100 off their first booking. You earn 100 Glow Points when they finish their visit.
          </p>
        </div>

        {/* Code Box */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            Your Unique Referral Code
          </span>

          <div className="flex items-center gap-2 w-full max-w-xs">
            <div className="flex-1 h-12 rounded-button bg-primary-soft border border-dashed border-primary flex items-center justify-center font-mono font-extrabold text-primary text-base tracking-wider">
              {referralCode}
            </div>

            <button
              onClick={handleCopy}
              className="h-12 w-12 rounded-button bg-surface border border-border flex items-center justify-center text-text hover:bg-primary-soft transition-colors cursor-pointer shrink-0"
              aria-label="Copy code"
            >
              <Copy size={18} />
            </button>
          </div>

          {/* O10 Native Share CTA */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 mt-1"
          >
            <Share2 size={16} />
            <span>Share with Friends</span>
          </Button>
        </div>

        {/* How it works */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider">
            How Referrals Work
          </h3>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <div>
                <span className="font-bold text-text block">Share Your Link</span>
                <p className="text-muted text-[11px] mt-0.5">Send your code via WhatsApp, Telegram, or social media.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <span className="font-bold text-text block">Friend Books a Slot</span>
                <p className="text-muted text-[11px] mt-0.5">They receive an instant flat Rs.100 discount at checkout.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <span className="font-bold text-text block">You Get 100 Points</span>
                <p className="text-muted text-[11px] mt-0.5">100 points (Rs.100 value) are automatically added to your wallet.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
