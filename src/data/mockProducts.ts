import { Product } from '../types';

export const mockProducts: Product[] = [
  // Hair Category (3 products)
  {
    id: 'prod-hair-1',
    name: 'Matte Clay Hair Pomade (100g)',
    brand: 'GlowSlot Lab',
    category: 'Hair',
    price: 39900, // Rs.399
    originalPrice: 55000,
    rating: 4.8,
    reviewCount: 142,
    images: [
      'https://images.unsplash.com/photo-1597354984706-aec992b7d02f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'High-hold, low-shine matte styling clay infused with bentonite clay and beeswax. Delivers natural texture and volume that lasts all day without flaking.',
    features: ['Strong All-day Hold', 'Matte Natural Finish', 'Water Soluble / Easy Wash', 'Paraben Free'],
    inStock: true,
  },
  {
    id: 'prod-hair-2',
    name: 'Keratin Deep Nourish Shampoo (250ml)',
    brand: 'Salon Pro Active',
    category: 'Hair',
    price: 49900,
    originalPrice: 65000,
    rating: 4.7,
    reviewCount: 88,
    images: [
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'Sulphate-free strengthening formula with hydrolyzed keratin and argan oil to repair dry and damaged strands from the scalp roots.',
    features: ['Sulphate & Paraben Free', 'Enriched with Argan Oil', 'Colour Safe', 'Zero Frizz'],
    inStock: true,
  },
  {
    id: 'prod-hair-3',
    name: 'Sea Salt Texturizing Spray (150ml)',
    brand: 'Urban Barber',
    category: 'Hair',
    price: 34900,
    originalPrice: 45000,
    rating: 4.6,
    reviewCount: 64,
    images: [
      'https://images.unsplash.com/photo-1608248597359-54d7f573887c?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'Adds effortless beachy waves and light gritty volume. Perfect as a pre-styler before blow drying or on damp hair.',
    features: ['Instant Texture & Grip', 'UV Protection', 'Lightweight Hold', 'Non-sticky'],
    inStock: true,
  },

  // Beard Category (3 products)
  {
    id: 'prod-beard-1',
    name: 'Cedarwood Beard Growth Oil (30ml)',
    brand: 'The Barberian',
    category: 'Beard',
    price: 34900,
    originalPrice: 49900,
    rating: 4.9,
    reviewCount: 230,
    images: [
      'https://images.unsplash.com/photo-1626015365107-28564478f729?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'Cold-pressed blend of jojoba, almond and cedarwood essential oils. Softens coarse stubble, relieves beard itch and promotes even growth.',
    features: ['100% Pure Natural Oils', 'Eliminates Beard Dandruff', 'Non-greasy Absorptive Formula', 'Subtle Woody Scent'],
    inStock: true,
  },
  {
    id: 'prod-beard-2',
    name: 'Conditioning Beard Butter Balm (50g)',
    brand: 'GlowSlot Lab',
    category: 'Beard',
    price: 39900,
    originalPrice: 50000,
    rating: 4.7,
    reviewCount: 95,
    images: [
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'Shea butter and cocoa butter balm designed to tame unruly flyaways and lock in long-lasting hydration.',
    features: ['Deep Conditioning', 'Medium Styling Control', 'Rich in Vitamin E', 'Protects Skin Underneath'],
    inStock: true,
  },
  {
    id: 'prod-beard-3',
    name: 'Refreshing Beard Wash & Shampoo (100ml)',
    brand: 'Urban Barber',
    category: 'Beard',
    price: 29900,
    originalPrice: 38000,
    rating: 4.8,
    reviewCount: 110,
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'Mild foaming cleanser with tea tree and aloe vera that purifies facial hair without stripping natural sebum.',
    features: ['Tea Tree Antibacterial', 'pH Balanced', 'Gentle on Face Skin', 'Clean Lather'],
    inStock: true,
  },

  // Skin Category (3 products)
  {
    id: 'prod-skin-1',
    name: 'Activated Charcoal Face Scrub (100g)',
    brand: 'Luxe Aesthetics',
    category: 'Skin',
    price: 27900,
    originalPrice: 39900,
    rating: 4.7,
    reviewCount: 180,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'Deep pore exfoliation with bamboo activated charcoal and walnut granules to eliminate blackheads and dead cells.',
    features: ['Draws Out Toxins & Dirt', 'Unclogs Pores', 'Reduces Oiliness', 'Dermatologist Tested'],
    inStock: true,
  },
  {
    id: 'prod-skin-2',
    name: 'Hyaluronic Acid Hydrating Face Gel (50g)',
    brand: 'GlowSlot Lab',
    category: 'Skin',
    price: 44900,
    originalPrice: 60000,
    rating: 4.9,
    reviewCount: 140,
    images: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'Ultra-lightweight oil-free cooling moisturizer that absorbs in seconds and provides 48-hour continuous hydration.',
    features: ['Oil-free Matte Feel', '72hr Deep Moisture', 'Non-comedogenic', 'Quick Absorbing'],
    inStock: true,
  },
  {
    id: 'prod-skin-3',
    name: 'SPF 50+ Invisible Sunscreen Gel (50ml)',
    brand: 'Salon Pro Active',
    category: 'Skin',
    price: 49900,
    originalPrice: 65000,
    rating: 4.8,
    reviewCount: 215,
    images: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'Broad spectrum UVA & UVB protection that leaves zero white cast, resists sweat, and keeps face non-greasy.',
    features: ['Zero White Cast', 'Broad Spectrum PA++++', 'Water & Sweat Resistant', 'Non-sticky'],
    inStock: true,
  },

  // Tools Category (3 products)
  {
    id: 'prod-tool-1',
    name: 'Precision Cordless Beard & Hair Trimmer',
    brand: 'Master Barber Tools',
    category: 'Tools',
    price: 149900, // Rs.1499
    originalPrice: 229900,
    rating: 4.9,
    reviewCount: 320,
    images: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'Professional T-blade detailing trimmer with self-sharpening titanium blades, 120-minute lithium battery, and 4 guard attachments.',
    features: ['Titanium T-Blade', '120 Min Cordless Runtime', 'USB Fast Charging', 'Ergonomic Grip'],
    inStock: true,
  },
  {
    id: 'prod-tool-2',
    name: 'Handcrafted Sandalwood Pocket Comb',
    brand: 'The Barberian',
    category: 'Tools',
    price: 24900,
    originalPrice: 35000,
    rating: 4.7,
    reviewCount: 80,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'Anti-static dual-tooth natural green sandalwood comb with soothing natural aroma. Glides smoothly through tangles.',
    features: ['Anti-static No Frizz', 'Dual Fine & Wide Teeth', 'Natural Sandalwood Fragrance', 'Pocket Portable'],
    inStock: true,
  },
  {
    id: 'prod-tool-3',
    name: 'Professional Stainless Steel Barber Shears (6 inch)',
    brand: 'Master Barber Tools',
    category: 'Tools',
    price: 79900,
    originalPrice: 119900,
    rating: 4.9,
    reviewCount: 165,
    images: [
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
    ],
    description:
      'Japanese 440C stainless steel razor-edge haircutting scissors with comfortable finger rest and tension adjustment screw.',
    features: ['Japanese 440C Steel', 'Convex Razor Edge', 'Adjustable Tension Dial', 'Removable Finger Ring'],
    inStock: true,
  },
];
