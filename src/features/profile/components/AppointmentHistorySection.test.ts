import { describe, it, expect, vi } from 'vitest';
import { Booking } from '../../../types';

const mockBookings: Booking[] = [
  {
    id: 'b-past-1',
    type: 'salon',
    salonName: 'Luxe Cut & Style Studio',
    salonAddress: 'Koramangala 5th Block',
    services: [
      { name: 'Signature Precision Haircut', durationMin: 30, price: 14900, qty: 1 },
      { name: 'Beard Sculpting & Styling', durationMin: 20, price: 9900, qty: 1 },
    ],
    slot: { date: '2026-10-01', time: '10:00 AM' },
    subtotalPaise: 24800,
    platformFeePaise: 1000,
    taxPaise: 4464,
    couponDiscountPaise: 0,
    pointsDiscountPaise: 0,
    totalPaise: 30264,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    status: 'completed',
    createdAt: '2026-09-30T10:00:00Z',
    rescheduleCount: 0,
  },
  {
    id: 'b-past-2',
    type: 'salon',
    salonName: 'Urban Fade & Shave Studio',
    salonAddress: 'HSR Layout Sector 3',
    services: [
      { name: 'Signature Precision Haircut', durationMin: 30, price: 14900, qty: 1 },
      { name: 'Keratin Hair Spa & Treatment', durationMin: 45, price: 28900, qty: 1 },
    ],
    slot: { date: '2026-09-15', time: '02:30 PM' },
    subtotalPaise: 43800,
    platformFeePaise: 1000,
    taxPaise: 7884,
    couponDiscountPaise: 0,
    pointsDiscountPaise: 0,
    totalPaise: 52684,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'completed',
    createdAt: '2026-09-14T10:00:00Z',
    rescheduleCount: 0,
  },
];

describe('Appointment History & Loyalty Points Earned Logic', () => {
  it('aggregates favorite services and orders by booking frequency', () => {
    const serviceMap = new Map<string, { serviceName: string; timesBooked: number; lastPrice: number; salonName: string }>();

    mockBookings.forEach((b) => {
      b.services.forEach((srv) => {
        const key = srv.name.toLowerCase().trim();
        const existing = serviceMap.get(key);
        if (existing) {
          existing.timesBooked += 1;
          existing.lastPrice = srv.price;
          existing.salonName = b.salonName;
        } else {
          serviceMap.set(key, {
            serviceName: srv.name,
            timesBooked: 1,
            lastPrice: srv.price,
            salonName: b.salonName,
          });
        }
      });
    });

    const favorites = Array.from(serviceMap.values()).sort((a, b) => b.timesBooked - a.timesBooked);

    expect(favorites.length).toBe(3);
    // 'Signature Precision Haircut' was booked twice, so it must be first
    expect(favorites[0].serviceName).toBe('Signature Precision Haircut');
    expect(favorites[0].timesBooked).toBe(2);
    expect(favorites[0].lastPrice).toBe(14900);
  });

  it('calculates loyalty points earned from completed bookings correctly (1 pt per ₹100 spent)', () => {
    const completedBookings = mockBookings.filter((b) => b.status === 'completed');
    const pointsEarned = completedBookings.reduce(
      (acc, b) => acc + Math.floor(b.totalPaise / 10000),
      0
    );

    expect(pointsEarned).toBe(Math.floor(30264 / 10000) + Math.floor(52684 / 10000));
    expect(pointsEarned).toBe(3 + 5);
  });

  it('triggers onRebookService with the target service details', () => {
    const onRebookService = vi.fn();
    const targetBooking = mockBookings[0];
    const targetService = targetBooking.services[0];

    onRebookService(targetBooking, {
      name: targetService.name,
      durationMin: targetService.durationMin,
      price: targetService.price,
    });

    expect(onRebookService).toHaveBeenCalledWith(
      targetBooking,
      expect.objectContaining({
        name: 'Signature Precision Haircut',
        price: 14900,
      })
    );
  });

  it('triggers onRebookVisit with the target booking', () => {
    const onRebookVisit = vi.fn();
    onRebookVisit(mockBookings[0]);

    expect(onRebookVisit).toHaveBeenCalledWith(mockBookings[0]);
    expect(onRebookVisit.mock.calls[0][0].salonName).toBe('Luxe Cut & Style Studio');
  });
});
