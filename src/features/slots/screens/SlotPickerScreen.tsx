import React, { useState, useEffect } from 'react';
import { Salon, SlotItem } from '../../../types';
import { getNext7Days } from '../../../data/mockData';
import { slotService } from '../services/slotService';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { CalendarSlotAvailability, CalendarViewMode } from '../components/CalendarSlotAvailability';
import { SlotSummaryModal } from '../components/SlotSummaryModal';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { useSessionStore } from '../../../store/useSessionStore';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Timer,
  LayoutGrid,
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
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<CalendarViewMode>('day');
  const { user } = useSessionStore();

  // 5-minute hold timer state follows held_until from server
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState<number | null>(null);

  const { showToast } = useUIStore();

  // Reset selection on date change
  const handleDateChange = (newDate: string) => {
    if (newDate !== selectedDate) {
      if (selectedSlot) {
        slotService.release(selectedSlot.id, user?.id);
      }
      setSelectedSlot(null);
      setHoldSecondsRemaining(null);
      setSelectedDate(newDate);
    }
  };

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
      return;
    }

    setSelectedSlot(slot);
    setSelectedDate(slot.date);
    if (res.heldUntil) {
      const diffSecs = Math.max(1, Math.floor((new Date(res.heldUntil).getTime() - Date.now()) / 1000));
      setHoldSecondsRemaining(diffSecs);
    } else {
      setHoldSecondsRemaining(5 * 60);
    }
    setIsSummaryModalOpen(true);
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

      {/* Quick 7-Day Date Pill Selector */}
      <div className="px-4 py-3 bg-surface border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-text uppercase tracking-wider">
            Quick Date Select
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
                onClick={() => handleDateChange(d.dateStr)}
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

      {/* Real-Time Interactive Calendar Availability Component with Day / Week View Toggle */}
      <main className="p-4">
        <CalendarSlotAvailability
          salonId={salon.id}
          serviceId={service.id}
          serviceName={service.name}
          basePricePaise={service.basePrice}
          userId={user?.id}
          selectedSlot={selectedSlot}
          onSelectSlot={handleSelectSlot}
          initialDate={selectedDate}
          initialMode={calendarMode}
          onDateChange={handleDateChange}
        />
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
              setIsSummaryModalOpen(true);
            }
          }}
        >
          Review & Continue
        </Button>
      </div>

      {/* Appointment Slot Summary Modal */}
      <SlotSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        salon={salon}
        service={service}
        slot={selectedSlot}
        holdSecondsRemaining={holdSecondsRemaining}
        customerDetails={{
          name: user?.name,
          phone: user?.phone,
          email: user?.email,
        }}
        onConfirm={(slotToConfirm, salonToConfirm, serviceToConfirm) => {
          setIsSummaryModalOpen(false);
          onContinue(slotToConfirm, salonToConfirm, serviceToConfirm);
        }}
        onSelectDifferentSlot={() => {
          setIsSummaryModalOpen(false);
        }}
      />

      {/* O03 Date Picker Sheet */}
      <DatePickerSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={(newDate) => handleDateChange(newDate)}
      />
    </div>
  );
};
