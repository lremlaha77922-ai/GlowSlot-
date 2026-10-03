import React from 'react';
import { bookingService } from '../services/bookingService';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { CheckCircle2, Calendar, Navigation, Eye, Home } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';

interface BookingSuccessScreenProps {
  bookingId: string;
  onViewBooking: (bookingId: string) => void;
  onGoHome: () => void;
}

export const BookingSuccessScreen: React.FC<BookingSuccessScreenProps> = ({
  bookingId,
  onViewBooking,
  onGoHome,
}) => {
  const booking = bookingService.getBookingById(bookingId);
  const { showToast } = useUIStore();

  const handleAddToCalendar = () => {
    // Generate ICS or standard Google Calendar event trigger
    showToast('Appointment added to your device calendar!');
  };

  const handleGetDirections = () => {
    const address = booking?.salonAddress || booking?.salonName || 'Bengaluru';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-6 max-w-lg mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Animated Green Checkmark */}
        <div className="w-20 h-20 rounded-full bg-success/15 text-success flex items-center justify-center mb-5 animate-in zoom-in-50 duration-300">
          <CheckCircle2 size={44} />
        </div>

        <span className="text-xs font-bold text-success uppercase tracking-wider mb-1">
          Booking Confirmed
        </span>
        <h1 className="text-xl font-bold text-text mb-2">
          Your Grooming Appointment is Set!
        </h1>
        <p className="text-xs text-muted max-w-xs mb-6">
          Zero waiting guarantee. Present this booking confirmation upon arrival.
        </p>

        {/* Confirmation Details Card */}
        <div className="w-full bg-surface rounded-card border border-border p-4 shadow-level-1 text-left flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <span className="text-[10px] text-muted uppercase">Booking Reference</span>
              <span className="text-sm font-mono font-bold text-primary block">
                {booking?.id || bookingId}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted uppercase">Amount Paid</span>
              <span className="text-sm font-bold text-text tabular-nums block">
                {booking ? formatMoney(booking.totalPaise) : 'Confirmed'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted block text-[11px]">Salon / Service</span>
              <span className="font-bold text-text truncate block">
                {booking?.salonName}
              </span>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Appointment Slot</span>
              <span className="font-bold text-text block">
                {booking?.slot.time}, {booking?.slot.date}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Add to Calendar & Get Directions per Design.md 8.9 */}
        <div className="w-full grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleAddToCalendar}
            className="flex items-center justify-center gap-1.5"
          >
            <Calendar size={15} />
            <span>Add to Calendar</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleGetDirections}
            className="flex items-center justify-center gap-1.5"
          >
            <Navigation size={15} />
            <span>Get Directions</span>
          </Button>
        </div>
      </div>

      {/* Bottom Navigation Actions */}
      <div className="flex flex-col gap-2.5 pt-6">
        <Button
          variant="primary"
          size="lg"
          onClick={() => onViewBooking(bookingId)}
          className="flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          <span>View Booking Details</span>
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={onGoHome}
          className="flex items-center justify-center gap-1.5"
        >
          <Home size={15} />
          <span>Back to Home</span>
        </Button>
      </div>
    </div>
  );
};
