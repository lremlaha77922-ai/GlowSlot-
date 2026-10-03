import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../../../types';
import { bookingService } from '../services/bookingService';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { EmptyState } from '../../../components/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  RotateCcw,
  Star,
  XCircle,
  CalendarCheck,
} from 'lucide-react';
import { CancelBookingSheet } from '../components/CancelBookingSheet';
import { WriteReviewModal } from '../components/WriteReviewModal';
import { useUIStore } from '../../../store/useUIStore';

interface BookingsListScreenProps {
  onSelectBooking: (bookingId: string) => void;
  onReschedule: (booking: Booking) => void;
  onRebook: (booking: Booking) => void;
  onExploreSalons: () => void;
}

export const BookingsListScreen: React.FC<BookingsListScreenProps> = ({
  onSelectBooking,
  onReschedule,
  onRebook,
  onExploreSalons,
}) => {
  const [activeSegment, setActiveSegment] = useState<BookingStatus>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);

  const { showToast } = useUIStore();

  const loadBookings = () => {
    const list = bookingService.getBookings();
    setBookings(list);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filtered = bookings.filter((b) => b.status === activeSegment);

  return (
    <div className="flex-1 pb-24 bg-bg text-text">
      {/* Top App Bar with Segments */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 pt-3 pb-2.5">
        <h1 className="text-base font-bold text-text mb-3">My Bookings (S10)</h1>

        {/* 3 Segments: Upcoming / Completed / Cancelled per Design.md */}
        <div className="h-9 p-0.5 rounded-button bg-muted/15 border border-border flex items-center">
          {(['upcoming', 'completed', 'cancelled'] as const).map((seg) => (
            <button
              key={seg}
              onClick={() => setActiveSegment(seg)}
              className={`flex-1 h-full rounded-[10px] text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeSegment === seg
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </header>

      {/* Bookings List */}
      <main className="p-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck size={32} />}
            title={`No ${activeSegment} bookings`}
            helperText={`You don't have any ${activeSegment} appointments at the moment.`}
            actionLabel={activeSegment === 'upcoming' ? 'Book a Salon Slot' : undefined}
            onAction={activeSegment === 'upcoming' ? onExploreSalons : undefined}
          />
        ) : (
          filtered.map((b) => {
            const canResched = bookingService.canReschedule(b);

            return (
              <div
                key={b.id}
                onClick={() => onSelectBooking(b.id)}
                className="bg-surface rounded-card border border-border/80 shadow-level-1 p-4 flex flex-col gap-3 cursor-pointer hover:border-primary/40 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-muted uppercase">
                      {b.id}
                    </span>
                    <h3 className="text-sm font-bold text-text mt-0.5">{b.salonName}</h3>
                    <p className="text-xs text-muted">
                      {b.services.map((s) => s.name).join(', ')}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-chip uppercase tracking-wider ${
                      b.status === 'upcoming'
                        ? 'bg-primary-soft text-primary'
                        : b.status === 'completed'
                        ? 'bg-success/15 text-success'
                        : 'bg-error/15 text-error'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Slot & Price */}
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <div className="flex items-center gap-3 text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-primary" /> {b.slot.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-primary" /> {b.slot.time}
                    </span>
                  </div>

                  <span className="font-bold text-text tabular-nums">
                    {formatMoney(b.totalPaise)}
                  </span>
                </div>

                {/* Cancellation notice */}
                {b.status === 'cancelled' && b.cancellation && (
                  <div className="text-[11px] text-error bg-error/10 p-2 rounded-button">
                    Cancelled: {b.cancellation.reason} • Refund: {formatMoney(b.cancellation.refundAmountPaise)}
                  </div>
                )}

                {/* Actions per status only */}
                <div
                  className="flex items-center justify-end gap-2 pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {b.status === 'upcoming' && (
                    <>
                      <button
                        onClick={() => setCancellingBooking(b)}
                        className="px-2.5 py-1 text-xs font-semibold text-error hover:bg-error/10 rounded-button transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      {canResched.allowed && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onReschedule(b)}
                        >
                          Reschedule
                        </Button>
                      )}
                    </>
                  )}

                  {b.status === 'completed' && (
                    <>
                      {!b.review && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setReviewingBooking(b)}
                        >
                          Review
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onRebook(b)}
                      >
                        Rebook
                      </Button>
                    </>
                  )}

                  <button
                    onClick={() => onSelectBooking(b.id)}
                    className="p-1.5 text-muted hover:text-text cursor-pointer ml-1"
                    aria-label="View details"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Cancel Modal */}
      {cancellingBooking && (
        <CancelBookingSheet
          isOpen={true}
          onClose={() => setCancellingBooking(null)}
          booking={cancellingBooking}
          onCancelled={() => {
            loadBookings();
            showToast('Booking cancelled.');
          }}
        />
      )}

      {/* Review Modal */}
      {reviewingBooking && (
        <WriteReviewModal
          isOpen={true}
          onClose={() => setReviewingBooking(null)}
          booking={reviewingBooking}
          onReviewSubmitted={() => {
            loadBookings();
          }}
        />
      )}
    </div>
  );
};
