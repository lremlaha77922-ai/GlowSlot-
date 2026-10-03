import React, { useState, useEffect } from 'react';
import { Booking } from '../../../types';
import { bookingService } from '../../bookings/services/bookingService';
import { useSessionStore } from '../../../store/useSessionStore';
import { formatMoney } from '../../../utils/money';
import { EmptyState } from '../../../components/EmptyState';
import { PullToRefresh } from '../../../components/PullToRefresh';
import { useUIStore } from '../../../store/useUIStore';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Scissors,
  Building2,
  Home,
  Tag,
} from 'lucide-react';

interface BookingHistoryScreenProps {
  onBack: () => void;
  onSelectBooking?: (bookingId: string) => void;
  onRebook?: (booking: Booking) => void;
}

export const BookingHistoryScreen: React.FC<BookingHistoryScreenProps> = ({
  onBack,
  onSelectBooking,
  onRebook,
}) => {
  const { user } = useSessionStore();
  const { showToast } = useUIStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getBookings(user?.id);
      setBookings(data);
    } catch {
      showToast('Error loading booking history');
    } finally {
      setIsLoading(false);
    }
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

  const handleRefresh = async () => {
    await loadBookings();
    showToast('Booking history refreshed.');
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') return b.status === 'upcoming' || b.status === 'in_progress';
    if (activeFilter === 'completed') return b.status === 'completed';
    if (activeFilter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'upcoming':
      case 'confirmed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-chip border border-emerald-200">
            <CheckCircle2 size={11} className="text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-chip border border-amber-200">
            <Clock3 size={11} className="text-amber-600" />
            <span>In Progress</span>
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-chip border border-blue-200">
            <Sparkles size={11} className="text-blue-600" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-chip border border-stone-200">
            <XCircle size={11} className="text-stone-500" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-bg text-text pb-24">
        {/* Sticky Header */}
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
              <h1 className="text-sm font-bold text-text">Booking History</h1>
              <span className="text-[10px] text-muted block">
                {bookings.length} total appointments
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 max-w-lg mx-auto flex flex-col gap-4">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(
              [
                { id: 'all', label: 'All Appointments' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
              ] as const
            ).map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-chip text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface border-border text-muted hover:text-text'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-card border border-border p-4 h-32 animate-pulse"
                />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <EmptyState
              title="No appointments found"
              helperText={
                activeFilter === 'all'
                  ? 'You have no past or upcoming appointments yet.'
                  : `No ${activeFilter} appointments in your history.`
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectBooking?.(b.id)}
                  className="bg-surface rounded-card border border-border/80 p-4 flex flex-col gap-3 shadow-xs hover:border-primary/40 hover:shadow-level-1 transition-all cursor-pointer relative"
                >
                  {/* Top Bar: Booking Ref ID + Status Badge */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      {b.type === 'athome' ? (
                        <Home size={14} className="text-primary shrink-0" />
                      ) : (
                        <Building2 size={14} className="text-primary shrink-0" />
                      )}
                      <span className="text-xs font-extrabold font-mono text-text">
                        {b.id}
                      </span>
                    </div>

                    {getStatusBadge(b.status)}
                  </div>

                  {/* Salon Details */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-text">{b.salonName}</h3>
                      {b.salonAddress && (
                        <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="shrink-0" />
                          <span className="truncate max-w-[200px]">{b.salonAddress}</span>
                        </p>
                      )}
                    </div>

                    <span className="text-xs font-extrabold text-primary tabular-nums">
                      {formatMoney(b.totalPaise)}
                    </span>
                  </div>

                  {/* Services Summary */}
                  <div className="bg-bg/60 p-2.5 rounded-button border border-border/50 flex flex-col gap-1 text-[11px]">
                    {b.services.map((srv, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-text font-medium flex items-center gap-1.5">
                          <Scissors size={11} className="text-primary/70 shrink-0" />
                          <span>{srv.name}</span>
                        </span>
                        <span className="text-muted tabular-nums">{formatMoney(srv.price)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Slot Date & Time */}
                  <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                    <div className="flex items-center gap-1 font-semibold text-text">
                      <Calendar size={12} className="text-primary" />
                      <span>{b.slot.date}</span>
                      <span>•</span>
                      <Clock size={12} className="text-primary" />
                      <span>{b.slot.time}</span>
                    </div>

                    {b.status === 'completed' && onRebook && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRebook(b);
                        }}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        <span>Rebook</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </PullToRefresh>
  );
};
