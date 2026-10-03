import React, { useState, useEffect } from 'react';
import { Booking } from '../../../types';
import { bookingService } from '../services/bookingService';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { CancelBookingSheet } from '../components/CancelBookingSheet';
import { WriteReviewModal } from '../components/WriteReviewModal';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  RotateCcw,
  XCircle,
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Phone,
  Scissors,
  User,
  CreditCard,
  Building2,
  FileText,
  CalendarPlus,
  RefreshCw,
} from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';
import { useSessionStore } from '../../../store/useSessionStore';

interface BookingDetailScreenProps {
  bookingId: string;
  onBack: () => void;
  onReschedule: (booking: Booking) => void;
  onRebook: (booking: Booking) => void;
}

export const BookingDetailScreen: React.FC<BookingDetailScreenProps> = ({
  bookingId,
  onBack,
  onReschedule,
  onRebook,
}) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { user } = useSessionStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const b = await bookingService.getBookingById(bookingId, user?.id);
      setBooking(b);
      setIsLoading(false);
    };
    load();
  }, [bookingId, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text p-6 flex items-center justify-center text-xs text-muted">
        Loading booking details...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6 text-center text-xs text-muted">
        Booking not found.
      </div>
    );
  }

  const rescheduleCheck = bookingService.canReschedule(booking);

  const handleDirections = () => {
    const query = booking.salonAddress || booking.salonName;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  const handleContactSalon = () => {
    showToast(`Connecting to ${booking.salonName} front desk...`);
    window.location.href = `tel:+919876543210`;
  };

  const handleAddCalendar = () => {
    showToast('Appointment added to your device calendar!');
  };

  const totalPaise = booking.totalPaise;
  const advancePaidPaise = Math.round(totalPaise * 0.25);
  const balanceDuePaise = Math.max(0, totalPaise - advancePaidPaise);

  return (
    <div className="min-h-screen bg-bg text-text pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-bold text-text">Booking Details</h1>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-chip tracking-wider ${
            booking.status === 'upcoming'
              ? 'bg-primary-soft text-primary'
              : booking.status === 'completed'
              ? 'bg-success/15 text-success'
              : booking.status === 'pending'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-error/15 text-error'
          }`}
        >
          {booking.status}
        </span>
      </header>

      <main className="p-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* Booking Reference ID Banner */}
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted uppercase font-bold block">Booking Reference ID</span>
            <span className="text-sm font-mono font-black text-primary block mt-0.5">
              {booking.id}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-muted uppercase font-bold block">Payment Status</span>
            <span className="text-xs font-bold text-success uppercase block mt-0.5">
              {booking.paymentStatus || 'Paid (UPI)'}
            </span>
          </div>
        </div>

        {/* Salon & Venue */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Building2 size={12} /> {booking.type === 'athome' ? 'At-Home Service' : 'Salon & Venue'}
              </span>
              <h2 className="text-base font-bold text-text mt-0.5">
                {booking.salonName}
              </h2>
              {booking.salonAddress && (
                <p className="text-xs text-muted mt-1 leading-relaxed flex items-center gap-1.5">
                  <MapPin size={13} className="text-primary shrink-0" />
                  <span>{booking.salonAddress}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-border text-xs">
            <div className="flex items-center gap-4 text-muted">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                <span className="font-semibold text-text">{booking.slot.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                <span className="font-semibold text-text">{booking.slot.time}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Services & Professional */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
            <Scissors size={14} className="text-primary" /> Selected Services & Professional
          </h3>

          <div className="flex flex-col gap-2.5 divide-y divide-border/60">
            {booking.services.map((s, idx) => (
              <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text block">{s.name}</span>
                  <span className="text-[10px] text-muted">Duration: {s.durationMin} mins</span>
                </div>
                <span className="font-mono font-bold text-text">
                  {formatMoney(s.price * s.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted">
            <span>Assigned Professional:</span>
            <span className="font-semibold text-text">Any Available Specialist (Verified Expert)</span>
          </div>
        </div>

        {/* Customer Details & Special Instructions */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-3 text-xs">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-primary" /> Customer Details & Instructions
          </h3>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted">Customer Name:</span>
              <span className="font-semibold text-text">{user?.name || 'Aarav Sharma'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Phone Number:</span>
              <span className="font-semibold text-text font-mono">{user?.phone || '+91 98765 43210'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Email Address:</span>
              <span className="font-semibold text-text">{user?.email || 'aarav@glowslot.com'}</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-border/60 flex flex-col gap-1">
            <span className="text-muted font-medium flex items-center gap-1">
              <FileText size={13} className="text-primary" /> Special Instructions:
            </span>
            <p className="text-text italic bg-bg p-2.5 rounded-button border border-border/60">
              "Please sanitize equipment prior to start and maintain gentle care."
            </p>
          </div>
        </div>

        {/* Payment Breakdown, Advance Paid & Balance Due */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-2.5 text-xs">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard size={14} className="text-primary" /> Payment Breakdown & Settlement
          </h3>

          <div className="flex justify-between text-muted">
            <span>Item Subtotal</span>
            <span className="font-mono text-text">{formatMoney(booking.subtotalPaise)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Taxes & GST (18%)</span>
            <span className="font-mono text-text">{formatMoney(booking.taxPaise)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Platform Fee</span>
            <span className="font-mono text-text">{formatMoney(booking.platformFeePaise)}</span>
          </div>

          {booking.couponDiscountPaise > 0 && (
            <div className="flex justify-between text-deal font-semibold">
              <span>Coupon Discount</span>
              <span className="font-mono">-{formatMoney(booking.couponDiscountPaise)}</span>
            </div>
          )}

          {booking.pointsDiscountPaise > 0 && (
            <div className="flex justify-between text-deal font-semibold">
              <span>Glow Points Redeemed</span>
              <span className="font-mono">-{formatMoney(booking.pointsDiscountPaise)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold text-text pt-2 border-t border-border">
            <span>Total Service Price</span>
            <span className="font-mono text-primary">{formatMoney(totalPaise)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-button border border-emerald-200">
              <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Advance Paid (25%)</span>
              <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-300 text-sm">
                {formatMoney(advancePaidPaise)}
              </span>
            </div>
            <div className="bg-bg p-2.5 rounded-button border border-border">
              <span className="text-[10px] text-muted uppercase font-semibold block">Balance Due at Salon</span>
              <span className="font-mono font-extrabold text-text text-sm">
                {formatMoney(balanceDuePaise)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Suite according to state */}
        <div className="flex flex-col gap-2.5 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={handleDirections}
              className="text-xs font-bold"
            >
              <Navigation size={15} className="mr-1.5 text-primary" />
              Get Directions
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={handleContactSalon}
              className="text-xs font-bold"
            >
              <Phone size={15} className="mr-1.5 text-primary" />
              Contact Salon
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={handleAddCalendar}
              className="text-xs font-bold"
            >
              <CalendarPlus size={15} className="mr-1.5 text-primary" />
              Add Calendar
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => onRebook(booking)}
              className="text-xs font-bold"
            >
              <RefreshCw size={15} className="mr-1.5 text-primary" />
              {booking.status === 'completed' ? 'Book Again' : 'Rebook'}
            </Button>
          </div>

          {booking.status === 'upcoming' && (
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsCancelSheetOpen(true)}
                className="border-error text-error hover:bg-error/10 text-xs font-bold"
              >
                <XCircle size={15} className="mr-1.5" />
                Cancel Slot
              </Button>

              <Button
                variant="primary"
                size="md"
                disabled={!rescheduleCheck.allowed}
                onClick={() => onReschedule(booking)}
                className="text-xs font-bold"
              >
                <RotateCcw size={15} className="mr-1.5" />
                Reschedule
              </Button>
            </div>
          )}

          {booking.status === 'completed' && !booking.review && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setIsReviewModalOpen(true)}
              className="mt-1 font-bold shadow-xs"
            >
              <Star size={16} className="mr-2" />
              Leave Review
            </Button>
          )}
        </div>
      </main>

      {/* Cancel Confirmation Sheet */}
      {isCancelSheetOpen && (
        <CancelBookingSheet
          isOpen={isCancelSheetOpen}
          onClose={() => setIsCancelSheetOpen(false)}
          booking={booking}
          onCancelled={(updated) => {
            setBooking(updated);
            showToast('Booking cancelled successfully.');
          }}
        />
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <WriteReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          booking={booking}
          onReviewSubmitted={(updated) => {
            setBooking(updated);
          }}
        />
      )}
    </div>
  );
};
