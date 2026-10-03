import React, { useState } from 'react';
import { Salon } from '../../../types';
import { formatMoney } from '../../../utils/money';
import { Star, MapPin, Heart } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';

interface PopularSalonsSectionProps {
  salons: Salon[];
  onSelectSalon?: (salonId: string) => void;
}

export const PopularSalonsSection: React.FC<PopularSalonsSectionProps> = ({
  salons,
  onSelectSalon,
}) => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const { showToast } = useUIStore();

  const toggleFavorite = (salonId: string, name: string) => {
    setFavorites((prev) => {
      const next = !prev[salonId];
      showToast(next ? `Saved ${name} to favorites` : `Removed ${name} from favorites`);
      return { ...prev, [salonId]: next };
    });
  };

  return (
    <section className="px-4 pt-4 pb-2" aria-labelledby="popular-salons-heading">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 id="popular-salons-heading" className="text-base font-bold text-text">
            Popular Salons
          </h2>
          <p className="text-xs text-muted">Top-rated grooming spots near you</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {salons.map((salon) => {
          const isFav = !!favorites[salon.id];

          return (
            <div
              key={salon.id}
              onClick={() => onSelectSalon?.(salon.id)}
              className="bg-surface rounded-card border border-border/80 shadow-level-1 p-3 flex gap-3 relative cursor-pointer hover:border-primary/40 hover:shadow-level-2 transition-all duration-300 group"
            >
              {/* 96x96 Image left per Design.md 8.4 */}
              <div className="w-24 h-24 rounded-button bg-muted/20 shrink-0 overflow-hidden relative">
                <img
                  src={salon.images[0]}
                  alt={salon.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {/* Open/Closed Tag */}
                <span
                  className={`absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider ${
                    salon.isOpen
                      ? 'bg-success text-white'
                      : 'bg-muted text-white'
                  }`}
                >
                  {salon.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>

              {/* Salon Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between pr-7">
                <div>
                  <h3 className="text-sm font-bold text-text truncate" title={salon.name}>
                    {salon.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted mt-0.5">
                    <MapPin size={11} className="shrink-0" />
                    <span className="truncate">{salon.area}</span>
                    <span>•</span>
                    <span className="shrink-0">{salon.distanceKm} km</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-1 text-xs">
                  <div className="flex items-center gap-0.5 font-bold text-text">
                    <Star size={12} className="fill-deal text-deal" />
                    <span>{salon.rating}</span>
                  </div>
                  <span className="text-muted text-[11px]">
                    ({salon.reviewCount} reviews)
                  </span>
                </div>

                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[11px] text-muted">From</span>
                  <span className="text-xs font-bold text-primary tabular-nums">
                    {formatMoney(salon.startingPrice)}
                  </span>
                </div>
              </div>

              {/* Heart icon top-right per Design.md 8.4 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(salon.id, salon.name);
                }}
                className="absolute top-3 right-3 p-1 rounded-full text-muted hover:text-accent transition-colors cursor-pointer"
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  size={18}
                  className={isFav ? 'fill-accent text-accent' : 'text-muted'}
                />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
