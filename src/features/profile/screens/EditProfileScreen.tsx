import React, { useState, useRef } from 'react';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { ArrowLeft, User, Phone, Mail, Camera } from 'lucide-react';
import { Gender } from '../../../types';
import { storageService } from '../services/storageService';

interface EditProfileScreenProps {
  onBack: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack }) => {
  const { user, setProfile } = useSessionStore();
  const { showToast } = useUIStore();

  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState<Gender>(user?.gender || 'male');
  const [email, setEmail] = useState(user?.email || 'aarav.sharma@example.com');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast('Uploading profile photo...');
    const res = await storageService.uploadAvatar(user?.id || 'guest', file);
    if (res.success && res.publicUrl) {
      setAvatarUrl(res.publicUrl);
      showToast('Profile photo updated!');
    } else {
      showToast(res.error || 'Failed to upload photo.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    setIsLoading(true);
    await setProfile(name.trim(), gender);
    setIsLoading(false);
    showToast('Profile updated successfully!');
    onBack();
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
          <h1 className="text-sm font-bold text-text">Edit Profile (S23)</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto w-full">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          className="hidden"
        />

        {/* Avatar with Camera icon */}
        <div className="flex flex-col items-center py-4 mb-2">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-20 h-20 rounded-full object-cover shadow-level-1 border-2 border-primary"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center shadow-level-1">
                {name.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-accent text-white shadow-xs hover:brightness-110 cursor-pointer"
              aria-label="Change photo"
            >
              <Camera size={14} />
            </button>
          </div>
          <span className="text-xs text-muted mt-2 font-mono">
            {user?.phone || '+91 98765 43210'}
          </span>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Your name"
            leftIcon={<User size={16} />}
            error={error}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.com"
            leftIcon={<Mail size={16} />}
          />

          <div>
            <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
              Verified Phone Number
            </label>
            <div className="relative">
              <Input
                value={user?.phone || '+91 98765 43210'}
                disabled
                leftIcon={<Phone size={16} />}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-success uppercase">
                Verified
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
              Gender
            </label>
            <div className="flex gap-2">
              {(['male', 'female', 'unisex'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-button text-xs font-semibold capitalize border transition-all cursor-pointer ${
                    gender === g
                      ? 'bg-primary text-white border-primary shadow-level-1'
                      : 'bg-surface text-text border-border hover:bg-primary-soft/50'
                  }`}
                >
                  {g === 'unisex' ? 'Other' : g}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
