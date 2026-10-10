import React, { useState } from 'react';
import { Salon, SlotItem } from '../../../types';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { formatMoney } from '../../../utils/money';
import {
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Tag,
  AlertCircle,
  FileText,
  User,
  Phone,
  ArrowRight,
  Info,
} from 'lucide-react';

export interface ServiceDetail {
  id: string;
  name: string;
  durationMin: number;
  basePrice: number;
}

export interface SlotSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  service: ServiceDetail;
  slot: SlotItem | null;
  holdSecondsRemaining?: number | null;
  customerDetails?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  onConfirm: (slot: SlotItem, salon: Salon, service: ServiceDetail, notes?: string) => void;
  onSelectDifferentSlot?: () => void;
}

export const format12HourTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const displayH = h < 10 ? `0${h}` : `${h}`;
  return `${displayH}:${m} ${ampm}`;
};

export const formatSlotDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const SlotSummaryModal: React.FC<SlotSummaryModalProps> = ({
  isOpen,
  onClose,
  salon,
  service,
  slot,
  holdSecondsRemaining,
  customerDetails,
  onConfirm,
  onSelectDifferentSlot,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !slot) return null;

  // Pricing calculations
  const finalPricePaise = slot.isFree ? 0 : slot.price;
  const originalPricePaise = service.basePrice;
  const savingsPaise = Math.max(0, originalPricePaise - finalPricePaise);
  const depositPaise = Math.round(finalPricePaise * 0.25);
  const balanceAtSalonPaise = Math.max(0, finalPricePaise - depositPaise);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirmClick = () => {
    setIsSubmitting(true);
    onConfirm(slot, salon, service, notes);
    setIsSubmitting(false);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Appointment Summary">
      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[75vh] pb-24 text-text">
        {/* Reservation Hold Active Banner */}
        {holdSecondsRemaining !== null && holdSecondsRemaining !== undefined && (
          <div className="flex items-center justify-between p-2.5 rounded-card bg-primary-soft/50 border border-primary/30 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="font-semibold text-primary">Chair Hold Reserved</span>
            </div>
            <div className="font-mono font-bold text-primary bg-surface px-2 py-0.5 rounded border border-primary/20 text-[11px]">
              {formatCountdown(holdSecondsRemaining)} left
            </div>
          </div>
        )}

        {/* Salon Info Header */}
        <div className="flex items-start gap-3 p-3.5 rounded-card bg-surface border border-border">
          <div className="w-12 h-12 rounded-lg bg-primary-soft/30 border border-primary/20 flex items-center justify-center text-primary font-black text-lg shrink-0">
            {salon.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-sm text-text truncate">{salon.name}</h3>
              <span className="text-[11px] font-bold text-deal flex items-center gap-0.5 shrink-0">
                ★ {salon.rating}
              </span>
            </div>
            <p className="text-xs text-muted flex items-center gap-1 mt-0.5 truncate">
              <MapPin size={12} className="shrink-0 text-muted" />
              <span>{salon.area || salon.address}</span>
            </p>
          </div>
        </div>

        {/* Service Details Card */}
        <div className="p-3.5 rounded-card bg-surface border border-border flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Selected Service
            </span>
            <span className="text-[11px] font-medium text-primary flex items-center gap-1">
              <Sparkles size={12} />
              GlowSlot Verified
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-text">{service.name}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {service.durationMin} mins
                </span>
                <span>•</span>
                <span>Single Client Slot</span>
              </div>
            </div>

            <div className="text-right">
              {slot.isFree ? (
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted line-through">
                    {formatMoney(service.basePrice)}
                  </span>
                  <span className="text-xs font-black text-deal uppercase tracking-wider">
                    FREE SLOT
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  {savingsPaise > 0 && (
                    <span className="text-[11px] text-muted line-through tabular-nums">
                      {formatMoney(service.basePrice)}
                    </span>
                  )}
                  <span className="text-sm font-bold text-text tabular-nums">
                    {formatMoney(slot.price)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date & Time Slot Card */}
        <div className="p-3.5 rounded-card bg-surface border border-border flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Appointment Schedule
            </span>
            {onSelectDifferentSlot && (
              <button
                type="button"
                onClick={onSelectDifferentSlot}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Change Slot
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-0.5">
            <div className="p-2.5 rounded-button bg-bg border border-border flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Calendar size={15} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted block uppercase">Date</span>
                <span className="text-xs font-bold text-text truncate block">
                  {formatSlotDate(slot.date)}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-button bg-bg border border-border flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Clock size={15} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted block uppercase">Time Slot</span>
                <span className="text-xs font-bold text-text truncate block">
                  {format12HourTime(slot.time)}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Pricing Slot Tag */}
          <div className="flex items-center gap-2 mt-1">
            {slot.isFree ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-chip bg-deal/10 text-deal border border-deal/20">
                <Tag size={11} /> 100% Free Promo Slot
              </span>
            ) : savingsPaise > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-chip bg-deal/10 text-deal border border-deal/20">
                <Tag size={11} /> Save {formatMoney(savingsPaise)} (Off-peak smart rate)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-chip bg-bg text-muted border border-border">
                <CheckCircle2 size={11} className="text-primary" /> Standard Slot
              </span>
            )}
          </div>
        </div>

        {/* Customer Information (if present) */}
        {customerDetails && (customerDetails.name || customerDetails.phone) && (
          <div className="p-3 rounded-card bg-surface border border-border flex flex-col gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Booking For
            </span>
            <div className="flex items-center justify-between text-text font-medium">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-primary" />
                {customerDetails.name || 'GlowSlot Guest'}
              </span>
              {customerDetails.phone && (
                <span className="flex items-center gap-1 text-muted text-[11px]">
                  <Phone size={11} /> {customerDetails.phone}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Special Instructions / Notes */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="slot-summary-notes" className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
            <FileText size={12} />
            <span>Special Requests / Notes (Optional)</span>
          </label>
          <input
            id="slot-summary-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Sensitive scalp, prefer quiet session"
            className="w-full px-3 py-2 text-xs rounded-button bg-surface border border-border text-text placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Fare & Advance Deposit Breakdown */}
        <div className="p-3.5 rounded-card bg-surface border border-border flex flex-col gap-2 text-xs">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            Fare Summary
          </span>

          <div className="flex items-center justify-between text-muted">
            <span>Base Service Rate</span>
            <span className="tabular-nums font-medium text-text">{formatMoney(originalPricePaise)}</span>
          </div>

          {savingsPaise > 0 && (
            <div className="flex items-center justify-between text-deal font-semibold">
              <span>Smart Slot Discount</span>
              <span className="tabular-nums">- {formatMoney(savingsPaise)}</span>
            </div>
          )}

          <div className="flex items-center justify-between font-bold text-sm text-text pt-2 border-t border-border">
            <span>Total Payable</span>
            <span className="tabular-nums text-primary">
              {slot.isFree ? 'FREE (₹0)' : formatMoney(finalPricePaise)}
            </span>
          </div>

          {!slot.isFree && (
            <div className="bg-primary-soft/30 p-2.5 rounded-card border border-primary/20 flex flex-col gap-1 mt-1 text-[11px]">
              <div className="flex items-center justify-between text-primary font-bold">
                <span>Advance Deposit (25%)</span>
                <span className="tabular-nums">{formatMoney(depositPaise)}</span>
              </div>
              <div className="flex items-center justify-between text-muted font-medium">
                <span>Balance at Salon</span>
                <span className="tabular-nums font-semibold text-text">{formatMoney(balanceAtSalonPaise)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Assurance Guarantee */}
        <div className="flex items-start gap-2 p-2.5 rounded-card bg-bg border border-border text-[11px] text-muted">
          <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
          <span>
            Free cancellation up to 2 hours before your appointment. Instant chair guarantee upon arrival.
          </span>
        </div>
      </div>

      {/* Sticky Bottom Action Buttons */}
      <div className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-md border-t border-border p-3.5 max-w-lg mx-auto flex items-center gap-2.5 z-50">
        <Button
          variant="outline"
          size="md"
          type="button"
          onClick={onClose}
          className="flex-1 text-xs"
        >
          Change Selection
        </Button>
        <Button
          variant="primary"
          size="md"
          type="button"
          disabled={isSubmitting}
          onClick={handleConfirmClick}
          className="flex-1 text-xs shadow-xs"
        >
          {isSubmitting ? 'Confirming...' : 'Confirm & Continue'}
        </Button>
      </div>
    </Sheet>
  );
};
