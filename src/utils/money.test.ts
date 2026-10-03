import { describe, it, expect } from 'vitest';
import { formatMoney, calculateTaxes } from './money';

describe('money utilities', () => {
  it('formats integer paise correctly into Rs. without space', () => {
    expect(formatMoney(24900)).toBe('Rs.249');
    expect(formatMoney(19900)).toBe('Rs.199');
    expect(formatMoney(14900)).toBe('Rs.149');
    expect(formatMoney(0)).toBe('Rs.0');
  });

  it('calculates taxes accurately', () => {
    // 18% of 24900 paise = 4482 paise
    expect(calculateTaxes(24900, 18)).toBe(4482);
  });
});
