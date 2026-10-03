import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../components/Button';
import { useSessionStore } from '../../../store/useSessionStore';
import { ArrowLeft, CheckCircle2, RotateCw } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';

interface OtpVerifyScreenProps {
  onBack: () => void;
  onVerified: (isNewUser: boolean) => void;
}

export const OtpVerifyScreen: React.FC<OtpVerifyScreenProps> = ({
  onBack,
  onVerified,
}) => {
  const { pendingPhone, verifyOtp } = useSessionStore();
  const { showToast } = useUIStore();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 30 seconds resend timer per scope
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    const next = [...digits];
    next[index] = clean[clean.length - 1]; // take last char
    setDigits(next);
    setError('');

    // Advance focus
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const next = [...digits];
    for (let i = 0; i < pasteData.length; i++) {
      next[i] = pasteData[i];
    }
    setDigits(next);
    if (pasteData.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    const result = verifyOtp(code);
    if (!result.success) {
      setError('Invalid OTP code. Try mock code: 123456');
      return;
    }

    showToast('Phone verified successfully!');
    onVerified(result.isNewUser);
  };

  const handleResend = () => {
    setSecondsRemaining(30);
    setDigits(['', '', '', '', '', '']);
    setError('');
    showToast('New verification code sent! (Mock: 123456)');
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-6 max-w-lg mx-auto">
      {/* Top Header */}
      <div>
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer mb-6"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-xl font-bold text-text">Verify Your Mobile (S16)</h1>
        <p className="text-xs text-muted mt-1 leading-relaxed">
          We sent a 6-digit code to{' '}
          <span className="font-bold text-text">{pendingPhone || '+91 98765 43210'}</span>.
        </p>
      </div>

      {/* 6 Boxes OTP Input per scope */}
      <form onSubmit={handleVerify} className="flex-1 flex flex-col justify-center gap-6 py-8">
        <div>
          <div
            className="flex items-center justify-between gap-2 max-w-xs mx-auto"
            onPaste={handlePaste}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-13 sm:w-12 sm:h-14 rounded-input border text-center text-lg font-mono font-bold transition-all outline-none ${
                  digit
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border bg-surface text-text'
                } focus:border-primary focus:ring-2 focus:ring-primary/20`}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && (
            <span className="text-xs text-error font-medium text-center block mt-3">
              {error}
            </span>
          )}

          <div className="text-center mt-4">
            <span className="text-[11px] text-muted">
              Mock testing code: <span className="font-mono font-bold text-primary">123456</span>
            </span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={digits.join('').length !== 6}
        >
          Verify & Continue
        </Button>

        {/* Resend Countdown (30s) */}
        <div className="text-center">
          {secondsRemaining > 0 ? (
            <span className="text-xs text-muted">
              Resend OTP in <span className="font-bold text-text font-mono">{secondsRemaining}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCw size={12} />
              <span>Resend OTP Code</span>
            </button>
          )}
        </div>
      </form>

      <div />
    </div>
  );
};
