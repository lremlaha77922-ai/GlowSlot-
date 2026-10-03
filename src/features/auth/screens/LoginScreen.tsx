import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { useSessionStore } from '../../../store/useSessionStore';
import { Scissors, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onOtpSent: () => void;
  onContinueAsGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onOtpSent,
  onContinueAsGuest,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const { setPendingPhone, continueAsGuest } = useSessionStore();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setPendingPhone(`+91 ${clean}`);
    setError('');
    onOtpSent();
  };

  const handleGuest = () => {
    continueAsGuest();
    onContinueAsGuest();
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-6 max-w-lg mx-auto">
      {/* Top Branding */}
      <div className="pt-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-[20px] bg-primary text-white flex items-center justify-center shadow-level-1 mb-4">
          <Scissors size={32} />
        </div>
        <h1 className="text-xl font-bold text-text">Welcome to GlowSlot</h1>
        <p className="text-xs text-muted mt-1 max-w-xs">
          Enter your phone number to book slots, earn points and track appointments.
        </p>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSendOtp} className="flex-1 flex flex-col justify-center gap-4 py-8">
        <div>
          <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
            Mobile Number
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-text border-r border-border pr-2.5">
              <span>🇮🇳</span>
              <span>+91</span>
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setError('');
              }}
              placeholder="98765 43210"
              maxLength={10}
              className="h-[52px] w-full pl-24 pr-4 rounded-input border border-border bg-surface text-text font-bold text-sm tracking-wide focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              autoFocus
            />
          </div>
          {error && <span className="text-xs text-error font-medium mt-1 block">{error}</span>}
          <span className="text-[11px] text-muted mt-1.5 block">
            We will send a 6-digit verification code. (Mock: <span className="font-mono font-bold text-primary">123456</span>)
          </span>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth className="mt-2">
          <span>Send OTP</span>
          <ArrowRight size={16} className="ml-2" />
        </Button>

        {/* Continue as Guest Button per scope & 03_APPFLOW.md */}
        <div className="flex flex-col items-center pt-2">
          <button
            type="button"
            onClick={handleGuest}
            className="text-xs font-bold text-primary hover:underline py-2 cursor-pointer"
          >
            Continue as Guest (Browse Only)
          </button>
        </div>
      </form>

      {/* Terms and Privacy policy disclaimer */}
      <div className="pb-4 text-center">
        <p className="text-[11px] text-muted leading-relaxed">
          By signing in, you agree to our{' '}
          <span className="text-primary underline cursor-pointer">Terms of Service</span> and{' '}
          <span className="text-primary underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
