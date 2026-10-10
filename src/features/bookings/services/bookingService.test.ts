import { describe, it, expect, beforeEach } from 'vitest';
import { bookingService } from './bookingService';
import { Booking } from '../../../types';
import { mockCoupons } from '../../../data/mockCoupons';

describe('Booking Service Cancellation & Refund Rules (PRD.md section 5)', () => {
  const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const baseBooking: Booking = {
    id: 'GS-TEST-1',
    type: 'salon',
    salonName: 'Test Salon',
    services: [{ name: 'Haircut', durationMin: 30, price: 24900, qty: 1 }],
    slot: {
      date: futureDate,
      time: '14:00',
    },
    subtotalPaise: 24900,
    platformFeePaise: 1000,
    taxPaise: 4482,
    couponDiscountPaise: 0,
    pointsDiscountPaise: 0,
    totalPaise: 30382,
    advancePaise: 7596,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    status: 'upcoming',
    createdAt: '2026-10-02T10:00:00Z',
    rescheduleCount: 0,
  };

  it('provides 80% refund of advance when cancelled >24 hours before slot', () => {
    // 5 days in advance
    const refund = bookingService.calculateRefund(baseBooking);
    expect(refund.refundPercent).toBe(80);
    expect(refund.refundAmountPaise).toBe(Math.round(7596 * 0.8));
  });

  it('provides 0% refund when cancelled within 24 hours of slot', () => {
    const tomorrow = new Date(Date.now() + 12 * 60 * 60 * 1000);
    const shortNoticeBooking: Booking = {
      ...baseBooking,
      slot: {
        date: tomorrow.toISOString().split('T')[0],
        time: tomorrow.toTimeString().slice(0, 5),
      },
    };
    const refund = bookingService.calculateRefund(shortNoticeBooking);
    expect(refund.refundPercent).toBe(0);
    expect(refund.refundAmountPaise).toBe(0);
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

  it('rejects reviews on bookings that are not completed', async () => {
    // GS-2026-88102 status is 'upcoming'
    const res = await bookingService.addReview('GS-2026-88102', {
      rating: 5,
      tags: ['Expert Stylist'],
      text: 'Great haircut',
      submittedAt: new Date().toISOString(),
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('completed appointments');
  });

  it('successfully adds and persists review on a completed booking', async () => {
    const completedBookingId = 'GS-2026-72419'; // completed mock booking
    const reviewData = {
      rating: 5,
      tags: ['Punctual & Zero Wait', 'Expert Stylist'],
      text: 'Brilliant fade haircut, zero waiting time!',
      submittedAt: new Date().toISOString(),
    };

    const res = await bookingService.addReview(completedBookingId, reviewData);
    expect(res.success).toBe(true);

    const updatedBooking = await bookingService.getBookingById(completedBookingId);
    expect(updatedBooking?.review).toBeDefined();
    expect(updatedBooking?.review?.rating).toBe(5);
    expect(updatedBooking?.review?.text).toBe('Brilliant fade haircut, zero waiting time!');
    expect(updatedBooking?.review?.tags).toContain('Expert Stylist');
  });
});
