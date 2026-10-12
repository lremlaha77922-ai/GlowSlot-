import React, { useState, useRef } from 'react';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { ArrowLeft, User, Phone, Mail, Camera, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
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
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format and 5MB limit
    const validation = storageService.validateImageFile(file);
    if (!validation.valid) {
      setPhotoError(validation.error || 'Invalid file.');
      showToast(validation.error || 'Invalid file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setPendingAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPendingPreviewUrl(objectUrl);
  };

  const handleCancelPendingPhoto = () => {
    if (pendingPreviewUrl && pendingPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }
    setPendingAvatarFile(null);
    setPendingPreviewUrl(null);
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSavePendingPhoto = async () => {
    if (!pendingAvatarFile) return;

    setIsUploadingPhoto(true);
    setPhotoError('');
    const res = await storageService.uploadAvatar(user?.id || 'guest', pendingAvatarFile);
    setIsUploadingPhoto(false);

    if (res.success && res.publicUrl) {
      const newUrl = res.publicUrl;
      setAvatarUrl(newUrl);
      if (pendingPreviewUrl && pendingPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
      setPendingAvatarFile(null);
      setPendingPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('Profile photo ready to save!');
    } else {
      setPhotoError(res.error || 'Failed to upload photo.');
      showToast(res.error || 'Failed to upload photo.');
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(undefined);
    handleCancelPendingPhoto();
    showToast('Photo removed. Initials will be used.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    setIsLoading(true);

    let finalAvatarUrl = avatarUrl;
    // If user has a pending photo selected but hasn't clicked "Save Photo", save it automatically now
    if (pendingAvatarFile) {
      const res = await storageService.uploadAvatar(user?.id || 'guest', pendingAvatarFile);
      if (res.success && res.publicUrl) {
        finalAvatarUrl = res.publicUrl;
      }
    }

    await setProfile(name.trim(), gender, finalAvatarUrl);
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
        {/* Hidden File Input supporting JPG, JPEG, PNG, WEBP with camera capture */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          accept="image/jpeg,image/png,image/webp,image/jpg"
          capture="environment"
          className="hidden"
        />

        {/* Avatar with Camera icon & Upload Options */}
        <div className="flex flex-col items-center py-4 mb-2">
          <div className="relative group">
            {pendingPreviewUrl ? (
              <img
                src={pendingPreviewUrl}
                alt="Pending preview"
                className="w-24 h-24 rounded-full object-cover shadow-level-1 border-3 border-accent ring-4 ring-accent/20 animate-pulse"
              />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-24 h-24 rounded-full object-cover shadow-level-1 border-3 border-primary ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary text-white text-3xl font-bold flex items-center justify-center shadow-level-1">
                {name.charAt(0).toUpperCase() || 'U'}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-accent text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              aria-label="Upload photo"
              title="Upload photo from Gallery or Camera"
            >
              <Camera size={16} />
            </button>
          </div>

          {/* Action buttons for Pending Photo Preview */}
          {pendingPreviewUrl && (
            <div className="mt-3 flex items-center gap-2 bg-surface border border-accent/30 rounded-card p-2 px-3 shadow-xs">
              <span className="text-[11px] font-semibold text-text flex items-center gap-1 mr-1">
                <ImageIcon size={13} className="text-accent" />
                Previewing
              </span>
              <button
                type="button"
                onClick={handleSavePendingPhoto}
                disabled={isUploadingPhoto}
                className="flex items-center gap-1 px-2.5 py-1 bg-primary text-white rounded-chip text-xs font-bold hover:brightness-105 disabled:opacity-50 cursor-pointer"
              >
                {isUploadingPhoto ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={12} />
                    <span>Apply</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelPendingPhoto}
                disabled={isUploadingPhoto}
                className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border text-muted rounded-chip text-xs font-semibold hover:text-error hover:border-error cursor-pointer"
              >
                <X size={12} />
                <span>Cancel</span>
              </button>
            </div>
          )}

          {/* Upload Photo Button & Guidance */}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
            >
              <Camera size={13} />
              <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
            {avatarUrl && !pendingPreviewUrl && (
              <>
                <span className="text-muted text-xs">•</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs font-medium text-error hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </>
            )}
          </div>

          <span className="text-[10px] text-muted mt-1">
            JPG, PNG, WEBP • Max 5 MB
          </span>

          {photoError && (
            <div className="mt-2 text-xs text-error font-medium bg-error/10 border border-error/20 px-3 py-1.5 rounded-card max-w-xs text-center">
              {photoError}
            </div>
          )}

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
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading || isUploadingPhoto}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
