import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  X,
  CheckCircle2,
  Sparkles,
  Clock3,
  History,
} from 'lucide-react';
import { CancelBookingSheet } from '../components/CancelBookingSheet';
import { WriteReviewModal } from '../components/WriteReviewModal';
import { PullToRefresh } from '../../../components/PullToRefresh';
import { useUIStore } from '../../../store/useUIStore';
import { useSessionStore } from '../../../store/useSessionStore';

type FilterTab = 'upcoming' | 'completed' | 'cancelled' | 'all';

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
  const [activeSegment, setActiveSegment] = useState<FilterTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
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

  const stats = useMemo(() => {
    const upcomingCount = bookings.filter(
      (b) => b.status === 'upcoming' || b.status === 'confirmed' || b.status === 'pending'
    ).length;
    const completedCount = bookings.filter((b) => b.status === 'completed').length;
    const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
    return {
      upcomingCount,
      completedCount,
      cancelledCount,
      totalCount: bookings.length,
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      // Tab filter
      if (activeSegment === 'upcoming') {
        const isUpcoming =
          b.status === 'upcoming' || b.status === 'confirmed' || b.status === 'pending' || b.status === 'in_progress';
        if (!isUpcoming) return false;
      } else if (activeSegment === 'completed') {
        if (b.status !== 'completed') return false;
      } else if (activeSegment === 'cancelled') {
        if (b.status !== 'cancelled') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const salonMatch = b.salonName.toLowerCase().includes(query);
        const serviceMatch = b.services.some((s) => s.name.toLowerCase().includes(query));
        const idMatch = b.id.toLowerCase().includes(query);
        if (!salonMatch && !serviceMatch && !idMatch) return false;
      }

      return true;
    });
  }, [bookings, activeSegment, searchQuery]);

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

  const renderStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'upcoming':
      case 'confirmed':
        return (
          <span
            data-testid="status-indicator-confirmed"
            className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-chip uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          >
            <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Confirmed</span>
          </span>
        );
      case 'completed':
        return (
          <span
            data-testid="status-indicator-completed"
            className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-chip uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
          >
            <Sparkles size={11} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span
            data-testid="status-indicator-cancelled"
            className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-chip uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          >
            <XCircle size={11} className="text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Cancelled</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-chip uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            <Clock3 size={11} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Pending</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-chip uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
            <Clock3 size={11} className="text-purple-600 dark:text-purple-400 shrink-0" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-chip uppercase tracking-wider bg-muted/20 text-muted">
            {status}
          </span>
        );
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex-1 pb-24 bg-bg text-text">
        {/* Top App Bar with Title & Stats */}
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 pt-3.5 pb-2.5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-lg font-bold text-text tracking-tight">My Bookings</h1>
              <p className="text-xs text-muted">
                Upcoming appointments & historical salon visit log
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary-soft/80 px-2.5 py-1 rounded-full border border-primary/20">
              <Calendar size={13} />
              <span>{stats.upcomingCount} Active</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-2.5 mb-2.5">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search salon, service, or booking ID..."
              className="w-full h-8.5 pl-8 pr-8 text-xs bg-bg border border-border/90 rounded-button focus:outline-hidden focus:border-primary transition-colors text-text placeholder:text-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter Tabs: Upcoming (Confirmed) / Completed (Log) / Cancelled / All */}
          <div className="h-9 p-0.5 rounded-button bg-muted/15 border border-border grid grid-cols-4 gap-1">
            {[
              { id: 'upcoming', label: 'Upcoming', count: stats.upcomingCount },
              { id: 'completed', label: 'Completed', count: stats.completedCount },
              { id: 'cancelled', label: 'Cancelled', count: stats.cancelledCount },
              { id: 'all', label: 'All Log', count: stats.totalCount },
            ].map((tab) => {
              const isActive = activeSegment === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSegment(tab.id as FilterTab)}
                  className={`h-full rounded-[8px] text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 px-1 truncate ${
                    isActive
                      ? 'bg-surface text-primary shadow-xs'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full font-extrabold ${
                      isActive
                        ? 'bg-primary-soft text-primary'
                        : 'bg-muted/20 text-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Quick Highlights Strip */}
        <div className="px-4 pt-3 pb-1 grid grid-cols-3 gap-2">
          <div
            onClick={() => setActiveSegment('upcoming')}
            className={`p-2.5 rounded-card border transition-all cursor-pointer ${
              activeSegment === 'upcoming'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                : 'bg-surface border-border text-muted hover:border-emerald-500/30'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Confirmed</span>
            </div>
            <div className="text-base font-extrabold text-text mt-0.5 tabular-nums">
              {stats.upcomingCount}
            </div>
            <span className="text-[10px] text-muted block truncate">Upcoming Slots</span>
          </div>

          <div
            onClick={() => setActiveSegment('completed')}
            className={`p-2.5 rounded-card border transition-all cursor-pointer ${
              activeSegment === 'completed'
                ? 'bg-blue-500/10 border-blue-500/40 text-blue-950 dark:text-blue-200'
                : 'bg-surface border-border text-muted hover:border-blue-500/30'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Completed</span>
            </div>
            <div className="text-base font-extrabold text-text mt-0.5 tabular-nums">
              {stats.completedCount}
            </div>
            <span className="text-[10px] text-muted block truncate">Salon Visits Log</span>
          </div>

          <div
            onClick={() => setActiveSegment('cancelled')}
            className={`p-2.5 rounded-card border transition-all cursor-pointer ${
              activeSegment === 'cancelled'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-200'
                : 'bg-surface border-border text-muted hover:border-rose-500/30'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>Cancelled</span>
            </div>
            <div className="text-base font-extrabold text-text mt-0.5 tabular-nums">
              {stats.cancelledCount}
            </div>
            <span className="text-[10px] text-muted block truncate">Refunded / Void</span>
          </div>
        </div>

        {/* Bookings List */}
        <main className="p-4 flex flex-col gap-3.5">
          {filtered.length === 0 ? (
            <EmptyState
              icon={
                activeSegment === 'completed' ? (
                  <History size={32} />
                ) : (
                  <CalendarCheck size={32} />
                )
              }
              title={
                searchQuery
                  ? 'No matching appointments found'
                  : activeSegment === 'completed'
                  ? 'No completed salon visits yet'
                  : activeSegment === 'cancelled'
                  ? 'No cancelled appointments'
                  : 'No upcoming appointments'
              }
              helperText={
                searchQuery
                  ? `No appointments matching "${searchQuery}". Try a different keyword.`
                  : activeSegment === 'completed'
                  ? 'Your historical salon visits and service reviews will appear here.'
                  : activeSegment === 'cancelled'
                  ? 'You have zero cancelled visits on your record.'
                  : 'You do not have any upcoming bookings at the moment. Ready for a new look?'
              }
              actionLabel={
                activeSegment === 'upcoming' || activeSegment === 'all'
                  ? 'Book a Salon Slot'
                  : undefined
              }
              onAction={
                activeSegment === 'upcoming' || activeSegment === 'all'
                  ? onExploreSalons
                  : undefined
              }
            />
          ) : (
            filtered.map((b) => {
              const canResched = bookingService.canReschedule(b);
              const isUpcoming = b.status === 'upcoming' || b.status === 'confirmed';
              const isCompleted = b.status === 'completed';
              const isCancelled = b.status === 'cancelled';

              const salonImageUrl =
                'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80';

              return (
                <div
                  key={b.id}
                  onClick={() => onSelectBooking(b.id)}
                  className="bg-surface rounded-card border border-border/80 shadow-level-1 p-4 flex flex-col gap-3.5 cursor-pointer hover:border-primary/40 transition-all"
                >
                  {/* Top Row: Salon Image, Name, Booking ID & Status Indicator */}
                  <div className="flex items-start gap-3">
                    <img
                      src={salonImageUrl}
                      alt={b.salonName}
                      className="w-14 h-14 rounded-button object-cover shrink-0 border border-border"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold text-muted uppercase truncate">
                          ID: {b.id}
                        </span>
                        {/* Status indicator: Confirmed, Completed, Cancelled */}
                        {renderStatusBadge(b.status)}
                      </div>

                      <h3 className="text-sm font-bold text-text truncate mt-1">
                        {b.salonName}
                      </h3>
                      <p className="text-xs text-muted truncate flex items-center gap-1 mt-0.5">
                        <Scissors size={12} className="text-primary shrink-0" />
                        <span>{b.services.map((s) => s.name).join(', ')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Visit Historical Log Details */}
                  {isCompleted && (
                    <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-button p-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-blue-600" />
                          <span>Visit Completed Successfully</span>
                        </span>
                        <span className="text-muted text-[10px]">
                          {b.slot.date} • {b.slot.time}
                        </span>
                      </div>

                      {/* Display Review Snippet if user has already reviewed */}
                      {b.review ? (
                        <div className="bg-surface/80 rounded-button p-2 border border-blue-200/40 flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={11}
                                className={
                                  i < b.review!.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-border'
                                }
                              />
                            ))}
                            <span className="text-[11px] font-bold text-text ml-1">
                              {b.review.rating}.0 Rated
                            </span>
                          </div>
                          {b.review.text && (
                            <p className="text-[11px] text-muted italic line-clamp-2">
                              "{b.review.text}"
                            </p>
                          )}
                          {b.review.tags && b.review.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {b.review.tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] font-semibold bg-bg text-muted px-1.5 py-0.5 rounded-chip"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[11px] text-muted pt-0.5">
                          <span>How was your salon visit?</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewingBooking(b);
                            }}
                            className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            <Star size={11} className="fill-primary" /> Leave a Review
                          </button>
                        </div>
                      )}
                    </div>
                  )}

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

                  {/* Salon Address snippet if present */}
                  {b.salonAddress && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted truncate">
                      <MapPin size={12} className="text-primary shrink-0" />
                      <span className="truncate">{b.salonAddress}</span>
                    </div>
                  )}

                  {/* Total Amount & Payment Badge */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted font-medium">Total Amount</span>
                    <span className="font-mono font-extrabold text-text text-sm tabular-nums">
                      {formatMoney(b.totalPaise)}
                    </span>
                  </div>

                  {/* Cancellation notice */}
                  {isCancelled && b.cancellation && (
                    <div className="text-[11px] text-error bg-error/10 p-2.5 rounded-button border border-error/20 flex flex-col gap-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>Cancelled: {b.cancellation.reason}</span>
                        <span className="text-success uppercase text-[10px]">
                          {b.cancellation.refundStatus || 'Refunded'}
                        </span>
                      </div>
                      <div className="text-muted text-[10px]">
                        Refund Amount:{' '}
                        <span className="font-mono font-bold text-text">
                          {formatMoney(b.cancellation.refundAmountPaise)}
                        </span>{' '}
                        ({b.cancellation.refundPercent}%)
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div
                    className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Get Directions (For upcoming appointments) */}
                    {isUpcoming && (
                      <button
                        onClick={() => handleGetDirections(b.salonName, b.salonAddress)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-text bg-bg border border-border hover:bg-border/40 rounded-button transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Navigation size={13} className="text-primary" /> Directions
                      </button>
                    )}

                    {/* Contact Salon (For upcoming appointments) */}
                    {isUpcoming && (
                      <button
                        onClick={() => handleContactSalon(b.salonName)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-text bg-bg border border-border hover:bg-border/40 rounded-button transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Phone size={13} className="text-primary" /> Call
                      </button>
                    )}

                    {/* Upcoming actions: Cancel & Reschedule */}
                    {isUpcoming && (
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

                    {/* Completed actions: Review & Rebook */}
                    {isCompleted && (
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

                    {/* Cancelled actions: Rebook */}
                    {isCancelled && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onRebook(b)}
                      >
                        Book Again
                      </Button>
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

