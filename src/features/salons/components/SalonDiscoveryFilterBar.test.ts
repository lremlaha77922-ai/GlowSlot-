import { describe, it, expect } from 'vitest';
import {
  DISTANCE_PRESETS,
  PRICE_PRESETS,
  SORT_OPTIONS,
} from './SalonDiscoveryFilterBar';
import { FilterOptions } from '../../../types';
import { salonService } from '../services/salonService';

describe('SalonDiscoveryFilterBar & Salon Filtering System', () => {
  it('defines valid distance presets with ascending values', () => {
    expect(DISTANCE_PRESETS).toHaveLength(4);
    expect(DISTANCE_PRESETS[0].value).toBeUndefined();
    expect(DISTANCE_PRESETS[1].value).toBe(2);
    expect(DISTANCE_PRESETS[2].value).toBe(5);
    expect(DISTANCE_PRESETS[3].value).toBe(10);
  });

  it('defines structured price presets matching Indian grooming budgets in paise', () => {
    expect(PRICE_PRESETS).toHaveLength(5);
    expect(PRICE_PRESETS[1].label).toBe('Under ₹200');
    expect(PRICE_PRESETS[1].max).toBe(20000); // 20000 paise = ₹200
    expect(PRICE_PRESETS[2].label).toBe('₹200 - ₹400');
    expect(PRICE_PRESETS[2].min).toBe(20000);
    expect(PRICE_PRESETS[2].max).toBe(40000);
    expect(PRICE_PRESETS[4].label).toBe('₹600+');
    expect(PRICE_PRESETS[4].min).toBe(60000);
  });

  it('provides all 4 core sorting options required by the user', () => {
    const ids = SORT_OPTIONS.map((o) => o.id);
    expect(ids).toContain('distance');
    expect(ids).toContain('price');
    expect(ids).toContain('price_desc');
    expect(ids).toContain('rating');
  });

  it('filters salons accurately by maximum distance', async () => {
    const filterClose: Partial<FilterOptions> = {
      gender: 'all',
      category: 'All',
      sortBy: 'distance',
      minPrice: 0,
      maxPrice: 100000,
      maxDistanceKm: 1.5,
    };

    const results = await salonService.list(filterClose);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((salon) => {
      expect(salon.distanceKm).toBeLessThanOrEqual(1.5);
    });
  });

  it('filters salons accurately by price range', async () => {
    const filterBudget: Partial<FilterOptions> = {
      gender: 'all',
      category: 'All',
      sortBy: 'price',
      minPrice: 15000, // ₹150
      maxPrice: 25000, // ₹250
    };

    const results = await salonService.list(filterBudget);
    results.forEach((salon) => {
      expect(salon.startingPrice).toBeGreaterThanOrEqual(15000);
      expect(salon.startingPrice).toBeLessThanOrEqual(25000);
    });
  });

  it('sorts salons properly by distance ascending', async () => {
    const filterSortDistance: Partial<FilterOptions> = {
      gender: 'all',
      category: 'All',
      sortBy: 'distance',
      minPrice: 0,
      maxPrice: 100000,
    };

    const results = await salonService.list(filterSortDistance);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].distanceKm).toBeLessThanOrEqual(results[i + 1].distanceKm);
    }
  });

  it('sorts salons properly by price ascending (low to high)', async () => {
    const filterSortPrice: Partial<FilterOptions> = {
      gender: 'all',
      category: 'All',
      sortBy: 'price',
      minPrice: 0,
      maxPrice: 100000,
    };

    const results = await salonService.list(filterSortPrice);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].startingPrice).toBeLessThanOrEqual(results[i + 1].startingPrice);
    }
  });

  it('sorts salons properly by price descending (high to low)', async () => {
    const filterSortPriceDesc: Partial<FilterOptions> = {
      gender: 'all',
      category: 'All',
      sortBy: 'price_desc',
      minPrice: 0,
      maxPrice: 100000,
    };

    const results = await salonService.list(filterSortPriceDesc);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].startingPrice).toBeGreaterThanOrEqual(results[i + 1].startingPrice);
    }
  });
});
