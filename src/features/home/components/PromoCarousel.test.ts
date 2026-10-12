import { describe, it, expect, vi } from 'vitest';
import { PromoBanner } from '../../../types';

const mockBanners: PromoBanner[] = [
  {
    id: 'ban-1',
    title: 'Diwali Festive Glow Package',
    subtitle: 'Flat 40% OFF on Keratin & Hair Spa',
    tag: 'Limited Time',
    bgGradient: 'from-amber-600 to-rose-700',
    imageUrl: '',
    actionUrl: '/explore',
  },
  {
    id: 'ban-2',
    title: 'Bridal Glow Special',
    subtitle: 'Complimentary trial makeup session with HD Bridal Package',
    tag: 'Seasonal',
    bgGradient: 'from-purple-600 to-indigo-700',
    imageUrl: '',
    actionUrl: '/explore',
  },
];

describe('PromoCarousel & Promotional Banners', () => {
  it('contains valid mock promo banners with tags and titles', () => {
    expect(mockBanners.length).toBe(2);
    expect(mockBanners[0].title).toContain('Diwali');
    expect(mockBanners[1].tag).toBe('Seasonal');
  });
});
