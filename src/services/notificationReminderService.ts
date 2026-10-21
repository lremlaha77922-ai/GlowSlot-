import { Booking } from '../types';
import { bookingService } from '../features/bookings/services/bookingService';

export interface AppointmentReminder {
  bookingId: string;
  salonName: string;
  slotDate: string;
  slotTime: string;
  scheduledTime: Date;
  diffMinutes: number;
  message: string;
  type: 'upcoming_2h' | 'starting_soon' | 'upcoming_24h';
}

const REMINDER_KEY_PREFIX = 'nexora_reminder_sent_';

// Fallback in-memory storage for test runners or non-browser environments
const inMemorySentMap = new Map<string, string>();

function getStoredReminder(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // Ignore restricted storage
  }
  return inMemorySentMap.get(key) || null;
}

function setStoredReminder(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore restricted storage
  }
  inMemorySentMap.set(key, value);
}

function removeStoredReminder(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
  inMemorySentMap.delete(key);
}

export const notificationReminderService = {
  /**
   * Checks if an appointment is eligible for a 2-hour reminder.
   * Eligible if scheduled time is between 0 and 125 minutes away.
   */
  checkBookingEligibleFor2HourReminder(
    booking: Booking,
    now: Date = new Date()
  ): { isEligible: boolean; reminder?: AppointmentReminder } {
    if (booking.status !== 'upcoming') {
      return { isEligible: false };
    }

    try {
      const scheduledTime = new Date(`${booking.slot.date}T${booking.slot.time}:00`);
      if (isNaN(scheduledTime.getTime())) {
        return { isEligible: false };
      }

      const diffMs = scheduledTime.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      // 2-hour reminder window: between 0 and 125 minutes
      if (diffMinutes > 0 && diffMinutes <= 125) {
        const key = `${REMINDER_KEY_PREFIX}2h_${booking.id}`;
        const alreadySent = getStoredReminder(key);

        if (!alreadySent) {
          const hoursLeft = Math.floor(diffMinutes / 60);
          const minutesLeft = diffMinutes % 60;
          let timeDescription = '';
          if (hoursLeft > 0) {
            timeDescription = `in ~${hoursLeft}h ${minutesLeft > 0 ? `${minutesLeft}m` : ''}`.trim();
          } else {
            timeDescription = `in ${minutesLeft} minutes`;
          }

          return {
            isEligible: true,
            reminder: {
              bookingId: booking.id,
              salonName: booking.salonName,
              slotDate: booking.slot.date,
              slotTime: booking.slot.time,
              scheduledTime,
              diffMinutes,
              message: `⏰ Reminder: Your salon appointment at ${booking.salonName} is ${timeDescription} (${booking.slot.time})!`,
              type: diffMinutes <= 30 ? 'starting_soon' : 'upcoming_2h',
            },
          };
        }
      }
    } catch (err) {
      console.error('[NotificationReminderService] Error checking 2h booking:', err);
    }

    return { isEligible: false };
  },

  /**
   * Checks if an appointment is eligible for a 24-hour reminder.
   * Eligible if scheduled time is between 125 minutes and 1450 minutes (~24 hours) away.
   */
  checkBookingEligibleFor24HourReminder(
    booking: Booking,
    now: Date = new Date()
  ): { isEligible: boolean; reminder?: AppointmentReminder } {
    if (booking.status !== 'upcoming') {
      return { isEligible: false };
    }

    try {
      const scheduledTime = new Date(`${booking.slot.date}T${booking.slot.time}:00`);
      if (isNaN(scheduledTime.getTime())) {
        return { isEligible: false };
      }

      const diffMs = scheduledTime.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      // 24-hour reminder window: between 125 minutes and 1450 minutes (~24 hours)
      if (diffMinutes > 125 && diffMinutes <= 1450) {
        const key = `${REMINDER_KEY_PREFIX}24h_${booking.id}`;
        const alreadySent = getStoredReminder(key);

        if (!alreadySent) {
          const hoursLeft = Math.round(diffMinutes / 60);

          return {
            isEligible: true,
            reminder: {
              bookingId: booking.id,
              salonName: booking.salonName,
              slotDate: booking.slot.date,
              slotTime: booking.slot.time,
              scheduledTime,
              diffMinutes,
              message: `📅 Upcoming Reminder: Your appointment at ${booking.salonName} is tomorrow (${booking.slot.date} at ${booking.slot.time})!`,
              type: 'upcoming_24h',
            },
          };
        }
      }
    } catch (err) {
      console.error('[NotificationReminderService] Error checking 24h booking:', err);
    }

    return { isEligible: false };
  },

  /**
   * Marks a reminder as notified in local storage to prevent duplicate alerts.
   */
  markReminderSent(bookingId: string, reminderType = '2h'): void {
    setStoredReminder(`${REMINDER_KEY_PREFIX}${reminderType}_${bookingId}`, new Date().toISOString());
  },

  /**
   * Clears reminder cache for a booking (useful if rescheduled or cancelled).
   */
  clearReminderSent(bookingId: string): void {
    removeStoredReminder(`${REMINDER_KEY_PREFIX}2h_${bookingId}`);
    removeStoredReminder(`${REMINDER_KEY_PREFIX}24h_${bookingId}`);
  },

  /**
   * Requests native Web Notification permission if supported.
   */
  async requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        return await Notification.requestPermission();
      }
      return Notification.permission;
    }
    return 'unsupported';
  },

  /**
   * Fires a native system/push notification if permission is granted, otherwise returns false.
   */
  showSystemNotification(title: string, options: NotificationOptions = {}): boolean {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
        return true;
      } catch (err) {
        console.warn('[NotificationReminderService] Web notification trigger error:', err);
      }
    }
    return false;
  },

  /**
   * Scans all user upcoming bookings and returns reminders that need to be triggered right now (prioritizing 2h, then 24h).
   */
  async evaluateUpcomingReminders(userId?: string): Promise<AppointmentReminder[]> {
    try {
      const bookings = await bookingService.getBookings(userId);
      const reminders: AppointmentReminder[] = [];
      const now = new Date();

      for (const booking of bookings) {
        // First check 2-hour window
        const check2h = this.checkBookingEligibleFor2HourReminder(booking, now);
        if (check2h.isEligible && check2h.reminder) {
          reminders.push(check2h.reminder);
          continue;
        }

        // Then check 24-hour window
        const check24h = this.checkBookingEligibleFor24HourReminder(booking, now);
        if (check24h.isEligible && check24h.reminder) {
          reminders.push(check24h.reminder);
        }
      }

      return reminders;
    } catch (err) {
      console.error('[NotificationReminderService] evaluateUpcomingReminders failed:', err);
      return [];
    }
  },
};
