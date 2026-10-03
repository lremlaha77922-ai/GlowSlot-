import React from 'react';
import { Sheet } from '../../../components/Sheet';
import { Calendar as CalendarIcon, Check } from 'lucide-react';

interface DatePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  dates: { dateStr: string; displayDay: string; displayDate: string; isToday: boolean }[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const DatePickerSheet: React.FC<DatePickerSheetProps> = ({
  isOpen,
  onClose,
  dates,
  selectedDate,
  onSelectDate,
}) => {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Choose Booking Date">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted mb-2">
          Select a date within the next 7 days to view available real-time slots and off-peak pricing.
        </p>

        <div className="divide-y divide-border/60">
          {dates.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                onClick={() => {
                  onSelectDate(d.dateStr);
                  onClose();
                }}
                className={`w-full py-3 px-3 rounded-button flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-text hover:bg-primary-soft/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-muted/15 text-muted'
                    }`}
                  >
                    <CalendarIcon size={15} />
                  </div>
                  <div>
                    <span className="text-sm block leading-none font-bold">
                      {d.displayDate}
                    </span>
                    <span className="text-xs text-muted mt-0.5 block">
                      {d.displayDay}
                    </span>
                  </div>
                </div>
                {isSelected && <Check size={18} className="text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
};
