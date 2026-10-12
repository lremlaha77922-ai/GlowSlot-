import React, { useState } from 'react';
import { SpecialistItem, Salon } from '../../../types';
import {
  X,
  Star,
  Clock,
  Calendar,
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Scissors,
  Check,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { Button } from '../../../components/Button';

export interface StylistDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stylist: SpecialistItem | null;
  salon: Salon;
  onBookWithStylist: (stylist: SpecialistItem, slotTime?: string) => void;
}

export const StylistDetailModal: React.FC<StylistDetailModalProps> = ({
  isOpen,
  onClose,
  stylist,
  salon,
  onBookWithStylist,
}) => {
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);

  if (!isOpen || !stylist) return null;

  const slotTimes = stylist.availableSlotTimes || [
    '10:00 AM',
    '11:30 AM',
    '02:00 PM',
    '04:30 PM',
  ];

  const days = stylist.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stylist-modal-title"
    >
      <div
        className="w-full max-w-lg bg-surface border border-border rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-level-3 overflow-hidden text-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface/90 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-primary/10 text-primary">
              <Scissors size={16} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Professional Stylist Profile
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted hover:text-text hover:bg-muted/20 transition-colors cursor-pointer"
            aria-label="Close profile"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Hero Profile Header */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={stylist.photoUrl}
                alt={stylist.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-primary/20 shadow-xs"
              />
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center border-2 border-surface shadow-xs"
                title="Verified Professional"
              >
                <ShieldCheck size={14} />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2
                  id="stylist-modal-title"
                  className="text-lg sm:text-xl font-extrabold text-text tracking-tight truncate"
                >
                  {stylist.name}
                </h2>
                <CheckCircle2 size={16} className="text-primary shrink-0" />
              </div>
              <p className="text-xs font-semibold text-primary mt-0.5">{stylist.role}</p>
              <p className="text-xs text-muted mt-0.5 truncate">{salon.name}</p>

              {/* Badges / Rating */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="inline-flex items-center gap-1 bg-deal/15 text-deal px-2 py-0.5 rounded-chip text-xs font-bold">
                  <Star size={12} className="fill-deal" />
                  <span>{stylist.rating}</span>
                </div>
                <div className="inline-flex items-center gap-1 bg-muted/15 text-muted px-2 py-0.5 rounded-chip text-xs font-semibold">
                  <span>{stylist.experienceYears}+ years exp</span>
                </div>
                {stylist.totalAppointments && (
                  <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-chip text-xs font-semibold">
                    <span>{stylist.totalAppointments}+ clients</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Real-Time Availability Callout */}
          <div className="bg-primary-soft/30 border border-primary/20 rounded-card p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-bold text-text">
                  Earliest Slot:{' '}
                  <span className="text-primary">{stylist.earliestSlot}</span>
                </p>
                <p className="text-[11px] text-muted">
                  Working Hours: {stylist.workingHours || '09:30 AM - 08:00 PM'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-chip bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Available
              </span>
            </div>
          </div>

          {/* Professional Bio */}
          {stylist.bio && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                About & Expertise
              </h3>
              <p className="text-xs leading-relaxed text-text bg-surface/50 border border-border/80 rounded-card p-3">
                {stylist.bio}
              </p>
            </div>
          )}

          {/* Specializations & Techniques */}
          {stylist.specialties && stylist.specialties.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary" />
                Specializations & Techniques
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {stylist.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-surface border border-border px-2.5 py-1 rounded-chip text-xs font-semibold text-text shadow-xs"
                  >
                    <Check size={11} className="text-primary" />
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications & Accreditations */}
          {stylist.certifications && stylist.certifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Award size={13} className="text-primary" />
                Certifications & Accreditations
              </h3>
              <div className="space-y-1.5">
                {stylist.certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-card bg-muted/10 border border-border/60 text-xs text-text"
                  >
                    <ShieldCheck size={14} className="text-primary shrink-0" />
                    <span className="font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Working Days */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Calendar size={13} className="text-primary" />
              Weekly Schedule
            </h3>
            <div className="flex items-center justify-between gap-1 bg-surface border border-border rounded-card p-2.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                const isWorking = days.includes(day);
                return (
                  <div
                    key={day}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-button flex-1 text-center transition-all ${
                      isWorking
                        ? 'bg-primary/10 border border-primary/20 text-primary font-bold'
                        : 'opacity-40 text-muted'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold">{day}</span>
                    <span className="text-[11px] mt-0.5">
                      {isWorking ? '✓' : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Open Appointment Slots */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-primary" />
                Select Today's Slot with {stylist.name.split(' ')[0]}
              </span>
              <span className="text-[11px] text-primary lowercase font-semibold">
                {slotTimes.length} slots
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {slotTimes.map((time) => {
                const isSelected = selectedSlotTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() =>
                      setSelectedSlotTime(isSelected ? null : time)
                    }
                    className={`py-2 px-3 rounded-card text-xs font-bold border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface hover:bg-muted/15 border-border text-text'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Testimonial Highlight */}
          <div className="bg-muted/10 border border-border/80 rounded-card p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted flex items-center gap-1">
                <MessageCircle size={12} className="text-primary" />
                Verified Client Feedback
              </span>
              <div className="flex items-center text-deal">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-deal" />
                ))}
              </div>
            </div>
            <p className="text-xs text-text italic">
              "{stylist.name} is exceptional! Paid great attention to my requested style and delivered the best haircut I've had in months."
            </p>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 border-t border-border bg-surface flex items-center gap-3">
          <Button
            variant="outline"
            className="flex-1 text-xs"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="primary"
            className="flex-2 text-xs font-bold flex items-center justify-center gap-1.5"
            onClick={() => {
              onBookWithStylist(stylist, selectedSlotTime || undefined);
              onClose();
            }}
          >
            <span>Book with {stylist.name.split(' ')[0]}</span>
            <ChevronRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
};
