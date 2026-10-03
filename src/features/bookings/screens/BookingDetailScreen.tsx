import React, { useState } from 'react';
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
  const [booking, setBooking] = useState<Booking | null>(
    bookingService.getBookingById(bookingId)
  );
  const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { showToast } = useUIStore();

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
          <div>
            <h1 className="text-sm font-bold text-text leading-tight">
              Booking Details (S11)
            </h1>
            <span className="text-[10px] font-mono text-muted">{booking.id}</span>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-chip uppercase tracking-wider ${
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

      <main className="p-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* Salon / Venue Info Card */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase">
                {booking.type === 'athome' ? 'At-Home Service' : 'At-Salon Appointment'}
              </span>
              <h2 className="text-base font-bold text-text mt-0.5">{booking.salonName}</h2>
              {booking.salonAddress && (
                <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                  <MapPin size={12} className="shrink-0 text-primary" />
                  <span className="line-clamp-1">{booking.salonAddress}</span>
                </div>
              )}
            </div>

            {booking.status === 'upcoming' && booking.type === 'salon' && (
              <button
                onClick={handleDirections}
                className="p-2 rounded-full bg-primary-soft text-primary hover:opacity-90 cursor-pointer"
                title="Get Directions"
              >
                <Navigation size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-border text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-primary" />
              <span>{booking.slot.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-primary" />
              <span>{booking.slot.time}</span>
            </div>
          </div>
        </div>

        {/* Cancellation Notice (if cancelled) */}
        {booking.status === 'cancelled' && booking.cancellation && (
          <div className="bg-error/10 border border-error/20 rounded-card p-3.5 flex flex-col gap-1.5 text-xs text-error">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle size={14} />
              <span>Booking Cancelled</span>
            </div>
            <p className="text-[11px] text-muted">
              Reason: {booking.cancellation.reason}
            </p>
            <div className="flex justify-between font-bold text-text pt-1 border-t border-error/15">
              <span>Refund Processed ({booking.cancellation.refundPercent}%)</span>
              <span className="text-primary tabular-nums">
                {formatMoney(booking.cancellation.refundAmountPaise)}
              </span>
            </div>
          </div>
        )}

        {/* Review Box (if completed and already reviewed) */}
        {booking.review && (
          <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text">Your Review</span>
              <div className="flex items-center gap-0.5 text-deal">
                {Array.from({ length: booking.review.rating }).map((_, i) => (
                  <Star key={i} size={12} className="fill-deal" />
                ))}
              </div>
            </div>
            <p className="text-muted leading-relaxed">{booking.review.text}</p>
          </div>
        )}

        {/* Services List */}
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-2">
          <span className="text-xs font-bold text-text uppercase tracking-wider mb-1">
            Booked Services ({booking.services.length})
          </span>

          <div className="divide-y divide-border">
            {booking.services.map((srv, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text">{srv.name}</h4>
                  <span className="text-[11px] text-muted">{srv.durationMin} mins • Qty: {srv.qty}</span>
                </div>
                <span className="text-xs font-bold text-text tabular-nums">
                  {formatMoney(srv.price * srv.qty)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Bill Summary */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-text uppercase tracking-wider">
              Payment Summary
            </span>
            <span className="text-[11px] uppercase font-bold text-muted">
              {booking.paymentMethod.replace('_', ' ')} ({booking.paymentStatus})
            </span>
          </div>

          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span className="text-text tabular-nums">{formatMoney(booking.subtotalPaise)}</span>
          </div>

          <div className="flex justify-between text-muted">
            <span>Platform Fee</span>
            <span className="text-text tabular-nums">{formatMoney(booking.platformFeePaise)}</span>
          </div>

          <div className="flex justify-between text-muted">
            <span>Taxes</span>
            <span className="text-text tabular-nums">{formatMoney(booking.taxPaise)}</span>
          </div>

          {booking.couponDiscountPaise > 0 && (
            <div className="flex justify-between text-success">
              <span>Coupon Discount</span>
              <span className="tabular-nums">-{formatMoney(booking.couponDiscountPaise)}</span>
            </div>
          )}

          {booking.pointsDiscountPaise > 0 && (
            <div className="flex justify-between text-deal">
              <span>Points Discount</span>
              <span className="tabular-nums">-{formatMoney(booking.pointsDiscountPaise)}</span>
            </div>
          )}

          <div className="border-t border-border pt-2 mt-1 flex justify-between text-sm font-bold text-text">
            <span>Total Paid</span>
            <span className="text-primary tabular-nums text-base">
              {formatMoney(booking.totalPaise)}
            </span>
          </div>
        </div>

        {/* Actions valid per status per scope */}
        {booking.status === 'upcoming' && (
          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              variant="outline"
              size="lg"
              disabled={!rescheduleCheck.allowed}
              onClick={() => onReschedule(booking)}
              className="flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Reschedule Slot</span>
            </Button>
            {!rescheduleCheck.allowed && rescheduleCheck.reason && (
              <span className="text-[11px] text-muted text-center">
                {rescheduleCheck.reason}
              </span>
            )}

            <Button
              variant="danger"
              size="lg"
              onClick={() => setIsCancelSheetOpen(true)}
              className="flex items-center justify-center gap-2"
            >
              <XCircle size={16} />
              <span>Cancel Appointment</span>
            </Button>
          </div>
        )}

        {booking.status === 'completed' && (
          <div className="flex flex-col gap-2.5 pt-2">
            {!booking.review && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsReviewModalOpen(true)}
                className="flex items-center justify-center gap-2"
              >
                <Star size={16} />
                <span>Write a Review</span>
              </Button>
            )}

            <Button
              variant="secondary"
              size="lg"
              onClick={() => onRebook(booking)}
              className="flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Book Again</span>
            </Button>
          </div>
        )}
      </main>

      {/* O06 Cancel Sheet */}
      <CancelBookingSheet
        isOpen={isCancelSheetOpen}
        onClose={() => setIsCancelSheetOpen(false)}
        booking={booking}
        onCancelled={(updated) => {
          setBooking(updated);
          showToast('Booking cancelled successfully.');
        }}
      />

      {/* S12 Write Review */}
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        booking={booking}
        onReviewSubmitted={(updated) => {
          setBooking(updated);
        }}
      />
    </div>
  );
};
