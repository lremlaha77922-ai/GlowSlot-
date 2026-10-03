import { QuickService, Salon, PromoBanner, SlotItem } from '../types';
import { generateTimeSlots, calculateSlotPrice } from '../utils/pricing';

export const mockBanners: PromoBanner[] = [
  {
    id: 'b1',
    title: 'Off-Peak Grooming Specials',
    subtitle: 'Save up to 40% on morning slots (8 AM - 11 AM)',
    tag: 'Smart Pricing',
    bgGradient: 'from-indigo-600 to-indigo-800',
  },
  {
    id: 'b2',
    title: 'Top Rated Neighborhood Salons',
    subtitle: 'Certified professionals, clean chairs & zero wait',
    tag: 'Verified',
    bgGradient: 'from-purple-600 to-indigo-700',
  },
  {
    id: 'b3',
    title: 'GlowSlot Referral Perks',
    subtitle: 'Share your link and earn 200 points after first service',
    tag: 'Rewards',
    bgGradient: 'from-blue-600 to-teal-700',
  },
];

export const mockQuickServices: QuickService[] = [
  {
    id: 'qs-1',
    name: 'Haircut',
    nameHi: 'हेयरकट',
    category: 'Hair',
    durationMin: 30,
    price: 24900, // Rs.249
    originalPrice: 35000,
  },
  {
    id: 'qs-2',
    name: 'Shave',
    nameHi: 'शेव',
    category: 'Beard',
    durationMin: 30,
    price: 19900, // Rs.199
    originalPrice: 25000,
  },
  {
    id: 'qs-3',
    name: 'Head Massage',
    nameHi: 'हेड मसाज',
    category: 'Relaxation',
    durationMin: 30,
    price: 19900, // Rs.199
    originalPrice: 28000,
  },
  {
    id: 'qs-4',
    name: 'Facial',
    nameHi: 'फेशियल',
    category: 'Skin',
    durationMin: 30,
    price: 14900, // Rs.149
    originalPrice: 22000,
  },
];

