import { studioflowClient, isStudioflowEnabled } from '../../lib/studioflowClient';
import type { Booking, PromoBanner, Salon, SlotItem } from '../../types';
import {
  SF_PREFIX,
  isStudioflowId,
  mapAvailabilityToSlots,
  mapWebsiteToBanner,
  mapWebsiteToSalon,
  parseSlotId,
  slugFromSalonId,
  type PublishedWebsiteRow,
} from './studioflowMapper';

export class StudioflowAuthRequired extends Error {
  constructor() {
    super('Sign in to your booking account to continue.');
    this.name = 'StudioflowAuthRequired';
  }
}

const friendly = (message?: string) =>
  (message || 'Something went wrong. Please try again.').replace(/^.*?: /, '');

async function fetchPublished(slug?: string): Promise<PublishedWebsiteRow[]> {
  if (!isStudioflowEnabled()) return [];
  try {
    let q = studioflowClient.from('studioflow_websites').select('slug,content,published_at,owner_id');
    q = slug ? q.eq('slug', slug) : q.order('published_at', { ascending: false }).limit(200);
    const { data, error } = await q;
    if (error || !data) return [];
    return data as PublishedWebsiteRow[];
  } catch {
    return [];
  }
}

// ---- Auth (one StudioFlow customer account, shared with the salon websites) ----
async function getUser() {
  try {
    const { data } = await studioflowClient.auth.getSession();
    return data.session?.user ?? null;
  } catch {
    return null;
  }
}

// ---- Razorpay (same checkout the website uses) ----
let sdk: Promise<void> | undefined;
function loadRazorpay(): Promise<void> {
  if ((window as any).Razorpay) return Promise.resolve();
  if (sdk) return sdk;
  sdk = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    const timer = setTimeout(() => { script.remove(); sdk = undefined; reject(new Error('Payment checkout did not load. Check your connection and retry.')); }, 15000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); script.remove(); sdk = undefined; reject(new Error('Payment checkout is unavailable. Check your connection and retry.')); };
    document.head.appendChild(script);
  });
  return sdk;
}

async function paymentRequest(action: string, data: Record<string, unknown> = {}) {
  const { data: result, error } = await studioflowClient.functions.invoke('studioflow-payments', { body: { action, ...data } });
  if (error) {
    let message = error.message;
    try { message = (await (error as any).context?.json())?.error || message; } catch { /* keep message */ }
    throw new Error(message || 'Payment service is unavailable');
  }
  if (result?.error) throw new Error(result.error);
  return result;
}

function openCheckout(booking: { id: string; clientName: string; clientPhone: string; clientEmail?: string }) {
  return paymentRequest('create', { bookingId: booking.id }).then(async (order) => {
    await loadRazorpay();
    return new Promise<any>((resolve, reject) => {
      let verifying = false;
      const checkout = new (window as any).Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId,
        name: 'Salon booking', description: 'Mandatory 25% advance',
        prefill: { name: booking.clientName, contact: booking.clientPhone, email: booking.clientEmail },
        handler: async (response: any) => {
          verifying = true;
          try {
            const result = await paymentRequest('verify', {
              bookingId: booking.id, orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id, signature: response.razorpay_signature,
            });
            if (result.booking?.refund_required) throw new Error('Payment received after the reservation expired. Contact support with your booking reference for a refund.');
            resolve(result.booking);
          } catch (e) { reject(e); }
        },
        modal: { ondismiss: () => { if (!verifying) reject(new Error('Checkout closed. Your slot is held for up to 15 minutes. Retry payment from My Bookings.')); } },
      });
      checkout.on('payment.failed', () => reject(new Error('Payment failed. Retry checkout before paying again.')));
      checkout.open();
    });
  });
}

function mapBookingRow(row: any, site?: PublishedWebsiteRow): Booking {
  const p = row.payload || {};
  const pricePaise = Math.round(Number(p.servicePrice || 0) * 100);
  const status = row.status === 'pending' ? 'pending' : row.status === 'confirmed' ? 'upcoming' : row.status;
  const paid = p.paymentStatus === 'paid_deposit' || p.paymentStatus === 'paid_full';
  const salon = site ? mapWebsiteToSalon(site) : null;
  return {
    id: `${SF_PREFIX}${row.id}`,
    type: 'salon',
    salonName: salon?.name || 'Salon',
    salonAddress: salon?.address,
    latitude: salon?.latitude,
    longitude: salon?.longitude,
    services: [{ name: p.serviceName || 'Service', durationMin: 30, price: pricePaise, qty: 1 }],
    slot: { date: p.date, time: p.time },
    subtotalPaise: pricePaise,
    platformFeePaise: 0,
    taxPaise: 0,
    couponDiscountPaise: 0,
    pointsDiscountPaise: 0,
    totalPaise: pricePaise,
    advancePaise: Math.round(pricePaise * 0.25),
    balancePaise: pricePaise - Math.round(pricePaise * 0.25),
    paymentMethod: 'upi',
    paymentStatus: paid ? 'paid' : 'pay_later',
    status: status as Booking['status'],
    createdAt: p.createdAt || row.created_at || new Date().toISOString(),
    rescheduleCount: 0,
  };
}

