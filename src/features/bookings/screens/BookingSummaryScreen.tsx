import React, { useState } from 'react';
import { Salon, SalonServiceItem, SpecialistItem, SlotItem, PaymentMethod } from '../../../types';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { useUIStore } from '../../../store/useUIStore';
import { useSessionStore } from '../../../store/useSessionStore';
import { slotService } from '../../slots/services/slotService';
import { paymentService } from '../services/paymentService';
import { bookingService } from '../../bookings/services/bookingService';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Star,
  Scissors,
  Clock,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  User,
  Tag,
  ShieldCheck,
  Lock,
  Edit2,
  X,
  AlertCircle,
  CreditCard,
  QrCode,
  Store,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export interface CustomerDetailsData {
  name: string;
  phone: string;
  email?: string;
  specialInstructions?: string;
}

export interface PricingSummaryData {
  subtotal: number;
  couponCode?: string;
  discount: number;
  convenienceFee?: number;
  total: number;
  deposit: number;
  balanceAtSalon: number;
}

export interface BookingSummaryScreenProps {
  salon: Salon;
  services: SalonServiceItem[];
  specialist: SpecialistItem | null;
  slot: SlotItem;
  customerDetails: CustomerDetailsData;
  pricingSummary: PricingSummaryData;
  onBack: () => void;
  onChangeSalon?: () => void;
  onChangeServices?: () => void;
  onChangeSpecialist?: () => void;
  onChangeSlot?: () => void;
  onChangeContact?: () => void;
  onAddEditNote?: (newNote: string) => void;
  onConfirmPayment: (summaryData: {
    salon: Salon;
    services: SalonServiceItem[];
    specialist: SpecialistItem | null;
    slot: SlotItem;
    customerDetails: CustomerDetailsData;
    pricingSummary: PricingSummaryData;
    bookingId: string;
  }) => void;
  onCancelBooking: () => void;
}

