import { mockBanners, mockQuickServices, mockSalons, mockAreas } from '../../../data/mockData';
import { PromoBanner, QuickService, Salon } from '../../../types';
import { studioflowService } from '../../studioflow/studioflowService';

export const homeService = {
  async getBanners(): Promise<PromoBanner[]> {
    // StudioFlow salon promotions first, then GlowSlot's own banners
    return [...(await studioflowService.getBanners()), ...mockBanners];
  },

  async getQuickServices(): Promise<QuickService[]> {
    return Promise.resolve([...mockQuickServices]);
  },

  async getLastMinuteDeals(): Promise<Salon[]> {
    const sf = (await studioflowService.listSalons()).filter((s) => s.isDeal);
    return [...sf, ...mockSalons.filter((s) => s.isDeal)];
  },

  async getPopularSalons(): Promise<Salon[]> {
    return [...(await studioflowService.listSalons()), ...mockSalons];
  },

  async getAvailableAreas(): Promise<string[]> {
    return Promise.resolve([...mockAreas]);
  },
};