export const mockSalons: Salon[] = [
  {
    id: 'sal-1',
    name: 'Luxe Cut & Style Studio',
    area: 'Koramangala 5th Block',
    city: 'Bengaluru',
    address: '42, 1st Cross, 5th Block, Koramangala, Bengaluru, Karnataka 560095',
    distanceKm: 0.8,
    rating: 4.8,
    reviewCount: 342,
    startingPrice: 19900,
    isOpen: true,
    openingHours: '08:00 AM - 08:30 PM',
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    ],
    gender: 'unisex',
    categories: ['Haircut', 'Shave & Beard', 'Facial', 'Massage'],
    isDeal: true,
    dealDiscountPercent: 25,
    dealEndsInMinutes: 45,
    aboutText:
      'Luxe Cut & Style Studio is a premier grooming parlour offering bespoke haircuts, beard styling, skin rejuvenation and express spa treatments. Enjoy zero wait times with guaranteed time slot holds.',
    amenities: ['Air Conditioned', 'Free Wi-Fi', 'Complimentary Beverages', 'Sanitized Tools', 'Card & UPI'],
    services: [
      {
        id: 'srv-101',
        name: 'Signature Precision Haircut',
        category: 'Haircut',
        gender: 'unisex',
        durationMin: 30,
        basePrice: 24900,
        description: 'Consultation, hair wash, cut, scalp massage and light styling.',
      },
      {
        id: 'srv-102',
        name: 'Classic Hot Towel Shave',
        category: 'Shave & Beard',
        gender: 'male',
        durationMin: 30,
        basePrice: 19900,
        description: 'Double lather shave with hot towel steam and aftershave balm.',
      },
      {
        id: 'srv-103',
        name: 'Deep Cleansing Charcoal Facial',
        category: 'Facial',
        gender: 'unisex',
        durationMin: 45,
        basePrice: 49900,
        description: 'Exfoliation, steam, blackhead removal and refreshing clay mask.',
      },
      {
        id: 'srv-104',
        name: 'Aromatic Scalp & Head Massage',
        category: 'Massage',
        gender: 'unisex',
        durationMin: 30,
        basePrice: 22900,
        description: 'Calming almond & rosemary warm oil massage to relieve tension.',
      },
      {
        id: 'srv-105',
        name: 'Beard Trimming & Lineup',
        category: 'Shave & Beard',
        gender: 'male',
        durationMin: 20,
        basePrice: 14900,
        description: 'Precision scissor and clipper trim with razor clean borders.',
      },
    ],
    packages: [
      {
        id: 'pkg-101',
        name: 'Gentleman Grooming Combo',
        description: 'Complete makeover including Haircut + Beard Trim + Head Massage.',
        price: 54900,
        durationMin: 75,
        inclusions: ['Precision Haircut', 'Beard Trim & Shape', '20min Head Massage', 'Hot Towel Finish'],
      },
      {
        id: 'pkg-102',
        name: 'Executive Refresh',
        description: 'Signature Haircut with Detox Cleanse Facial and styling.',
        price: 69900,
        durationMin: 80,
        inclusions: ['Signature Haircut', 'Charcoal Facial', 'Eyebrow Grooming', 'Complimentary Green Tea'],
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        authorName: 'Rohan Mehra',
        rating: 5,
        date: 'Yesterday',
        tags: ['Great Service', 'Clean Environment', 'Punctual'],
        comment: 'Booked the 9 AM morning slot at a huge discount. The chair was waiting for me as soon as I walked in! Superb cut by Mahesh.',
      },
      {
        id: 'rev-2',
        authorName: 'Pooja Hegde',
        rating: 4.8,
        date: '3 days ago',
        tags: ['Hygienic', 'Value for Money'],
        comment: 'Very hygienic and professional setup. The scalp massage was immensely relaxing.',
      },
    ],
  },
  {
    id: 'sal-2',
    name: 'Urban Grooming Bar',
    area: 'Indiranagar 100ft Rd',
    city: 'Bengaluru',
    address: '112, 100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    distanceKm: 1.4,
    rating: 4.9,
    reviewCount: 512,
    startingPrice: 24900,
    isOpen: true,
    openingHours: '08:00 AM - 08:00 PM',
    images: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    ],
    gender: 'male',
    categories: ['Haircut', 'Shave & Beard', 'Facial'],
    isDeal: true,
    dealDiscountPercent: 30,
    dealEndsInMinutes: 28,
    aboutText:
      'Trendy modern barbershop specializing in fade haircuts, classic hot lather shaves and beard design. Fast service, premium coffee bar.',
    amenities: ['Coffee Bar', 'Air Conditioned', 'Free Wi-Fi', 'Parking Available'],
    services: [
      {
        id: 'srv-201',
        name: 'Skin Fade / Taper Cut',
        category: 'Haircut',
        gender: 'male',
        durationMin: 35,
        basePrice: 29900,
        description: 'Zero fade with textured top and neck taper.',
      },
      {
        id: 'srv-202',
        name: 'Luxury Royal Shave',
        category: 'Shave & Beard',
        gender: 'male',
        durationMin: 30,
        basePrice: 24900,
        description: 'Pre-shave oil, hot towel wrap, badger brush lather and cold towel close.',
      },
    ],
    packages: [
      {
        id: 'pkg-201',
        name: 'Urban Fade & Shave Duo',
        description: 'Skin fade haircut combined with luxury hot towel shave.',
        price: 49900,
        durationMin: 60,
        inclusions: ['Skin Fade', 'Royal Shave', 'Hair Tonic Tonic Massage'],
      },
    ],
    reviews: [
      {
        id: 'rev-3',
        authorName: 'Arjun Das',
        rating: 5,
        date: '2 days ago',
        tags: ['Expert Stylists', 'Fast Service'],
        comment: 'Best skin fade in Indiranagar. The dynamic slot price made it unbelievable value.',
      },
    ],
  },
  {
    id: 'sal-3',
    name: 'Crown Heritage Barber',
    area: 'HSR Layout Sector 4',
    city: 'Bengaluru',
    address: '89, 14th Main, Sector 4, HSR Layout, Bengaluru 560102',
    distanceKm: 2.1,
    rating: 4.7,
    reviewCount: 189,
    startingPrice: 17900,
    isOpen: true,
    openingHours: '08:00 AM - 08:00 PM',
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    ],
    gender: 'male',
    categories: ['Haircut', 'Shave & Beard', 'Massage'],
    isDeal: true,
    dealDiscountPercent: 20,
    dealEndsInMinutes: 75,
    aboutText:
      'Classic gentleman styling parlour with traditional craftsmanship and friendly seasoned stylists.',
    amenities: ['Air Conditioned', 'Sanitized Kits', 'UPI Accepted'],
    services: [
      {
        id: 'srv-301',
        name: 'Regular Haircut',
        category: 'Haircut',
        gender: 'male',
        durationMin: 30,
        basePrice: 19900,
        description: 'Neat classic haircut with neck trimming.',
      },
      {
        id: 'srv-302',
        name: 'Beard Trim & Styling',
        category: 'Shave & Beard',
        gender: 'male',
        durationMin: 20,
        basePrice: 14900,
        description: 'Shape up and oil conditioning.',
      },
    ],
  },
  {
    id: 'sal-4',
    name: 'Aura Spa & Hair Lounge',
    area: 'Koramangala 4th Block',
    city: 'Bengaluru',
    address: '15, 80 Feet Rd, 4th Block, Koramangala, Bengaluru 560034',
    distanceKm: 1.1,
    rating: 4.6,
    reviewCount: 220,
    startingPrice: 29900,
    isOpen: true,
    openingHours: '08:00 AM - 08:00 PM',
    images: [
      'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&w=800&q=80',
    ],
    gender: 'female',
    categories: ['Haircut', 'Facial', 'Massage'],
    aboutText: 'Serene spa and hair boutique designed specifically for modern women seeking quick, high-end grooming.',
    amenities: ['Private Spa Rooms', 'Organic Products', 'Valet Parking', 'Free Wi-Fi'],
    services: [
      {
        id: 'srv-401',
        name: 'Women Layer Cut & Blowdry',
        category: 'Haircut',
        gender: 'female',
        durationMin: 45,
        basePrice: 39900,
        description: 'Custom layered style with blowout volume.',
      },
    ],
  },
  {
    id: 'sal-5',
    name: 'Velvet Glow Unisex Salon',
    area: 'Jayanagar 4th Block',
    city: 'Bengaluru',
    address: '24, 11th Main, 4th Block, Jayanagar, Bengaluru 560011',
    distanceKm: 3.5,
    rating: 4.8,
    reviewCount: 410,
    startingPrice: 22900,
    isOpen: true,
    openingHours: '08:00 AM - 08:00 PM',
    images: [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    ],
    gender: 'unisex',
    categories: ['Haircut', 'Shave & Beard', 'Facial', 'Massage'],
    aboutText: 'Complete family grooming and salon services with welcoming ambience and dedicated specialists.',
    amenities: ['Air Conditioned', 'Kids Friendly', 'Sanitized Station'],
    services: [
      {
        id: 'srv-501',
        name: 'Unisex Creative Cut',
        category: 'Haircut',
        gender: 'unisex',
        durationMin: 35,
        basePrice: 26900,
        description: 'Style consultation and precision texturizing.',
      },
    ],
  },
  {
    id: 'sal-6',
    name: 'TrueBlend Barber Co.',
    area: 'BTM Layout 2nd Stage',
    city: 'Bengaluru',
    address: '77, 7th Main, BTM 2nd Stage, Bengaluru 560076',
    distanceKm: 2.8,
    rating: 4.5,
    reviewCount: 165,
    startingPrice: 14900,
    isOpen: false,
    openingHours: '08:30 AM - 08:00 PM',
    images: [
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    ],
    gender: 'male',
    categories: ['Haircut', 'Shave & Beard'],
    aboutText: 'Friendly neighborhood barbershop known for clean scissor work and budget-conscious pricing.',
    amenities: ['Air Conditioned', 'UPI Accepted'],
    services: [
      {
        id: 'srv-601',
        name: 'Express Haircut',
        category: 'Haircut',
        gender: 'male',
        durationMin: 25,
        basePrice: 16900,
        description: 'Quick clean cut and neck cleanup.',
      },
    ],
  },
  {
    id: 'sal-7',
    name: 'The Barberian Lounge',
    area: 'Whitefield Main Rd',
    city: 'Bengaluru',
    address: '401, Prestige Tech Plaza, Whitefield, Bengaluru 560066',
    distanceKm: 5.2,
    rating: 4.9,
    reviewCount: 680,
    startingPrice: 34900,
    isOpen: true,
    openingHours: '08:00 AM - 08:30 PM',
    images: [
      'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=800&q=80',
    ],
    gender: 'unisex',
    categories: ['Haircut', 'Shave & Beard', 'Facial', 'Massage'],
    aboutText: 'Luxury tech-lounge salon with bespoke aesthetic treatments and personal styling booths.',
    amenities: ['Private Styling Suites', 'Free Espresso', 'High Speed Wi-Fi', 'Complimentary Parking'],
    services: [
      {
        id: 'srv-701',
        name: 'Master Barber Haircut',
        category: 'Haircut',
        gender: 'unisex',
        durationMin: 45,
        basePrice: 44900,
        description: 'Cut by senior master barber with styling consultation and blowdry.',
      },
    ],
  },
  {
    id: 'sal-8',
    name: 'Elegance Hair Craft',
    area: 'Koramangala 7th Block',
    city: 'Bengaluru',
    address: '33, 5th Main, 7th Block, Koramangala, Bengaluru 560095',
    distanceKm: 1.6,
    rating: 4.7,
    reviewCount: 290,
    startingPrice: 19900,
    isOpen: true,
    openingHours: '08:00 AM - 08:00 PM',
    images: [
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    ],
    gender: 'female',
    categories: ['Haircut', 'Facial', 'Massage'],
    aboutText: 'Creative ladies hair design and facial care with certified organic serums.',
    amenities: ['Air Conditioned', 'Complimentary Tea', 'Sanitized Linens'],
    services: [
      {
        id: 'srv-801',
        name: 'Hair Spa & Blowdry',
        category: 'Haircut',
        gender: 'female',
        durationMin: 50,
        basePrice: 34900,
        description: 'Intense keratin conditioning mask with hot steam and style.',
      },
    ],
  },
];

