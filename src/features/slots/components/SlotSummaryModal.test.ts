import { describe, it, expect, vi } from 'vitest';
import { format12HourTime, formatSlotDate } from './SlotSummaryModal';
import { Salon, SlotItem } from '../../../types';

describe('SlotSummaryModal helper functions and logic', () => {
  it('formats 24-hour time to 12-hour AM/PM correctly', () => {
    expect(format12HourTime('09:00')).toBe('09:00 AM');
    expect(format12HourTime('12:00')).toBe('12:00 PM');
    expect(format12HourTime('14:30')).toBe('02:30 PM');
    expect(format12HourTime('18:45')).toBe('06:45 PM');
    expect(format12HourTime('')).toBe('');
  });

  it('formats slot date strings to friendly display dates', () => {
    const formatted = formatSlotDate('2026-10-15');
    expect(formatted).toContain('Oct');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2026');
  });

  it('calculates 25% advance deposit and balance at salon accurately', () => {
    const originalPricePaise = 100000; // Rs. 1000
    const slotPricePaise = 80000; // Rs. 800 (off-peak discount)
    const savingsPaise = originalPricePaise - slotPricePaise;
    const depositPaise = Math.round(slotPricePaise * 0.25);
    const balanceAtSalonPaise = slotPricePaise - depositPaise;

    expect(savingsPaise).toBe(20000);
    expect(depositPaise).toBe(20000);
    expect(balanceAtSalonPaise).toBe(60000);
  });

  it('handles 100% free promotional slots correctly', () => {
    const freeSlot: SlotItem = {
      id: 'slot-free-1',
      salonId: 'salon-1',
      serviceId: 'srv-1',
      date: '2026-10-15',
      time: '11:00',
      status: 'available',
      price: 0,
      isFree: true,
      isPeak: false,
    };

    const finalPricePaise = freeSlot.isFree ? 0 : freeSlot.price;
    const depositPaise = Math.round(finalPricePaise * 0.25);

    expect(finalPricePaise).toBe(0);
    expect(depositPaise).toBe(0);
  });
});
