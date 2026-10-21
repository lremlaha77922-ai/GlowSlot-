import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notificationReminderService } from './notificationReminderService';
import { Booking } from '../types';

describe('NotificationReminderService (2-Hour & 24-Hour Appointment Reminder Suite)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  const baseBooking: Booking = {
    id: 'GS-TEST-12345',
    type: 'salon',
    salonName: 'Luxe Cut & Style Studio',
    salonAddress: 'Koramangala, Bengaluru',
    services: [{ name: 'Precision Haircut', durationMin: 30, price: 15000, qty: 1 }],
    slot: {
      date: '2026-10-12',
      time: '14:00',
    },
    subtotalPaise: 15000,
    platformFeePaise: 1000,
    taxPaise: 2880,
    couponDiscountPaise: 0,
    pointsDiscountPaise: 0,
    totalPaise: 18880,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    status: 'upcoming',
    rescheduleCount: 0,
    createdAt: new Date().toISOString(),
  };

  it('detects booking exactly ~90 minutes away as eligible for 2-hour reminder', () => {
    // Current time is 12:30 PM, appointment is at 14:00 (1.5 hours away)
    const mockNow = new Date('2026-10-12T12:30:00');
    const result = notificationReminderService.checkBookingEligibleFor2HourReminder(baseBooking, mockNow);

    expect(result.isEligible).toBe(true);
    expect(result.reminder).toBeDefined();
    expect(result.reminder?.diffMinutes).toBe(90);
    expect(result.reminder?.bookingId).toBe('GS-TEST-12345');
    expect(result.reminder?.message).toContain('Luxe Cut & Style Studio');
    expect(result.reminder?.message).toContain('14:00');
  });

  it('rejects booking more than 2 hours away (e.g. 5 hours away) for 2h reminder', () => {
    // Current time is 09:00 AM, appointment is at 14:00 (5 hours away)
    const mockNow = new Date('2026-10-12T09:00:00');
    const result = notificationReminderService.checkBookingEligibleFor2HourReminder(baseBooking, mockNow);

    expect(result.isEligible).toBe(false);
    expect(result.reminder).toBeUndefined();
  });

  it('detects booking ~24 hours away as eligible for 24-hour reminder', () => {
    // Current time is Oct 11, 14:00, appointment is on Oct 12 at 14:00 (24 hours away)
    const mockNow = new Date('2026-10-11T14:00:00');
    const result = notificationReminderService.checkBookingEligibleFor24HourReminder(baseBooking, mockNow);

    expect(result.isEligible).toBe(true);
    expect(result.reminder).toBeDefined();
    expect(result.reminder?.type).toBe('upcoming_24h');
    expect(result.reminder?.diffMinutes).toBe(1440);
    expect(result.reminder?.message).toContain('tomorrow');
  });

  it('rejects booking within 2 hours for 24-hour reminder check', () => {
    // Current time is 12:30 PM, appointment is at 14:00 (90 mins away) -> 24h reminder should be false
    const mockNow = new Date('2026-10-12T12:30:00');
    const result = notificationReminderService.checkBookingEligibleFor24HourReminder(baseBooking, mockNow);

    expect(result.isEligible).toBe(false);
  });

  it('rejects past appointments (diffMinutes <= 0)', () => {
    // Current time is 15:00, appointment was at 14:00
    const mockNow = new Date('2026-10-12T15:00:00');
    const result = notificationReminderService.checkBookingEligibleFor2HourReminder(baseBooking, mockNow);

    expect(result.isEligible).toBe(false);
  });

  it('rejects cancelled or completed appointments even if within reminder windows', () => {
    const mockNow = new Date('2026-10-11T14:00:00');
    const cancelledBooking: Booking = { ...baseBooking, status: 'cancelled' };
    const completedBooking: Booking = { ...baseBooking, status: 'completed' };

    expect(notificationReminderService.checkBookingEligibleFor24HourReminder(cancelledBooking, mockNow).isEligible).toBe(false);
    expect(notificationReminderService.checkBookingEligibleFor24HourReminder(completedBooking, mockNow).isEligible).toBe(false);
  });

  it('enforces idempotency and does not notify twice if already marked sent', () => {
    const mockNow = new Date('2026-10-11T14:00:00');
    // First check should be eligible
    const firstCheck = notificationReminderService.checkBookingEligibleFor24HourReminder(baseBooking, mockNow);
    expect(firstCheck.isEligible).toBe(true);

    // Mark sent
    notificationReminderService.markReminderSent(baseBooking.id, '24h');

    // Second check should be suppressed by local storage idempotency key
    const secondCheck = notificationReminderService.checkBookingEligibleFor24HourReminder(baseBooking, mockNow);
    expect(secondCheck.isEligible).toBe(false);
  });
});
