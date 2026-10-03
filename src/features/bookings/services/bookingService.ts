import { Booking, BookingReview } from '../../../types';
import { PARTIAL_REFUND_PERCENT } from '../../../utils/constants';

const STORAGE_KEY = 'glowslot_bookings';

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'GS-2026-88102',
    type: 'salon',
    salonName: 'Luxe Cut & Style Studio',
    salonAddress: '42, 1st Cross, 5th Block, Koramangala, Bengaluru',
    services: [
      { name: 'Signature Precision Haircut', durationMin: 30, price: 14900, qty: 1 },
      { name: 'Aromatic Scalp & Head Massage', durationMin: 30, price: 22900, qty: 1 },
    ],
    slot: {
      date: '2026-10-05',
      time: '09:00',
    },
    subtotalPaise: 37800,
    platformFeePaise: 1000,
    taxPaise: 6804,
    couponDiscountPaise: 5000,
    pointsDiscountPaise: 2000,
    totalPaise: 38604,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    rescheduleCount: 0,
  },
  {
    id: 'GS-2026-72419',
    type: 'athome',
    salonName: 'GlowSlot At-Home Pro',
    services: [
      { name: 'Classic Clean Shave & Beard Trim', durationMin: 30, price: 19900, qty: 1 },
    ],
    slot: {
      date: '2026-09-28',
      time: '11:00',
    },
    subtotalPaise: 19900,
    platformFeePaise: 1000,
    taxPaise: 3582,
    couponDiscountPaise: 0,
    pointsDiscountPaise: 0,
    totalPaise: 24482,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'completed',
    createdAt: '2026-09-27T10:00:00Z',
    rescheduleCount: 0,
    review: {
      rating: 5,
      tags: ['On Time', 'Clean Setup', 'Polite Stylist'],
      text: 'Stylist arrived 5 mins before time with a sealed sanitized kit. Excellent work.',
      submittedAt: '2026-09-28T12:00:00Z',
    },
  },
];

export const bookingService = {
  getBookings(): Booking[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed reading bookings:', e);
    }
    this.saveBookings(SEED_BOOKINGS);
    return SEED_BOOKINGS;
  },

  saveBookings(bookings: Booking[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed saving bookings:', e);
    }
  },

  getBookingById(id: string): Booking | null {
    const list = this.getBookings();
    return list.find((b) => b.id === id) || null;
  },

  createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'rescheduleCount' | 'status'>): Booking {
    const list = this.getBookings();
    const newBooking: Booking = {
      ...booking,
      id: `GS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      status: 'upcoming',
      rescheduleCount: 0,
    };
    list.unshift(newBooking);
    this.saveBookings(list);
    return newBooking;
  },

  /**
   * Cancellation rules per PRD.md section 5:
   * > 4 hours before slot: 100% refund
   * 1 to 4 hours before slot: 50% partial refund
   * < 1 hour before slot: 0% refund
   */
  calculateRefund(booking: Booking): { refundPercent: number; refundAmountPaise: number; hoursRemaining: number } {
    try {
      const [year, month, day] = booking.slot.date.split('-').map(Number);
      const [hours, mins] = booking.slot.time.split(':').map(Number);
      const slotTime = new Date(year, month - 1, day, hours, mins).getTime();
      const now = Date.now();
      const diffHours = (slotTime - now) / (1000 * 60 * 60);

      if (diffHours > 4) {
        return {
          refundPercent: 100,
          refundAmountPaise: booking.totalPaise,
          hoursRemaining: diffHours,
        };
      } else if (diffHours >= 1) {
        const refundAmountPaise = Math.round((booking.totalPaise * PARTIAL_REFUND_PERCENT) / 100);
        return {
          refundPercent: PARTIAL_REFUND_PERCENT,
          refundAmountPaise,
          hoursRemaining: diffHours,
        };
      } else {
        return {
          refundPercent: 0,
          refundAmountPaise: 0,
          hoursRemaining: diffHours,
        };
      }
    } catch {
      // Default to 100% if date parsing fails in mock
      return {
        refundPercent: 100,
        refundAmountPaise: booking.totalPaise,
        hoursRemaining: 5,
      };
    }
  },

  cancelBooking(id: string, reason: string): Booking | null {
    const list = this.getBookings();
    const booking = list.find((b) => b.id === id);
    if (!booking) return null;

    const { refundPercent, refundAmountPaise } = this.calculateRefund(booking);

    booking.status = 'cancelled';
    booking.cancellation = {
      reason,
      refundPercent,
      refundAmountPaise,
      cancelledAt: new Date().toISOString(),
    };

    this.saveBookings(list);
    return booking;
  },

  canReschedule(booking: Booking): { allowed: boolean; reason?: string } {
    if (booking.rescheduleCount >= 1) {
      return { allowed: false, reason: 'Rescheduling is allowed only once per booking.' };
    }
    const [year, month, day] = booking.slot.date.split('-').map(Number);
    const [hours, mins] = booking.slot.time.split(':').map(Number);
    const slotTime = new Date(year, month - 1, day, hours, mins).getTime();
    const now = Date.now();
    const diffHours = (slotTime - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return { allowed: false, reason: 'Rescheduling must be done at least 2 hours before the appointment.' };
    }
    return { allowed: true };
  },

  rescheduleBooking(id: string, newDate: string, newTime: string): Booking | null {
    const list = this.getBookings();
    const booking = list.find((b) => b.id === id);
    if (!booking) return null;

    booking.slot = { date: newDate, time: newTime };
    booking.rescheduleCount += 1;

    this.saveBookings(list);
    return booking;
  },

  addReview(id: string, review: BookingReview): Booking | null {
    const list = this.getBookings();
    const booking = list.find((b) => b.id === id);
    if (!booking) return null;

    booking.review = review;
    this.saveBookings(list);
    return booking;
  },
};
