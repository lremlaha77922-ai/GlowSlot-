import { describe, it, expect } from 'vitest';
import { Booking } from '../../../types';
import { bookingService } from '../services/bookingService';

describe('My Bookings Tab & Historical Salon Visit Log', () => {
  const mockAppointments: Booking[] = [
    {
      id: 'GS-CONFIRMED-1',
      type: 'salon',
      salonName: 'Luxe Cut & Style Studio',
      salonAddress: '42 Koramangala 5th Block, Bengaluru',
      services: [{ name: 'Signature Precision Haircut', durationMin: 30, price: 14900, qty: 1 }],
      slot: { date: '2026-10-15', time: '10:00' },
      subtotalPaise: 14900,
      platformFeePaise: 1000,
      taxPaise: 2682,
      couponDiscountPaise: 0,
      pointsDiscountPaise: 0,
      totalPaise: 18582,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      status: 'upcoming',
      createdAt: '2026-10-12T10:00:00Z',
      rescheduleCount: 0,
    },
    {
      id: 'GS-COMPLETED-1',
      type: 'salon',
      salonName: 'Urban Fade & Shave Studio',
      salonAddress: '15 HSR Layout Sector 3, Bengaluru',
      services: [
        { name: 'Keratin Hair Spa', durationMin: 45, price: 28900, qty: 1 },
        { name: 'Beard Sculpting', durationMin: 20, price: 9900, qty: 1 },
      ],
      slot: { date: '2026-09-12', time: '16:00' },
      subtotalPaise: 38800,
      platformFeePaise: 1000,
      taxPaise: 6984,
      couponDiscountPaise: 4000,
      pointsDiscountPaise: 1000,
      totalPaise: 40784,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      status: 'completed',
      createdAt: '2026-09-10T15:00:00Z',
      rescheduleCount: 0,
      review: {
        rating: 5,
        tags: ['Master Stylist', 'Great Ambience', 'Zero Waiting Time'],
        text: 'Superb keratin spa treatment!',
        submittedAt: '2026-09-12T17:30:00Z',
      },
    },
    {
      id: 'GS-CANCELLED-1',
      type: 'salon',
      salonName: 'Aura Luxe Beauty Lounge',
      salonAddress: '77 Indiranagar 4th Block, Bengaluru',
      services: [{ name: 'Hydra Facial & Glow Treatment', durationMin: 60, price: 34900, qty: 1 }],
      slot: { date: '2026-09-20', time: '14:30' },
      subtotalPaise: 34900,
      platformFeePaise: 1000,
      taxPaise: 6282,
      couponDiscountPaise: 0,
      pointsDiscountPaise: 0,
      totalPaise: 42182,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      status: 'cancelled',
      createdAt: '2026-09-18T11:20:00Z',
      rescheduleCount: 0,
      cancellation: {
        reason: 'Schedule conflict with personal appointment',
        refundAmountPaise: 42182,
        refundPercent: 100,
        cancelledAt: '2026-09-19T09:15:00Z',
        refundStatus: 'refunded',
      },
    },
  ];

  it('correctly maps booking statuses to expected status indicators (Confirmed, Completed, Cancelled)', () => {
    const getStatusIndicator = (status: Booking['status']) => {
      switch (status) {
        case 'upcoming':
        case 'confirmed':
          return 'Confirmed';
        case 'completed':
          return 'Completed';
        case 'cancelled':
          return 'Cancelled';
        default:
          return status;
      }
    };

    expect(getStatusIndicator('upcoming')).toBe('Confirmed');
    expect(getStatusIndicator('confirmed')).toBe('Confirmed');
    expect(getStatusIndicator('completed')).toBe('Completed');
    expect(getStatusIndicator('cancelled')).toBe('Cancelled');
  });

  it('filters upcoming appointments correctly into the upcoming tab', () => {
    const upcoming = mockAppointments.filter(
      (b) => b.status === 'upcoming' || b.status === 'confirmed' || b.status === 'pending'
    );
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].id).toBe('GS-CONFIRMED-1');
    expect(upcoming[0].salonName).toBe('Luxe Cut & Style Studio');
  });

  it('filters historical log of completed salon visits into the completed tab', () => {
    const completedLog = mockAppointments.filter((b) => b.status === 'completed');
    expect(completedLog).toHaveLength(1);
    expect(completedLog[0].id).toBe('GS-COMPLETED-1');
    expect(completedLog[0].review).toBeDefined();
    expect(completedLog[0].review?.rating).toBe(5);
    expect(completedLog[0].services).toHaveLength(2);
  });

  it('filters cancelled salon visits into the cancelled tab with refund details', () => {
    const cancelled = mockAppointments.filter((b) => b.status === 'cancelled');
    expect(cancelled).toHaveLength(1);
    expect(cancelled[0].id).toBe('GS-CANCELLED-1');
    expect(cancelled[0].cancellation).toBeDefined();
    expect(cancelled[0].cancellation?.refundPercent).toBe(100);
    expect(cancelled[0].cancellation?.refundStatus).toBe('refunded');
  });

  it('computes booking statistics for user overview', () => {
    const upcomingCount = mockAppointments.filter(
      (b) => b.status === 'upcoming' || b.status === 'confirmed' || b.status === 'pending'
    ).length;
    const completedCount = mockAppointments.filter((b) => b.status === 'completed').length;
    const cancelledCount = mockAppointments.filter((b) => b.status === 'cancelled').length;

    expect(upcomingCount).toBe(1);
    expect(completedCount).toBe(1);
    expect(cancelledCount).toBe(1);
    expect(mockAppointments.length).toBe(3);
  });

  it('filters appointments by search query across salon names and service names', () => {
    const searchBySalon = (query: string) => {
      const q = query.toLowerCase();
      return mockAppointments.filter(
        (b) =>
          b.salonName.toLowerCase().includes(q) ||
          b.services.some((s) => s.name.toLowerCase().includes(q))
      );
    };

    const facialResults = searchBySalon('Facial');
    expect(facialResults).toHaveLength(1);
    expect(facialResults[0].id).toBe('GS-CANCELLED-1');

    const cutResults = searchBySalon('Precision Haircut');
    expect(cutResults).toHaveLength(1);
    expect(cutResults[0].id).toBe('GS-CONFIRMED-1');

    const salonResults = searchBySalon('Urban Fade');
    expect(salonResults).toHaveLength(1);
    expect(salonResults[0].id).toBe('GS-COMPLETED-1');
  });

  it('verifies seed bookings include upcoming, completed, and cancelled visits in bookingService', async () => {
    const allBookings = await bookingService.getBookings();
    expect(allBookings.length).toBeGreaterThanOrEqual(3);

    const hasUpcoming = allBookings.some((b) => b.status === 'upcoming' || b.status === 'confirmed');
    const hasCompleted = allBookings.some((b) => b.status === 'completed');
    const hasCancelled = allBookings.some((b) => b.status === 'cancelled');

    expect(hasUpcoming).toBe(true);
    expect(hasCompleted).toBe(true);
    expect(hasCancelled).toBe(true);
  });
});