export const studioflowService = {
  isEnabled: isStudioflowEnabled,
  isStudioflowId,

  // ---------- Catalogue ----------
  async listSalons(): Promise<Salon[]> {
    return (await fetchPublished()).map((r) => mapWebsiteToSalon(r));
  },
  async getSalon(salonId: string): Promise<Salon | null> {
    const rows = await fetchPublished(slugFromSalonId(salonId));
    return rows[0] ? mapWebsiteToSalon(rows[0]) : null;
  },
  async getBanners(): Promise<PromoBanner[]> {
    return (await fetchPublished()).map(mapWebsiteToBanner).filter(Boolean) as PromoBanner[];
  },

  // ---------- Availability (same RPC the website booking modal uses) ----------
  async getSlots(salonId: string, serviceId: string, date: string, basePricePaise: number, stylistId = 'any'): Promise<SlotItem[]> {
    const slug = slugFromSalonId(salonId);
    try {
      const { data, error } = await studioflowClient.rpc('studioflow_available_slots', {
        p_slug: slug, p_service_id: serviceId, p_date: date, p_stylist_id: stylistId,
      });
      if (error || !Array.isArray(data)) return [];
      return mapAvailabilityToSlots(slug, serviceId, date, basePricePaise, data, stylistId);
    } catch {
      return [];
    }
  },
  subscribeToSlots(onUpdate: () => void) {
    // StudioFlow bookings change availability; refresh on any booking change for this customer's view.
    const channel = studioflowClient
      .channel(`sf-bookings-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'studioflow_bookings' }, onUpdate)
      .subscribe();
    return { unsubscribe: () => { studioflowClient.removeChannel(channel); } };
  },

  // ---------- Customer account ----------
  getUser,
  async signIn(email: string, password: string) {
    const { error } = await studioflowClient.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(friendly(error.message));
  },
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await studioflowClient.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: fullName.trim(), source: 'glowslot' } },
    });
    if (error) throw new Error(friendly(error.message));
    if (!data.session) throw new Error('Check your email to confirm your account, then sign in.');
  },
  async signOut() { await studioflowClient.auth.signOut(); },

  // ---------- Booking + mandatory 25% deposit ----------
  async bookAndPay(params: {
    slotId: string; clientName: string; clientPhone: string;
  }): Promise<{ success: boolean; booking?: Booking; error?: string; authRequired?: boolean }> {
    const parsed = parseSlotId(params.slotId);
    if (!parsed) return { success: false, error: 'Invalid slot.' };
    const user = await getUser();
    if (!user) return { success: false, authRequired: true, error: new StudioflowAuthRequired().message };
    try {
      const { data, error } = await studioflowClient.rpc('studioflow_book', {
        p_slug: parsed.slug,
        p_request: {
          serviceId: parsed.serviceId, stylistId: parsed.stylistId, date: parsed.date, time: parsed.time,
          clientName: params.clientName, clientPhone: params.clientPhone,
        },
      });
      if (error) return { success: false, error: friendly(error.message) };
      await openCheckout({ id: data.id, clientName: data.clientName, clientPhone: data.clientPhone, clientEmail: data.clientEmail });
      const [site] = await fetchPublished(parsed.slug);
      const { data: row } = await studioflowClient.from('studioflow_bookings').select('id,status,payload,created_at').eq('id', data.id).maybeSingle();
      return { success: true, booking: mapBookingRow(row ?? { id: data.id, status: 'confirmed', payload: data }, site) };
    } catch (e: any) {
      return { success: false, error: friendly(e?.message) };
    }
  },

  // ---------- My bookings (website + app show the same rows) ----------
  async myBookings(): Promise<Booking[]> {
    const user = await getUser();
    if (!user) return [];
    try {
      const { data, error } = await studioflowClient
        .from('studioflow_bookings')
        .select('id,status,payload,created_at,owner_id')
        .eq('customer_id', user.id)
        .order('starts_at', { ascending: false });
      if (error || !data) return [];
      const sites = await fetchPublished();
      const byOwner = new Map(sites.map((s) => [s.owner_id, s]));
      return data.map((row: any) => mapBookingRow(row, byOwner.get(row.owner_id)));
    } catch {
      return [];
    }
  },
  async cancel(bookingId: string): Promise<{ success: boolean; error?: string }> {
    const id = bookingId.slice(SF_PREFIX.length);
    try {
      const { error } = await studioflowClient.rpc('studioflow_update_booking', { p_id: id, p_status: 'cancelled' });
      return error ? { success: false, error: friendly(error.message) } : { success: true };
    } catch (e: any) {
      return { success: false, error: friendly(e?.message) };
    }
  },
};
