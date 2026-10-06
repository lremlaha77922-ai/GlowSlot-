import React from 'react';
import { Salon } from '../types';
import { formatMoney } from '../utils/money';
import { Star, MapPin, Heart, Clock, ShieldCheck, CheckCircle2, ChevronRight, Calendar, Navigation } from 'lucide-react';
import { openInGoogleMaps } from '../utils/mapHelper';

export interface SalonCardProps {
  salon: Salon;
  badge?: string; // VERIFIED, TOP RATED, TRENDING, FOR YOU
  badgeType?: 'VERIFIED' | 'TOP RATED' | 'TRENDING' | 'FOR YOU';
  variant?: 'horizontal' | 'list';
  onClick?: () => void;
  onViewProfile?: () => void;
  onBookNow?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export const SalonCard: React.FC<SalonCardProps> = ({
  salon,
  badge,
  badgeType,
  variant = 'horizontal',
  onClick,
  onViewProfile,
  onBookNow,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const displayBadge = badge || badgeType || salon.badgeType;

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewProfile) {
      onViewProfile();
    } else if (onClick) {
      onClick();
    }
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookNow) {
      onBookNow();
    } else if (onViewProfile) {
      onViewProfile();
    } else if (onClick) {
      onClick();
    }
  };

  const badgeColorClass =
    displayBadge === 'VERIFIED'
      ? 'bg-blue-600/90 text-white'
      : displayBadge === 'TOP RATED'
      ? 'bg-amber-500/90 text-white'
      : displayBadge === 'TRENDING'
      ? 'bg-purple-600/90 text-white'
      : displayBadge === 'FOR YOU'
      ? 'bg-emerald-600/90 text-white'
      : 'bg-primary/90 text-white';

  const categoriesText = salon.categories ? salon.categories.slice(0, 3).join(', ') : 'Grooming & Styling';
  const slotsTodayCount = salon.availableSlotsToday ?? 8;

  if (variant === 'horizontal') {
    return (
      <div
        onClick={handleProfileClick}
        className="w-[280px] sm:w-[310px] shrink-0 bg-surface rounded-card border border-border/80 shadow-level-1 hover:shadow-level-2 transition-all duration-150 overflow-hidden flex flex-col justify-between cursor-pointer group"
      >
        <div>
          {/* Cover Image Header */}
          <div className="h-36 sm:h-40 w-full relative bg-muted/20 overflow-hidden">
            <img
              src={salon.images[0]}
              alt={salon.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Top Left Section Badge (VERIFIED / TOP RATED / TRENDING / FOR YOU) */}
            {displayBadge && (
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
                <span className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-chip backdrop-blur-xs shadow-xs ${badgeColorClass}`}>
                  {displayBadge}
                </span>
              </div>
            )}

            {/* Favorite Heart Button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(e);
                }}
                className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-accent transition-colors cursor-pointer"
                aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart
                  size={15}
                  className={isFavorite ? 'fill-accent text-accent' : ''}
                />
              </button>
            )}

            {/* Bottom Overlay Badges: Open Status & Today's Available Slots */}
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-bold">
              <span
                className={`px-2 py-0.5 rounded-chip backdrop-blur-sm shadow-xs ${
                  salon.isOpen ? 'bg-emerald-600/90 text-white' : 'bg-stone-900/80 text-stone-300'
                }`}
              >
                {salon.isOpen ? 'Open Now' : 'Closed'}
              </span>

              {slotsTodayCount > 0 ? (
                <span className="px-2 py-0.5 rounded-chip bg-black/70 text-amber-300 backdrop-blur-sm flex items-center gap-1 border border-amber-400/30">
                  <Calendar size={11} />
                  <span>{slotsTodayCount} slots today</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-chip bg-black/70 text-muted backdrop-blur-sm">
                  Full today
                </span>
              )}
            </div>
          </div>

          {/* Card Body Details */}
          <div className="p-3.5 flex flex-col gap-2">
            {/* Salon Name & Verified Checkmark */}
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-text truncate tracking-tight" title={salon.name}>
                  {salon.name}
                </h3>
                {(salon.isVerified ?? true) && (
                  <CheckCircle2 size={15} className="text-primary shrink-0 fill-primary/10" />
                )}
              </div>

              {/* Categories */}
              <p className="text-[11px] text-muted truncate mt-0.5 font-medium">
                {categoriesText}
              </p>
            </div>

            {/* Rating & Distance */}
            <div className="flex items-center justify-between text-xs text-muted pt-0.5 border-t border-border/50">
              <div className="flex items-center gap-1 font-bold text-text">
                <Star size={13} className="fill-deal text-deal" />
                <span>{salon.rating}</span>
                <span className="text-muted font-normal text-[11px]">({salon.reviewCount})</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px]">
                  <MapPin size={12} className="text-primary/80" />
                  <span className="truncate max-w-[80px]">{salon.area}</span>
                  <span>•</span>
                  <span className="font-semibold">{salon.distanceKm} km</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openInGoogleMaps(salon.name, salon.address, salon.latitude, salon.longitude);
                  }}
                  className="p-1 text-primary hover:bg-primary-soft rounded-full transition-colors cursor-pointer"
                  title={`Get directions to ${salon.name}`}
                  aria-label={`Get directions to ${salon.name}`}
                >
                  <Navigation size={12} />
                </button>
              </div>
            </div>

            {/* Starting Price Banner */}
            <div className="flex items-center justify-between bg-primary-soft/40 px-2.5 py-1.5 rounded-chip text-xs">
              <span className="text-[11px] text-muted font-medium">Starting Price</span>
              <span className="font-bold text-text tabular-nums">{formatMoney(salon.startingPrice)}</span>
            </div>
          </div>
        </div>

        {/* Dual CTA Buttons: View Profile & Book Now */}
        <div className="p-3.5 pt-0 grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={handleProfileClick}
            className="w-full py-2 px-2 rounded-button border border-border bg-surface hover:bg-primary-soft text-text text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <span>View Profile</span>
          </button>

          <button
            onClick={handleBookClick}
            className="w-full py-2 px-2 rounded-button bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1"
          >
            <span>Book Now</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Full-width List Variant
  return (
    <div
      onClick={handleProfileClick}
      className="bg-surface rounded-card border border-border/80 shadow-level-1 p-3.5 flex flex-col sm:flex-row gap-3 relative cursor-pointer hover:border-primary/40 hover:shadow-level-2 transition-all"
    >
      {/* Cover Image Left */}
      <div className="w-full sm:w-32 h-32 sm:h-auto rounded-button bg-muted/20 shrink-0 overflow-hidden relative">
        <img
          src={salon.images[0]}
          alt={salon.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {displayBadge && (
          <span className={`absolute top-2 left-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-chip backdrop-blur-xs ${badgeColorClass}`}>
            {displayBadge}
          </span>
        )}

        <span
          className={`absolute bottom-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-chip backdrop-blur-xs ${
            salon.isOpen ? 'bg-emerald-600/90 text-white' : 'bg-black/80 text-white/80'
          }`}
        >
          {salon.isOpen ? 'Open Now' : 'Closed'}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-text truncate" title={salon.name}>
                {salon.name}
              </h3>
              {(salon.isVerified ?? true) && (
                <CheckCircle2 size={15} className="text-primary shrink-0" />
              )}
            </div>

            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(e);
                }}
                className="p-1 text-muted hover:text-accent transition-colors cursor-pointer"
                aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart size={16} className={isFavorite ? 'fill-accent text-accent' : ''} />
              </button>
            )}
          </div>

          <p className="text-[11px] text-muted truncate mt-0.5">{categoriesText}</p>

          <div className="flex items-center gap-2 text-xs text-muted mt-1">
            <div className="flex items-center gap-0.5 font-bold text-text">
              <Star size={12} className="fill-deal text-deal" />
              <span>{salon.rating}</span>
            </div>
            <span>({salon.reviewCount} reviews)</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin size={11} className="text-primary shrink-0" />
              <span className="truncate">{salon.area}</span>
              <span>•</span>
              <span className="font-semibold text-text">{salon.distanceKm} km</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openInGoogleMaps(salon.name, salon.address, salon.latitude, salon.longitude);
              }}
              className="flex items-center gap-1 text-primary font-bold hover:underline cursor-pointer ml-1"
              aria-label={`Get directions to ${salon.name}`}
            >
              <Navigation size={11} />
              <span>Directions</span>
            </button>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted">Starting from</span>
            <span className="text-xs font-bold text-text tabular-nums">{formatMoney(salon.startingPrice)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleProfileClick}
              className="py-1.5 px-3 rounded-button border border-border bg-surface hover:bg-primary-soft text-text text-xs font-bold transition-colors cursor-pointer"
            >
              View Profile
            </button>
            <button
              onClick={handleBookClick}
              className="py-1.5 px-3 rounded-button bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
