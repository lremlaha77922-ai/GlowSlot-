import React from 'react';
import { Salon } from '../../../types';
import { formatMoney } from '../../../utils/money';
import { Star, Timer, MapPin } from 'lucide-react';

interface LastMinuteDealsSectionProps {
  deals: Salon[];
  onSelectSalon?: (salonId: string) => void;
}

export const LastMinuteDealsSection: React.FC<LastMinuteDealsSectionProps> = ({
  deals,
  onSelectSalon,
}) => {
  return (
    <section className="pt-4 pb-2" aria-labelledby="deals-heading">
      <div className="px-4 flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 id="deals-heading" className="text-base font-bold text-text">
              Last-Minute Deals
            </h2>
            <span className="w-2 h-2 rounded-full bg-deal animate-ping" />
          </div>
          <p className="text-xs text-muted">Special off-peak rates expiring soon</p>
        </div>
      </div>

      {/* 260px wide cards per Design.md 8.3 */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar scroll-smooth">
        {deals.map((salon) => (
          <div
            key={salon.id}
            onClick={() => onSelectSalon?.(salon.id)}
            className="w-[260px] shrink-0 bg-surface rounded-card border border-border/80 shadow-level-1 overflow-hidden flex flex-col justify-between cursor-pointer hover:border-primary/50 hover:shadow-level-2 transition-all duration-300 group"
          >
            {/* Salon Image / Placeholder with Deal badge & Countdown */}
            <div className="relative w-full h-32 bg-muted/20 overflow-hidden">
              <img
                src={salon.images[0]}
                alt={salon.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Deal Badge per Design.md 6 */}
              <div className="absolute top-2.5 left-2.5 bg-deal text-stone-900 px-2 py-0.5 rounded-[8px] text-[11px] font-bold shadow-xs">
                {salon.dealDiscountPercent}% OFF
              </div>

              {/* Countdown Timer */}
              {salon.dealEndsInMinutes && (
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-chip text-[10px] font-semibold flex items-center gap-1">
                  <Timer size={11} className="text-accent" />
                  <span>Ends in {salon.dealEndsInMinutes}m</span>
                </div>
              )}

              {/* Rating */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-surface/90 backdrop-blur-xs px-2 py-0.5 rounded-chip text-text text-xs font-bold shadow-xs">
                <Star size={12} className="fill-deal text-deal" />
                <span>{salon.rating}</span>
                <span className="text-muted font-normal text-[10px]">
                  ({salon.reviewCount})
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="text-sm font-bold text-text truncate" title={salon.name}>
                {salon.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted mt-1">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{salon.area}</span>
                <span>•</span>
                <span className="shrink-0">{salon.distanceKm} km</span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted block uppercase tracking-wide">
                    Services from
                  </span>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {formatMoney(salon.startingPrice)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-primary bg-primary-soft px-3 py-1.5 rounded-button">
                  View Slots
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
