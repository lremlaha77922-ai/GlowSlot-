import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SlotItem, SlotStatus } from '../../../types';
import { slotService } from '../services/slotService';
import { formatMoney } from '../../../utils/money';
import { Skeleton } from '../../../components/Skeleton';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Lock,
  Sparkles,
  Zap,
  Filter,
} from 'lucide-react';

export type CalendarViewMode = 'day' | 'week';

export interface CalendarSlotAvailabilityProps {
  salonId: string;
  serviceId: string;
  serviceName?: string;
  basePricePaise: number;
  userId?: string;
  selectedSlot: SlotItem | null;
  onSelectSlot: (slot: SlotItem) => void;
  initialDate?: string; // YYYY-MM-DD
  initialMode?: CalendarViewMode;
  onDateChange?: (dateStr: string) => void;
  className?: string;
}

export interface DayOverview {
  dateStr: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  slots: SlotItem[];
  availableCount: number;
  freeSlotsCount: number;
  lowestPricePaise: number;
  isLoading: boolean;
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatIsoDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseIsoDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const CalendarSlotAvailability: React.FC<CalendarSlotAvailabilityProps> = ({
  salonId,
  serviceId,
  serviceName,
  basePricePaise,
  userId,
  selectedSlot,
  onSelectSlot,
  initialDate,
  initialMode = 'day',
  onDateChange,
  className = '',
}) => {
  const [mode, setMode] = useState<CalendarViewMode>(initialMode);
  const todayStr = useMemo(() => formatIsoDate(new Date()), []);
  const [activeDate, setActiveDate] = useState<string>(initialDate || todayStr);

  // Time-of-day filter: all, morning (8-12), afternoon (12-16), evening (16-20)
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  // Day slots cache
  const [daySlotsMap, setDaySlotsMap] = useState<Record<string, SlotItem[]>>({});
  const [loadingDates, setLoadingDates] = useState<Record<string, boolean>>({});

  // Realtime update triggers
  const [updateTick, setUpdateTick] = useState(0);

  // Notify parent of date change
  const handleDateSelect = (dateStr: string) => {
    setActiveDate(dateStr);
    onDateChange?.(dateStr);
  };

  // Compute 7 days for the current week starting from activeDate (or active week anchor)
  const weekDates = useMemo(() => {
    const active = parseIsoDate(activeDate);
    // Anchor week to start on current active date or beginning of week?
    // In appointment apps, showing activeDate to next 6 days (rolling 7 days) is most intuitive and avoids past dates
    const dates: { dateStr: string; dayName: string; dayNumber: number; monthName: string; isToday: boolean }[] = [];
    
    // Find monday of activeDate's week for standard week view, or 7-day rolling window
    // Standard week: Sunday/Monday to Saturday/Sunday or 7 consecutive days starting from Monday
    const dayOfWeek = active.getDay(); // 0 is Sunday
    // Let's create a 7-day block starting from Monday (or Sunday if Indian preference)
    const startOfWeek = new Date(active);
    const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Monday start
    startOfWeek.setDate(active.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const str = formatIsoDate(d);
      dates.push({
        dateStr: str,
        dayName: DAYS_SHORT[d.getDay()],
        dayNumber: d.getDate(),
        monthName: MONTHS_SHORT[d.getMonth()],
        isToday: str === todayStr,
      });
    }
    return dates;
  }, [activeDate, todayStr]);

  // Fetch slots for a single date
  const loadDateSlots = useCallback(
    async (dateStr: string) => {
      setLoadingDates((prev) => ({ ...prev, [dateStr]: true }));
      try {
        const slots = await slotService.listByDay(salonId, serviceId, dateStr, basePricePaise, userId);
        setDaySlotsMap((prev) => ({ ...prev, [dateStr]: slots }));
      } catch (err) {
        console.error('Failed to load slots for', dateStr, err);
      } finally {
        setLoadingDates((prev) => ({ ...prev, [dateStr]: false }));
      }
    },
    [salonId, serviceId, basePricePaise, userId]
  );

  // When activeDate changes or mode changes, load relevant dates
  useEffect(() => {
    if (mode === 'day') {
      loadDateSlots(activeDate);
    } else {
      // In week mode, fetch all 7 dates in parallel
      weekDates.forEach((wd) => {
        loadDateSlots(wd.dateStr);
      });
    }
  }, [activeDate, mode, weekDates, loadDateSlots, updateTick]);

  // Realtime subscription for activeDate
  useEffect(() => {
    const sub = slotService.subscribeToSlots(salonId, activeDate, () => {
      setUpdateTick((t) => t + 1);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [salonId, activeDate]);

  // Navigate dates
  const handlePrev = () => {
    const current = parseIsoDate(activeDate);
    if (mode === 'day') {
      current.setDate(current.getDate() - 1);
      handleDateSelect(formatIsoDate(current));
    } else {
      current.setDate(current.getDate() - 7);
      handleDateSelect(formatIsoDate(current));
    }
  };

  const handleNext = () => {
    const current = parseIsoDate(activeDate);
    if (mode === 'day') {
      current.setDate(current.getDate() + 1);
      handleDateSelect(formatIsoDate(current));
    } else {
      current.setDate(current.getDate() + 7);
      handleDateSelect(formatIsoDate(current));
    }
  };

  const handleJumpToToday = () => {
    handleDateSelect(todayStr);
  };

  // Filter slots by morning / afternoon / evening
  const filterSlotList = (slots: SlotItem[] = []) => {
    if (timeFilter === 'all') return slots;
    return slots.filter((slot) => {
      const hour = parseInt(slot.time.split(':')[0], 10);
      if (timeFilter === 'morning') return hour >= 8 && hour < 12;
      if (timeFilter === 'afternoon') return hour >= 12 && hour < 16;
      if (timeFilter === 'evening') return hour >= 16 && hour <= 20;
      return true;
    });
  };

  // Day view data
  const currentDaySlots = daySlotsMap[activeDate] || [];
  const isCurrentDayLoading = !!loadingDates[activeDate] && currentDaySlots.length === 0;
  const filteredCurrentDaySlots = useMemo(() => filterSlotList(currentDaySlots), [currentDaySlots, timeFilter]);

  // Week overview metrics
  const weekOverviews: DayOverview[] = useMemo(() => {
    return weekDates.map((wd) => {
      const slots = daySlotsMap[wd.dateStr] || [];
      const available = slots.filter((s) => s.status === 'available');
      const free = slots.filter((s) => s.isFree && s.status === 'available');
      const lowest = available.reduce(
        (min, s) => (s.price < min ? s.price : min),
        available.length > 0 ? available[0].price : basePricePaise
      );

      return {
        ...wd,
        slots,
        availableCount: available.length,
        freeSlotsCount: free.length,
        lowestPricePaise: available.length > 0 ? lowest : basePricePaise,
        isLoading: !!loadingDates[wd.dateStr] && slots.length === 0,
      };
    });
  }, [weekDates, daySlotsMap, loadingDates, basePricePaise]);

  // Format header title
  const activeDateObj = useMemo(() => parseIsoDate(activeDate), [activeDate]);
  const formattedActiveDateTitle = useMemo(() => {
    return `${activeDateObj.getDate()} ${MONTHS_SHORT[activeDateObj.getMonth()]} ${activeDateObj.getFullYear()} (${DAYS_SHORT[activeDateObj.getDay()]})`;
  }, [activeDateObj]);

  const weekRangeTitle = useMemo(() => {
    const first = weekDates[0];
    const last = weekDates[6];
    return `${first.dayNumber} ${first.monthName} – ${last.dayNumber} ${last.monthName}`;
  }, [weekDates]);

  return (
    <div className={`calendar-slot-availability bg-surface rounded-card border border-border overflow-hidden shadow-level-1 ${className}`}>
      {/* Top Header: Title, Realtime pulse & Day/Week Toggle */}
      <div className="p-3.5 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center">
            <CalendarIcon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                Availability Calendar
              </h3>
              <span className="flex items-center gap-1 text-[10px] text-success font-semibold px-1.5 py-0.5 rounded-full bg-success/10" title="Live slot availability sync">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Live
              </span>
            </div>
            {serviceName && (
              <p className="text-[11px] text-muted truncate max-w-[200px] mt-0.5">
                {serviceName}
              </p>
            )}
          </div>
        </div>

        {/* Day / Week View Mode Switcher */}
        <div className="flex items-center bg-bg p-0.5 rounded-button border border-border" role="tablist" aria-label="Calendar view selector">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'day'}
            onClick={() => setMode('day')}
            className={`px-3 py-1 text-xs font-bold rounded-button transition-all cursor-pointer ${
              mode === 'day'
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted hover:text-text'
            }`}
          >
            Day View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'week'}
            onClick={() => setMode('week')}
            className={`px-3 py-1 text-xs font-bold rounded-button transition-all cursor-pointer ${
              mode === 'week'
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted hover:text-text'
            }`}
          >
            Week View
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="px-3.5 py-2.5 bg-surface/70 border-b border-border/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 rounded-full text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer"
            aria-label="Previous day or week"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-xs font-bold text-text tabular-nums">
            {mode === 'day' ? formattedActiveDateTitle : weekRangeTitle}
          </span>

          <button
            type="button"
            onClick={handleNext}
            className="p-1 rounded-full text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer"
            aria-label="Next day or week"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleJumpToToday}
          className={`text-[11px] font-bold px-2 py-1 rounded-button border transition-colors cursor-pointer ${
            activeDate === todayStr
              ? 'bg-primary-soft text-primary border-primary/40'
              : 'bg-bg text-muted border-border hover:text-text'
          }`}
        >
          Today
        </button>
      </div>

      {/* ========================================================= */}
      {/* WEEK VIEW MODE */}
      {/* ========================================================= */}
      {mode === 'week' && (
        <div className="p-3.5 space-y-3">
          {/* Week Horizontal Summary Strips */}
          <div className="grid grid-cols-7 gap-1.5">
            {weekOverviews.map((day) => {
              const isSelectedDay = day.dateStr === activeDate;
              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => handleDateSelect(day.dateStr)}
                  className={`p-2 rounded-card border flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                    isSelectedDay
                      ? 'border-primary bg-primary-soft ring-1 ring-primary/40'
                      : 'border-border bg-bg/60 hover:bg-bg hover:border-primary/40'
                  }`}
                  aria-pressed={isSelectedDay}
                >
                  <span className={`text-[10px] font-semibold uppercase ${isSelectedDay ? 'text-primary' : 'text-muted'}`}>
                    {day.dayName}
                  </span>
                  <span className={`text-sm font-bold my-0.5 ${isSelectedDay ? 'text-primary' : 'text-text'}`}>
                    {day.dayNumber}
                  </span>

                  {day.isLoading ? (
                    <span className="text-[9px] text-muted animate-pulse">...</span>
                  ) : day.availableCount > 0 ? (
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-bold text-success">
                        {day.availableCount} slots
                      </span>
                      {day.freeSlotsCount > 0 && (
                        <span className="text-[8px] font-extrabold text-white bg-teal-600 px-1 rounded-chip mt-0.5">
                          FREE
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[9px] text-muted">Full</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Week Overview Details for Active Day */}
          <div className="p-3 bg-bg/50 rounded-card border border-border/80">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text">
                  Slots for {formattedActiveDateTitle}
                </span>
                <span className="text-[10px] text-muted">
                  ({(daySlotsMap[activeDate] || []).filter((s) => s.status === 'available').length} available)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMode('day')}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Switch to Day Grid →
              </button>
            </div>

            {/* Quick Time Chips for selected day in week view */}
            {isCurrentDayLoading ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" radius="button" />
                ))}
              </div>
            ) : currentDaySlots.length === 0 ? (
              <div className="text-center py-6 text-muted text-xs">
                No slots available on this date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                {currentDaySlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const isBooked = slot.status === 'booked';
                  const isHeldOthers = slot.status === 'held_by_others';
                  const isFree = slot.isFree;
                  const isPeak = slot.isPeak && !isFree && !isBooked && !isHeldOthers;

                  return (
                    <SlotCellButton
                      key={slot.id}
                      slot={slot}
                      isSelected={isSelected}
                      isBooked={isBooked}
                      isHeldOthers={isHeldOthers}
                      isFree={isFree}
                      isPeak={isPeak}
                      onSelectSlot={onSelectSlot}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DAY VIEW MODE */}
      {/* ========================================================= */}
      {mode === 'day' && (
        <div className="p-3.5 space-y-3">
          {/* Day View Filters: Morning, Afternoon, Evening */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1 mr-1">
                <Filter size={11} /> Filter:
              </span>
              {(['all', 'morning', 'afternoon', 'evening'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setTimeFilter(filterKey)}
                  className={`px-2.5 py-1 rounded-chip text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                    timeFilter === filterKey
                      ? 'bg-primary text-white font-bold'
                      : 'bg-bg text-muted border border-border hover:text-text'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-muted font-medium shrink-0">
              {filteredCurrentDaySlots.filter((s) => s.status === 'available').length} slots open
            </span>
          </div>

          {/* Slots 3-Column Grid */}
          {isCurrentDayLoading ? (
            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" radius="button" />
              ))}
            </div>
          ) : filteredCurrentDaySlots.length === 0 ? (
            <div className="text-center py-10 bg-bg/40 rounded-card border border-dashed border-border text-muted text-xs">
              <Clock size={24} className="mx-auto mb-2 opacity-40" />
              No slots match the selected time filter on this date.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {filteredCurrentDaySlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const isBooked = slot.status === 'booked';
                const isHeldOthers = slot.status === 'held_by_others';
                const isFree = slot.isFree;
                const isPeak = slot.isPeak && !isFree && !isBooked && !isHeldOthers;

                return (
                  <SlotCellButton
                    key={slot.id}
                    slot={slot}
                    isSelected={isSelected}
                    isBooked={isBooked}
                    isHeldOthers={isHeldOthers}
                    isFree={isFree}
                    isPeak={isPeak}
                    onSelectSlot={onSelectSlot}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Availability Status Legend footer */}
      <div className="px-3.5 py-2.5 bg-surface/90 border-t border-border flex items-center justify-between text-[11px] text-muted overflow-x-auto no-scrollbar gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-surface border border-border" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-primary text-white" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-600" />
          <span>Free Slot</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-accent" />
          <span>Peak Price</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-bg border border-border opacity-50" />
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

// Internal Subcomponent for Individual Slot Cell Button
interface SlotCellButtonProps {
  slot: SlotItem;
  isSelected: boolean;
  isBooked: boolean;
  isHeldOthers: boolean;
  isFree: boolean;
  isPeak: boolean;
  onSelectSlot: (slot: SlotItem) => void;
}

const SlotCellButton: React.FC<SlotCellButtonProps> = ({
  slot,
  isSelected,
  isBooked,
  isHeldOthers,
  isFree,
  isPeak,
  onSelectSlot,
}) => {
  const accessibilityLabel = `${slot.time}, ${
    isFree ? 'Free' : formatMoney(slot.price)
  }, ${isPeak ? 'peak price' : ''}, ${
    isBooked
      ? 'fully booked'
      : isHeldOthers
      ? 'held by another user'
      : isSelected
      ? 'selected'
      : 'available'
  }`;

  if (isBooked) {
    return (
      <div
        className="h-14 min-h-[48px] rounded-button bg-bg border border-border/60 flex flex-col items-center justify-center p-1.5 opacity-50 cursor-not-allowed select-none"
        aria-label={accessibilityLabel}
        aria-disabled="true"
      >
        <span className="text-xs font-semibold text-muted line-through">
          {slot.time}
        </span>
        <span className="text-[10px] text-muted">Booked</span>
      </div>
    );
  }

  if (isHeldOthers) {
    return (
      <div
        className="h-14 min-h-[48px] rounded-button bg-muted/10 border border-border/60 flex flex-col items-center justify-center p-1.5 cursor-not-allowed select-none"
        aria-label={accessibilityLabel}
        aria-disabled="true"
      >
        <div className="flex items-center gap-1 text-muted text-xs font-semibold">
          <Lock size={10} />
          <span>{slot.time}</span>
        </div>
        <span className="text-[9px] text-muted mt-0.5">Held</span>
      </div>
    );
  }

  if (isFree) {
    return (
      <button
        type="button"
        onClick={() => onSelectSlot(slot)}
        className={`h-14 min-h-[48px] rounded-button p-1.5 flex flex-col items-center justify-center transition-all cursor-pointer relative shadow-sm ${
          isSelected
            ? 'border-2 border-white ring-2 ring-primary'
            : 'border border-emerald-500/40 hover:opacity-95'
        } bg-gradient-to-r from-emerald-600 to-teal-600 text-white`}
        aria-label={accessibilityLabel}
      >
        {isSelected && (
          <span className="absolute top-1 left-1 bg-white text-emerald-600 rounded-full p-0.5">
            <Check size={9} strokeWidth={3} />
          </span>
        )}
        <span className="text-xs font-bold leading-none">{slot.time}</span>
        <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider bg-white/20 px-1.5 py-0.5 rounded-chip">
          Free Slot
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectSlot(slot)}
      className={`h-14 min-h-[48px] rounded-button p-1.5 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
        isSelected
          ? 'bg-primary-soft border-2 border-primary shadow-xs'
          : 'bg-surface border border-border shadow-xs hover:border-primary/50'
      }`}
      aria-label={accessibilityLabel}
    >
      {isSelected && (
        <span className="absolute top-1 left-1 bg-primary text-white rounded-full p-0.5">
          <Check size={9} strokeWidth={3} />
        </span>
      )}
      <span
        className={`text-xs font-bold leading-none ${
          isSelected ? 'text-primary' : 'text-text'
        }`}
      >
        {slot.time}
      </span>

      {isPeak ? (
        <span className="text-[10px] font-bold text-white bg-accent px-1.5 py-0.5 rounded-[4px] mt-1 tabular-nums">
          {formatMoney(slot.price)}
        </span>
      ) : (
        <span
          className={`text-[11px] font-semibold mt-1 tabular-nums ${
            isSelected ? 'text-primary' : 'text-muted'
          }`}
        >
          {formatMoney(slot.price)}
        </span>
      )}
    </button>
  );
};
