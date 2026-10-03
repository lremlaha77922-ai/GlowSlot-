import React, { useState } from 'react';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';
import { LogoutConfirmSheet } from '../components/LogoutConfirmSheet';
import { DeleteAccountSheet } from '../components/DeleteAccountSheet';
import {
  ArrowLeft,
  ChevronRight,
  User,
  MapPin,
  Heart,
  Sparkles,
  Gift,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  Edit2,
} from 'lucide-react';

interface ProfileMainScreenProps {
  onBack: () => void;
  onEditProfile: () => void;
  onSavedAddresses: () => void;
  onFavouriteSalons: () => void;
  onWalletPoints: () => void;
  onReferEarn: () => void;
  onSettings: () => void;
  onHelpSupport: () => void;
  onTermsPrivacy: () => void;
  onLoggedOut: () => void;
}

export const ProfileMainScreen: React.FC<ProfileMainScreenProps> = ({
  onBack,
  onEditProfile,
  onSavedAddresses,
  onFavouriteSalons,
  onWalletPoints,
  onReferEarn,
  onSettings,
  onHelpSupport,
  onTermsPrivacy,
  onLoggedOut,
}) => {
  const { user, isGuest, logout, deleteAccount } = useSessionStore();
  const { showToast } = useUIStore();

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully.');
    onLoggedOut();
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    showToast('Account permanently deleted.');
    onLoggedOut();
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-24">
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
          <h1 className="text-sm font-bold text-text">My Profile (S22)</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* User Card */}
        <div className="bg-surface rounded-card border border-border/80 shadow-level-1 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-primary text-white text-xl font-bold flex items-center justify-center shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
            </div>

            <div>
              <h2 className="text-base font-bold text-text">
                {user?.name || (isGuest ? 'Guest User' : 'GlowSlot Member')}
              </h2>
              <span className="text-xs text-muted font-mono block mt-0.5">
                {user?.phone || 'Browse Mode'}
              </span>
            </div>
          </div>

          {!isGuest && (
            <button
              onClick={onEditProfile}
              className="p-2 rounded-full text-muted hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer"
              aria-label="Edit Profile"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>

        {/* 1. Account Group */}
        <div className="bg-surface rounded-card border border-border shadow-level-1 overflow-hidden divide-y divide-border">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider px-4 pt-3 pb-1 block">
            Account & Rewards
          </span>

          <div
            onClick={onSavedAddresses}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-primary-soft/30 transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-semibold">
              <MapPin size={17} className="text-primary" />
              <span>Saved Addresses</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>

          <div
            onClick={onFavouriteSalons}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-primary-soft/30 transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-semibold">
              <Heart size={17} className="text-accent" />
              <span>Favourite Salons</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>

          <div
            onClick={onWalletPoints}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-primary-soft/30 transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-semibold">
              <Sparkles size={17} className="text-deal" />
              <span>Wallet & Points ({user?.points ?? 120} pts)</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>

          <div
            onClick={onReferEarn}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-primary-soft/30 transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-semibold">
              <Gift size={17} className="text-teal-600 dark:text-teal-400" />
              <span>Refer & Earn (Rs.100)</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>
        </div>

        {/* 2. Preferences Group */}
        <div className="bg-surface rounded-card border border-border shadow-level-1 overflow-hidden divide-y divide-border">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider px-4 pt-3 pb-1 block">
            Preferences
          </span>

          <div
            onClick={onSettings}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-primary-soft/30 transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-semibold">
              <Settings size={17} className="text-muted" />
              <span>Settings (Language, Dark Mode)</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>
        </div>

        {/* 3. Support & Legal Group */}
        <div className="bg-surface rounded-card border border-border shadow-level-1 overflow-hidden divide-y divide-border">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider px-4 pt-3 pb-1 block">
            Support & Legal
          </span>

          <div
            onClick={onHelpSupport}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-primary-soft/30 transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-semibold">
              <HelpCircle size={17} className="text-muted" />
              <span>Help & Support (24/7)</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>

          <div
            onClick={onTermsPrivacy}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-primary-soft/30 transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-semibold">
              <FileText size={17} className="text-muted" />
              <span>Terms of Service & Privacy</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>
        </div>

        {/* Logout / Delete Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="w-full py-3 rounded-card bg-surface border border-border text-xs font-bold text-text flex items-center justify-center gap-2 hover:bg-error/10 hover:text-error transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>

          {!isGuest && (
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="w-full py-2.5 text-[11px] font-semibold text-error hover:underline flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete My Account</span>
            </button>
          )}
        </div>

        <div className="text-center pt-2">
          <span className="text-[10px] text-muted font-mono">
            GlowSlot v0.1.0 • Phase 4C
          </span>
        </div>
      </main>

      {/* O08 Logout Sheet */}
      <LogoutConfirmSheet
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
      />

      {/* O09 Delete Sheet */}
      <DeleteAccountSheet
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
};
