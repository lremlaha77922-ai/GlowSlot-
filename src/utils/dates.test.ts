import { describe, it, expect } from 'vitest';
import { getNext7Days } from '../data/mockData';

describe('Date & Scheduling Utilities', () => {
  it('generates next 7 days correctly with today as first day', () => {
    const days = getNext7Days();
    expect(days.length).toBe(7);
    expect(days[0].displayDay).toBe('Today');
    expect(days[0].isToday).toBe(true);
    expect(days[0].dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formats consecutive days sequentially', () => {
    const days = getNext7Days();
    for (let i = 0; i < days.length - 1; i++) {
      const d1 = new Date(days[i].dateStr);
      const d2 = new Date(days[i + 1].dateStr);
      const diffMs = d2.getTime() - d1.getTime();
      expect(diffMs).toBe(24 * 60 * 60 * 1000);
    }
  });
});
