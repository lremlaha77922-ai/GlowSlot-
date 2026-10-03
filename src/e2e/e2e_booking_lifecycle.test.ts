import { describe, it, expect, vi } from 'vitest';
import { authService } from '../features/auth/services/authService';
import { salonService } from '../features/salons/services/salonService';
import { slotService } from '../features/slots/services/slotService';
import { bookingService } from '../features/bookings/services/bookingService';
import { couponService } from '../features/cart/services/couponService';
import { supabase } from '../lib/supabase';

describe('E2E Integration Test: User Lifecycle & Booking Journey (P6A)', () => {
  it('executes the full booking lifecycle: Sign Up -> Explore -> Hold -> Book -> Reschedule -> Cancel', async () => {
    vi.restoreAllMocks();
    const testEmail = 'e2e_user@glowslot.com';
    const testPassword = 'password123';
    const mockId = '00000000-0000-0000-0000-000000000099';

    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
      data: {
        user: { id: mockId, email: testEmail } as any,
        session: { access_token: 'fake-token' } as any,
      },
      error: null,
    });

    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: {
        user: { id: mockId, email: testEmail } as any,
        session: { access_token: 'fake-token' } as any,
      },
      error: null,
    });

    vi.spyOn(supabase, 'from').mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: mockId, full_name: 'Aarav E2E', gender: 'male', points: 100 },
        error: null,
      }),
    } as any);

    // Step 1: Sign up with Email and Password
    const signUpRes = await authService.signUpWithEmail(testEmail, testPassword, 'Aarav E2E', 'male');
    expect(signUpRes.success).toBe(true);

    const loginRes = await authService.signInWithEmail(testEmail, testPassword);
    expect(loginRes.success).toBe(true);
    const userId = loginRes.session?.id || mockId;

    // Step 2: Explore salons and select service
    const salons = await salonService.list();
    expect(salons.length).toBeGreaterThan(0);
    const targetSalon = salons[0];
    const salonId = targetSalon.id;

    const services = await salonService.getServicesBySalon(salonId);
    expect(services.length).toBeGreaterThan(0);
    const serviceId = services[0].id;

    // Step 3: Select and hold slot for 5 minutes
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const slots = await slotService.getSlots(salonId, serviceId, futureDate, 14900, userId);
    expect(slots.length).toBeGreaterThan(0);

    const availableSlot = slots.find((s) => s.status === 'available') || slots[0];
    const holdRes = await slotService.hold(availableSlot.id, userId);
    expect(holdRes.success).toBe(true);
    expect(holdRes.heldUntil).toBeDefined();

    // Step 4: Validate coupon and confirm checkout booking
    const couponValidation = await couponService.validateCoupon('GLOW50', 30000);
    expect(couponValidation.valid).toBe(true);

    const bookingRes = await bookingService.createBooking({
      userId,
      slotId: availableSlot.id,
      salonId,
      salonName: targetSalon.name,
      services: [{ name: 'Precision Haircut', durationMin: 30, price: 14900, qty: 1 }],
      slot: { date: futureDate, time: '10:00' },
      subtotalPaise: 14900,
      platformFeePaise: 1000,
      taxPaise: 2682,
      couponDiscountPaise: 5000,
      pointsDiscountPaise: 0,
      totalPaise: 13582,
      paymentMethod: 'upi',
    });

    expect(bookingRes.success).toBe(true);
    expect(bookingRes.booking).toBeDefined();
    expect(bookingRes.booking?.status).toBe('upcoming');
    const bookingId = bookingRes.booking!.id;

    // Step 5: Reschedule booking to a new time
    const rescheduleRes = await bookingService.rescheduleBooking(
      bookingId,
      { id: 'slot-new-1', date: futureDate, time: '14:00' },
      userId
    );
    expect(rescheduleRes.success).toBe(true);

    const updated = await bookingService.getBookingById(bookingId, userId);
    expect(updated?.slot.time).toBe('14:00');
    expect(updated?.rescheduleCount).toBe(1);

    // Step 6: Cancel booking and verify 100% refund (>4h window)
    const cancelRes = await bookingService.cancelBooking(
      bookingId,
      'Change of plans',
      userId
    );

    expect(cancelRes.success).toBe(true);
    expect(cancelRes.refundPercent).toBe(100);
    expect(cancelRes.refundAmountPaise).toBe(13582);

    const cancelledBooking = await bookingService.getBookingById(bookingId, userId);
    expect(cancelledBooking?.status).toBe('cancelled');
    expect(cancelledBooking?.cancellation?.reason).toBe('Change of plans');
  });
});
