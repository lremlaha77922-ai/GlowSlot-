import React, { useState } from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { Booking } from '../../../types';
import { bookingService } from '../services/bookingService';
import { formatMoney } from '../../../utils/money';
import { useSessionStore } from '../../../store/useSessionStore';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface CancelBookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onCancelled: (updatedBooking: Booking) => void;
}

const CANCELLATION_REASONS = [
  'Change of plans / Schedule conflict',
  'Want to book a different salon or slot',
  'Emergency or unwell',
  'Stylist requested reschedule',
  'Other reason',
];

export const CancelBookingSheet: React.FC<CancelBookingSheetProps> = ({
  isOpen,
  onClose,
  booking,
  onCancelled,
}) => {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSessionStore();

  const { refundPercent, refundAmountPaise, hoursRemaining } =
    bookingService.calculateRefund(booking);

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    const res = await bookingService.cancelBooking(booking.id, selectedReason, user?.id);
    setIsSubmitting(false);
    if (res.success) {
      const updatedBooking: Booking = {
        ...booking,
        status: 'cancelled',
        cancellation: {
          reason: selectedReason,
          refundAmountPaise: res.refundAmountPaise,
          refundPercent: res.refundPercent,
          cancelledAt: new Date().toISOString(),
        },
      };
      onCancelled(updatedBooking);
      onClose();
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Cancel Appointment">
      <div className="flex flex-col gap-4 pb-4">
        {/* Refund Policy Notice per PRD.md section 5 */}
        <div className={`p-3.5 rounded-card border flex items-start gap-3 ${
          refundPercent === 100
            ? 'bg-success/10 border-success/30 text-success'
            : refundPercent > 0
            ? 'bg-deal/10 border-deal/30 text-stone-900 dark:text-deal'
            : 'bg-error/10 border-error/30 text-error'
        }`}>
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block">
              {refundPercent === 100
                ? 'Full 100% Refund Applicable'
                : refundPercent > 0
                ? `${refundPercent}% Partial Refund Applicable`
                : 'No Refund (< 1 Hour to Slot)'}
            </span>
            <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
              Appointment is in ~{Math.max(0, Math.round(hoursRemaining))} hours. Under our policy, cancellation &gt;4h before slot gets 100% refund, 1-4h gets 50%, and &lt;1h gets 0%.
            </p>
          </div>
        </div>

        {/* Refund Summary Breakdown */}
        <div className="bg-surface rounded-card border border-border p-3 flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-muted">
            <span>Original Total Paid</span>
            <span className="text-text tabular-nums">{formatMoney(booking.totalPaise)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Refund Percentage</span>
            <span className="text-text font-bold">{refundPercent}%</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-bold text-text">
            <span>Estimated Refund Amount</span>
            <span className="text-primary tabular-nums text-sm">
              {formatMoney(refundAmountPaise)}
            </span>
          </div>
        </div>

        {/* Reason Selector */}
        <div>
          <label className="text-xs font-bold text-text uppercase tracking-wider block mb-2">
            Select Cancellation Reason
          </label>
          <div className="flex flex-col gap-2">
            {CANCELLATION_REASONS.map((reason) => (
              <label
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`p-2.5 rounded-button border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  selectedReason === reason
                    ? 'bg-primary-soft border-primary text-primary font-semibold'
                    : 'bg-surface border-border text-text hover:bg-primary-soft/30'
                }`}
              >
                <span>{reason}</span>
                <input
                  type="radio"
                  name="cancel_reason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="accent-primary"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" size="md" className="flex-1" onClick={onClose}>
            Keep Booking
          </Button>
          <Button
            variant="danger"
            size="md"
            className="flex-1"
            disabled={isSubmitting}
            onClick={handleConfirmCancel}
          >
            {isSubmitting ? 'Cancelling...' : 'Confirm Cancel'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
