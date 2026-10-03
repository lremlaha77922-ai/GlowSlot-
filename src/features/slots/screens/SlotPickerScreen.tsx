import React, { useState, useEffect } from 'react';
import { Salon, SlotItem } from '../../../types';
import { getNext7Days } from '../../../data/mockData';
import { slotService } from '../services/slotService';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { Skeleton } from '../../../components/Skeleton';
import { useSessionStore } from '../../../store/useSessionStore';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Check,
  Lock,
  Timer,
  Info,
} from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';

interface SlotPickerScreenProps {
  salon: Salon;
  service: {
    id: string;
    name: string;
    durationMin: number;
    basePrice: number;
  };
  onBack: () => void;
  onContinue: (slot: SlotItem, salon: Salon, service: { id: string; name: string; durationMin: number; basePrice: number }) => void;
}

export const SlotPickerScreen: React.FC<SlotPickerScreenProps> = ({
  salon,
  service,
  onBack,
  onContinue,
}) => {
  const dates = getNext7Days();
  const [selectedDate, setSelectedDate] = useState(dates[0].dateStr);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { user } = useSessionStore();

  // 5-minute hold timer state follows held_until from server
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState<number | null>(null);

  const { showToast } = useUIStore();

  const fetchSlots = async () => {
    setIsLoading(true);
    const items = await slotService.listByDay(
      salon.id,
      service.id,
      selectedDate,
      service.basePrice,
      user?.id
    );
    setSlots(items);
    setIsLoading(false);
  };

  // Fetch slots on date change & subscribe to Realtime channel
  useEffect(() => {
    setSelectedSlot(null);
    setHoldSecondsRemaining(null);
    fetchSlots();

    const sub = slotService.subscribeToSlots(salon.id, selectedDate, () => {
      fetchSlots();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [salon.id, service.id, selectedDate, service.basePrice, user?.id]);

  // Hold Countdown effect
  useEffect(() => {
    if (holdSecondsRemaining === null) return;

    if (holdSecondsRemaining <= 0) {
      // Hold expired per 03_APPFLOW.md & 09_Phases.md
      showToast('Hold expired, please choose your slot again.');
      if (selectedSlot) {
        slotService.release(selectedSlot.id, user?.id);
      }
      setSelectedSlot(null);
      setHoldSecondsRemaining(null);
      fetchSlots();
      return;
    }

    const timer = setInterval(() => {
      setHoldSecondsRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [holdSecondsRemaining, selectedSlot, user?.id, showToast]);

  const handleBack = () => {
    if (selectedSlot) {
      slotService.release(selectedSlot.id, user?.id);
    }
    onBack();
  };

  const handleSelectSlot = async (slot: SlotItem) => {
    if (slot.status === 'booked' || slot.status === 'held_by_others') {
      return;
    }

    const res = await slotService.hold(slot.id, user?.id);
    if (!res.success) {
      showToast(res.error || 'Slot no longer available.');
      fetchSlots();
      return;
    }

    setSelectedSlot(slot);
    if (res.heldUntil) {
      const diffSecs = Math.max(1, Math.floor((new Date(res.heldUntil).getTime() - Date.now()) / 1000));
      setHoldSecondsRemaining(diffSecs);
    } else {
      setHoldSecondsRemaining(5 * 60);
    }
    showToast(`Slot ${slot.time} reserved for 5 minutes.`);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-28">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 h-14 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-bold text-text truncate max-w-[220px]">
          Smart Slot Picker
        </span>
        <button
          onClick={() => setIsDatePickerOpen(true)}
          className="p-2 rounded-full text-primary hover:bg-primary-soft transition-colors cursor-pointer"
          aria-label="Pick custom date"
        >
          <Calendar size={18} />
        </button>
      </header>

      {/* Service Header Info Card per Design.md 8.6 */}
      <div className="p-4 bg-surface border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
              {salon.name}
            </span>
            <h1 className="text-base font-bold text-text leading-tight mt-0.5">
              {service.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted mt-1">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {service.durationMin} mins
              </span>
              <span>•</span>
              <span>⭐ {salon.rating}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-muted block uppercase">Base Price</span>
            <span className="text-sm font-bold text-text tabular-nums">
              {formatMoney(service.basePrice)}
            </span>
          </div>
        </div>

        {/* 5-minute Hold Countdown Pill per Design.md 8.6 */}
        {selectedSlot && holdSecondsRemaining !== null && (
          <div className="mt-3 p-2.5 rounded-button bg-primary text-white text-xs font-semibold flex items-center justify-between shadow-level-1 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-1.5">
              <Timer size={14} className="animate-spin" />
              <span>Selected {selectedSlot.time} ({formatMoney(selectedSlot.price)})</span>
            </div>
            <div className="px-2 py-0.5 rounded-chip bg-white/20 text-[11px] font-mono font-bold">
              Hold: {formatCountdown(holdSecondsRemaining)}
            </div>
          </div>
        )}
      </div>

      {/* 7-Days Date Strip per Design.md 8.6 */}
      <div className="px-4 py-3 bg-surface border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-text uppercase tracking-wider">
            Select Date
          </span>
          <button
            onClick={() => setIsDatePickerOpen(true)}
            className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Calendar size={13} />
            <span>More Dates</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {dates.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                className={`w-[60px] py-2.5 rounded-button flex flex-col items-center justify-center shrink-0 transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-primary text-white shadow-level-1 font-bold'
                    : 'bg-bg text-muted border border-border hover:bg-primary-soft/40 hover:text-text'
                }`}
                aria-pressed={isSelected}
              >
                <span className="text-[10px] tracking-tight uppercase">
                  {d.displayDay}
                </span>
                <span className="text-sm font-bold mt-0.5">
                  {d.displayDate.split(' ')[0]}
                </span>
                <span className="text-[9px] tracking-tight mt-0.5">
                  {d.displayDate.split(' ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend Row per Design.md 8.6 */}
      <div className="px-4 py-2.5 bg-surface/50 border-b border-border/60">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar text-[11px] text-muted font-medium">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-[3px] border border-border bg-surface" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-primary-soft border border-primary" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-gradient-to-r from-success to-teal-500" />
            <span>Free Slot</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-accent" />
            <span>Peak</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-bg border border-border" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-muted/30" />
            <span>Held</span>
          </div>
        </div>
      </div>

      {/* 3-Column Slot Grid per Design.md 8.6 */}
      <main className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2.5">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" radius="button" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              const isBooked = slot.status === 'booked';
              const isHeldOthers = slot.status === 'held_by_others';
              const isFree = slot.isFree;
              const isPeak = slot.isPeak && !isFree && !isBooked && !isHeldOthers;

              // Accessible Screen Reader announcement per Design.md 11:
              // "10:30 AM, Rs.60, peak price, available"
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
                    key={slot.id}
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
                    key={slot.id}
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
                    key={slot.id}
                    onClick={() => handleSelectSlot(slot)}
                    className={`h-14 min-h-[48px] rounded-button p-1.5 flex flex-col items-center justify-center transition-all cursor-pointer relative shadow-sm ${
                      isSelected
                        ? 'border-2 border-white ring-2 ring-primary'
                        : 'border border-success/40 hover:opacity-95'
                    } gradient-free-slot text-white`}
                    aria-label={accessibilityLabel}
                  >
                    {isSelected && (
                      <span className="absolute top-1 left-1 bg-white text-success rounded-full p-0.5">
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
                  key={slot.id}
                  onClick={() => handleSelectSlot(slot)}
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
            })}
          </div>
        )}
      </main>

      {/* Bottom Sticky Continue Bar per Design.md 8.6 */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-level-2 p-3 max-w-lg mx-auto flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-muted uppercase tracking-wider block">
            {selectedSlot ? 'Slot Price' : 'Slot Selection'}
          </span>
          <span className="text-base font-bold text-primary tabular-nums">
            {selectedSlot
              ? selectedSlot.isFree
                ? 'FREE (Rs.0)'
                : formatMoney(selectedSlot.price)
              : 'Select a slot'}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="flex-1 max-w-xs"
          disabled={!selectedSlot}
          onClick={() => {
            if (selectedSlot) {
              onContinue(selectedSlot, salon, service);
            }
          }}
        >
          Continue
        </Button>
      </div>

      {/* O03 Date Picker Sheet */}
      <DatePickerSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
      />
    </div>
  );
};
