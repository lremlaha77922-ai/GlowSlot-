import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './useCartStore';
import { QuickService } from '../types';
import { PLATFORM_FEE_PAISE, TAX_PERCENT } from '../utils/constants';

const sampleService: QuickService = {
  id: 'qs-1',
  name: 'Haircut',
  category: 'Hair',
  durationMin: 30,
  price: 24900,
};

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('starts with an empty cart', () => {
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().getTotalCount()).toBe(0);
    expect(useCartStore.getState().getSubtotalPaise()).toBe(0);
    expect(useCartStore.getState().getTotalPaise()).toBe(0);
  });

  it('adds items and calculates subtotal, taxes, platform fee, and total accurately', () => {
    useCartStore.getState().addItem(sampleService);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().getItemQty(sampleService.id)).toBe(1);
    expect(useCartStore.getState().getSubtotalPaise()).toBe(24900);

    const expectedTaxes = Math.round((24900 * TAX_PERCENT) / 100);
    expect(useCartStore.getState().getTaxesPaise()).toBe(expectedTaxes);

    const expectedTotal = 24900 + PLATFORM_FEE_PAISE + expectedTaxes;
    expect(useCartStore.getState().getTotalPaise()).toBe(expectedTotal);
  });

  it('updates quantity with stepper', () => {
    useCartStore.getState().addItem(sampleService);
    useCartStore.getState().updateQty(sampleService.id, 1);
    expect(useCartStore.getState().getItemQty(sampleService.id)).toBe(2);

    useCartStore.getState().updateQty(sampleService.id, -1);
    expect(useCartStore.getState().getItemQty(sampleService.id)).toBe(1);

    useCartStore.getState().updateQty(sampleService.id, -1);
    expect(useCartStore.getState().getItemQty(sampleService.id)).toBe(0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
