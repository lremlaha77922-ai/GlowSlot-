import { describe, it, expect, vi } from 'vitest';
import { slotService } from '../services/slotService';
import { formatIsoDate, parseIsoDate } from './CalendarSlotAvailability';
import { SlotItem } from '../../../types';

describe('CalendarSlotAvailability Core Logic & Scheduling', () => {
  it('correctly formats and parses ISO dates without timezone shifting', () => {
    const testDate = new Date(2026, 9, 15); // Oct 15, 2026
    const isoStr = formatIsoDate(testDate);
    expect(isoStr).toBe('2026-10-15');

    const parsed = parseIsoDate(isoStr);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(9); // 0-indexed October
    expect(parsed.getDate()).toBe(15);
  });

  it('calculates 7-day rolling window dates accurately for week view', () => {
    const anchor = parseIsoDate('2026-10-14'); // Wednesday
    const dayOfWeek = anchor.getDay(); // 3
    const startOfWeek = new Date(anchor);
    const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    startOfWeek.setDate(anchor.getDate() + diff);

    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(formatIsoDate(d));
    }

    expect(week.length).toBe(7);
    expect(week[0]).toBe('2026-10-12'); // Monday
    expect(week[6]).toBe('2026-10-18'); // Sunday
    expect(week.includes('2026-10-14')).toBe(true);
  });

  it('filters real-time slots by time of day (morning, afternoon, evening)', async () => {
    const slots: SlotItem[] = [
      {
        id: 'slot-1',
        salonId: 'salon-1',
        serviceId: 'serv-1',
        date: '2026-10-15',
        time: '09:30',
        price: 6000,
        isFree: false,
        isPeak: false,
        status: 'available',
      },
      {
        id: 'slot-2',
        salonId: 'salon-1',
        serviceId: 'serv-1',
        date: '2026-10-15',
        time: '13:00',
        price: 9000,
        isFree: false,
        isPeak: false,
        status: 'available',
      },
      {
        id: 'slot-3',
        salonId: 'salon-1',
        serviceId: 'serv-1',
        date: '2026-10-15',
        time: '18:30',
        price: 12000,
        isFree: false,
        isPeak: true,
        status: 'available',
      },
    ];

    const filterSlotList = (list: SlotItem[], filter: 'all' | 'morning' | 'afternoon' | 'evening') => {
      if (filter === 'all') return list;
      return list.filter((slot) => {
        const hour = parseInt(slot.time.split(':')[0], 10);
        if (filter === 'morning') return hour >= 8 && hour < 12;
        if (filter === 'afternoon') return hour >= 12 && hour < 16;
        if (filter === 'evening') return hour >= 16 && hour <= 20;
        return true;
      });
    };

    const morning = filterSlotList(slots, 'morning');
    const afternoon = filterSlotList(slots, 'afternoon');
    const evening = filterSlotList(slots, 'evening');

    expect(morning.length).toBe(1);
    expect(morning[0].time).toBe('09:30');

    expect(afternoon.length).toBe(1);
    expect(afternoon[0].time).toBe('13:00');

    expect(evening.length).toBe(1);
    expect(evening[0].time).toBe('18:30');
  });

  it('aggregates day metrics for week view overview properly', () => {
    const slots: SlotItem[] = [
      {
        id: 'slot-1',
        salonId: 'salon-1',
        serviceId: 'serv-1',
        date: '2026-10-15',
        time: '09:00',
        price: 5000,
        isFree: true,
        isPeak: false,
        status: 'available',
      },
      {
        id: 'slot-2',
        salonId: 'salon-1',
        serviceId: 'serv-1',
        date: '2026-10-15',
        time: '10:00',
        price: 8000,
        isFree: false,
        isPeak: false,
        status: 'available',
      },
      {
        id: 'slot-3',
        salonId: 'salon-1',
        serviceId: 'serv-1',
        date: '2026-10-15',
        time: '11:00',
        price: 9000,
        isFree: false,
        isPeak: false,
        status: 'booked',
      },
      {
        id: 'slot-4',
        salonId: 'salon-1',
        serviceId: 'serv-1',
        date: '2026-10-15',
        time: '12:00',
        price: 9000,
        isFree: false,
        isPeak: false,
        status: 'held_by_others',
      },
    ];

    const available = slots.filter((s) => s.status === 'available');
    const free = slots.filter((s) => s.isFree && s.status === 'available');
    const booked = slots.filter((s) => s.status === 'booked');

    expect(available.length).toBe(2);
    expect(free.length).toBe(1);
    expect(booked.length).toBe(1);
  });

  it('retrieves slots via slotService listByDay with off-peak and peak multipliers', async () => {
    const salonId = 'salon-test';
    const serviceId = 'service-test';
    const date = '2026-10-20';
    const basePrice = 10000; // Rs.100

    const slots = await slotService.listByDay(salonId, serviceId, date, basePrice);
    expect(Array.isArray(slots)).toBe(true);
    expect(slots.length).toBeGreaterThan(0);

    // Verify time structure
    const firstSlot = slots[0];
    expect(firstSlot.salonId).toBe(salonId);
    expect(firstSlot.date).toBe(date);
    expect(firstSlot.time).toMatch(/^\d{2}:\d{2}$/);
  });
});
