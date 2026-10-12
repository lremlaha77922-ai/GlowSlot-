import React from 'react';
import { Clock, Navigation, AlertCircle, X } from 'lucide-react';
import { AppointmentReminder } from '../../../services/notificationReminderService';

interface AppointmentReminderBannerProps {
  reminder: AppointmentReminder;
  onViewBooking: (bookingId: string) => void;
  onDismiss: () => void;
}

export const AppointmentReminderBanner: React.FC<AppointmentReminderBannerProps> = ({
  reminder,
  onViewBooking,
  onDismiss,
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-primary/10 to-primary/5 border border-amber-500/30 rounded-card p-3 shadow-xs flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <Clock size={16} className="animate-pulse" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-chip">
              Upcoming in 2h
            </span>
            <span className="text-[10px] text-muted">
              {reminder.slotTime} Today
            </span>
          </div>
          <p className="text-xs font-bold text-text leading-tight mt-0.5">
            Appointment at {reminder.salonName}
          </p>
          <p className="text-[11px] text-muted leading-relaxed">
            Your slot starts in ~{Math.round(reminder.diffMinutes / 60) || 1} hour(s). Please plan your commute to arrive 5 mins early.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => onViewBooking(reminder.bookingId)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Navigation size={12} />
              <span>View Booking & Directions</span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="p-1 text-muted hover:text-text rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
        aria-label="Dismiss reminder banner"
      >
        <X size={14} />
      </button>
    </div>
  );
};
