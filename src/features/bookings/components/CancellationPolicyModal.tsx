import React, { useState, useEffect } from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { Booking } from '../../../types';
import { bookingService } from '../services/bookingService';
import { formatMoney } from '../../../utils/money';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
import { Skeleton } from '../../../components/Skeleton';
import { useSessionStore } from '../../../store/useSessionStore';

interface CancellationPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onProceedToCancel?: () => void;
}

export const CancellationPolicyModal: React.FC<CancellationPolicyModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  onProceedToCancel,
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

  const refundInfo = booking ? bookingService.calculateRefund(booking) : null;
  const advancePaid = booking?.advancePaise || 0;
  const refundAmount = refundInfo?.refundAmountPaise || 0;
  const chargeAmount = advancePaid - refundAmount;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Cancellation Policy">
      <div className="flex flex-col gap-5 pb-6">
        {loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-16 w-full" radius="card" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-24 w-full" radius="card" />
            </div>
            <Skeleton className="h-32 w-full" radius="card" />
          </div>
        ) : !booking ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Info size={32} className="text-muted" />
            <p className="text-xs text-muted">Booking information could not be retrieved.</p>
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            {/* Context Header */}
            <div className="bg-muted/10 p-3 rounded-card border border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted uppercase font-bold block">Appointment</span>
                <span className="text-xs font-bold text-text">{booking.slot.date} at {booking.slot.time}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted uppercase font-bold block">Booking ID</span>
                <span className="text-xs font-mono font-bold text-primary">{booking.id}</span>
              </div>
            </div>

            {/* Standard Rules Section */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-primary" /> Refund Rules
              </h3>
              
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-start gap-3 p-3 rounded-button bg-surface border border-border/60">
                  <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={14} className="text-success" />
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold text-text block">More than 24 hours before</span>
                    <p className="text-muted mt-0.5">
                      Eligible for <span className="font-bold text-text">80% refund</span> of your advance payment. 
                      A 20% processing fee applies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-button bg-surface border border-border/60">
                  <div className="w-6 h-6 rounded-full bg-error/10 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle size={14} className="text-error" />
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold text-text block">Within 24 hours / Same Day</span>
                    <p className="text-muted mt-0.5">
                      <span className="font-bold text-text">Non-refundable</span>. 
                      Since slots are blocked exclusively for you, the advance payment is retained.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personalized Refund Estimate */}
            <div className="bg-primary/5 rounded-card border border-primary/20 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Your Refund Estimate
                </h3>
                {refundInfo?.isSameDay && (
                  <span className="text-[9px] font-bold bg-error text-white px-1.5 py-0.5 rounded-chip">SAME DAY</span>
                )}
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Advance Paid (25%)</span>
                  <span className="font-mono text-text font-medium">{formatMoney(advancePaid)}</span>
                </div>
                <div className="flex justify-between text-error font-medium">
                  <span>Cancellation Charge ({100 - (refundInfo?.refundPercent || 0)}%)</span>
                  <span className="font-mono">-{formatMoney(chargeAmount)}</span>
                </div>
                
                <div className="h-px bg-primary/10 my-1" />
                
                <div className="flex justify-between font-black text-text items-baseline">
                  <span className="text-sm">Net Refund Amount</span>
                  <span className={`${refundAmount > 0 ? 'text-success' : 'text-text'} tabular-nums text-lg`}>
                    {formatMoney(refundAmount)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-primary/10 flex items-start gap-2 text-[10px] text-muted italic leading-relaxed">
                <CheckCircle2 size={12} className="shrink-0 text-success mt-0.5" />
                <span>
                  {refundAmount > 0 
                    ? `Refund of ${formatMoney(refundAmount)} will be processed back to your original payment method within 24 hours.`
                    : 'This appointment is no longer eligible for a refund per the policy above.'
                  }
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-2">
              {onProceedToCancel && booking.status === 'upcoming' && (
                <Button 
                  variant="danger" 
                  size="md" 
                  fullWidth 
                  onClick={() => {
                    onClose();
                    onProceedToCancel();
                  }}
                >
                  Proceed to Cancel
                </Button>
              )}
              <Button variant="outline" size="md" fullWidth onClick={onClose}>
                Back to Details
              </Button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
};
