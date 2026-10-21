import React, { useState, useEffect } from 'react';
import { Booking } from '../../../types';
import { bookingService } from '../../bookings/services/bookingService';
import { useSessionStore } from '../../../store/useSessionStore';
import { formatMoney } from '../../../utils/money';
import {
  Calendar,
  Clock,
  RotateCcw,
  ChevronRight,
  MapPin,
  Sparkles,
  Scissors,
  CheckCircle2,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface AppointmentHistorySectionProps {
  onViewAllHistory: () => void;
  onSelectBooking: (bookingId: string) => void;
  onRebookVisit: (booking: Booking) => void;
  onRebookService: (
    booking: Booking,
    service: { name: string; durationMin: number; price: number }
  ) => void;
  onExploreSalons?: () => void;
  onWalletPoints?: () => void;
}

interface FavoriteServiceAggregate {
  serviceName: string;
  durationMin: number;
  lastPrice: number;
  salonName: string;
  sourceBooking: Booking;
  timesBooked: number;
}

export const AppointmentHistorySection: React.FC<AppointmentHistorySectionProps> = ({
  onViewAllHistory,
  onSelectBooking,
  onRebookVisit,
  onRebookService,
  onExploreSalons,
  onWalletPoints,
}) => {
  const { user } = useSessionStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const data = await bookingService.getBookings(user?.id);
        if (isMounted) {
          setBookings(data);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBookings();

    if (user?.id) {
      const sub = bookingService.subscribeToBookings(user.id, () => {
        fetchBookings();
      });
      return () => {
        isMounted = false;
        sub.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Filter completed and past visits
  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'confirmed'
  );

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const completedBookingsCount = completedBookings.length;
  const pointsEarnedFromBookings = completedBookings.reduce(
    (acc, b) => acc + Math.floor(b.totalPaise / 10000),
    0
  );

  // Extract past favorite services for 1-tap rebooking
  const favoriteServices: FavoriteServiceAggregate[] = React.useMemo(() => {
    const serviceMap = new Map<string, FavoriteServiceAggregate>();

    pastBookings.forEach((b) => {
      b.services.forEach((srv) => {
        const key = srv.name.toLowerCase().trim();
        const existing = serviceMap.get(key);
        if (existing) {
          existing.timesBooked += 1;
          existing.lastPrice = srv.price;
          existing.salonName = b.salonName;
          existing.sourceBooking = b;
        } else {
          serviceMap.set(key, {
            serviceName: srv.name,
            durationMin: srv.durationMin,
            lastPrice: srv.price,
            salonName: b.salonName,
            sourceBooking: b,
            timesBooked: 1,
          });
        }
      });
    });

    return Array.from(serviceMap.values())
      .sort((a, b) => b.timesBooked - a.timesBooked)
      .slice(0, 4);
  }, [pastBookings]);

  const recentVisits = pastBookings.slice(0, 2);

  return (
    <div className="bg-surface rounded-card border border-border/80 shadow-level-1 overflow-hidden flex flex-col gap-3 p-4">
      {/* Loyalty Points Earned from Completed Bookings Card */}
      <div className="bg-gradient-to-r from-deal/15 via-primary/10 to-primary/5 border border-deal/30 rounded-card p-3 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-deal/20 text-deal flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-text">
                {user?.points ?? 120} Loyalty Points
              </span>
              <span className="text-[10px] font-bold text-deal bg-deal/15 px-1.5 py-0.2 rounded-chip">
                +{pointsEarnedFromBookings || 50} Earned
              </span>
            </div>
            <span className="text-[11px] text-muted leading-tight mt-0.5">
              Earned from {completedBookingsCount || 2} completed salon visit{completedBookingsCount === 1 ? '' : 's'} (1 pt / ₹100)
            </span>
          </div>
        </div>

        {onWalletPoints && (
          <button
            onClick={onWalletPoints}
            className="h-7 px-3 rounded-button bg-surface border border-border text-xs font-bold text-primary hover:bg-primary-soft/50 transition-colors shrink-0 shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <span>Wallet</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* Header with Title & View All Link */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-button bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Calendar size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">
              Appointment History
            </h3>
            <span className="text-[11px] text-muted block">
              Track past visits & rebook favorite services
            </span>
          </div>
        </div>

        <button
          onClick={onViewAllHistory}
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-0.5 cursor-pointer py-1 px-2 rounded-button hover:bg-primary-soft/50 transition-colors"
          aria-label="View all appointment history"
        >
          <span>View All</span>
          {pastBookings.length > 0 && (
            <span className="text-[10px] font-bold text-muted ml-0.5">
              ({pastBookings.length})
            </span>
          )}
          <ChevronRight size={14} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2.5 py-2">
          <div className="h-16 rounded-card bg-muted/10 animate-pulse" />
          <div className="h-20 rounded-card bg-muted/10 animate-pulse" />
        </div>
      ) : pastBookings.length === 0 ? (
        /* Empty State */
        <div className="py-6 px-4 text-center flex flex-col items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text">No past salon visits yet</h4>
            <p className="text-[11px] text-muted max-w-xs mx-auto mt-0.5">
              Completed appointments will appear here with 1-click rebooking for your favorite stylists & services.
            </p>
          </div>
          {onExploreSalons && (
            <button
              onClick={onExploreSalons}
              className="mt-1 h-8 px-4 rounded-button bg-primary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover transition-colors shadow-xs cursor-pointer"
            >
              <span>Explore Top Salons</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {/* Quick Rebook Favorites Strip */}
          {favoriteServices.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-muted uppercase tracking-wider">
                <span className="flex items-center gap-1 text-text">
                  <Sparkles size={12} className="text-primary" />
                  <span>Rebook Favorite Services</span>
                </span>
                <span className="text-[10px] font-medium text-muted lowercase">
                  1-tap slot picker
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {favoriteServices.map((fav, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-button bg-bg border border-border/80 flex items-center justify-between gap-2 hover:border-primary/50 transition-all shadow-2xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-text truncate">
                        {fav.serviceName}
                      </div>
                      <div className="text-[10px] text-muted flex items-center gap-1.5 mt-0.5">
                        <span className="truncate max-w-[110px]">{fav.salonName}</span>
                        <span>·</span>
                        <span className="tabular-nums font-semibold text-text">
                          {formatMoney(fav.lastPrice)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        onRebookService(fav.sourceBooking, {
                          name: fav.serviceName,
                          durationMin: fav.durationMin,
                          price: fav.lastPrice,
                        })
                      }
                      className="h-7 px-2.5 rounded-button bg-primary text-white text-[11px] font-bold flex items-center gap-1 hover:bg-primary-hover transition-colors shrink-0 shadow-2xs cursor-pointer"
                      title={`Rebook ${fav.serviceName}`}
                      aria-label={`Rebook ${fav.serviceName}`}
                    >
                      <RotateCcw size={10} />
                      <span>Rebook</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Past Visits List */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-text uppercase tracking-wider">
              Recent Salon Visits
            </span>

            <div className="flex flex-col gap-2.5">
              {recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  onClick={() => onSelectBooking(visit.id)}
                  className="p-3 rounded-button bg-bg border border-border hover:border-primary/40 transition-all cursor-pointer flex flex-col gap-2 shadow-2xs"
                >
                  {/* Top Line: Salon Name, Date & Price */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-primary shrink-0" />
                        <h4 className="text-xs font-bold text-text hover:text-primary transition-colors">
                          {visit.salonName}
                        </h4>
                      </div>
                      {visit.salonAddress && (
                        <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5 pl-4">
                          <MapPin size={10} className="shrink-0" />
                          <span className="truncate max-w-[210px]">{visit.salonAddress}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-primary tabular-nums block">
                        {formatMoney(visit.totalPaise)}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 justify-end">
                        <CheckCircle2 size={10} />
                        <span>Completed</span>
                      </span>
                    </div>
                  </div>

                  {/* Services Taken */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/50 text-[11px]">
                    {visit.services.map((srv, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 text-[10px] text-text font-medium bg-surface px-2 py-0.5 rounded-button border border-border/80"
                      >
                        <Scissors size={10} className="text-muted" />
                        <span>{srv.name}</span>
                      </span>
                    ))}
                  </div>

                  {/* Bottom Line: Date/Time + Rebook Visit Button */}
                  <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                    <div className="flex items-center gap-1 text-[10px] font-medium text-muted">
                      <Clock size={11} className="text-muted" />
                      <span>
                        {visit.slot.date} · {visit.slot.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRebookVisit(visit);
                        }}
                        className="h-6 px-2.5 rounded-button bg-primary/10 hover:bg-primary text-primary hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        aria-label={`Rebook visit at ${visit.salonName}`}
                      >
                        <RotateCcw size={10} />
                        <span>Rebook Visit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
