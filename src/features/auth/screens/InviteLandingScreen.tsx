import React, { useEffect, useState } from 'react';
import { Gift, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useSessionStore } from '../../../store/useSessionStore';

interface InviteLandingScreenProps {
  onJoin: (referralCode: string) => void;
  onSignIn: () => void;
}

export const InviteLandingScreen: React.FC<InviteLandingScreenProps> = ({ onJoin, onSignIn }) => {
  const [referralCode, setReferralCode] = useState<string>('');
  const { setReferralCode: setStoreReferralCode } = useSessionStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('ref');
    if (code) {
      setReferralCode(code.trim().toUpperCase());
    }
  }, []);

  const handleJoin = () => {
    setStoreReferralCode(referralCode);
    onJoin(referralCode);
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-center items-center p-6 max-w-lg mx-auto text-center">
      <div className="w-20 h-20 rounded-[25px] bg-primary text-white flex items-center justify-center shadow-level-2 mb-6">
        <Gift size={40} />
      </div>

      <h1 className="text-2xl font-extrabold text-text mb-2">You're Invited to GlowSlot</h1>
      <p className="text-sm text-muted mb-8 max-w-xs leading-relaxed">
        Join GlowSlot and discover easy salon appointment booking.
      </p>

      {referralCode && (
        <div className="bg-surface rounded-card border border-border p-5 w-full mb-8 shadow-level-1">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
            Referral Code
          </span>
          <div className="font-mono text-xl font-bold text-primary tracking-widest">
            {referralCode}
          </div>
        </div>
      )}

      <div className="w-full flex flex-col gap-3">
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onClick={handleJoin}
          className="font-extrabold"
        >
          <span>Join GlowSlot</span>
          <ArrowRight size={18} className="ml-2" />
        </Button>

        <button
          onClick={onSignIn}
          className="text-sm font-semibold text-text hover:text-primary transition-colors cursor-pointer pt-2"
        >
          Already have an account? <span className="font-bold underline">Sign In</span>
        </button>
      </div>
    </div>
  );
};
