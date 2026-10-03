import { mockSalons } from '../../../data/mockData';
import { Salon, FilterOptions } from '../../../types';

export const salonService = {
  async list(filters?: Partial<FilterOptions>, query?: string): Promise<Salon[]> {
    let result = [...mockSalons];

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.categories.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (filters) {
      if (filters.gender && filters.gender !== 'all') {
        result = result.filter(
          (s) => s.gender === filters.gender || s.gender === 'unisex'
        );
      }

      if (filters.category && filters.category !== 'All') {
        result = result.filter((s) => s.categories.includes(filters.category!));
      }

      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        result = result.filter(
          (s) => s.startingPrice >= filters.minPrice! && s.startingPrice <= filters.maxPrice!
        );
      }

      if (filters.openNowOnly) {
        result = result.filter((s) => s.isOpen);
      }

      if (filters.rating4PlusOnly) {
        result = result.filter((s) => s.rating >= 4.0);
      }

      if (filters.offersOnly) {
        result = result.filter((s) => !!s.isDeal);
      }

      if (filters.sortBy) {
        if (filters.sortBy === 'distance') {
          result.sort((a, b) => a.distanceKm - b.distanceKm);
        } else if (filters.sortBy === 'rating') {
          result.sort((a, b) => b.rating - a.rating);
        } else if (filters.sortBy === 'price') {
          result.sort((a, b) => a.startingPrice - b.startingPrice);
        }
      }
    }

    return Promise.resolve(result);
  },

  async get(id: string): Promise<Salon | null> {
    const salon = mockSalons.find((s) => s.id === id);
    return Promise.resolve(salon || null);
  },
};
