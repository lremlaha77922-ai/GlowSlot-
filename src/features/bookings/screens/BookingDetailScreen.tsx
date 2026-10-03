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
  CheckCircle,
  AlertCircle,
  Navigation,
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
          <h1 className="text-sm font-bold text-text">Booking Details (S11)</h1>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-chip tracking-wider ${
            booking.status === 'upcoming'
              ? 'bg-primary-soft text-primary'
              : booking.status === 'completed'
              ? 'bg-success/15 text-success'
              : 'bg-error/15 text-error'
          }`}
        >
          {booking.status}
        </span>
      </header>

      <main className="p-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* Salon & Schedule Card */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                {booking.type === 'athome' ? 'At-Home Service' : 'At-Salon Appointment'}
              </span>
              <h2 className="text-base font-bold text-text mt-0.5">
                {booking.salonName}
              </h2>
              {booking.salonAddress && (
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  {booking.salonAddress}
                </p>
              )}
            </div>

            {booking.status === 'upcoming' && booking.type === 'salon' && (
              <button
                onClick={handleDirections}
                className="p-2 rounded-full bg-primary-soft text-primary hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                aria-label="Get Directions"
              >
                <Navigation size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted">
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

        {/* Services List */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider">
            Booked Services
          </h3>
          <div className="divide-y divide-border">
            {booking.services.map((s, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text block">{s.name}</span>
                  <span className="text-[10px] text-muted">{s.durationMin} mins</span>
                </div>
                <span className="font-mono font-bold text-text">
                  {formatMoney(s.price * s.qty)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-2.5">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider">
            Bill Summary
          </h3>
          <div className="flex justify-between text-xs text-muted">
            <span>Item Subtotal</span>
            <span className="font-mono text-text">{formatMoney(booking.subtotalPaise)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>Taxes & GST (18%)</span>
            <span className="font-mono text-text">{formatMoney(booking.taxPaise)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>Platform Fee</span>
            <span className="font-mono text-text">{formatMoney(booking.platformFeePaise)}</span>
          </div>

          {booking.couponDiscountPaise > 0 && (
            <div className="flex justify-between text-xs text-deal font-semibold">
              <span>Coupon Discount</span>
              <span className="font-mono">-{formatMoney(booking.couponDiscountPaise)}</span>
            </div>
          )}

          {booking.pointsDiscountPaise > 0 && (
            <div className="flex justify-between text-xs text-deal font-semibold">
              <span>Glow Points Redeemed</span>
              <span className="font-mono">-{formatMoney(booking.pointsDiscountPaise)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold text-text pt-2 border-t border-border">
            <span>Total Amount</span>
            <span className="font-mono text-primary">{formatMoney(booking.totalPaise)}</span>
          </div>
        </div>

        {/* Action Buttons for upcoming bookings */}
        {booking.status === 'upcoming' && (
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setIsCancelSheetOpen(true)}
              className="border-error text-error hover:bg-error/10"
            >
              <XCircle size={15} className="mr-1.5" />
              Cancel Slot
            </Button>

            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={!rescheduleCheck.allowed}
              onClick={() => onReschedule(booking)}
            >
              <RotateCcw size={15} className="mr-1.5" />
              Reschedule
            </Button>
          </div>
        )}

        {/* Review Action for completed bookings */}
        {booking.status === 'completed' && !booking.review && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setIsReviewModalOpen(true)}
          >
            <Star size={16} className="mr-2" />
            Rate & Review Stylist
          </Button>
        )}
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
