import React, { useState, useMemo } from 'react';
import { SpecialistItem, Salon } from '../../../types';
import {
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  UserCheck,
  Calendar,
  Filter,
} from 'lucide-react';
import { Button } from '../../../components/Button';
import { StylistDetailModal } from './StylistDetailModal';

export interface MeetOurStylistsSectionProps {
  salon: Salon;
  specialists?: SpecialistItem[];
  onBookWithStylist: (stylist: SpecialistItem, slotTime?: string) => void;
  layout?: 'grid' | 'carousel';
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
}

export const MeetOurStylistsSection: React.FC<MeetOurStylistsSectionProps> = ({
  salon,
  specialists = salon.specialists || [],
  onBookWithStylist,
  layout = 'grid',
  title = 'Meet Our Stylists',
  subtitle = 'Certified specialists with guaranteed slot bookings',
  showFilters = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalStylist, setActiveModalStylist] = useState<SpecialistItem | null>(null);

  // Derive dynamic filter categories from stylists' specialties and roles
  const filterCategories = useMemo(() => {
    const categories = ['All', 'Hair', 'Beard', 'Skin & Facial', 'Coloring'];
    return categories;
  }, []);

  const filteredSpecialists = useMemo(() => {
    if (selectedCategory === 'All') return specialists;
    const cat = selectedCategory.toLowerCase();
    return specialists.filter((s) => {
      const matchRole = s.role.toLowerCase().includes(cat);
      const matchSpecialty = s.specialties?.some((spec) =>
        spec.toLowerCase().includes(cat)
      );
      if (cat === 'skin & facial') {
        return (
          matchRole ||
          matchSpecialty ||
          s.role.toLowerCase().includes('facial') ||
          s.role.toLowerCase().includes('skin')
        );
      }
      return matchRole || matchSpecialty;
    });
  }, [specialists, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base sm:text-lg font-extrabold text-text tracking-tight flex items-center gap-1.5">
              <span>{title}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-chip bg-primary/10 text-primary">
                <UserCheck size={12} />
                {specialists.length} Experts
              </span>
            </h2>
          </div>
          <p className="text-xs text-muted mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Filter Category Chips */}
      {showFilters && filterCategories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterCategories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-chip text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface border border-border text-text hover:bg-muted/15'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      {/* Stylist Cards Grid or Carousel */}
      {filteredSpecialists.length === 0 ? (
        <div className="p-8 text-center bg-surface border border-border rounded-card text-muted space-y-2">
          <p className="text-xs font-semibold">No stylists found in this specialization.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory('All')}
            className="text-xs"
          >
            Show All Stylists
          </Button>
        </div>
      ) : (
        <div
          className={
            layout === 'carousel'
              ? 'flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory'
              : 'grid grid-cols-1 md:grid-cols-2 gap-3.5'
          }
        >
          {filteredSpecialists.map((stylist) => (
            <div
              key={stylist.id}
              className={`bg-surface border border-border rounded-card p-4 shadow-level-1 hover:border-primary/40 transition-all flex flex-col justify-between ${
                layout === 'carousel' ? 'w-[280px] shrink-0 snap-start' : 'w-full'
              }`}
            >
              <div>
                {/* Top Stylist Info Card */}
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={stylist.photoUrl}
                      alt={stylist.name}
                      className="w-16 h-16 rounded-xl object-cover border border-border shadow-xs"
                    />
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center border-2 border-surface"
                      title="Verified Staff"
                    >
                      <ShieldCheck size={11} />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h3 className="text-sm font-bold text-text truncate">
                          {stylist.name}
                        </h3>
                        <p className="text-[11px] font-medium text-primary mt-0.5 truncate">
                          {stylist.role}
                        </p>
                      </div>

                      <div className="flex items-center gap-0.5 bg-deal/15 text-deal px-1.5 py-0.5 rounded-chip text-[11px] font-bold shrink-0">
                        <Star size={11} className="fill-deal" />
                        <span>{stylist.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted">
                      <span>{stylist.experienceYears} yrs experience</span>
                      {stylist.totalAppointments && (
                        <>
                          <span>•</span>
                          <span>{stylist.totalAppointments}+ bookings</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specialization Tags */}
                {stylist.specialties && stylist.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {stylist.specialties.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="bg-muted/15 text-text border border-border/60 text-[10px] font-semibold px-2 py-0.5 rounded-chip"
                      >
                        {spec}
                      </span>
                    ))}
                    {stylist.specialties.length > 3 && (
                      <span className="text-muted text-[10px] font-semibold px-1 py-0.5">
                        +{stylist.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Availability Bar */}
                <div className="mt-3 pt-2.5 border-t border-border/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted text-[11px]">
                    <Clock size={12} className="text-primary" />
                    <span>Earliest:</span>
                    <span className="font-bold text-text">{stylist.earliestSlot}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-chip">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Open Today
                  </span>
                </div>

                {/* Quick Slots Row */}
                {stylist.availableSlotTimes && stylist.availableSlotTimes.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-0.5 scrollbar-none">
                    <span className="text-[10px] text-muted font-medium shrink-0">Today:</span>
                    {stylist.availableSlotTimes.slice(0, 3).map((t) => (
                      <button
                        key={t}
                        onClick={() => onBookWithStylist(stylist, t)}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-chip bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/20 transition-colors shrink-0 cursor-pointer"
                        title={`Book ${t} with ${stylist.name}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-[11px] py-1.5 h-auto font-bold"
                  onClick={() => setActiveModalStylist(stylist)}
                >
                  View Profile
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 text-[11px] py-1.5 h-auto font-bold"
                  onClick={() => onBookWithStylist(stylist)}
                >
                  Book with {stylist.name.split(' ')[0]}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stylist Profile Detail Modal */}
      <StylistDetailModal
        isOpen={Boolean(activeModalStylist)}
        onClose={() => setActiveModalStylist(null)}
        stylist={activeModalStylist}
        salon={salon}
        onBookWithStylist={onBookWithStylist}
      />
    </div>
  );
};
