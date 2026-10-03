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
  Navigation,
  Phone,
  Scissors,
  UserCheck,
  CreditCard,
} from 'lucide-react';
import { CancelBookingSheet } from '../components/CancelBookingSheet';
import { WriteReviewModal } from '../components/WriteReviewModal';
import { PullToRefresh } from '../../../components/PullToRefresh';
import { useUIStore } from '../../../store/useUIStore';
import { useSessionStore } from '../../../store/useSessionStore';

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

  const { user } = useSessionStore();
  const { showToast } = useUIStore();

  const loadBookings = async () => {
    const list = await bookingService.getBookings(user?.id);
    setBookings(list);
  };

  useEffect(() => {
    loadBookings();

    if (user?.id) {
      const sub = bookingService.subscribeToBookings(user.id, () => {
        loadBookings();
      });
      return () => {
        sub.unsubscribe();
      };
    }
  }, [user?.id]);

  const filtered = bookings.filter((b) => b.status === activeSegment);

  const handleRefresh = async () => {
    await loadBookings();
    showToast('Bookings updated.');
  };

  const handleGetDirections = (salonName: string, salonAddress?: string) => {
    const address = salonAddress || salonName || 'Bengaluru';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const handleContactSalon = (salonName: string) => {
    showToast(`Connecting to ${salonName} front desk...`);
    window.location.href = `tel:+919876543210`;
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex-1 pb-24 bg-bg text-text">
        {/* Top App Bar with 4 Tabs */}
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 pt-3 pb-2.5">
          <h1 className="text-base font-bold text-text mb-3">Appointments & Bookings</h1>

          {/* 4 Tabs: Upcoming / Pending / Completed / Cancelled */}
          <div className="h-9 p-0.5 rounded-button bg-muted/15 border border-border grid grid-cols-4 gap-1">
            {(['upcoming', 'pending', 'completed', 'cancelled'] as const).map((seg) => {
              const isActive = activeSegment === seg;
              return (
                <button
                  key={seg}
                  onClick={() => setActiveSegment(seg)}
                  className={`h-full rounded-[8px] text-[11px] font-bold capitalize transition-all cursor-pointer truncate px-1 ${
                    isActive
                      ? 'bg-surface text-primary shadow-xs'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  {seg}
                </button>
              );
            })}
          </div>
        </header>

        {/* Bookings List */}
        <main className="p-4 flex flex-col gap-3">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck size={32} />}
              title={`No ${activeSegment} appointments`}
              helperText={`You don't have any ${activeSegment} bookings at the moment.`}
              actionLabel={activeSegment === 'upcoming' || activeSegment === 'pending' ? 'Book a Salon Slot' : undefined}
              onAction={activeSegment === 'upcoming' || activeSegment === 'pending' ? onExploreSalons : undefined}
            />
          ) : (
            filtered.map((b) => {
              const canResched = bookingService.canReschedule(b);
              const salonImageUrl =
                'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80';

              return (
                <div
                  key={b.id}
                  onClick={() => onSelectBooking(b.id)}
                  className="bg-surface rounded-card border border-border/80 shadow-level-1 p-4 flex flex-col gap-3.5 cursor-pointer hover:border-primary/40 transition-all"
                >
                  {/* Top Row: Salon Image, Name, Booking ID & Status */}
                  <div className="flex items-start gap-3">
                    <img
                      src={salonImageUrl}
                      alt={b.salonName}
                      className="w-14 h-14 rounded-button object-cover shrink-0 border border-border"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-muted uppercase">
                          ID: {b.id}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-chip uppercase tracking-wider ${
                            b.status === 'upcoming'
                              ? 'bg-primary-soft text-primary'
                              : b.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : b.status === 'completed'
                              ? 'bg-success/15 text-success'
                              : 'bg-error/15 text-error'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-text truncate mt-0.5">{b.salonName}</h3>
                      <p className="text-xs text-muted truncate flex items-center gap-1 mt-0.5">
                        <Scissors size={12} className="text-primary shrink-0" />
                        <span>{b.services.map((s) => s.name).join(', ')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Details Grid: Staff, Date, Time, Payment & Amount */}
                  <div className="grid grid-cols-2 gap-2 bg-bg p-2.5 rounded-button border border-border/60 text-xs">
                    <div className="flex items-center gap-1.5 text-muted">
                      <UserCheck size={13} className="text-primary shrink-0" />
                      <span className="truncate">Staff: Any Specialist</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted justify-end">
                      <CreditCard size={13} className="text-primary shrink-0" />
                      <span className="capitalize font-semibold text-text">
                        Payment: {b.paymentStatus || 'paid'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted">
                      <Calendar size={13} className="text-primary shrink-0" />
                      <span>{b.slot.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted justify-end">
                      <Clock size={13} className="text-primary shrink-0" />
                      <span>{b.slot.time}</span>
                    </div>
                  </div>

                  {/* Total Amount & Payment Badge */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted font-medium">Total Amount Payable</span>
                    <span className="font-mono font-extrabold text-text text-sm tabular-nums">
                      {formatMoney(b.totalPaise)}
                    </span>
                  </div>

                  {/* Cancellation notice */}
                  {b.status === 'cancelled' && b.cancellation && (
                    <div className="text-[11px] text-error bg-error/10 p-2 rounded-button">
                      Cancelled: {b.cancellation.reason} • Refunded: {formatMoney(b.cancellation.refundAmountPaise)}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div
                    className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Get Directions */}
                    <button
                      onClick={() => handleGetDirections(b.salonName, b.salonAddress)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-text bg-bg border border-border hover:bg-border/40 rounded-button transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation size={13} className="text-primary" /> Directions
                    </button>

                    {/* Contact Salon */}
                    <button
                      onClick={() => handleContactSalon(b.salonName)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-text bg-bg border border-border hover:bg-border/40 rounded-button transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Phone size={13} className="text-primary" /> Call Salon
                    </button>

                    {b.status === 'upcoming' && (
                      <>
                        <button
                          onClick={() => setCancellingBooking(b)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-error hover:bg-error/10 rounded-button transition-colors cursor-pointer"
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

                    {/* View Details */}
                    <button
                      onClick={() => onSelectBooking(b.id)}
                      className="px-2.5 py-1.5 text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer ml-auto"
                    >
                      Details <ChevronRight size={14} />
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
    </PullToRefresh>
  );
};
