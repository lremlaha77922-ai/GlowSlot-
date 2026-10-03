export type Gender = 'male' | 'female' | 'unisex';

export interface QuickService {
  id: string;
  name: string;
  nameHi?: string;
  category: string;
  durationMin: number;
  price: number; // in paise
  originalPrice?: number; // in paise
  imageUrl?: string;
}

export interface SalonServiceItem {
  id: string;
  name: string;
  category: string;
  gender: Gender;
  durationMin: number;
  basePrice: number; // in paise
  description?: string;
}

export interface PackageItem {
  id: string;
  name: string;
  description: string;
  price: number; // in paise
  inclusions: string[];
  durationMin: number;
}

export interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  tags: string[];
  comment: string;
}

export interface Salon {
  id: string;
  name: string;
  area: string;
  city: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  startingPrice: number; // in paise
  isOpen: boolean;
  openingHours: string;
  images: string[];
  gender: Gender;
  categories: string[];
  isDeal?: boolean;
  dealDiscountPercent?: number;
  dealEndsInMinutes?: number;
  aboutText?: string;
  amenities?: string[];
  services?: SalonServiceItem[];
  packages?: PackageItem[];
  reviews?: ReviewItem[];
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  bgGradient: string;
  link?: string;
}

export type SlotStatus = 'available' | 'held' | 'booked' | 'held_by_others';

export interface SlotItem {
  id: string;
  salonId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  price: number; // in paise
  isFree: boolean;
  isPeak: boolean;
  status: SlotStatus;
}

export interface CartSlotInfo {
  slotId: string;
  salonId: string;
  salonName: string;
  serviceName: string;
  date: string;
  time: string;
  price: number; // paise
  isFree?: boolean;
  isPeak?: boolean;
}

export type CartItemType = 'service' | 'product';

export interface CartItem {
  id: string;
  serviceId: string;
  name: string;
  price: number; // in paise
  durationMin: number;
  qty: number;
  type?: CartItemType;
  imageUrl?: string;
  slot?: CartSlotInfo;
}

export interface UserSession {
  id: string;
  name: string;
  phone: string;
  gender?: Gender;
  points: number;
  isNewUser?: boolean;
}

export interface FilterOptions {
  gender: 'all' | 'male' | 'female';
  category: string;
  sortBy: 'distance' | 'rating' | 'price';
  minPrice: number;
  maxPrice: number;
  openNowOnly: boolean;
  rating4PlusOnly: boolean;
  offersOnly: boolean;
}

export interface UserAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  houseNumber: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscountPaise?: number;
  minOrderPaise: number;
  isExpired: boolean;
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'pay_at_salon';

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface BookingCancellation {
  reason: string;
  refundAmountPaise: number;
  refundPercent: number;
  cancelledAt: string;
}

export interface BookingReview {
  rating: number;
  tags: string[];
  text: string;
  submittedAt: string;
}

export interface Booking {
  id: string;
  type: 'salon' | 'athome';
  salonName: string;
  salonAddress?: string;
  userAddress?: UserAddress;
  services: {
    name: string;
    durationMin: number;
    price: number;
    qty: number;
  }[];
  slot: {
    date: string;
    time: string;
  };
  subtotalPaise: number;
  platformFeePaise: number;
  taxPaise: number;
  couponDiscountPaise: number;
  pointsDiscountPaise: number;
  totalPaise: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pay_later';
  status: BookingStatus;
  createdAt: string;
  rescheduleCount: number;
  cancellation?: BookingCancellation;
  review?: BookingReview;
}

export type ProductCategory = 'Hair' | 'Beard' | 'Skin' | 'Tools';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number; // in paise
  originalPrice?: number; // in paise
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  features: string[];
  inStock: boolean;
}
