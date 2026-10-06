import React, { useState } from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Booking } from '../../../types';
import { bookingService } from '../services/bookingService';
import { formatMoney } from '../../../utils/money';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';
import { AlertCircle, AlertTriangle, CreditCard, CheckCircle2, QrCode } from 'lucide-react';

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
  const [step, setStep] = useState<'confirm' | 'refund_request' | 'success'>('confirm');
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiIdError] = useState('');
  const { user } = useSessionStore();
  const { showToast } = useUIStore();

  const { refundPercent, refundAmountPaise, hoursRemaining, isSameDay } =
    bookingService.calculateRefund(booking);

  const advancePaid = booking.advancePaise || 0;
  const cancellationCharge = advancePaid - refundAmountPaise;

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    const res = await bookingService.cancelBooking(booking.id, selectedReason, user?.id);
    setIsSubmitting(false);
    if (res.success) {
      if (res.refundAmountPaise > 0) {
        setStep('refund_request');
      } else {
        setStep('success');
      }
      onCancelled({
        ...booking,
        status: 'cancelled',
        cancellation: {
          reason: selectedReason,
          refundAmountPaise: res.refundAmountPaise,
          refundPercent: res.refundPercent,
          cancelledAt: new Date().toISOString(),
        },
      });
    } else {
      showToast(res.error || 'Cancellation failed');
    }
  };

  const handleApplyRefund = async () => {
    if (!upiId || !upiId.includes('@')) {
      setUpiIdError('Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }
    
    setIsSubmitting(true);
    const res = await bookingService.submitRefundRequest(booking.id, upiId, user?.id);
    setIsSubmitting(false);
    
    if (res.success) {
      setStep('success');
      showToast('Refund request submitted!');
    } else {
      showToast(res.error || 'Failed to submit refund request');
    }
  };

  const canCancel = hoursRemaining > 0 || isSameDay; // Simplified check, backend will block if past

  return (
    <Sheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title={step === 'confirm' ? "Cancel Appointment" : step === 'refund_request' ? "Apply for Refund" : "Cancellation Success"}
    >
      <div className="flex flex-col gap-5 pb-6">
        {step === 'confirm' && (
          <>
            {/* 1. Clear Header & Bold Notice Banner */}
            <div className={`p-4 rounded-card border-2 flex items-start gap-3.5 shadow-xs ${
              refundPercent > 0
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}>
              <div className={`p-2 rounded-full shrink-0 ${refundPercent > 0 ? 'bg-emerald-200/50' : 'bg-rose-200/50'}`}>
                {refundPercent > 0 ? <AlertCircle size={20} className="text-emerald-700" /> : <AlertTriangle size={20} className="text-rose-700" />}
              </div>
              <div className="flex-1">
                <span className="font-black text-xs uppercase tracking-widest block mb-1">
                  Cancellation Policy
                </span>
                <div className="text-xs leading-relaxed font-bold">
                  {isSameDay ? (
                    <p>Same-day cancellations are non-refundable. Advance payment is retained as per salon policy.</p>
                  ) : refundPercent > 0 ? (
                    <p>20% Cancellation Charge applies. You are eligible for an 80% refund of your advance.</p>
                  ) : (
                    <p>Booking is within 24 hours of appointment and is non-refundable.</p>
                  )}
                </div>
                <p className="text-[10px] opacity-70 mt-2 font-medium italic border-t border-current/10 pt-1.5">
                  Refunds (if applicable) are credited to original source within 24 hours.
                </p>
              </div>
            </div>

            {/* 2. Clean Refund Summary Card (Bold Highlights) */}
            <div className="bg-surface rounded-card border border-border p-4 flex flex-col gap-3 shadow-level-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <CreditCard size={48} />
              </div>
              
              <div className="flex justify-between items-center text-xs text-muted">
                <span className="font-medium">Total Booking Amount</span>
                <span className="font-mono tabular-nums">{formatMoney(booking.totalPaise)}</span>
              </div>
              
              <div className="flex justify-between items-center bg-muted/20 p-2.5 rounded-button border border-border/40">
                <span className="text-xs font-bold text-text uppercase tracking-tight">Total Advance Paid (25%)</span>
                <span className="text-sm font-black text-text tabular-nums">{formatMoney(advancePaid)}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs text-error font-bold px-1">
                <span>Cancellation Charge ({100 - refundPercent}%)</span>
                <span className="font-mono tabular-nums">-{formatMoney(cancellationCharge)}</span>
              </div>
              
              <div className="h-px bg-border/60 my-1" />
              
              <div className="flex justify-between items-center bg-primary/5 p-3 rounded-button border border-primary/20">
                <span className="text-xs font-black text-primary uppercase tracking-wider">Final Refund Amount</span>
                <span className="text-xl font-black text-text tabular-nums tracking-tighter">
                  {formatMoney(refundAmountPaise)}
                </span>
              </div>
            </div>

            {/* 3. Reason Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">
                Why are you cancelling?
              </label>
              <div className="flex flex-col gap-2">
                {CANCELLATION_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <label
                      key={reason}
                      className={`group relative p-3 rounded-button border-2 flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary/5 border-primary shadow-xs'
                          : 'bg-surface border-border hover:border-primary/40'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-primary' : 'border-border group-hover:border-primary/40'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-primary' : 'text-text'}`}>
                        {reason}
                      </span>
                      <input
                        type="radio"
                        className="hidden"
                        name="cancel_reason"
                        checked={isSelected}
                        onChange={() => setSelectedReason(reason)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Action Buttons */}
            <div className="flex flex-col gap-3 mt-2">
              <Button
                variant="danger"
                size="lg"
                fullWidth
                className="font-black h-12 shadow-md shadow-error/20 uppercase tracking-wider"
                disabled={isSubmitting || !canCancel}
                onClick={handleConfirmCancel}
              >
                {isSubmitting ? 'Processing...' : refundAmountPaise > 0 ? `Cancel & Refund ${formatMoney(refundAmountPaise)}` : 'Cancel — No Refund'}
              </Button>
              
              <Button 
                variant="outline" 
                size="md" 
                fullWidth 
                className="font-bold border-border text-muted hover:text-text hover:bg-muted/10 h-11"
                onClick={onClose}
              >
                Keep My Booking
              </Button>
            </div>
          </>
        )}

        {step === 'refund_request' && (
          <div className="flex flex-col gap-5 py-2">
            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-black text-text">Cancellation Successful</h3>
              <p className="text-xs text-muted">You are eligible for a refund of <span className="font-bold text-text">{formatMoney(refundAmountPaise)}</span></p>
            </div>

            <div className="bg-surface rounded-card border border-border p-4 flex flex-col gap-3 shadow-xs">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Booking Amount</span>
                <span className="font-mono text-text">{formatMoney(booking.totalPaise)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Advance Paid</span>
                <span className="font-mono text-text">{formatMoney(advancePaid)}</span>
              </div>
              <div className="flex justify-between text-xs text-error font-medium">
                <span>Cancellation Charge (20%)</span>
                <span className="font-mono">-{formatMoney(cancellationCharge)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-black text-text">
                <span className="text-xs uppercase tracking-wider">Refund Amount</span>
                <span className="text-lg text-primary">{formatMoney(refundAmountPaise)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Input
                label="Enter UPI ID for refund"
                placeholder="example@upi"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  setUpiIdError('');
                }}
                error={upiError}
                leftIcon={<QrCode size={18} />}
              />
              <p className="text-[10px] text-muted leading-relaxed px-1">
                * Please double-check your UPI ID. Refund will be initiated once approved by admin.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              onClick={handleApplyRefund}
              className="font-black h-12 uppercase"
            >
              {isSubmitting ? 'Submitting...' : 'Apply for Refund'}
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col gap-6 py-6 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 size={48} />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black text-text">
                {refundAmountPaise > 0 ? 'Refund Request Submitted' : 'Cancellation Completed'}
              </h3>
              {refundAmountPaise > 0 ? (
                <p className="text-xs text-muted leading-relaxed px-4">
                  Your refund request of <span className="font-bold text-text">{formatMoney(refundAmountPaise)}</span> has been submitted successfully. 
                  After admin approval, the refund will be processed within 24 hours.
                </p>
              ) : (
                <p className="text-xs text-muted leading-relaxed px-4">
                  Your appointment has been cancelled. No refund is applicable as per our 24-hour cancellation policy.
                </p>
              )}
            </div>

            {refundAmountPaise > 0 && (
              <div className="bg-bg rounded-button border border-border p-3 flex items-center justify-center gap-2">
                <span className="text-[10px] font-bold text-muted uppercase">Status:</span>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-chip">
                  Refund Pending Approval
                </span>
              </div>
            )}

            <Button 
              variant="outline" 
              size="lg" 
              fullWidth 
              onClick={onClose}
              className="mt-2 font-bold h-12"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  );
};
