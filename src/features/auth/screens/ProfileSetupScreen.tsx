import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useSessionStore } from '../../../store/useSessionStore';
import { Gender } from '../../../types';
import { User, MapPin, Check, ShieldCheck, Gift } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';
import { referralService } from '../../profile/services/referralService';

interface ProfileSetupScreenProps {
  onComplete: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onComplete,
}) => {
  const { setProfile, user } = useSessionStore();
  const { showToast } = useUIStore();

  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState<Gender>('male');
  const [locationGranted, setLocationGranted] = useState(false);
  const [error, setError] = useState('');
  
  // Referral states
  const [referralCode, setReferralCode] = useState('');
  const [referralError, setReferralError] = useState('');
  const [isReferralValid, setIsReferralValid] = useState(false);

  const handleGrantLocation = () => {
    setLocationGranted(true);
    showToast('Location permission enabled!');
  };

  const handleReferralChange = (val: string) => {
    setReferralCode(val.toUpperCase());
    setReferralError('');
    
    if (!val) {
      setIsReferralValid(false);
      return;
    }

    // Support validation: Codes are alphanumeric/hyphen, at least 6 characters
    if (val.length < 6) {
      setReferralError('Referral code must be at least 6 characters long.');
      setIsReferralValid(false);
    } else {
      setIsReferralValid(true);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (referralCode && !isReferralValid) {
      setReferralError('Please fix or clear the invalid referral code.');
      return;
    }

    setIsLoading(true);

    if (referralCode && isReferralValid) {
      await referralService.recordReferralSignup(
        referralCode,
        user?.email || 'new.user@glowslot.com',
        name.trim()
      );
      showToast('Referral code applied successfully! Rs.100 off your first visit.');
    }

    await setProfile(name.trim(), gender);
    setIsLoading(false);
    showToast(`Welcome to GlowSlot, ${name.trim()}!`);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-6 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="pt-6">
        <h1 className="text-xl font-bold text-text">Setup Your Profile (S17)</h1>
        <p className="text-xs text-muted mt-1 leading-relaxed">
          Tell us your name so stylists can prepare your personalized grooming station.
        </p>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center gap-5 py-6">
        <Input
          label="Your Full Name"
          placeholder="e.g. Aarav Sharma"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          leftIcon={<User size={16} />}
          error={error}
          required
          autoFocus
        />

        {/* Gender Selection */}
        <div>
          <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
            Gender Preference
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'male', label: 'Male' },
              { id: 'female', label: 'Female' },
              { id: 'unisex', label: 'Other / Unisex' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setGender(item.id as Gender)}
                className={`py-2.5 px-2 rounded-button text-xs font-semibold border transition-all cursor-pointer ${
                  gender === item.id
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface text-muted border-border hover:bg-primary-soft/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Referral Code field with inline validation per REF-4 */}
        <Input
          label="Referral Code (Optional)"
          placeholder="e.g. GLOW-RAHU100"
          value={referralCode}
          onChange={(e) => handleReferralChange(e.target.value)}
          leftIcon={<Gift size={16} />}
          error={referralError}
          className="uppercase"
        />

        {/* Location Permission Card per scope */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text">Enable Location Access</h3>
              <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                Needed to show accurate nearby salons, travel distance, and real-time off-peak slots in your area.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGrantLocation}
            className={`w-full mt-1 py-2 px-3 rounded-button text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              locationGranted
                ? 'bg-success/15 text-success border border-success/30'
                : 'bg-primary-soft text-primary border border-primary/20 hover:bg-primary-soft/80'
            }`}
          >
            {locationGranted ? (
              <>
                <Check size={14} />
                <span>Location Enabled</span>
              </>
            ) : (
              <span>Allow Location Access</span>
            )}
          </button>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth className="mt-3">
          Complete Setup & Start
        </Button>
      </form>

      <div />
    </div>
  );
};
