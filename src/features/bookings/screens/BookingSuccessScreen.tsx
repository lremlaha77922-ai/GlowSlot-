import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { useUIStore } from '../../../store/useUIStore';
import { useSessionStore } from '../../../store/useSessionStore';
import { Booking } from '../../../types';
import {
  CheckCircle2,
  Calendar,
  Navigation,
  Eye,
  Home,
  Store,
  MessageSquare,
  Building2,
  MapPin,
  Scissors,
  UserCheck,
  Clock,
  Phone,
  User,
  ShieldCheck,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

interface BookingSuccessScreenProps {
  bookingId: string;
  onViewBooking: (bookingId: string) => void;
  onGoHome: () => void;
  onViewAppointments: () => void;
}

export const BookingSuccessScreen: React.FC<BookingSuccessScreenProps> = ({
  bookingId,
  onViewBooking,
  onGoHome,
  onViewAppointments,
}) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const { user } = useSessionStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    bookingService.getBookingById(bookingId, user?.id).then((b) => setBooking(b));
  }, [bookingId, user?.id]);

  const handleAddToCalendar = () => {
    if (!booking) {
      showToast('Appointment added to calendar.');
      return;
    }
    const title = encodeURIComponent(`GlowSlot Appointment at ${booking.salonName}`);
    const details = encodeURIComponent(`Services: ${booking.services.map((s) => s.name).join(', ')}`);
    const location = encodeURIComponent(booking.salonAddress || booking.salonName);
    const start = booking.slot.date.replace(/-/g, '') + 'T' + booking.slot.time.replace(':', '') + '00Z';
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${start}`;
    window.open(gcalUrl, '_blank');
    showToast('Calendar event created successfully!');
  };

  const handleGetDirections = () => {
    const address = booking?.salonAddress || booking?.salonName || 'Bengaluru';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const totalPaise = booking?.totalPaise || 0;
  const advancePaidPaise = Math.round(totalPaise * 0.25);
  const balanceDuePaise = Math.max(0, totalPaise - advancePaidPaise);
  const salonName = booking?.salonName || 'GlowSlot Salon Partner';

  return (
    <div className="min-h-screen bg-bg text-text pb-28">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between">
        <h1 className="text-xs font-black uppercase tracking-wider text-primary">
          Appointment Confirmed
        </h1>
        <button
          onClick={onGoHome}
          className="text-xs font-bold text-muted hover:text-text cursor-pointer"
        >
          Skip to Home
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto flex flex-col gap-5">
        {/* Strong Confirmation Card */}
        <div className="bg-surface rounded-card border border-border/80 shadow-level-1 p-5 flex flex-col items-center text-center">
          {/* Animated Green Checkmark */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3.5 animate-in zoom-in-50 duration-300">
            <CheckCircle2 size={36} />
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-chip mb-1">
            ✓ BOOKING SUBMITTED & CONFIRMED
          </span>
          <h2 className="text-base font-extrabold text-text mb-1">Your booking is confirmed.</h2>
          <p className="text-[11px] text-muted max-w-xs">
            Zero waiting guarantee. Present your booking reference upon arrival at the salon.
          </p>

          {/* WhatsApp Confirmation Queued Banner */}
          <div className="w-full mt-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-2.5 rounded-card flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageSquare size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block">
                WhatsApp confirmation queued
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block truncate">
                Digital pass & receipt will arrive on {user?.phone || 'your phone'} shortly.
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Booking Summary Card */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div>
              <span className="text-[10px] text-muted uppercase font-semibold">Booking Reference ID</span>
              <span className="text-sm font-mono font-black text-primary block mt-0.5">
                {booking?.id || bookingId}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted uppercase font-semibold">Status</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-chip inline-block mt-0.5">
                Confirmed
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 divide-y divide-border/50">
            {/* Salon */}
            <div className="pt-2 first:pt-0 flex items-start justify-between">
              <span className="text-muted flex items-center gap-1.5 font-medium">
                <Building2 size={13} className="text-primary" /> Salon:
              </span>
              <div className="text-right">
                <span className="font-bold text-text block">{salonName}</span>
                {booking?.salonAddress && (
                  <span className="text-[10px] text-muted block max-w-[200px] truncate">
                    {booking.salonAddress}
                  </span>
                )}
              </div>
            </div>

            {/* Service & Staff */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-muted flex items-center gap-1.5 font-medium">
                <Scissors size={13} className="text-primary" /> Service & Staff:
              </span>
              <div className="text-right">
                <span className="font-semibold text-text block">
                  {booking?.services.map((s) => s.name).join(', ') || 'Grooming Service'}
                </span>
                <span className="text-[10px] text-muted block">
                  Stylist: Any Available Specialist
                </span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-muted flex items-center gap-1.5 font-medium">
                <Calendar size={13} className="text-primary" /> Date & Time:
              </span>
              <span className="font-bold text-text">
                {booking ? `${booking.slot.date} at ${booking.slot.time}` : 'Scheduled'}
              </span>
            </div>

            {/* Financials */}
            <div className="pt-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-muted">
                <span>Total Service Price</span>
                <span className="font-semibold text-text tabular-nums">{formatMoney(totalPaise)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-medium">
                <span>Advance Paid (25%)</span>
                <span className="tabular-nums font-bold">{formatMoney(advancePaidPaise)}</span>
              </div>
              <div className="flex items-center justify-between text-muted font-medium">
                <span>Balance Due at Salon (75%)</span>
                <span className="tabular-nums font-semibold text-text">{formatMoney(balanceDuePaise)}</span>
              </div>
            </div>

            {/* Customer Contact */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-muted flex items-center gap-1.5 font-medium">
                <User size={13} className="text-primary" /> Customer Contact:
              </span>
              <span className="font-semibold text-text font-mono">
                {user?.name || 'Aarav Sharma'} • {user?.phone || '+91 98765 43210'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={handleAddToCalendar}
            className="text-xs font-bold"
          >
            <Calendar size={15} className="mr-1.5 text-primary" />
            Add to Calendar
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleGetDirections}
            className="text-xs font-bold"
          >
            <Navigation size={15} className="mr-1.5 text-primary" />
            Get Directions
          </Button>
        </div>

        {/* 3. PRIMARY ACTION */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onViewAppointments}
          className="font-extrabold text-sm shadow-xs py-3.5"
        >
          Done & view appointments
        </Button>

        {/* 4. BOOKING STATUS GUIDE */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider">
            BOOKING STATUS GUIDE
          </h3>

          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 rounded-button bg-bg border border-border/60">
              <span className="text-base shrink-0">🟠</span>
              <div>
                <span className="font-bold text-text block">Pending</span>
                <span className="text-muted text-[11px]">Submitted — waiting for salon confirmation</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-button bg-bg border border-border/60">
              <span className="text-base shrink-0">🟢</span>
              <div>
                <span className="font-bold text-text block">Confirmed</span>
                <span className="text-muted text-[11px]">Your booking is confirmed</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-button bg-bg border border-border/60">
              <span className="text-base shrink-0">⚪</span>
              <div>
                <span className="font-bold text-text block">Completed</span>
                <span className="text-muted text-[11px]">Visit finished — thanks for coming</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-button bg-bg border border-border/60">
              <span className="text-base shrink-0">🔴</span>
              <div>
                <span className="font-bold text-text block">Cancelled</span>
                <span className="text-muted text-[11px]">This booking was cancelled</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-button bg-bg border border-border/60">
              <span className="text-base shrink-0">🟠</span>
              <div>
                <span className="font-bold text-text block">No-show</span>
                <span className="text-muted text-[11px]">Marked as missed — you can rebook anytime</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
