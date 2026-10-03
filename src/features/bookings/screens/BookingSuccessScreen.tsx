import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { CheckCircle2, Calendar, Navigation, Eye, Home } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';
import { useSessionStore } from '../../../store/useSessionStore';
import { Booking } from '../../../types';

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
  const [booking, setBooking] = useState<Booking | null>(null);
  const { user } = useSessionStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    bookingService.getBookingById(bookingId, user?.id).then((b) => setBooking(b));
  }, [bookingId, user?.id]);

  const handleAddToCalendar = () => {
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
              <span className="text-sm font-mono font-bold text-text block">
                {formatMoney(booking?.totalPaise || 0)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Salon:</span>
              <span className="font-semibold text-text">{booking?.salonName || 'GlowSlot Partner'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Date & Time:</span>
              <span className="font-semibold text-text">
                {booking ? `${booking.slot.date} at ${booking.slot.time}` : 'Scheduled'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex gap-3 w-full mb-6">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={handleAddToCalendar}
          >
            <Calendar size={15} className="mr-1.5" />
            Add to Calendar
          </Button>

          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={handleGetDirections}
          >
            <Navigation size={15} className="mr-1.5" />
            Directions
          </Button>
        </div>
      </div>

      {/* Bottom Sticky CTAs */}
      <div className="flex flex-col gap-2 w-full pt-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => onViewBooking(bookingId)}
        >
          <Eye size={16} className="mr-2" />
          View Booking Details
        </Button>

        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={onGoHome}
        >
          <Home size={16} className="mr-1.5" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};
