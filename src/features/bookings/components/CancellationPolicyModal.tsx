import React, { useState, useEffect } from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { Booking } from '../../../types';
import { bookingService } from '../services/bookingService';
import { formatMoney } from '../../../utils/money';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert, Info, AlertTriangle, Calendar } from 'lucide-react';
import { Skeleton } from '../../../components/Skeleton';
import { useSessionStore } from '../../../store/useSessionStore';

interface CancellationPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onProceedToCancel?: () => void;
  onCancelAndRefund?: (booking: Booking) => void;
}

export const CancellationPolicyModal: React.FC<CancellationPolicyModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  onProceedToCancel,
  onCancelAndRefund,
}) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSessionStore();

  useEffect(() => {
    if (isOpen && bookingId) {
      const load = async () => {
        setLoading(true);
        try {
          const data = await bookingService.getBookingById(bookingId, user?.id);
          setBooking(data);
        } catch (error) {
          console.error('[GlowSlot] Failed to load booking for policy modal:', error);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [isOpen, bookingId, user?.id]);

  if (!isOpen) return null;

  const refundInfo = booking ? bookingService.calculateRefund(booking) : null;
  const advancePaid = booking?.advancePaise || Math.round((booking?.totalPaise || 0) * 0.25);
  const refundPercent = refundInfo?.refundPercent ?? 0;
  const refundAmount = refundInfo?.refundAmountPaise ?? 0;
  const chargeAmount = Math.max(0, advancePaid - refundAmount);
  const isEligibleFor80Percent = refundPercent === 80;

  const handleCancelAction = () => {
    onClose();
    if (onCancelAndRefund && booking) {
      onCancelAndRefund(booking);
    } else if (onProceedToCancel) {
      onProceedToCancel();
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Cancellation & Refund Policy">
      <div className="flex flex-col gap-4 pb-6">
        {loading ? (
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-16 w-full" radius="card" />
            <Skeleton className="h-28 w-full" radius="card" />
            <Skeleton className="h-32 w-full" radius="card" />
          </div>
        ) : !booking ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Info size={32} className="text-muted" />
            <p className="text-xs text-muted">Booking information could not be retrieved.</p>
            <Button variant="outline" size="sm" onClick={onClose}>
              Keep Booking
            </Button>
          </div>
        ) : (
          <>
            {/* Booking Context Banner */}
            <div className="bg-surface p-3.5 rounded-card border border-border flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold block">Appointment</span>
                  <span className="text-xs font-bold text-text">
                    {booking.slot.date} at {booking.slot.time}
                  </span>
                  <span className="text-[10px] text-primary font-mono block mt-0.5">{booking.id}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-muted uppercase font-bold block">Status</span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-chip tracking-wider ${
                  booking.status === 'upcoming'
                    ? 'bg-primary-soft text-primary'
                    : booking.status === 'completed'
                    ? 'bg-success/15 text-success'
                    : 'bg-error/15 text-error'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>

            {/* 80% / 0% Cutoff Policy Banner */}
            <div className={`p-4 rounded-card border-2 flex items-start gap-3 shadow-xs ${
              isEligibleFor80Percent
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50/80 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-200'
            }`}>
              <div className={`p-2 rounded-full shrink-0 ${
                isEligibleFor80Percent ? 'bg-emerald-200/60 text-emerald-800' : 'bg-rose-200/60 text-rose-800'
              }`}>
                {isEligibleFor80Percent ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              </div>

              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-black uppercase tracking-wider text-[11px]">
                    {isEligibleFor80Percent ? '80% Refund Eligible' : '0% Refund (Non-Refundable)'}
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-chip bg-black/10 dark:bg-white/10">
                    24-Hour Cutoff
                  </span>
                </div>

                <p className="leading-relaxed font-medium">
                  {refundInfo?.isSameDay
                    ? 'This appointment is scheduled for today. Same-day cancellations are non-refundable (0% refund).'
                    : isEligibleFor80Percent
                    ? `You are cancelling more than 24 hours prior to your slot. You will receive an 80% refund of your advance payment (20% processing fee).`
                    : `This booking is within the 24-hour cutoff window. The advance payment is non-refundable (0% refund).`}
                </p>

                <p className="text-[10px] opacity-75 mt-2 border-t border-current/15 pt-1.5 italic">
                  Refunds are credited to your original payment method / UPI within 24 hours upon request.
                </p>
              </div>
            </div>

            {/* 24-Hour Rule Reference Cards */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[10px] font-black text-muted uppercase tracking-widest px-1 flex items-center gap-1">
                <ShieldAlert size={12} className="text-primary" /> GlowSlot Cancellation Rules
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-button border transition-all ${
                  isEligibleFor80Percent
                    ? 'bg-emerald-500/10 border-emerald-500/30 font-semibold'
                    : 'bg-surface border-border opacity-70'
                }`}>
                  <div className="flex items-center gap-1 text-success font-black text-[11px] mb-0.5">
                    <Clock size={12} /> &gt; 24h Before
                  </div>
                  <span className="font-extrabold text-sm block text-text">80% Refund</span>
                  <span className="text-[10px] text-muted block">20% cancellation fee</span>
                </div>

                <div className={`p-2.5 rounded-button border transition-all ${
                  !isEligibleFor80Percent
                    ? 'bg-rose-500/10 border-rose-500/30 font-semibold'
                    : 'bg-surface border-border opacity-70'
                }`}>
                  <div className="flex items-center gap-1 text-error font-black text-[11px] mb-0.5">
                    <AlertCircle size={12} /> &le; 24h / Same Day
                  </div>
                  <span className="font-extrabold text-sm block text-text">0% Refund</span>
                  <span className="text-[10px] text-muted block">100% advance retained</span>
                </div>
              </div>
            </div>

            {/* Refund Estimate Breakdown Card */}
            <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center text-muted">
                <span>Total Booking Amount</span>
                <span className="font-mono text-text font-medium tabular-nums">{formatMoney(booking.totalPaise)}</span>
              </div>

              <div className="flex justify-between items-center bg-muted/20 p-2.5 rounded-button border border-border/40">
                <span className="text-xs font-bold text-text uppercase tracking-tight">Total Advance Paid (25%)</span>
                <span className="text-sm font-black text-text font-mono tabular-nums">{formatMoney(advancePaid)}</span>
              </div>

              <div className="flex justify-between items-center text-error font-bold px-1 text-xs">
                <span>Cancellation Charge ({100 - refundPercent}%)</span>
                <span className="font-mono tabular-nums">-{formatMoney(chargeAmount)}</span>
              </div>

              <div className="h-px bg-border/60 my-0.5" />

              <div className="flex justify-between items-center bg-primary/5 p-3 rounded-button border border-primary/20">
                <span className="text-xs font-black text-primary uppercase tracking-wider">Final Refund Amount</span>
                <span className="text-xl font-black text-text font-mono tabular-nums tracking-tight">
                  {formatMoney(refundAmount)}
                </span>
              </div>
            </div>

            {/* REQUIRED ACTION BUTTONS: 'Keep Booking' and 'Cancel & Refund' */}
            <div className="flex flex-col gap-2.5 pt-2">
              {booking.status === 'upcoming' && (
                <Button
                  variant="danger"
                  size="lg"
                  fullWidth
                  className="font-black h-12 shadow-md shadow-error/20 uppercase tracking-wider flex items-center justify-center gap-1.5"
                  onClick={handleCancelAction}
                >
                  <span>Cancel &amp; Refund</span>
                  {refundAmount > 0 ? (
                    <span className="font-mono text-xs opacity-90">({formatMoney(refundAmount)})</span>
                  ) : (
                    <span className="text-xs opacity-90">(₹0)</span>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                size="md"
                fullWidth
                className="font-bold border-border text-muted hover:text-text hover:bg-muted/10 h-11"
                onClick={onClose}
              >
                Keep Booking
              </Button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
};
