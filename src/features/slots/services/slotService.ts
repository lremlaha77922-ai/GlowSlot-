import { generateMockSlots } from '../../../data/mockData';
import { SlotItem } from '../../../types';

export const slotService = {
  async listByDay(
    salonId: string,
    serviceId: string,
    dateStr: string,
    basePrice: number = 24900
  ): Promise<SlotItem[]> {
    const slots = generateMockSlots(salonId, serviceId, dateStr, basePrice);
    return Promise.resolve(slots);
  },

  async hold(slotId: string): Promise<{ success: boolean; heldUntil: Date }> {
    // 5-minute hold per 04_TECHSPEC.md
    const heldUntil = new Date(Date.now() + 5 * 60 * 1000);
    return Promise.resolve({ success: true, heldUntil });
  },

  async release(_slotId: string): Promise<void> {
    return Promise.resolve();
  },
};
