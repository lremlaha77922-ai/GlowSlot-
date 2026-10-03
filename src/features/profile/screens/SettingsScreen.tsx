import React, { useState } from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { LanguagePickerSheet } from '../components/LanguagePickerSheet';
import { ArrowLeft, Globe, Moon, Sun, Bell, Shield, ChevronRight, MessageSquare, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { reengagementService, ReengagementJobReport } from '../../../services/reengagementService';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { theme, toggleTheme, language, showToast } = useUIStore();
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Notification toggles
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [dealAlerts, setDealAlerts] = useState(true);
  const [reminders, setReminders] = useState(true);

  // Re-engagement Automation State
  const [isRunningAutomation, setIsRunningAutomation] = useState(false);
  const [lastAutomationReport, setLastAutomationReport] = useState<ReengagementJobReport | null>(null);

  const handleTriggerReengagementAutomation = async () => {
    setIsRunningAutomation(true);
    try {
      const report = await reengagementService.runReengagementJob({ isTestMode: true, daysOld: 30 });
      setLastAutomationReport(report);
      showToast(`Re-engagement run complete! Created ${report.created} reminders (${report.skippedDuplicate} duplicates skipped).`);
    } catch (err: any) {
      showToast('Automation run failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsRunningAutomation(false);
    }
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

        {/* 30-Day Re-engagement Automation (QA & Testing) */}
        <div className="bg-surface rounded-card border border-border shadow-level-1 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              <div>
                <h3 className="text-xs font-bold text-text">30-Day WhatsApp Re-engagement</h3>
                <p className="text-[11px] text-muted">Automated reminder for completed bookings &gt; 30 days old</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-chip bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
              SAFE TEST MODE
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Identifies completed salon visits from 30+ days ago, prepares a WhatsApp re-engagement message, and verifies idempotency to prevent duplicate reminders.
          </p>

          <button
            onClick={handleTriggerReengagementAutomation}
            disabled={isRunningAutomation}
            className="w-full h-9 rounded-button bg-primary text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play size={14} className={isRunningAutomation ? 'animate-spin' : ''} />
            <span>{isRunningAutomation ? 'Running Automation Job...' : 'Run Re-engagement Job (Test Mode)'}</span>
          </button>

          {lastAutomationReport && (
            <div className="mt-2 p-3 bg-bg rounded-button border border-border flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between font-bold border-b border-border/60 pb-1.5 text-text">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Job Run Summary</span>
                </span>
                <span className="text-[10px] font-semibold text-muted">
                  {lastAutomationReport.isTestMode ? 'Test Mode Active' : 'Live Mode'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-surface p-2 rounded border border-border">
                  <span className="text-muted block text-[10px]">Eligible Bookings</span>
                  <span className="font-bold text-text text-sm">{lastAutomationReport.totalEligible}</span>
                </div>
                <div className="bg-surface p-2 rounded border border-border">
                  <span className="text-muted block text-[10px]">Reminders Created</span>
                  <span className="font-bold text-primary text-sm">{lastAutomationReport.created}</span>
                </div>
                <div className="bg-surface p-2 rounded border border-border">
                  <span className="text-muted block text-[10px]">Duplicates Skipped</span>
                  <span className="font-bold text-emerald-600 text-sm">{lastAutomationReport.skippedDuplicate}</span>
                </div>
                <div className="bg-surface p-2 rounded border border-border">
                  <span className="text-muted block text-[10px]">Skipped (No Phone)</span>
                  <span className="font-bold text-amber-600 text-sm">{lastAutomationReport.skippedNoPhone}</span>
                </div>
              </div>

              {lastAutomationReport.records.length > 0 && (
                <div className="mt-1 pt-1 border-t border-border/60">
                  <span className="font-bold text-[11px] block mb-1">Generated Sample Reminder:</span>
                  <div className="bg-surface p-2 rounded border border-border/80 text-[11px] text-muted font-mono whitespace-pre-wrap">
                    {lastAutomationReport.records[0].message_text}
                  </div>
                  {lastAutomationReport.records[0].whatsapp_url && (
                    <a
                      href={lastAutomationReport.records[0].whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline mt-1.5"
                    >
                      <MessageSquare size={12} />
                      <span>Preview WhatsApp Click-to-Chat URL</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
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
