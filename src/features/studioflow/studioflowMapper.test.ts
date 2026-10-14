import { describe, it, expect } from 'vitest';
import {
  buildSlotId,
  isStudioflowId,
  mapAvailabilityToSlots,
  mapWebsiteToBanner,
  mapWebsiteToSalon,
  parseSlotId,
  salonIdFromSlug,
  slugFromSalonId,
} from './studioflowMapper';

const row = {
  slug: 'glow-studio',
  content: {
    profile: {
      businessName: 'Glow Studio',
      city: 'Jaipur',
      areaLocality: 'C-Scheme',
      address: '12 MI Road',
      about: 'Premium salon',
      coverImageUrl: 'cover.jpg',
      latitude: 26.9,
      longitude: 75.8,
      workingHoursMonFri: '10:00 AM - 8:00 PM',
      promotions: { enabled: true, title: 'Diwali Glow', message: 'Flat 20% off', discountPercent: 20, promoCode: 'DIWALI20' },
      websiteTestimonials: [
        { id: 't1', name: 'Asha', rating: 5, comment: 'Great', serviceName: 'Haircut', status: 'approved' },
        { id: 't2', name: 'Ravi', rating: 3, comment: 'Ok', status: 'approved' },
        { id: 't3', name: 'Hidden', rating: 1, comment: 'x', status: 'pending' },
      ],
    },
    services: [
      { id: 's1', name: 'Haircut', category: 'Hair', durationMinutes: 45, price: 499.5, popular: true },
      { id: 's2', name: 'Facial', category: 'Skin', durationMinutes: 60, price: 1200 },
    ],
    stylists: [
      { id: 'st1', name: 'Neha', role: 'Stylist', avatarUrl: 'n.jpg', specialties: ['Color'], rating: 4.8 },
      { id: 'st2', name: 'Gone', status: 'Inactive' },
    ],
    gallery: ['g1.jpg', 'g2.jpg'],
  },
};

describe('studioflowMapper', () => {
  it('prefixes ids and round-trips slugs', () => {
    expect(salonIdFromSlug('a-b')).toBe('sf:a-b');
    expect(isStudioflowId('sf:a-b')).toBe(true);
    expect(isStudioflowId('uuid-123')).toBe(false);
    expect(slugFromSalonId('sf:a-b')).toBe('a-b');
  });

  it('maps a published website into a GlowSlot salon (rupees -> paise)', () => {
    const s = mapWebsiteToSalon(row);
    expect(s.id).toBe('sf:glow-studio');
    expect(s.name).toBe('Glow Studio');
    expect(s.startingPrice).toBe(49950);
    expect(s.services?.[0]).toMatchObject({ id: 's1', basePrice: 49950, durationMin: 45, isPopular: true });
    expect(s.images).toEqual(['cover.jpg', 'g1.jpg', 'g2.jpg']);
    expect(s.categories).toEqual(['Hair', 'Skin']);
    expect(s.specialists).toHaveLength(1);
    expect(s.isDeal).toBe(true);
    expect(s.dealDiscountPercent).toBe(20);
    expect(s.latitude).toBe(26.9);
  });

  it('only shows approved testimonials and averages their rating', () => {
    const s = mapWebsiteToSalon(row);
    expect(s.reviews).toHaveLength(2);
    expect(s.reviewCount).toBe(2);
    expect(s.rating).toBe(4);
  });

  it('does not invent ratings when there are no reviews', () => {
    const s = mapWebsiteToSalon({ slug: 'x', content: { profile: { businessName: 'X' }, services: [], stylists: [] } });
    expect(s.rating).toBe(0);
    expect(s.reviewCount).toBe(0);
    expect(s.startingPrice).toBe(0);
  });

  it('ignores expired promotions', () => {
    const expired = structuredClone(row);
    (expired.content.profile.promotions as any).expiryDate = '2020-01-01';
    expect(mapWebsiteToSalon(expired).isDeal).toBe(false);
    expect(mapWebsiteToBanner(expired)).toBeNull();
  });

  it('builds a banner from an active promotion', () => {
    const b = mapWebsiteToBanner(row)!;
    expect(b.title).toBe('Diwali Glow');
    expect(b.tag).toBe('DIWALI20');
    expect(b.link).toBe('sf:glow-studio');
  });

  it('encodes and parses slot ids', () => {
    const id = buildSlotId('glow-studio', 's1', '2026-10-20', '10:30', 'st1');
    expect(parseSlotId(id)).toEqual({ slug: 'glow-studio', serviceId: 's1', date: '2026-10-20', time: '10:30', stylistId: 'st1' });
    expect(parseSlotId('plain-uuid')).toBeNull();
    expect(parseSlotId('sf:only-slug')).toBeNull();
  });

  it('maps availability rows to slot items', () => {
    const slots = mapAvailabilityToSlots('glow-studio', 's1', '2026-10-20', 49950, [
      { time: '10:00', available: true },
      { time: '10:30', available: false },
    ]);
    expect(slots.map((s) => s.status)).toEqual(['available', 'booked']);
    expect(slots[0].price).toBe(49950);
    expect(slots[0].salonId).toBe('sf:glow-studio');
  });
});
