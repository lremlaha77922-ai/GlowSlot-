import React, { useState } from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { LanguagePickerSheet } from '../components/LanguagePickerSheet';
import { ArrowLeft, Globe, Moon, Sun, Bell, Shield, ChevronRight } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { theme, toggleTheme, language } = useUIStore();
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Notification toggles
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [dealAlerts, setDealAlerts] = useState(true);
  const [reminders, setReminders] = useState(true);

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
          <h1 className="text-sm font-bold text-text">App Settings (S28)</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Appearance & Language */}
        <div className="bg-surface rounded-card border border-border shadow-level-1 overflow-hidden divide-y divide-border">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider px-4 pt-3 pb-1 block">
            Display & Region
          </span>

          {/* Language Selector */}
          <div
            onClick={() => setIsLangOpen(true)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-primary-soft/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-primary" />
              <div>
                <span className="text-xs font-bold text-text block">Language</span>
                <span className="text-[11px] text-muted">
                  {language === 'en' ? 'English' : 'हिन्दी (Hindi)'}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>

          {/* Dark Mode Toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon size={18} className="text-primary" />
              ) : (
                <Sun size={18} className="text-deal" />
              )}
              <div>
                <span className="text-xs font-bold text-text block">Dark Appearance</span>
                <span className="text-[11px] text-muted">
                  {theme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>

        {/* Notifications Group */}
        <div className="bg-surface rounded-card border border-border shadow-level-1 overflow-hidden divide-y divide-border">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider px-4 pt-3 pb-1 block">
            Notification Preferences
          </span>

          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-text block">Appointment Reminders</span>
              <span className="text-[11px] text-muted">Alert 1 hour before scheduled time</span>
            </div>
            <input
              type="checkbox"
              checked={reminders}
              onChange={(e) => setReminders(e.target.checked)}
              className="accent-primary w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-text block">Booking Status Updates</span>
              <span className="text-[11px] text-muted">Instant confirmation & invoice receipts</span>
            </div>
            <input
              type="checkbox"
              checked={bookingAlerts}
              onChange={(e) => setBookingAlerts(e.target.checked)}
              className="accent-primary w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-text block">Flash Deals & Discounts</span>
              <span className="text-[11px] text-muted">Real-time off-peak slot price drops</span>
            </div>
            <input
              type="checkbox"
              checked={dealAlerts}
              onChange={(e) => setDealAlerts(e.target.checked)}
              className="accent-primary w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </main>

      {/* O07 Language Picker */}
      <LanguagePickerSheet
        isOpen={isLangOpen}
        onClose={() => setIsLangOpen(false)}
      />
    </div>
  );
};
