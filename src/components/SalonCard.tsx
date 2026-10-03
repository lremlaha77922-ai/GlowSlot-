import React from 'react';
import { Salon } from '../types';
import { formatMoney } from '../utils/money';
import { Star, MapPin, Heart, Clock } from 'lucide-react';

interface SalonCardProps {
  salon: Salon;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export const SalonCard: React.FC<SalonCardProps> = ({
  salon,
  onClick,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-surface rounded-card border border-border/80 shadow-level-1 p-3 flex gap-3 relative cursor-pointer hover:border-primary/40 hover:shadow-level-2 transition-all"
    >
      {/* 96x96 Image left per Design.md 8.4 */}
      <div className="w-24 h-24 rounded-button bg-muted/20 shrink-0 overflow-hidden relative">
        <img
          src={salon.images[0]}
          alt={salon.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Open/Closed Tag */}
        <span
          className={`absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-chip backdrop-blur-xs ${
            salon.isOpen ? 'bg-success/90 text-white' : 'bg-black/70 text-white/80'
          }`}
        >
          {salon.isOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      {/* Salon Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between pr-7">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted mb-0.5">
            <span className="capitalize font-semibold text-primary">
              {salon.gender}
            </span>
            <span>•</span>
            <span className="truncate">{salon.area}</span>
          </div>

          <h3 className="text-sm font-bold text-text truncate" title={salon.name}>
            {salon.name}
          </h3>

          <div className="flex items-center gap-1 text-xs text-muted mt-1">
            <div className="flex items-center gap-0.5 font-bold text-text">
              <Star size={12} className="fill-deal text-deal" />
              <span>{salon.rating}</span>
            </div>
            <span>({salon.reviewCount})</span>
            <span>•</span>
            <span>{salon.distanceKm} km</span>
          </div>
        </div>

        {/* Pricing / Deals */}
        <div className="mt-2 pt-1.5 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] text-muted">Starts from</span>
            <span className="text-xs font-bold text-text tabular-nums">
              {formatMoney(salon.startingPrice)}
            </span>
          </div>

          {salon.isDeal && salon.dealDiscountPercent && (
            <span className="text-[10px] font-bold text-deal bg-deal/10 px-1.5 py-0.5 rounded-chip">
              {salon.dealDiscountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Heart Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(e);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full text-muted hover:text-accent transition-colors cursor-pointer"
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart
            size={16}
            className={isFavorite ? 'fill-accent text-accent' : ''}
          />
        </button>
      )}
    </div>
  );
};
