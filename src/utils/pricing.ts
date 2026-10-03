/**
 * Pricing algorithm per 04_TECHSPEC.md section 4.
 *
 * price = round_to_nearest_10_paise_rupee(base_price * time_multiplier(slot_time))
 *
 * Multipliers:
 *   08:00 - 10:59 -> 0.60 (off-peak, 40% discount)
 *   11:00 - 15:59 -> 0.90 (normal off-peak)
 *   16:00 - 18:59 -> 1.20 (peak)
 *   19:00 - 20:00 -> 1.30 (peak)
 */

export interface SlotPriceResult {
  price: number; // in paise
  multiplier: number;
  isPeak: boolean;
  isFree: boolean;
}

export const getTimeMultiplier = (timeStr: string): number => {
  // Expected format: "HH:mm" or "HH:mm:ss"
  const [hourStr, minStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  const totalMinutes = hour * 60 + min;

  // 08:00 to 10:59 (480 to 659 mins) -> 0.60
  if (totalMinutes >= 8 * 60 && totalMinutes < 11 * 60) {
    return 0.6;
  }
  // 11:00 to 15:59 (660 to 959 mins) -> 0.90
  if (totalMinutes >= 11 * 60 && totalMinutes < 16 * 60) {
    return 0.9;
  }
  // 16:00 to 18:59 (960 to 1139 mins) -> 1.20
  if (totalMinutes >= 16 * 60 && totalMinutes < 19 * 60) {
    return 1.2;
  }
  // 19:00 to 20:00 (1140 to 1200 mins) -> 1.30
  if (totalMinutes >= 19 * 60 && totalMinutes <= 20 * 60) {
    return 1.3;
  }

  // Default outside standard hours
  return 1.0;
};

export const roundToNearestRupeePaise = (paiseAmount: number): number => {
  // Rounds to the nearest 100 paise (nearest Rupee)
  return Math.round(paiseAmount / 100) * 100;
};

export const calculateSlotPrice = (
  basePricePaise: number,
  timeStr: string,
  isFreeSlot: boolean = false
): SlotPriceResult => {
  if (isFreeSlot) {
    return {
      price: 0,
      multiplier: 0,
      isPeak: false,
      isFree: true,
    };
  }

  const multiplier = getTimeMultiplier(timeStr);
  const rawPrice = basePricePaise * multiplier;
  const price = roundToNearestRupeePaise(rawPrice);
  const isPeak = multiplier >= 1.2;

  return {
    price,
    multiplier,
    isPeak,
    isFree: false,
  };
};

/**
 * Generates slot times in 30-minute intervals between startHour and endHour.
 */
export const generateTimeSlots = (
  startHour: number = 8,
  endHour: number = 20,
  stepMinutes: number = 30
): string[] => {
  const slots: string[] = [];
  const totalStart = startHour * 60;
  const totalEnd = endHour * 60;

  for (let mins = totalStart; mins <= totalEnd; mins += stepMinutes) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    slots.push(formatted);
  }

  return slots;
};
