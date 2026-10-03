import React, { useState } from 'react';
import { useCartStore } from '../../../store/useCartStore';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';
import { formatMoney } from '../../../utils/money';
import { PLATFORM_FEE_PAISE, TAX_PERCENT } from '../../../utils/constants';
import { mockCoupons } from '../../../data/mockCoupons';
import { addressService } from '../../../data/mockAddresses';
import { paymentService } from '../services/paymentService';
import { bookingService } from '../../bookings/services/bookingService';
import { OfferDetailsSheet } from '../components/OfferDetailsSheet';
import { AddressPickerSheet } from '../../athome/components/AddressPickerSheet';
import { Button } from '../../../components/Button';
import { Coupon, PaymentMethod, UserAddress } from '../../../types';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import {
  ArrowLeft,
  Tag,
  Sparkles,
  CreditCard,
  QrCode,
  Building,
  Store,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface CheckoutScreenProps {
  onBack: () => void;
  onSuccess: (bookingId: string) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const { items, getSubtotalPaise, getTaxesPaise, getPrimarySlot, clearCart } =
    useCartStore();
  const { user, updatePoints } = useSessionStore();
  const { showToast } = useUIStore();

  const primarySlot = getPrimarySlot();
  const subtotal = getSubtotalPaise();
  const taxes = getTaxesPaise();

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isOfferSheetOpen, setIsOfferSheetOpen] = useState(false);

  // Address state (if home service or delivery)
  const defaultAddress = addressService.getAddresses().find((a) => a.isDefault) || addressService.getAddresses()[0];
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(defaultAddress || null);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);

  // Points toggle (cap 20% of subtotal per scope)
  const [usePoints, setUsePoints] = useState(false);
  const maxPointsAllowedPaise = Math.floor(subtotal * 0.2); // 20% cap
  const availablePoints = user?.points ?? 0;
  const userPointsPaise = availablePoints * 100; // 1 point = Rs.1 = 100 paise
  const pointsDeductionPaise = usePoints
    ? Math.min(userPointsPaise, maxPointsAllowedPaise)
    : 0;

  // Coupon discount calculation
  let couponDiscountPaise = 0;
  if (appliedCoupon && !appliedCoupon.isExpired && subtotal >= appliedCoupon.minOrderPaise) {
    if (appliedCoupon.discountType === 'percentage') {
      const discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      couponDiscountPaise = appliedCoupon.maxDiscountPaise
        ? Math.min(discount, appliedCoupon.maxDiscountPaise)
        : discount;
    } else {
      couponDiscountPaise = appliedCoupon.discountValue;
    }
  }

  // Final Total
  const finalTotalPaise = Math.max(
    0,
    subtotal +
      PLATFORM_FEE_PAISE +
      taxes -
      couponDiscountPaise -
      pointsDeductionPaise
  );

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);

  const handleApplyCoupon = (coupon: Coupon) => {
    if (coupon.isExpired) {
      setCouponError('This coupon has expired.');
      setAppliedCoupon(null);
      return;
    }
    if (subtotal < coupon.minOrderPaise) {
      setCouponError(
        `Minimum order value for ${coupon.code} is ${formatMoney(coupon.minOrderPaise)}.`
      );
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponCodeInput(coupon.code);
    setCouponError('');
    showToast(`Coupon ${coupon.code} applied!`);
  };

  const handleApplyInputCoupon = () => {
    const code = couponCodeInput.trim().toUpperCase();
    const found = mockCoupons.find((c) => c.code === code);
    if (!found) {
      setCouponError('Invalid coupon code.');
      setAppliedCoupon(null);
      return;
    }
    handleApplyCoupon(found);
  };

  const isOnline = useNetworkStatus();

  const handlePaymentSubmit = async () => {
    if (!isOnline) {
      showToast('You are currently offline. Please reconnect to proceed with booking.');
      return;
    }

    if (items.length === 0) {
      showToast('Cart is empty.');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await paymentService.processPayment(
        {
          amountPaise: finalTotalPaise,
          method: paymentMethod,
          bookingDetails: {
            salonName: primarySlot?.salonName || 'GlowSlot Salon Partner',
            date: primarySlot?.date || 'Today',
            time: primarySlot?.time || 'Express',
          },
        },
        simulateFailure
      );

      if (!result.success) {
        showToast(result.errorMessage || 'Payment failed.');
        setIsProcessing(false);
        return;
      }

      // Deduct used points
      if (usePoints && pointsDeductionPaise > 0 && user) {
        const pointsUsed = Math.round(pointsDeductionPaise / 100);
        updatePoints(Math.max(0, user.points - pointsUsed));
      }

      // Create Booking on server / mock
      const bookingRes = await bookingService.createBooking({
        userId: user?.id || 'guest',
        slotId: primarySlot?.slotId || 'slot-1',
        salonId: primarySlot?.salonId || 'sal-1',
        salonName: primarySlot?.salonName || 'Luxe Cut & Style Studio',
        salonAddress: '42, 1st Cross, Koramangala 5th Block, Bengaluru',
        userAddress: selectedAddress || undefined,
        services: items.map((i) => ({
          name: i.name,
          durationMin: i.durationMin,
          price: i.price,
          qty: i.qty,
        })),
        slot: {
          date: primarySlot?.date || new Date().toISOString().split('T')[0],
          time: primarySlot?.time || '10:00',
        },
        subtotalPaise: subtotal,
        platformFeePaise: PLATFORM_FEE_PAISE,
        taxPaise: taxes,
        couponDiscountPaise,
        pointsDiscountPaise: pointsDeductionPaise,
        totalPaise: finalTotalPaise,
        paymentMethod,
      });

      if (!bookingRes.success || !bookingRes.booking) {
        showToast(bookingRes.error || 'Failed to confirm booking.');
        setIsProcessing(false);
        return;
      }

      // Clear cart
      clearCart();
      setIsProcessing(false);
      onSuccess(bookingRes.booking.id);
    } catch {
      showToast('An unexpected payment error occurred.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Back to Cart"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-bold text-text">Checkout (S08)</h1>
        </div>
      </header>

      <main className="p-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* Slot / Location Summary */}
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text uppercase tracking-wider">
              Booking Appointment
            </span>
            <span className="text-xs text-primary font-semibold">
              {primarySlot?.salonName || 'Salon Partner'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-primary" />
              <span>{primarySlot?.date || 'Upcoming'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-primary" />
              <span>{primarySlot?.time || 'Express Slot'}</span>
            </div>
          </div>
        </div>

        {/* Address Picker (if at-home service) */}
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex items-center justify-between">
          <div className="flex items-start gap-2.5">
            <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-text block">
                {selectedAddress ? `${selectedAddress.label} Address` : 'Service Address'}
              </span>
              <p className="text-[11px] text-muted line-clamp-1">
                {selectedAddress
                  ? `${selectedAddress.houseNumber}, ${selectedAddress.street}`
                  : 'Add service location'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddressSheetOpen(true)}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Change
          </button>
        </div>

        {/* Coupon Field & Offers Sheet Trigger per Design.md 8.8 */}
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1">
              <Tag size={13} className="text-deal" /> Apply Coupon
            </span>
            <button
              onClick={() => setIsOfferSheetOpen(true)}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              View Offers
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter promo code (e.g. GLOW50)"
              value={couponCodeInput}
              onChange={(e) => {
                setCouponCodeInput(e.target.value.toUpperCase());
                setCouponError('');
              }}
              className="h-10 flex-1 px-3 rounded-button border border-border bg-bg text-xs font-mono uppercase focus:border-primary outline-none"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleApplyInputCoupon}
              disabled={!couponCodeInput.trim()}
            >
              Apply
            </Button>
          </div>

          {appliedCoupon && !couponError && (
            <div className="flex items-center justify-between p-2 rounded-button bg-success/10 text-success text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={13} />
                <span>{appliedCoupon.code} applied! (-{formatMoney(couponDiscountPaise)})</span>
              </div>
              <button
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponCodeInput('');
                }}
                className="text-muted hover:text-error text-[11px] cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}

          {couponError && (
            <div className="flex items-center gap-1 text-xs text-error">
              <AlertCircle size={13} />
              <span>{couponError}</span>
            </div>
          )}
        </div>

        {/* Points Toggle (cap 20% of subtotal) */}
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex items-center justify-between">
          <div className="flex items-start gap-2.5">
            <Sparkles size={16} className="text-deal shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-text">Use Glow Points</span>
                <span className="text-[10px] text-muted">({user?.points ?? 0} pts available)</span>
              </div>
              <p className="text-[11px] text-muted">
                Save up to 20% ({formatMoney(maxPointsAllowedPaise)}) on this booking
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={usePoints}
              onChange={(e) => setUsePoints(e.target.checked)}
              disabled={(user?.points ?? 0) <= 0}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>

        {/* Payment Methods List */}
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-2.5">
          <span className="text-xs font-bold text-text uppercase tracking-wider block">
            Payment Method
          </span>

          <div className="flex flex-col gap-2">
            {[
              { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)', icon: QrCode },
              { id: 'card', label: 'Credit or Debit Card', icon: CreditCard },
              { id: 'netbanking', label: 'Net Banking', icon: Building },
              { id: 'pay_at_salon', label: 'Pay at Salon / Cash', icon: Store },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;

              return (
                <label
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`p-3 rounded-button border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-soft border-primary text-primary font-semibold'
                      : 'bg-surface border-border text-text hover:bg-primary-soft/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span className="text-xs">{method.label}</span>
                  </div>
                  <input
                    type="radio"
                    name="payment_method"
                    checked={isSelected}
                    onChange={() => setPaymentMethod(method.id as PaymentMethod)}
                    className="accent-primary"
                  />
                </label>
              );
            })}
          </div>

          {/* Dev Simulation Toggle */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted">
            <span>Simulate Payment Failure:</span>
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="accent-error w-3.5 h-3.5 cursor-pointer"
            />
          </div>
        </div>

        {/* Full Price Breakdown */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-2 text-xs">
          <h3 className="font-bold text-text uppercase tracking-wider mb-1">
            Price Breakdown
          </h3>

          <div className="flex justify-between text-muted">
            <span>Services Subtotal ({items.length} items)</span>
            <span className="text-text tabular-nums">{formatMoney(subtotal)}</span>
          </div>

          <div className="flex justify-between text-muted">
            <span>Platform Convenience Fee</span>
            <span className="text-text tabular-nums">{formatMoney(PLATFORM_FEE_PAISE)}</span>
          </div>

          <div className="flex justify-between text-muted">
            <span>Taxes & GST ({TAX_PERCENT}%)</span>
            <span className="text-text tabular-nums">{formatMoney(taxes)}</span>
          </div>

          {couponDiscountPaise > 0 && (
            <div className="flex justify-between text-success font-medium">
              <span>Coupon Discount ({appliedCoupon?.code})</span>
              <span className="tabular-nums">-{formatMoney(couponDiscountPaise)}</span>
            </div>
          )}

          {pointsDeductionPaise > 0 && (
            <div className="flex justify-between text-deal font-medium">
              <span>Points Discount</span>
              <span className="tabular-nums">-{formatMoney(pointsDeductionPaise)}</span>
            </div>
          )}

          <div className="border-t border-border pt-2 mt-1 flex justify-between text-sm font-bold text-text">
            <span>Total Payable Amount</span>
            <span className="text-primary tabular-nums text-base">
              {formatMoney(finalTotalPaise)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted pt-1">
          <ShieldCheck size={14} className="text-success" />
          <span>256-bit encrypted secure payment</span>
        </div>
      </main>

      {/* Sticky Bottom Pay Button */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-level-2 p-3 max-w-lg mx-auto flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-muted uppercase tracking-wider block">
            Final Amount
          </span>
          <span className="text-lg font-bold text-text tabular-nums">
            {formatMoney(finalTotalPaise)}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="flex-1 max-w-xs"
          disabled={isProcessing || !isOnline}
          onClick={handlePaymentSubmit}
        >
          {!isOnline
            ? 'Offline (Reconnect to Pay)'
            : isProcessing
            ? 'Processing...'
            : `Pay ${formatMoney(finalTotalPaise)}`}
        </Button>
      </div>

      {/* O04 Offers Sheet */}
      <OfferDetailsSheet
        isOpen={isOfferSheetOpen}
        onClose={() => setIsOfferSheetOpen(false)}
        subtotalPaise={subtotal}
        onSelectCoupon={handleApplyCoupon}
      />

      {/* O05 Address Picker Sheet */}
      <AddressPickerSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        selectedAddressId={selectedAddress?.id}
        onSelectAddress={(addr) => setSelectedAddress(addr)}
      />
    </div>
  );
};
