import { describe, it, expect, beforeEach } from 'vitest';
import { bookingService } from './bookingService';
import { Booking } from '../../../types';
import { mockCoupons } from '../../../data/mockCoupons';

describe('Booking Service Cancellation & Refund Rules (PRD.md section 5)', () => {
  const baseBooking: Booking = {
    id: 'GS-TEST-1',
    type: 'salon',
    salonName: 'Test Salon',
    services: [{ name: 'Haircut', durationMin: 30, price: 24900, qty: 1 }],
    slot: {
      date: '2026-10-10',
      time: '14:00',
    },
    subtotalPaise: 24900,
    platformFeePaise: 1000,
    taxPaise: 4482,
    couponDiscountPaise: 0,
    pointsDiscountPaise: 0,
    totalPaise: 30382,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    status: 'upcoming',
    createdAt: '2026-10-02T10:00:00Z',
    rescheduleCount: 0,
  };

  it('provides 100% refund when cancelled >4 hours before slot', () => {
    // 5 days in advance
    const refund = bookingService.calculateRefund(baseBooking);
    expect(refund.refundPercent).toBe(100);
    expect(refund.refundAmountPaise).toBe(30382);
  });

  it('allows rescheduling when >2 hours before slot and rescheduleCount is 0', () => {
    const check = bookingService.canReschedule(baseBooking);
    expect(check.allowed).toBe(true);
  });

  it('disallows rescheduling if already rescheduled once', () => {
    const rescheduledBooking: Booking = {
      ...baseBooking,
      rescheduleCount: 1,
    };
    const check = bookingService.canReschedule(rescheduledBooking);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('only once');
  });

  it('validates mock coupons correctly', () => {
    const glow50 = mockCoupons.find((c) => c.code === 'GLOW50');
    expect(glow50).toBeDefined();
    expect(glow50?.isExpired).toBe(false);
    expect(glow50?.minOrderPaise).toBe(20000);

    const expired = mockCoupons.find((c) => c.code === 'EXPIRED20');
    expect(expired?.isExpired).toBe(true);
  });
});
