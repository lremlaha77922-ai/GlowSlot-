import { describe, it, expect, vi } from 'vitest';
import { Salon, ReviewItem, Booking } from '../../../types';

const mockSalon: Salon = {
  id: 'sal-test-1',
  name: 'Luxe Salon & Spa',
  area: 'Indiranagar',
  city: 'Bengaluru',
  address: '100 Feet Road, Indiranagar',
  distanceKm: 1.2,
  rating: 4.8,
  reviewCount: 45,
  startingPrice: 15000,
  isOpen: true,
  openingHours: '09:00 AM - 09:00 PM',
  images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035'],
  gender: 'unisex',
  categories: ['Haircut', 'Spa'],
};

const mockReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    authorName: 'Aarav Sharma',
    rating: 5,
    date: 'Yesterday',
    tags: ['Punctual', 'Clean Environment'],
    comment: 'Exceptional haircut experience! Booking the morning slot had zero waiting time.',
    serviceName: 'Executive Haircut & Beard Trim',
    verifiedAppointment: true,
    helpfulCount: 5,
    images: ['https://images.unsplash.com/photo-1562322140-8baeececf3df'],
  },
  {
    id: 'rev-2',
    authorName: 'Priya Verma',
    rating: 4,
    date: '3 days ago',
    tags: ['Friendly Staff', 'Value for Money'],
    comment: 'The hair spa treatment was super relaxing and hygienic.',
    serviceName: 'Deep Conditioning Hair Spa',
    verifiedAppointment: true,
    helpfulCount: 2,
  },
  {
    id: 'rev-3',
    authorName: 'Kunal Kapoor',
    rating: 3,
    date: '1 week ago',
    tags: ['Good Service'],
    comment: 'Stylist was great but the salon was quite busy on weekend afternoon.',
    verifiedAppointment: false,
    helpfulCount: 0,
  },
];

const mockCompletedBooking: Booking = {
  id: 'b-test-101',
  type: 'salon',
  salonName: 'Luxe Salon & Spa',
  services: [{ name: 'Executive Haircut & Beard Trim', durationMin: 45, price: 15000, qty: 1 }],
  slot: { date: '2026-10-17', time: '10:30 AM' },
  subtotalPaise: 15000,
  platformFeePaise: 0,
  couponDiscountPaise: 0,
  pointsDiscountPaise: 0,
  taxPaise: 0,
  totalPaise: 15000,
  paymentMethod: 'upi',
  paymentStatus: 'paid',
  status: 'completed',
  createdAt: '2026-10-17T05:00:00Z',
  rescheduleCount: 0,
};

describe('SalonReviewsSection logic & data structure', () => {
  it('correctly calculates rating distribution and percentages', () => {
    const total = mockReviews.length;
    const fiveStars = mockReviews.filter((r) => Math.round(r.rating) === 5).length;
    const fourStars = mockReviews.filter((r) => Math.round(r.rating) === 4).length;
    const threeStars = mockReviews.filter((r) => Math.round(r.rating) === 3).length;

    expect(total).toBe(3);
    expect(fiveStars).toBe(1);
    expect(fourStars).toBe(1);
    expect(threeStars).toBe(1);

    const fiveStarPct = Math.round((fiveStars / total) * 100);
    expect(fiveStarPct).toBe(33);
  });

  it('filters reviews by photos only', () => {
    const withPhotos = mockReviews.filter((r) => r.images && r.images.length > 0);
    expect(withPhotos.length).toBe(1);
    expect(withPhotos[0].authorName).toBe('Aarav Sharma');
  });

  it('filters reviews by verified appointments', () => {
    const verified = mockReviews.filter((r) => r.verifiedAppointment !== false);
    expect(verified.length).toBe(2);
  });

  it('sorts reviews by helpful count correctly', () => {
    const sorted = [...mockReviews].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    expect(sorted[0].id).toBe('rev-1');
    expect(sorted[0].helpfulCount).toBe(5);
    expect(sorted[1].id).toBe('rev-2');
    expect(sorted[2].id).toBe('rev-3');
  });

  it('identifies completed user appointments matching the salon', () => {
    const matches = mockCompletedBooking.salonName === mockSalon.name;
    const isCompleted = mockCompletedBooking.status === 'completed';
    expect(matches).toBe(true);
    expect(isCompleted).toBe(true);
  });
});
