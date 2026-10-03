import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { Booking, BookingReview, PaymentMethod, UserAddress } from '../../../types';
import { getFriendlyErrorMessage } from '../../../services/errors';

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

let inMemoryBookings: Booking[] = [...SEED_BOOKINGS];

const getStoredBookings = (): Booking[] => {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return inMemoryBookings;
};

const saveStoredBookings = (bookings: Booking[]) => {
  inMemoryBookings = bookings;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    }
  } catch {
    // Ignore
  }
};

export const bookingService = {
  async getBookings(userId?: string): Promise<Booking[]> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, salons(name, address), booking_items(*), reviews(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((b: any) => ({
            id: b.booking_number || b.id,
            type: b.booking_type || 'salon',
            salonName: b.salons?.name || 'GlowSlot Salon',
            salonAddress: b.salons?.address,
            services: b.booking_items?.map((item: any) => ({
              name: item.service_name || 'Service',
              durationMin: Number(item.duration_min) || 30,
              price: Number(item.price_paise),
              qty: Number(item.qty) || 1,
            })) || [],
            slot: {
              date: b.scheduled_date || '2026-10-05',
              time: b.scheduled_time ? b.scheduled_time.slice(0, 5) : '10:00',
            },
            subtotalPaise: Number(b.subtotal_paise),
            platformFeePaise: Number(b.platform_fee_paise),
            taxPaise: Number(b.tax_paise),
            couponDiscountPaise: Number(b.coupon_discount_paise) || 0,
            pointsDiscountPaise: Number(b.points_discount_paise) || 0,
            totalPaise: Number(b.total_paise),
            paymentMethod: b.payment_method as PaymentMethod,
            paymentStatus: b.payment_status,
            status: b.status,
            createdAt: b.created_at,
            rescheduleCount: Number(b.reschedule_count) || 0,
            review: b.reviews?.[0]
              ? {
                  rating: Number(b.reviews[0].rating),
                  tags: b.reviews[0].tags || [],
                  text: b.reviews[0].comment || '',
                  submittedAt: b.reviews[0].created_at,
                }
              : undefined,
          }));
        }
      } catch {
        // fallback
      }
    }

    return getStoredBookings();
  },

  async getBookingById(id: string, userId?: string): Promise<Booking | null> {
    const list = await this.getBookings(userId);
    return list.find((b) => b.id === id) || null;
  },

  async createBooking(params: {
    userId: string;
    slotId: string;
    salonId: string;
    salonName: string;
    salonAddress?: string;
    userAddress?: UserAddress;
    services: { name: string; durationMin: number; price: number; qty: number }[];
    slot: { date: string; time: string };
    subtotalPaise: number;
    platformFeePaise: number;
    taxPaise: number;
    couponDiscountPaise: number;
    pointsDiscountPaise: number;
    totalPaise: number;
    paymentMethod: PaymentMethod;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    if (params.userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.rpc('create_booking', {
          p_user_id: params.userId,
          p_slot_id: params.slotId,
          p_salon_id: params.salonId,
          p_service_names: params.services.map((s) => s.name),
          p_coupon_discount_paise: params.couponDiscountPaise,
          p_points_discount_paise: params.pointsDiscountPaise,
          p_payment_method: params.paymentMethod,
          p_idempotency_key: params.idempotencyKey || `idemp-${Date.now()}`,
        });

        if (error) {
          return { success: false, error: getFriendlyErrorMessage(error.message) };
        }

        const newBooking: Booking = {
          id: data?.booking_number || `GS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          type: params.userAddress ? 'athome' : 'salon',
          salonName: params.salonName,
          salonAddress: params.salonAddress,
          userAddress: params.userAddress,
          services: params.services,
          slot: params.slot,
          subtotalPaise: Number(data?.subtotal_paise ?? params.subtotalPaise),
          platformFeePaise: Number(data?.platform_fee_paise ?? params.platformFeePaise),
          taxPaise: Number(data?.tax_paise ?? params.taxPaise),
          couponDiscountPaise: Number(data?.coupon_discount_paise ?? params.couponDiscountPaise),
          pointsDiscountPaise: Number(data?.points_discount_paise ?? params.pointsDiscountPaise),
          totalPaise: Number(data?.total_paise ?? params.totalPaise),
          paymentMethod: params.paymentMethod,
          paymentStatus: params.paymentMethod === 'pay_at_salon' ? 'pay_later' : 'paid',
          status: 'upcoming',
          createdAt: new Date().toISOString(),
          rescheduleCount: 0,
        };

        return { success: true, booking: newBooking };
      } catch (err: any) {
        return { success: false, error: getFriendlyErrorMessage(err?.message) };
      }
    }

    // Mock flow
    const bookingNumber = `GS-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBooking: Booking = {
      id: bookingNumber,
      type: params.userAddress ? 'athome' : 'salon',
      salonName: params.salonName,
      salonAddress: params.salonAddress,
      userAddress: params.userAddress,
      services: params.services,
      slot: params.slot,
      subtotalPaise: params.subtotalPaise,
      platformFeePaise: params.platformFeePaise,
      taxPaise: params.taxPaise,
      couponDiscountPaise: params.couponDiscountPaise,
      pointsDiscountPaise: params.pointsDiscountPaise,
      totalPaise: params.totalPaise,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'pay_at_salon' ? 'pay_later' : 'paid',
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      rescheduleCount: 0,
    };

    const current = getStoredBookings();
    saveStoredBookings([newBooking, ...current]);
    return { success: true, booking: newBooking };
  },

  canReschedule(booking: Booking): { allowed: boolean; reason?: string } {
    if ((booking.rescheduleCount || 0) >= 1) {
      return { allowed: false, reason: 'Appointments can be rescheduled only once.' };
    }
    const appointmentDate = new Date(`${booking.slot.date}T${booking.slot.time}:00`);
    const diffHours = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);
    if (diffHours < 2) {
      return { allowed: false, reason: 'Rescheduling is permitted only up to 2 hours before the slot.' };
    }
    return { allowed: true };
  },

  calculateRefund(booking: Booking): { refundPercent: number; refundAmountPaise: number; hoursRemaining: number } {
    const appointmentDate = new Date(`${booking.slot.date}T${booking.slot.time}:00`);
    const diffHours = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (diffHours >= 4) {
      refundPercent = 100;
    } else if (diffHours >= 1) {
      refundPercent = 50;
    } else {
      refundPercent = 0;
    }

    const refundableTotal = booking.paymentStatus === 'paid' ? booking.totalPaise : 0;
    const refundAmountPaise = Math.round((refundableTotal * refundPercent) / 100);

    return {
      refundPercent,
      refundAmountPaise,
      hoursRemaining: Math.max(0, diffHours),
    };
  },

  async cancelBooking(
    bookingId: string,
    reason: string,
    userId?: string
  ): Promise<{ success: boolean; refundAmountPaise: number; refundPercent: number; error?: string }> {
    const list = getStoredBookings();
    const booking = list.find((b) => b.id === bookingId);
    if (!booking) return { success: false, refundAmountPaise: 0, refundPercent: 0, error: 'Booking not found' };

    // Calculate hours until appointment
    const appointmentDate = new Date(`${booking.slot.date}T${booking.slot.time}:00`);
    const diffHours = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (diffHours >= 4) {
      refundPercent = 100;
    } else if (diffHours >= 1) {
      refundPercent = 50;
    } else {
      refundPercent = 0;
    }

    const refundableTotal = booking.paymentStatus === 'paid' ? booking.totalPaise : 0;
    const refundAmountPaise = Math.round((refundableTotal * refundPercent) / 100);

    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { error } = await supabase.rpc('cancel_booking', {
          p_booking_id: bookingId,
          p_user_id: userId,
          p_reason: reason,
        });

        if (error) {
          return { success: false, refundAmountPaise: 0, refundPercent: 0, error: getFriendlyErrorMessage(error.message) };
        }
      } catch (err: any) {
        return { success: false, refundAmountPaise: 0, refundPercent: 0, error: getFriendlyErrorMessage(err?.message) };
      }
    }

    const updated = list.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: 'cancelled' as const,
            cancellation: {
              reason,
              refundAmountPaise,
              refundPercent,
              cancelledAt: new Date().toISOString(),
            },
          }
        : b
    );
    saveStoredBookings(updated);

    return {
      success: true,
      refundAmountPaise,
      refundPercent,
    };
  },

  async rescheduleBooking(
    bookingId: string,
    newSlot: { id: string; date: string; time: string },
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { error } = await supabase.rpc('reschedule_booking', {
          p_booking_id: bookingId,
          p_user_id: userId,
          p_new_slot_id: newSlot.id,
        });

        if (error) {
          return { success: false, error: getFriendlyErrorMessage(error.message) };
        }
      } catch (err: any) {
        return { success: false, error: getFriendlyErrorMessage(err?.message) };
      }
    }

    const list = getStoredBookings();
    const updated = list.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            slot: { date: newSlot.date, time: newSlot.time },
            rescheduleCount: (b.rescheduleCount || 0) + 1,
          }
        : b
    );
    saveStoredBookings(updated);
    return { success: true };
  },

  async addReview(
    bookingId: string,
    review: BookingReview,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const list = getStoredBookings();
    const booking = list.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };
    if (booking.status !== 'completed') {
      return { success: false, error: 'Reviews are only permitted for completed appointments.' };
    }

    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { error } = await supabase.from('reviews').insert({
          booking_id: bookingId,
          user_id: userId,
          rating: review.rating,
          tags: review.tags,
          comment: review.text,
        });

        if (error) {
          return { success: false, error: getFriendlyErrorMessage(error.message) };
        }
      } catch (err: any) {
        return { success: false, error: getFriendlyErrorMessage(err?.message) };
      }
    }

    const updated = list.map((b) =>
      b.id === bookingId ? { ...b, review } : b
    );
    saveStoredBookings(updated);
    return { success: true };
  },

  subscribeToBookings(userId: string, onUpdate: () => void) {
    if (!isSupabaseConfigured() || import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      return { unsubscribe: () => {} };
    }

    const channel = supabase
      .channel(`user-bookings:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },
};
