import { Coupon } from '../types';

export const mockCoupons: Coupon[] = [
  {
    code: 'GLOW50',
    title: '50% Off First Booking',
    description: 'Get 50% discount up to Rs.100 on orders above Rs.200',
    discountType: 'percentage',
    discountValue: 50,
    maxDiscountPaise: 10000, // Rs.100
    minOrderPaise: 20000, // Rs.200
    isExpired: false,
  },
  {
    code: 'FIRSTLOOK',
    title: 'Flat Rs.50 Off',
    description: 'Save flat Rs.50 on express styling on orders above Rs.150',
    discountType: 'flat',
    discountValue: 5000, // Rs.50
    minOrderPaise: 15000, // Rs.150
    isExpired: false,
  },
  {
    code: 'FESTIVE100',
    title: 'Festive Glow Rs.100 Off',
    description: 'Special seasonal celebration discount on orders above Rs.400',
    discountType: 'flat',
    discountValue: 10000, // Rs.100
    minOrderPaise: 40000, // Rs.400
    isExpired: false,
  },
  {
    code: 'EXPIRED20',
    title: '20% Weekend Flash Sale',
    description: 'Expired yesterday. Cannot be redeemed.',
    discountType: 'percentage',
    discountValue: 20,
    minOrderPaise: 10000,
    isExpired: true,
  },
];
