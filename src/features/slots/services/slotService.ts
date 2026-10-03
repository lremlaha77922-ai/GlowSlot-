import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { SlotItem, SlotStatus } from '../../../types';
import { calculateSlotPrice } from '../../../utils/pricing';
import { getFriendlyErrorMessage } from '../../../services/errors';

export interface HoldResult {
  success: boolean;
  heldUntil?: string;
  error?: string;
}

export const slotService = {
  async getSlots(
    salonId: string,
    serviceId: string,
    date: string,
    basePricePaise: number,
    userId?: string
  ): Promise<SlotItem[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('slots')
          .select('*')
          .eq('salon_id', salonId)
          .eq('date', date)
          .order('start_time', { ascending: true });

        if (!error && data && data.length > 0) {
          const now = new Date();
          return data.map((row: any) => {
            let status: SlotStatus = row.status;
            if (row.status === 'held') {
              if (row.held_until && new Date(row.held_until) < now) {
                status = 'available';
              } else if (row.held_by_user_id && row.held_by_user_id === userId) {
                status = 'held';
              } else {
                status = 'held_by_others';
              }
            }

            const timeFormatted = row.start_time.slice(0, 5);
            const pricing = calculateSlotPrice(basePricePaise, timeFormatted, row.is_free);

            return {
              id: row.id,
              salonId: row.salon_id,
              serviceId: serviceId,
              date: row.date,
              time: timeFormatted,
              price: row.price_paise ? Number(row.price_paise) : pricing.price,
              isFree: row.is_free ?? pricing.isFree,
              isPeak: row.is_peak ?? pricing.isPeak,
              status,
            };
          });
        }
      } catch {
        // fallback to local generator
      }
    }

    // Default mock generator
    const times = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '14:00', '15:00', '16:00',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
    ];

    return times.map((t, idx) => {
      const pricing = calculateSlotPrice(basePricePaise, t);
      let status: SlotStatus = 'available';
      if (idx === 1) status = 'booked';
      if (idx === 4) status = 'held_by_others';

      return {
        id: `slot-${salonId}-${date}-${t.replace(':', '')}`,
        salonId,
        serviceId,
        date,
        time: t,
        price: pricing.price,
        isFree: pricing.isFree,
        isPeak: pricing.isPeak,
        status,
      };
    });
  },

  async listByDay(
    salonId: string,
    serviceId: string,
    date: string,
    basePricePaise: number,
    userId?: string
  ): Promise<SlotItem[]> {
    return this.getSlots(salonId, serviceId, date, basePricePaise, userId);
  },

  async holdSlot(slotId: string, userId?: string): Promise<HoldResult> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase.rpc('hold_slot', {
          p_slot_id: slotId,
          p_user_id: userId,
        });

        if (error) {
          return {
            success: false,
            error: getFriendlyErrorMessage(error.message),
          };
        }

        const heldUntil = data?.held_until || new Date(Date.now() + 5 * 60 * 1000).toISOString();
        return {
          success: true,
          heldUntil,
        };
      } catch (err: any) {
        return {
          success: false,
          error: getFriendlyErrorMessage(err?.message),
        };
      }
    }

    const heldUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    return {
      success: true,
      heldUntil,
    };
  },

  async hold(slotId: string, userId?: string): Promise<HoldResult> {
    return this.holdSlot(slotId, userId);
  },

  async releaseSlot(slotId: string, userId?: string): Promise<boolean> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        await supabase.rpc('release_slot', {
          p_slot_id: slotId,
          p_user_id: userId,
        });
        return true;
      } catch {
        return false;
      }
    }
    return true;
  },

  async release(slotId: string, userId?: string): Promise<boolean> {
    return this.releaseSlot(slotId, userId);
  },

  subscribeToSlots(
    salonId: string,
    date: string,
    onUpdate: () => void
  ) {
    if (!isSupabaseConfigured() || import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      return { unsubscribe: () => {} };
    }

    const channelName = `slots:${salonId}:${date}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'slots',
          filter: `salon_id=eq.${salonId}`,
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