export const mockAreas = [
  'Koramangala, Bengaluru',
  'Indiranagar, Bengaluru',
  'HSR Layout, Bengaluru',
  'Jayanagar, Bengaluru',
  'Whitefield, Bengaluru',
  'BTM Layout, Bengaluru',
  'Malleshwaram, Bengaluru',
];

/**
 * Generate 7 days dates starting from today in YYYY-MM-DD format
 */
export const getNext7Days = (): { dateStr: string; displayDay: string; displayDate: string; isToday: boolean }[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const result = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    result.push({
      dateStr,
      displayDay: i === 0 ? 'Today' : days[d.getDay()],
      displayDate: `${d.getDate()} ${months[d.getMonth()]}`,
      isToday: i === 0,
    });
  }

  return result;
};

/**
 * Generates mock slots for a salon, service, and date with all 6 states
 * (available, selected, fully booked, peak, free, held by others)
 */
export const generateMockSlots = (
  salonId: string,
  serviceId: string,
  dateStr: string,
  basePrice: number = 24900
): SlotItem[] => {
  const timeStrings = generateTimeSlots(8, 20, 30); // 25 slots from 08:00 to 20:00

  // We assign diverse states to showcase all states defined in Design.md 8.6:
  // - 08:30: Free slot (isFree = true, price = 0)
  // - 10:00: Held by others
  // - 12:30: Booked (fully booked)
  // - 15:00: Booked
  // - 16:30, 17:00, 18:00, 19:30: Peak price
  // - Others: available
  return timeStrings.map((time, idx) => {
    const isFree = time === '08:30'; // 1 free off-peak slot per day
    const priceResult = calculateSlotPrice(basePrice, time, isFree);

    let status: SlotItem['status'] = 'available';
    if (time === '10:00') {
      status = 'held_by_others';
    } else if (time === '12:30' || time === '15:00') {
      status = 'booked';
    }

    return {
      id: `slot-${salonId}-${serviceId}-${dateStr}-${idx}`,
      salonId,
      serviceId,
      date: dateStr,
      time,
      price: priceResult.price,
      isFree: priceResult.isFree,
      isPeak: priceResult.isPeak,
      status,
    };
  });
};
