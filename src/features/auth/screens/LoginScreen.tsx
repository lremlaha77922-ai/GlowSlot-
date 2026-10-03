import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { useSessionStore } from '../../../store/useSessionStore';
import { authService } from '../services/authService';
import { Scissors, ArrowRight, Mail, Phone } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { setPendingPhone, continueAsGuest, setUser } = useSessionStore();
  const { showToast } = useUIStore();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const fullPhone = `+91 ${clean}`;
    setPendingPhone(fullPhone);
    setIsLoading(true);
    setError('');

    const res = await authService.sendOtp(fullPhone);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to send OTP.');
      return;
    }

    onOtpSent();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    const res = await authService.signInWithEmail(email, password);
    setIsLoading(false);

    if (!res.success || !res.session) {
      setError(res.error || 'Invalid credentials.');
      return;
    }

    setUser(res.session);
    showToast(`Welcome back, ${res.session.name}!`);
    onContinueAsGuest(); // navigates to main tabs
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
        <h1 className="text-xl font-bold text-text">Welcome to GlowSlot (S15)</h1>
        <p className="text-xs text-muted mt-1 max-w-xs">
          Sign in to book chairs, access off-peak discounts, and earn Glow Points.
        </p>
      </div>

      {/* Main Login Form */}
      {!isEmailMode ? (
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

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading} className="mt-2">
            <span>{isLoading ? 'Sending code...' : 'Send OTP'}</span>
            <ArrowRight size={16} className="ml-2" />
          </Button>

          {/* Alternative actions */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleGuest}
              className="text-xs font-bold text-primary hover:underline py-1.5 cursor-pointer"
            >
              Continue as Guest (Browse Only)
            </button>

            {/* Email test fallback toggle per Phase 5B scope */}
            <button
              type="button"
              onClick={() => {
                setIsEmailMode(true);
                setError('');
              }}
              className="text-[11px] text-muted hover:text-text flex items-center gap-1 cursor-pointer"
            >
              <Mail size={13} />
              <span>Email Sign In (Test fallback)</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleEmailLogin} className="flex-1 flex flex-col justify-center gap-4 py-8">
          <div>
            <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tester@example.com"
              className="h-[48px] w-full px-4 rounded-input border border-border bg-surface text-text text-xs focus:border-primary outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-[48px] w-full px-4 rounded-input border border-border bg-surface text-text text-xs focus:border-primary outline-none"
            />
          </div>

          {error && <span className="text-xs text-error font-medium">{error}</span>}

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading}>
            <span>{isLoading ? 'Signing in...' : 'Sign In with Email'}</span>
          </Button>

          <button
            type="button"
            onClick={() => {
              setIsEmailMode(false);
              setError('');
            }}
            className="text-xs font-semibold text-primary hover:underline py-1 text-center cursor-pointer"
          >
            ← Back to Phone OTP
          </button>
        </form>
      )}

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
