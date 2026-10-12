import React, { useEffect, useState } from 'react';
import { Gift, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useSessionStore } from '../../../store/useSessionStore';

export interface InviteLandingPageProps {
  /**
   * Callback fired when user clicks 'Join Nexora' or 'Join Nexora',
   * passing validated referral code and transitioning to the onboarding / signup flow.
   */
  onJoin?: (referralCode: string) => void;
  /**
   * Optional callback to redirect to sign in if user already has an account.
   */
  onSignIn?: () => void;
  /**
   * Brand title override (defaults to 'Nexora')
   */
  brandName?: string;
}

export const InviteLandingPage: React.FC<InviteLandingPageProps> = ({
  onJoin,
  onSignIn,
  brandName = 'Nexora',
}) => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [isValidCode, setIsValidCode] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  const { setReferralCode: setStoreReferralCode, getReferralCode } = useSessionStore();

  useEffect(() => {
    // Extract 'ref' query parameter from URL (also checks 'referral' alias)
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('ref') || params.get('referral');
    const existingStored = getReferralCode();

    const activeCode = codeParam || existingStored || '';

    if (activeCode) {
      const sanitized = activeCode.trim().toUpperCase();
      setReferralCode(sanitized);

      // Validate referral code logic:
      // Valid codes should be at least 4 alphanumeric characters (e.g., GLOW-XXXX or NEX-XXXX or alphanumeric alias)
      const validFormat = /^[A-Z0-9_-]{4,20}$/.test(sanitized);
      if (validFormat) {
        setIsValidCode(true);
        setValidationMessage('Verified active referral code');
        // Preserve referral attribution in local state & session storage
        setStoreReferralCode(sanitized);
        try {
          localStorage.setItem('glowslot_invite_ref', sanitized);
        } catch {
          // ignore storage errors
        }
      } else {
        setIsValidCode(false);
        setValidationMessage('Invalid referral code format');
      }
    } else {
      setReferralCode('');
      setIsValidCode(false);
      setValidationMessage('No referral code detected');
    }
  }, [setStoreReferralCode, getReferralCode]);

  const handleJoinNexora = () => {
    const codeToPreserve = isValidCode ? referralCode : '';
    if (codeToPreserve) {
      setStoreReferralCode(codeToPreserve);
      try {
        localStorage.setItem('glowslot_invite_ref', codeToPreserve);
      } catch {
        // ignore
      }
    }

    if (onJoin) {
      onJoin(codeToPreserve);
    }
  };

  const handleCopyCode = () => {
    if (referralCode && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(referralCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-6 max-w-lg mx-auto">
      {/* Top Hero Section */}
      <div className="pt-8 flex flex-col items-center text-center">
        {/* Glow / Icon badge */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-[24px] bg-primary text-white flex items-center justify-center shadow-level-2 transform -rotate-2 hover:rotate-0 transition-transform">
            <Gift size={38} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-deal text-white flex items-center justify-center text-xs font-black shadow-xs">
            <Sparkles size={14} />
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-soft text-primary uppercase tracking-wider mb-3">
          VIP Invitation
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight mb-2">
          You're Invited to {brandName}
        </h1>
        <p className="text-sm text-muted max-w-xs leading-relaxed">
          Unlock guaranteed salon appointments, seamless grooming booking, and exclusive discounts.
        </p>

        {/* Dual Incentive Promo Banner */}
        <div className="w-full mt-6 bg-deal-light/40 border border-deal/30 rounded-card p-4 text-left shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-deal/15 text-deal flex items-center justify-center shrink-0 mt-0.5">
            <Tag size={18} />
          </div>
          <div>
            <span className="text-xs font-black text-deal uppercase tracking-wider block">
              Exclusive Welcome Bonus
            </span>
            <p className="text-xs font-bold text-text mt-0.5">
              Flat <span className="text-deal font-black">₹100 Off</span> your first booking with this invite!
            </p>
            <p className="text-[11px] text-muted mt-0.5">
              Applied automatically upon completing onboarding and signing up.
            </p>
          </div>
        </div>

        {/* Referral Code Validation Card */}
        {referralCode ? (
          <div className="w-full mt-4 bg-surface rounded-card border border-border p-4 shadow-xs text-left">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className={isValidCode ? 'text-success' : 'text-danger'} />
                Friend's Referral Code
              </span>
              {isValidCode ? (
                <span className="text-[10px] font-black text-success uppercase bg-success-soft px-2 py-0.5 rounded-full">
                  Valid & Active
                </span>
              ) : (
                <span className="text-[10px] font-black text-danger uppercase bg-danger/10 px-2 py-0.5 rounded-full">
                  Invalid Format
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 bg-bg rounded-lg p-2.5 border border-border/80">
              <span className="font-mono text-lg font-black text-primary tracking-wider truncate">
                {referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs font-bold px-3 py-1.5 rounded-md bg-surface border border-border text-text hover:text-primary transition-colors shrink-0"
              >
                {isCopied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {isValidCode ? (
                <span className="text-success font-medium flex items-center gap-1">
                  <CheckCircle2 size={13} /> {validationMessage}
                </span>
              ) : (
                <span className="text-danger font-medium flex items-center gap-1">
                  <AlertCircle size={13} /> {validationMessage} (You can still join as a new guest)
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full mt-4 bg-surface rounded-card border border-border/80 p-4 shadow-xs text-center">
            <p className="text-xs text-muted">
              No referral code provided in the invite link. Tap below to begin onboarding.
            </p>
          </div>
        )}
      </div>

      {/* Action CTA: 'Join Nexora' */}
      <div className="pb-6 pt-6 flex flex-col gap-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleJoinNexora}
          className="font-black flex items-center justify-center gap-2 shadow-sm text-base h-12"
          aria-label="Join Nexora"
        >
          <span>Join {brandName}</span>
          <ArrowRight size={18} />
        </Button>

        {onSignIn && (
          <button
            type="button"
            onClick={onSignIn}
            className="text-sm font-semibold text-text hover:text-primary transition-colors cursor-pointer py-2 text-center"
          >
            Already have an account? <span className="font-extrabold underline text-primary">Sign In</span>
          </button>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted/70 text-center">
          <CheckCircle2 size={12} className="text-success" />
          <span>Guaranteed time slots • Zero wait time • Instant booking</span>
        </div>
      </div>
    </div>
  );
};