export const BookingSummaryScreen: React.FC<BookingSummaryScreenProps> = ({
  salon,
  services,
  specialist,
  slot,
  customerDetails,
  pricingSummary,
  onBack,
  onChangeSalon,
  onChangeServices,
  onChangeSpecialist,
  onChangeSlot,
  onChangeContact,
  onAddEditNote,
  onConfirmPayment,
  onCancelBooking,
}) => {
  const { showToast } = useUIStore();
  const { user } = useSessionStore();

  const [isNoteEditing, setIsNoteEditing] = useState(false);
  const [noteInput, setNoteInput] = useState(customerDetails.specialInstructions || '');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Payment Method State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);

  const totalDurationMin = services.reduce((sum, s) => sum + s.durationMin, 0);
  const convenienceFee = pricingSummary.convenienceFee ?? 1000; // ₹10 convenience fee
  const grandTotalPaise = pricingSummary.total + convenienceFee;

  // Exact 25% Advance Deposit & 75% Balance at Salon
  const deposit25Paise = Math.round(grandTotalPaise * 0.25);
  const balance75Paise = Math.max(0, grandTotalPaise - deposit25Paise);

  const handleSaveNote = () => {
    if (onAddEditNote) {
      onAddEditNote(noteInput.trim());
    }
    setIsNoteEditing(false);
    showToast('Special instructions updated');
  };

  // COMPLETE PAYMENT & SLOT-LOCK FLOW
  const handlePayAndLockSlot = async () => {
    // 1. Validation Before Payment
    if (!slot || !slot.id || !slot.date || !slot.time) {
      showToast('Selected time slot is invalid. Please select a valid slot.');
      return;
    }
    if (!services || services.length === 0) {
      showToast('No services selected. Please add at least 1 service.');
      return;
    }
    if (!customerDetails.name || customerDetails.name.trim().length < 2) {
      showToast('Please provide a valid full name for the appointment contact.');
      return;
    }
    if (!customerDetails.phone || customerDetails.phone.replace(/\D/g, '').length < 10) {
      showToast('Please provide a valid 10-digit contact number.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 2. Lock the slot using the existing RPC / slot hold system before payment
      const holdRes = await slotService.holdSlot(slot.id, user?.id);
      if (!holdRes.success) {
        showToast(
          holdRes.error ||
            'This slot is no longer available or currently held by another user. Please pick another time slot.'
        );
        setIsProcessingPayment(false);
        return;
      }

      showToast('Slot lock acquired! Processing 25% advance deposit...');

      // 3. Process Payment for 25% Advance Deposit
      const payRes = await paymentService.processPayment(
        {
          amountPaise: deposit25Paise,
          method: selectedPaymentMethod,
          bookingDetails: {
            salonName: salon.name,
            date: slot.date,
            time: slot.time,
          },
        },
        simulateFailure
      );

      // 4. Handle Payment Failure: Release temporary slot lock & keep booking recoverable
      if (!payRes.success) {
        // Release slot lock
        await slotService.releaseSlot(slot.id, user?.id);
        showToast(
          payRes.errorMessage || 'Payment failed. Slot lock has been released. Please try again.'
        );
        setIsProcessingPayment(false);
        return;
      }

      // 5. Payment Successful: Create confirmed booking & store deposit status
      const bookingRes = await bookingService.createBooking({
        userId: user?.id || 'guest',
        slotId: slot.id,
        salonId: salon.id,
        salonName: salon.name,
        salonAddress: salon.address,
        services: services.map((s) => ({
          name: s.name,
          durationMin: s.durationMin,
          price: s.basePrice,
          qty: 1,
        })),
        slot: {
          date: slot.date,
          time: slot.time,
        },
        subtotalPaise: pricingSummary.subtotal,
        platformFeePaise: convenienceFee,
        taxPaise: 0,
        couponDiscountPaise: pricingSummary.discount,
        pointsDiscountPaise: 0,
        totalPaise: grandTotalPaise,
        paymentMethod: selectedPaymentMethod,
      });

      if (!bookingRes.success || !bookingRes.booking) {
        // Release slot if booking DB creation fails
        await slotService.releaseSlot(slot.id, user?.id);
        showToast(bookingRes.error || 'Failed to confirm booking after payment.');
        setIsProcessingPayment(false);
        return;
      }

      // 6. Confirmed Booking Created
      showToast(`Booking confirmed! Reference: ${bookingRes.booking.id}`);
      setIsProcessingPayment(false);

      onConfirmPayment({
        salon,
        services,
        specialist,
        slot,
        customerDetails: {
          ...customerDetails,
          specialInstructions: noteInput || customerDetails.specialInstructions,
        },
        pricingSummary: {
          ...pricingSummary,
          convenienceFee,
          total: grandTotalPaise,
          deposit: deposit25Paise,
          balanceAtSalon: balance75Paise,
        },
        bookingId: bookingRes.booking.id,
      });
    } catch {
      // Safety rollback on exception
      await slotService.releaseSlot(slot.id, user?.id);
      showToast('An unexpected payment error occurred. Temporary slot lock released.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-36">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-primary">
              BOOKING SUMMARY
            </h1>
            <span className="text-[10px] text-muted block">Review & Lock Slot</span>
          </div>
        </div>

        <button
          onClick={() => setShowCancelConfirm(true)}
          className="text-xs font-bold text-error hover:underline cursor-pointer"
        >
          Cancel
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* 1. SALON & VENUE */}
        <section className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              1. Salon & Venue
            </span>
            {onChangeSalon && (
              <button
                onClick={onChangeSalon}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit2 size={12} /> Change
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <img
              src={salon.images[0] || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80'}
              alt={salon.name}
              className="w-16 h-16 rounded-button object-cover shrink-0 border border-border"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-text truncate">{salon.name}</h3>
                <ShieldCheck size={14} className="text-primary shrink-0" />
              </div>
              <p className="text-[11px] text-muted line-clamp-2 mt-0.5 flex items-start gap-1">
                <MapPin size={12} className="shrink-0 mt-0.5" />
                <span>{salon.address}</span>
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-muted">
                <span className="flex items-center gap-1 text-deal font-bold">
                  <Star size={11} className="fill-deal" /> {salon.rating}
                </span>
                <span>•</span>
                <span>{salon.distanceKm} km away</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SELECTED SERVICES */}
        <section className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              2. Selected Services ({services.length})
            </span>
            {onChangeServices && (
              <button
                onClick={onChangeServices}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit2 size={12} /> Change
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 divide-y divide-border/40">
            {services.map((srv) => (
              <div key={srv.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-text flex items-center gap-1.5">
                    <Scissors size={13} className="text-primary" />
                    <span>{srv.name}</span>
                  </h4>
                  <span className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {srv.durationMin} mins
                  </span>
                </div>
                <span className="font-extrabold text-text tabular-nums">
                  {formatMoney(srv.basePrice)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. ASSIGNED PROFESSIONAL */}
        <section className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              3. Assigned Professional
            </span>
            {onChangeSpecialist && (
              <button
                onClick={onChangeSpecialist}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit2 size={12} /> Change
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {specialist ? (
              <img
                src={specialist.photoUrl}
                alt={specialist.name}
                className="w-12 h-12 rounded-full object-cover shrink-0 border border-border"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <UserCheck size={22} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-text">
                {specialist ? specialist.name : 'Any Available Specialist'}
              </h4>
              <p className="text-[11px] text-muted mt-0.5">
                {specialist ? specialist.role : 'First available expert stylist on arrival'}
              </p>
              {specialist && (
                <div className="flex items-center gap-3 mt-1 text-[10px] font-semibold text-muted">
                  <span className="flex items-center gap-1 text-deal font-bold">
                    <Star size={10} className="fill-deal" /> {specialist.rating}
                  </span>
                  <span>•</span>
                  <span>{specialist.experienceYears ?? 5}+ yrs exp</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. DATE & APPOINTMENT WINDOW */}
        <section className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              4. Date & Appointment Window
            </span>
            {onChangeSlot && (
              <button
                onClick={onChangeSlot}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit2 size={12} /> Change
              </button>
            )}
          </div>

          <div className="flex items-center justify-between bg-primary-soft/30 p-3 rounded-card border border-primary/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-text block">{slot.date}</span>
                <span className="text-[11px] font-extrabold text-primary block mt-0.5">
                  Slot: {slot.time}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-muted block">Duration</span>
              <span className="text-xs font-bold text-text">{totalDurationMin} mins total</span>
            </div>
          </div>
        </section>

        {/* 5. CONTACT FOR THIS APPOINTMENT */}
        <section className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              5. Contact for this Appointment
            </span>
            {onChangeContact && (
              <button
                onClick={onChangeContact}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit2 size={12} /> Edit
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2 text-text font-bold">
              <User size={13} className="text-primary" />
              <span>{customerDetails.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted font-mono">
              <Phone size={13} className="text-primary" />
              <span>{customerDetails.phone}</span>
            </div>
            {customerDetails.email && (
              <div className="flex items-center gap-2 text-muted">
                <Mail size={13} className="text-muted" />
                <span>{customerDetails.email}</span>
              </div>
            )}
          </div>
        </section>

        {/* 6. SPECIAL INSTRUCTIONS */}
        <section className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              6. Special Instructions
            </span>
            <button
              onClick={() => setIsNoteEditing(!isNoteEditing)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {isNoteEditing ? 'Cancel' : noteInput ? 'Edit Note' : '+ Add Note'}
            </button>
          </div>

          {isNoteEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={2}
                placeholder="Add any styling notes or special requests..."
                className="w-full p-2.5 text-xs bg-bg border border-border rounded-input text-text placeholder:text-muted focus:border-primary focus:outline-none"
              />
              <Button size="sm" variant="primary" onClick={handleSaveNote} className="self-end">
                Save Note
              </Button>
            </div>
          ) : (
            <p className="text-xs text-text italic bg-bg/50 p-2.5 rounded-button border border-border/50">
              {noteInput || customerDetails.specialInstructions || 'No special instructions added.'}
            </p>
          )}
        </section>

        {/* 7. PAYMENT METHOD & BREAKDOWN */}
        <section className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={14} className="text-primary" /> 7. Payment Method & Slot Lock
            </span>
            {pricingSummary.couponCode && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-chip">
                {pricingSummary.couponCode} Applied
              </span>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'upi', name: 'UPI / GPay / PhonePe', icon: QrCode },
                { id: 'card', name: 'Credit / Debit Card', icon: CreditCard },
                { id: 'netbanking', name: 'Net Banking', icon: Building2 },
                { id: 'pay_at_salon', name: 'Pay at Salon', icon: Store },
              ] as const
            ).map((pm) => {
              const Icon = pm.icon;
              const isSelected = selectedPaymentMethod === pm.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(pm.id)}
                  className={`p-2.5 rounded-card border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-soft/40 ring-1 ring-primary'
                      : 'border-border bg-surface hover:border-primary/40'
                  }`}
                >
                  <Icon size={16} className={isSelected ? 'text-primary' : 'text-muted'} />
                  <span className="text-[11px] font-bold text-text truncate">{pm.name}</span>
                </button>
              );
            })}
          </div>

          {/* Test Payment Simulator Switcher */}
          <div className="flex items-center justify-between bg-bg/60 p-2.5 rounded-button border border-border/50 text-[11px]">
            <span className="text-muted font-medium">Test Payment Failure Simulator</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-muted/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-error"></div>
            </label>
          </div>

          {/* FINANCIAL BREAKDOWN */}
          <div className="mt-1 pt-2.5 border-t border-border/60 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between text-muted">
              <span>Total Service Amount</span>
              <span className="font-extrabold text-text tabular-nums">
                {formatMoney(grandTotalPaise)}
              </span>
            </div>

            {pricingSummary.discount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-medium">
                <span>Coupon Discount</span>
                <span className="tabular-nums">- {formatMoney(pricingSummary.discount)}</span>
              </div>
            )}

            {/* CLEAR 25% ADVANCE DEPOSIT & 75% BALANCE AT SALON DISPLAY */}
            <div className="bg-primary-soft/40 p-3 rounded-card border border-primary/20 flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between text-primary font-black text-xs">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-primary" /> 25% Advance Deposit (Pay Now)
                </span>
                <span className="tabular-nums text-sm">{formatMoney(deposit25Paise)}</span>
              </div>

              <div className="flex items-center justify-between text-muted font-medium text-[11px] pt-1.5 border-t border-primary/10">
                <span>75% Remaining Balance (Pay at Salon)</span>
                <span className="tabular-nums font-bold text-text">{formatMoney(balance75Paise)}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-md border-t border-border p-3.5 max-w-lg mx-auto flex items-center justify-between gap-3 shadow-level-2 z-50">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-muted font-medium truncate">
            25% Deposit {formatMoney(deposit25Paise)} • 75% Salon {formatMoney(balance75Paise)}
          </span>
          <span className="text-base font-extrabold text-primary tabular-nums">
            Total {formatMoney(grandTotalPaise)}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          disabled={isProcessingPayment}
          onClick={handlePayAndLockSlot}
          className="flex-1 max-w-xs shadow-xs font-extrabold flex items-center justify-center gap-2"
        >
          {isProcessingPayment ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Locking Chair Slot...</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>Pay {formatMoney(deposit25Paise)} & Lock Slot</span>
            </>
          )}
        </Button>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-card border border-border p-5 max-w-xs w-full flex flex-col gap-3 shadow-level-2">
            <div className="flex items-center gap-2 text-error font-bold text-sm">
              <AlertCircle size={18} />
              <span>Cancel Appointment Booking?</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to cancel this booking? Your selected chair time slot will be released.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
              >
                Keep Booking
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowCancelConfirm(false);
                  onCancelBooking();
                }}
                className="flex-1 bg-error hover:bg-error/90 border-error text-white"
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
