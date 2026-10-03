import React from 'react';
import {
  MapPin,
  ChevronDown,
  Bell,
  Sparkles,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';

interface HomeHeaderProps {
  onOpenLocation: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenPoints: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onOpenLocation,
  onOpenNotifications,
  onOpenProfile,
  onOpenPoints,
}) => {
  const { user } = useSessionStore();
  const { selectedLocation, theme, toggleTheme, language, toggleLanguage } =
    useUIStore();

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 pt-3 pb-3">
      {/* Top utility row: Points Chip, Theme, Lang, Bell, Cart */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {/* Points Chip -> S26 */}
          <button
            onClick={onOpenPoints}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-chip bg-primary-soft text-primary border border-primary/20 text-xs font-bold shadow-2xs hover:bg-primary-soft/80 cursor-pointer"
            aria-label="View points"
          >
            <Sparkles size={13} className="text-deal" />
            <span className="tabular-nums">{user?.points ?? 0} pts</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="h-8 px-2 rounded-button text-xs font-medium text-muted hover:text-text hover:bg-primary-soft/50 transition-colors flex items-center gap-1 cursor-pointer"
            aria-label="Switch Language"
          >
            <Globe size={14} />
            <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-button text-muted hover:text-text hover:bg-primary-soft/50 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications Bell -> S21 */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-text hover:bg-primary-soft/50 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
          </button>
        </div>
      </div>

      {/* Main Greeting & Avatar -> S22 Profile */}
      <div className="flex items-center justify-between">
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 text-left cursor-pointer group"
          aria-label="Open profile"
        >
          <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-xs group-hover:brightness-105">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Hello, {user?.name || 'Guest'} 👋</p>
            <span className="text-[10px] text-primary font-bold group-hover:underline">View Profile</span>
          </div>
        </button>

        {/* Location Selector */}
        <button
          onClick={onOpenLocation}
          className="flex items-center gap-1 text-xs font-bold text-text hover:text-primary transition-colors cursor-pointer text-right"
          aria-label="Change location"
        >
          <MapPin size={13} className="text-primary shrink-0" />
          <span className="max-w-[140px] truncate">{selectedLocation}</span>
          <ChevronDown size={12} className="text-muted shrink-0" />
        </button>
      </div>
    </header>
  );
};
