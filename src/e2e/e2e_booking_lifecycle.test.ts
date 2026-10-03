import { describe, it, expect } from 'vitest';
import { authService } from '../features/auth/services/authService';
import { salonService } from '../features/salons/services/salonService';
import { slotService } from '../features/slots/services/slotService';
import { bookingService } from '../features/bookings/services/bookingService';
import { couponService } from '../features/cart/services/couponService';
import { useSessionStore } from '../store/useSessionStore';

describe('E2E Integration Test: User Lifecycle & Booking Journey (P6A)', () => {
  it('executes the full booking lifecycle: OTP -> Explore -> Hold -> Book -> Reschedule -> Cancel', async () => {
    const testPhone = '9876543210';

    // Step 1: Sign up and verify OTP
    const otpSent = await authService.sendOtp(testPhone);
    expect(otpSent.success).toBe(true);

    const verify = await authService.verifyOtp(testPhone, '123456');
    expect(verify.success).toBe(true);
    const userId = useSessionStore.getState().user?.id || 'usr-test-123';

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
