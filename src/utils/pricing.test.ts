import { describe, it, expect } from 'vitest';
import {
  getTimeMultiplier,
  calculateSlotPrice,
  generateTimeSlots,
  roundToNearestRupeePaise,
} from './pricing';

describe('Pricing Algorithm (04_TECHSPEC.md section 4)', () => {
  const basePrice = 24900; // Rs.249 haircut

  it('applies 0.60 multiplier for morning off-peak slots (08:00 - 10:59)', () => {
    expect(getTimeMultiplier('08:00')).toBe(0.6);
    expect(getTimeMultiplier('09:30')).toBe(0.6);
    expect(getTimeMultiplier('10:59')).toBe(0.6);

    const result = calculateSlotPrice(basePrice, '09:00');
    // 24900 * 0.6 = 14940 -> rounded to nearest rupee = 14900 paise (Rs.149)
    expect(result.price).toBe(14900);
    expect(result.isPeak).toBe(false);
    expect(result.isFree).toBe(false);
    expect(result.price).toBeLessThan(basePrice);
  });

  it('applies 0.90 multiplier for afternoon slots (11:00 - 15:59)', () => {
    expect(getTimeMultiplier('11:00')).toBe(0.9);
    expect(getTimeMultiplier('14:30')).toBe(0.9);
    expect(getTimeMultiplier('15:59')).toBe(0.9);

    const result = calculateSlotPrice(basePrice, '13:00');
    // 24900 * 0.9 = 22410 -> rounded to nearest rupee = 22400 paise (Rs.224)
    expect(result.price).toBe(22400);
    expect(result.isPeak).toBe(false);
  });

  it('applies 1.20 peak multiplier for evening slots (16:00 - 18:59)', () => {
    expect(getTimeMultiplier('16:00')).toBe(1.2);
    expect(getTimeMultiplier('17:30')).toBe(1.2);
    expect(getTimeMultiplier('18:59')).toBe(1.2);

    const result = calculateSlotPrice(basePrice, '17:00');
    // 24900 * 1.2 = 29880 -> rounded = 29900 paise (Rs.299)
    expect(result.price).toBe(29900);
    expect(result.isPeak).toBe(true);
    expect(result.price).toBeGreaterThan(basePrice);
  });

  it('applies 1.30 peak multiplier for late evening slots (19:00 - 20:00)', () => {
    expect(getTimeMultiplier('19:00')).toBe(1.3);
    expect(getTimeMultiplier('20:00')).toBe(1.3);

    const result = calculateSlotPrice(basePrice, '19:30');
    // 24900 * 1.3 = 32370 -> rounded = 32400 paise (Rs.324)
    expect(result.price).toBe(32400);
    expect(result.isPeak).toBe(true);
    expect(result.price).toBeGreaterThan(basePrice);
  });

  it('flags free-offer slots with price 0 and isFree: true', () => {
    const result = calculateSlotPrice(basePrice, '09:00', true);
    expect(result.price).toBe(0);
    expect(result.isFree).toBe(true);
    expect(result.isPeak).toBe(false);
  });

  it('generates 30-minute time intervals between 08:00 and 20:00', () => {
    const slots = generateTimeSlots(8, 20, 30);
    expect(slots[0]).toBe('08:00');
    expect(slots[1]).toBe('08:30');
    expect(slots[slots.length - 1]).toBe('20:00');
    expect(slots.length).toBe(25); // 08:00 to 20:00 inclusive every 30m = 25 slots
  });

  it('rounds paise to the nearest Rupee (100 paise)', () => {
    expect(roundToNearestRupeePaise(14940)).toBe(14900);
    expect(roundToNearestRupeePaise(14960)).toBe(15000);
  });
});
