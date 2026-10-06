import React from 'react';
import { QuickService } from '../../../types';
import { Button } from '../../../components/Button';
import { formatMoney } from '../../../utils/money';
import { useUIStore } from '../../../store/useUIStore';
import { Clock, Scissors, Sparkles, HeartHandshake, Smile } from 'lucide-react';

interface QuickServicesSectionProps {
  services: QuickService[];
  onSelectSalon?: (salonId: string) => void;
}

export const QuickServicesSection: React.FC<QuickServicesSectionProps> = ({
  services,
  onSelectSalon,
}) => {
  const { showToast } = useUIStore();

  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hair':
        return <Scissors size={14} className="text-white" />;
      case 'beard':
        return <Sparkles size={14} className="text-amber-300" />;
      case 'relaxation':
        return <HeartHandshake size={14} className="text-rose-300" />;
      default:
        return <Smile size={14} className="text-emerald-300" />;
    }
  };

  const handleBook = () => {
    if (onSelectSalon) {
      // Directs them to the main premium salon detail screen to book the service
      onSelectSalon('luxe-cut-style');
    } else {
      showToast('Select a salon to book this service.');
    }
  };

  return (
    <section className="pt-4 pb-2" aria-labelledby="quick-services-heading">
      <div className="px-4 flex items-center justify-between mb-3">
        <div>
          <h2 id="quick-services-heading" className="text-base font-bold text-text">
            Quick Services
          </h2>
          <p className="text-xs text-muted">Express 30-minute grooming slots</p>
        </div>
        <span className="text-[11px] font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-chip">
          30 MIN
        </span>
      </div>

      {/* Horizontal scroll container with 140px wide cards */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar scroll-smooth">
        {services.map((service) => {
          return (
            <div
              key={service.id}
              className="w-[140px] shrink-0 bg-surface rounded-card border border-border/80 shadow-level-1 overflow-hidden flex flex-col justify-between hover:border-primary/50 hover:shadow-level-2 transition-all duration-300 group"
            >
              {/* Cinematic Image Thumbnail Header */}
              <div className="w-full h-22 relative overflow-hidden bg-stone-900/10">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-soft/80 to-surface flex items-center justify-center">
                    {getServiceIcon(service.category)}
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-900/20 to-transparent pointer-events-none" />

                {/* Service Category Icon Overlay */}
                <div className="absolute top-1.5 left-1.5 p-1 rounded-full bg-stone-900/70 backdrop-blur-md border border-white/20 shadow-xs flex items-center justify-center">
                  {getServiceIcon(service.category)}
                </div>
              </div>

              {/* Service Details */}
              <div className="p-2.5 pt-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-text truncate line-clamp-1" title={service.name}>
                    {service.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                    <Clock size={11} />
                    <span>{service.durationMin}m</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1.5 mb-2">
                    <span className="text-sm font-bold text-text tabular-nums">
                      {formatMoney(service.price)}
                    </span>
                    {service.originalPrice && service.originalPrice > service.price && (
                      <span className="text-[10px] text-muted line-through tabular-nums">
                        {formatMoney(service.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Simple Book Now CTA */}
                <Button
                  onClick={handleBook}
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="font-bold text-[11px] py-1 h-7 rounded-button"
                >
                  Book Slot
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
