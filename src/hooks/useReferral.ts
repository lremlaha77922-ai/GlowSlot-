import { useState } from 'react';
import { referralService } from '../../features/profile/services/referralService';
import { useUIStore } from '../../store/useUIStore';

export const useReferral = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useUIStore();

  const generateReferralCode = (name: string): string => {
    return `GLOW-${name.toUpperCase().replace(/\s+/g, '').slice(0, 4)}100`;
  };

  const validateReferralCode = async (code: string): Promise<boolean> => {
    // Basic validation logic
    if (!code || code.length < 6) return false;
    // In a real app, this would check if code exists in the database.
    // Since our DB is simple, we check format here.
    return code.startsWith('GLOW-');
  };

  const recordReferralSignup = async (code: string, email: string, name: string) => {
    setLoading(true);
    try {
      const res = await referralService.recordReferralSignup(code, email, name);
      if (!res.success) {
        showToast(res.error || 'Failed to apply referral code');
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateReferralCode,
    validateReferralCode,
    recordReferralSignup,
  };
};
