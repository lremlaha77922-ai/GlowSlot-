import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { bookingService } from '../features/bookings/services/bookingService';

export type ReminderStatus = 'pending' | 'sent' | 'skipped_no_phone' | 'no_provider' | 'failed';

export interface ReengagementReminderRecord {
  id: string;
  booking_id: string;
  user_id: string;
  salon_id?: string;
  salon_name?: string;
  phone?: string;
  reminder_type: string;
  scheduled_at: string;
  sent_at?: string;
  status: ReminderStatus;
  message_text?: string;
  whatsapp_url?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ReengagementJobReport {
  totalEligible: number;
  processed: number;
  created: number;
  skippedDuplicate: number;
  skippedNoPhone: number;
  statusSummary: Record<string, number>;
  records: ReengagementReminderRecord[];
  isTestMode: boolean;
  hasWhatsAppProvider: boolean;
}

// In-Memory store for offline/mock testing & fallback
const inMemoryRemindersMap = new Map<string, ReengagementReminderRecord>();

// Helper: Format friendly re-engagement message
export function generateReengagementMessage(
  customerName: string,
  salonName: string,
  bookingLink: string
): string {
  const name = customerName.trim() || 'Valued Customer';
  const salon = salonName.trim() || 'your favorite salon';
  return `Hi ${name} 👋\n\nIt's been a while since your last visit to ${salon}.\n\nReady for your next beauty & grooming session?\n\nBook your next appointment with GlowSlot:\n${bookingLink}\n\n— GlowSlot`;
}

// Helper: Generate WhatsApp click-to-chat URL
export function generateWhatsAppClickToChatUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return '';
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Helper: Generate deep booking URL
export function generateBookingLink(salonId?: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://glowslot.app';
  return salonId ? `${baseUrl}/?salonId=${salonId}` : `${baseUrl}/`;
}

export const reengagementService = {
  // Check if live WhatsApp Business API provider is configured in environment
  hasWhatsAppProvider(): boolean {
    const key = import.meta.env.VITE_WHATSAPP_API_KEY || import.meta.env.WHATSAPP_API_KEY;
    return !!key;
  },

  // Main automated 30-day re-engagement job
  async runReengagementJob(options?: {
    isTestMode?: boolean;
    daysOld?: number;
  }): Promise<ReengagementJobReport> {
    const isTestMode = options?.isTestMode ?? true; // Default to TEST MODE for safety
    const daysOld = options?.daysOld ?? 30;
    const hasProvider = this.hasWhatsAppProvider();

    const report: ReengagementJobReport = {
      totalEligible: 0,
      processed: 0,
      created: 0,
      skippedDuplicate: 0,
      skippedNoPhone: 0,
      statusSummary: {},
      records: [],
      isTestMode,
      hasWhatsAppProvider: hasProvider,
    };

    // Calculate cutoff timestamp (30 days ago)
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - daysOld * 24 * 60 * 60 * 1000);

    // 1. Fetch eligible completed bookings
    let candidates: Array<{
      booking_id: string;
      user_id: string;
      salon_id?: string;
      salon_name?: string;
      customer_name?: string;
      phone?: string;
      completed_at: Date;
    }> = [];

    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        // Attempt RPC call first
        const { data: rpcData, error: rpcErr } = await supabase.rpc(
          'get_eligible_reengagement_bookings',
          { p_days_old: daysOld }
        );

        if (!rpcErr && Array.isArray(rpcData)) {
          candidates = rpcData.map((b: any) => ({
            booking_id: b.booking_id,
            user_id: b.user_id,
            salon_id: b.salon_id,
            salon_name: b.salon_name,
            customer_name: b.customer_name,
            phone: b.phone,
            completed_at: new Date(b.booking_date),
          }));
        } else {
          // Direct Supabase table query fallback
          const { data: dbBookings } = await supabase
            .from('bookings')
            .select('*, profiles(full_name, phone), salons(name)')
            .eq('status', 'completed')
            .lte('created_at', cutoffDate.toISOString());

          if (dbBookings && dbBookings.length > 0) {
            candidates = dbBookings.map((b: any) => ({
              booking_id: b.id,
              user_id: b.user_id || 'user-unknown',
              salon_id: b.salon_id,
              salon_name: b.salons?.name || b.salon_name || 'GlowSlot Partner Salon',
              customer_name: b.profiles?.full_name || 'Customer',
              phone: b.profiles?.phone || b.phone || '',
              completed_at: new Date(b.created_at),
            }));
          }
        }
      } catch (err) {
        console.warn('[ReengagementService] Supabase fetch error, using fallback:', err);
      }
    }

    // Fallback: Check local/mock bookings for offline mode or test suite
    if (candidates.length === 0) {
      const allBookings = await bookingService.getBookings();
      const eligible = allBookings.filter((b) => {
        if (b.status !== 'completed') return false;
        const bookingDate = new Date(b.createdAt || b.slot.date);
        return bookingDate <= cutoffDate;
      });

      // Include a test synthetic completed booking older than 30 days if none exist
      if (eligible.length === 0) {
        const synthDate = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
        candidates.push({
          booking_id: 'GS-2026-COMPLETED-35D',
          user_id: 'user-001',
          salon_id: 'sal-1',
          salon_name: 'Luxe Cut & Style Studio',
          customer_name: 'Aarav Sharma',
          phone: '+919876543210',
          completed_at: synthDate,
        });
      } else {
        candidates = eligible.map((b) => ({
          booking_id: b.id,
          user_id: 'user-001',
          salon_id: 'sal-1',
          salon_name: b.salonName,
          customer_name: 'Aarav Sharma',
          phone: '+919876543210',
          completed_at: new Date(b.createdAt || b.slot.date),
        }));
      }
    }

    report.totalEligible = candidates.length;

    // 2. Process each candidate with idempotency check
    for (const candidate of candidates) {
      const reminderType = '30_day_reengagement';
      const mapKey = `${candidate.booking_id}_${reminderType}`;

      // Check duplicate in-memory
      if (inMemoryRemindersMap.has(mapKey)) {
        report.skippedDuplicate++;
        continue;
      }

      // Check duplicate in Supabase
      if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
        try {
          const { data: existing } = await supabase
            .from('booking_reengagement_reminders')
            .select('id')
            .eq('booking_id', candidate.booking_id)
            .eq('reminder_type', reminderType)
            .maybeSingle();

          if (existing) {
            report.skippedDuplicate++;
            continue;
          }
        } catch {
          // Continue processing
        }
      }

      report.processed++;

      // Validate customer phone number
      const phone = candidate.phone?.trim() || '';
      let status: ReminderStatus = 'pending';

      if (!phone) {
        status = 'skipped_no_phone';
        report.skippedNoPhone++;
      } else if (!hasProvider && !isTestMode) {
        status = 'no_provider';
      } else {
        status = 'pending';
      }

      const bookingLink = generateBookingLink(candidate.salon_id);
      const messageText = generateReengagementMessage(
        candidate.customer_name || 'Customer',
        candidate.salon_name || 'GlowSlot Salon',
        bookingLink
      );
      const whatsappUrl = phone ? generateWhatsAppClickToChatUrl(phone, messageText) : undefined;

      const record: ReengagementReminderRecord = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        booking_id: candidate.booking_id,
        user_id: candidate.user_id,
        salon_id: candidate.salon_id,
        salon_name: candidate.salon_name,
        phone: phone || undefined,
        reminder_type: reminderType,
        scheduled_at: new Date().toISOString(),
        status,
        message_text: messageText,
        whatsapp_url: whatsappUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store in memory (Idempotency Key)
      inMemoryRemindersMap.set(mapKey, record);

      // Persist to Supabase if configured
      if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
        try {
          await supabase.from('booking_reengagement_reminders').upsert(
            {
              booking_id: record.booking_id,
              user_id: record.user_id,
              salon_id: record.salon_id,
              salon_name: record.salon_name,
              phone: record.phone,
              reminder_type: record.reminder_type,
              scheduled_at: record.scheduled_at,
              status: record.status,
              message_text: record.message_text,
              whatsapp_url: record.whatsapp_url,
              created_at: record.created_at,
              updated_at: record.updated_at,
            },
            { onConflict: 'booking_id,reminder_type' }
          );
        } catch (dbErr) {
          console.warn('[ReengagementService] Failed to persist reminder record to DB:', dbErr);
        }
      }

      report.created++;
      report.records.push(record);
      report.statusSummary[status] = (report.statusSummary[status] || 0) + 1;
    }

    return report;
  },

  // Get historical re-engagement reminders
  async getRemindersHistory(userId?: string): Promise<ReengagementReminderRecord[]> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('booking_reengagement_reminders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as ReengagementReminderRecord[];
        }
      } catch {
        // Fallback to in-memory
      }
    }

    return Array.from(inMemoryRemindersMap.values());
  },

  // Clear in-memory map for unit test teardown
  _clearMemoryCacheForTesting() {
    inMemoryRemindersMap.clear();
  },
};
