import { mockBanners, mockQuickServices, mockSalons, mockAreas } from '../../../data/mockData';
import { PromoBanner, QuickService, Salon } from '../../../types';

export const homeService = {
  async getBanners(): Promise<PromoBanner[]> {
    // Simulating async read
    return Promise.resolve([...mockBanners]);
  },

  async getQuickServices(): Promise<QuickService[]> {
    return Promise.resolve([...mockQuickServices]);
  },

  async getLastMinuteDeals(): Promise<Salon[]> {
    return Promise.resolve(mockSalons.filter(s => s.isDeal));
  },

  async getPopularSalons(): Promise<Salon[]> {
    return Promise.resolve([...mockSalons]);
  },

  async getAvailableAreas(): Promise<string[]> {
    return Promise.resolve([...mockAreas]);
  },
};
