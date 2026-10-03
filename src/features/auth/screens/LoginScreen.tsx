import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { useSessionStore } from '../../../store/useSessionStore';
import { Scissors, ArrowRight, Mail, Lock, User, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';
import { Gender } from '../../../types';
import { validateEmail } from '../../../utils/validators';

interface LoginScreenProps {
  onSuccess: () => void;
  onContinueAsGuest: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onContinueAsGuest,
}) => {
  const [mode, setAuthMode] = useState<AuthMode>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('male');

  // Status states
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { loginWithEmail, signUpWithEmail, resetPassword, continueAsGuest } = useSessionStore();
  const { showToast } = useUIStore();

  const resetFormState = () => {
    setError('');
    setMessage('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    resetFormState();

    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const res = await loginWithEmail(email.trim(), password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid email or password.');
      return;
    }

    showToast('Signed in successfully!');
    onSuccess();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    resetFormState();

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await signUpWithEmail(email.trim(), password, fullName.trim(), gender);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Account creation failed. Email may already exist.');
      return;
    }

    if (res.message) {
      setMessage(res.message);
      showToast('Account created!');
      return;
    }

    showToast(`Welcome to GlowSlot, ${fullName.trim()}!`);
    onSuccess();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(email.trim());
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to send reset link.');
      return;
    }

    setMessage('Password reset link sent! Check your email inbox.');
  };

  const handleGuest = () => {
    continueAsGuest();
    onContinueAsGuest();
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-6 max-w-lg mx-auto">
      {/* Top Branding Header */}
      <div className="pt-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-[20px] bg-primary text-white flex items-center justify-center shadow-level-1 mb-3">
          <Scissors size={32} />
        </div>
        <h1 className="text-xl font-bold text-text">Welcome to GlowSlot</h1>
        <p className="text-xs text-muted mt-1 max-w-xs">
          {mode === 'login' && 'Sign in with your email to manage bookings and earn Glow Points.'}
          {mode === 'signup' && 'Create your account to unlock smart slot pricing and discounts.'}
          {mode === 'forgot' && 'Enter your registered email to reset your password.'}
        </p>
      </div>

      {/* Auth Forms */}
      <div className="flex-1 flex flex-col justify-center py-6">
        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3.5 bg-error/10 border border-error/30 rounded-card flex flex-col gap-2 text-xs text-error font-medium">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block mb-0.5">
                  {error.toLowerCase().includes('limit') ? 'Email Rate Limit Reached' : 'Authentication Error'}
                </span>
                <span>{error}</span>
              </div>
            </div>

            {error.toLowerCase().includes('limit') && (
              <div className="mt-1 pt-2 border-t border-error/20 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    resetFormState();
                  }}
                  className="text-xs font-bold text-primary underline hover:text-primary/80 cursor-pointer"
                >
                  Already have an account? Sign In
                </button>
                <button
                  type="button"
                  onClick={handleGuest}
                  className="text-xs font-semibold text-muted hover:text-text cursor-pointer"
                >
                  Explore as Guest
                </button>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-card flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle size={16} className="shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-3.5 text-muted pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="name@example.com"
                  className="h-[50px] w-full pl-10 pr-4 rounded-input border border-border bg-surface text-text font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-text uppercase tracking-wider block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot');
                    resetFormState();
                  }}
                  className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-3.5 text-muted pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="h-[50px] w-full pl-10 pr-4 rounded-input border border-border bg-surface text-text font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading} className="mt-2">
              <span>{isLoading ? 'Signing in...' : 'Login'}</span>
              <ArrowRight size={16} className="ml-2" />
            </Button>

            <div className="text-center mt-2">
              <span className="text-xs text-muted">Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  resetFormState();
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGN UP MODE */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
            <div>
              <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User size={18} className="absolute left-3.5 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError('');
                  }}
                  placeholder="Aarav Sharma"
                  className="h-[48px] w-full pl-10 pr-4 rounded-input border border-border bg-surface text-text font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-3.5 text-muted pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="name@example.com"
                  className="h-[48px] w-full pl-10 pr-4 rounded-input border border-border bg-surface text-text font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1">
                Password (min 6 chars)
              </label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-3.5 text-muted pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="h-[48px] w-full pl-10 pr-4 rounded-input border border-border bg-surface text-text font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <KeyRound size={18} className="absolute left-3.5 text-muted pointer-events-none" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="h-[48px] w-full pl-10 pr-4 rounded-input border border-border bg-surface text-text font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1">
                Gender Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['male', 'female', 'unisex'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-3 rounded-button text-xs font-semibold capitalize border transition-colors cursor-pointer ${
                      gender === g
                        ? 'bg-primary text-white border-primary'
                        : 'border-border bg-surface text-text hover:bg-primary-soft/30'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading} className="mt-2">
              <span>{isLoading ? 'Creating Account...' : 'Register / Create Account'}</span>
            </Button>

            <div className="text-center mt-2">
              <span className="text-xs text-muted">Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  resetFormState();
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
                Registered Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-3.5 text-muted pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="name@example.com"
                  className="h-[50px] w-full pl-10 pr-4 rounded-input border border-border bg-surface text-text font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  autoFocus
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading}>
              <span>{isLoading ? 'Sending Link...' : 'Send Password Reset Link'}</span>
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  resetFormState();
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bottom Guest Action */}
      <div className="pt-2 text-center border-t border-border/60">
        <button
          type="button"
          onClick={handleGuest}
          className="text-xs font-bold text-primary hover:underline py-2 cursor-pointer"
        >
          Continue as Guest (Browse Only)
        </button>
      </div>
    </div>
  );
};
