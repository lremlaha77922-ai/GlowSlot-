import React from 'react';
import { Button } from '../../../components/Button';
import { ArrowLeft } from 'lucide-react';

interface OtpVerifyScreenProps {
  onBack: () => void;
  onVerified: (isNewUser: boolean) => void;
}

export const OtpVerifyScreen: React.FC<OtpVerifyScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-bg text-text p-6 flex flex-col justify-between max-w-lg mx-auto">
      <header className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-bold text-text">Phone Verification</h1>
      </header>

      <div className="text-center py-12 flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-muted max-w-xs">
          GlowSlot now uses Email + Password authentication. Phone OTP login has been migrated to Email Authentication.
        </p>
        <Button onClick={onBack} variant="primary" className="mt-4">
          Return to Email Login
        </Button>
      </div>

      <div />
    </div>
  );
};
