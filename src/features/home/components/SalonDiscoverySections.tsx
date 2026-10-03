import React from 'react';
import { Salon } from '../../../types';
import { SalonCard } from '../../../components/SalonCard';
import { ChevronRight, ShieldCheck, Star, TrendingUp, Sparkles, MapPin } from 'lucide-react';

interface SalonDiscoverySectionsProps {
  salons: Salon[];
  onSelectSalon: (salonId: string) => void;
  onBookNow?: (salon: Salon) => void;
  onExploreSalons?: () => void;
}

export const SalonDiscoverySections: React.FC<SalonDiscoverySectionsProps> = ({
  salons,
  onSelectSalon,
  onBookNow,
  onExploreSalons,
}) => {
  // 1. Nearby Verified Salons (Sorted by distanceKm asc)
  const nearbySalons = [...salons]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 6);

  // 2. Top Rated Near You (Sorted by rating desc)
  const topRatedSalons = [...salons]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 6);

  // 3. Trending This Week (Highest review count & deals)
  const trendingSalons = [...salons]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6);

  // 4. Recommended For You (Personalized mixture)
  const recommendedSalons = [...salons]
    .filter((s) => s.rating >= 4.7 || s.isDeal)
    .slice(0, 6);

  const renderHorizontalSection = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    badgeType: 'VERIFIED' | 'TOP RATED' | 'TRENDING' | 'FOR YOU',
    list: Salon[]
  ) => {
    return (
      <section className="py-4 border-b border-border/60">
        {/* Section Header */}
        <div className="px-4 flex items-center justify-between mb-2.5">
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-button bg-primary-soft text-primary mt-0.5 shrink-0">
              {icon}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-text tracking-tight flex items-center gap-1.5">
                {title}
              </h2>
              <p className="text-[11px] text-muted font-medium">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={onExploreSalons || (() => onSelectSalon(list[0]?.id || 'sal-1'))}
            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-0.5 cursor-pointer shrink-0 pl-2"
          >
            <span>See all</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Mobile-first Horizontal Scroll Container */}
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x snap-mandatory">
          {list.map((salon) => (
            <div key={`${badgeType}-${salon.id}`} className="snap-start">
              <SalonCard
                salon={salon}
                badgeType={badgeType}
                variant="horizontal"
                onViewProfile={() => onSelectSalon(salon.id)}
                onBookNow={() => onBookNow ? onBookNow(salon) : onSelectSalon(salon.id)}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="flex flex-col">
      {/* 1. Nearby Verified Salons */}
      {renderHorizontalSection(
        'Nearby Verified Salons',
        'Sorted by distance · verified partners first',
        <ShieldCheck size={18} />,
        'VERIFIED',
        nearbySalons
      )}

      {/* 2. Top Rated Near You */}
      {renderHorizontalSection(
        'Top Rated Near You',
        'Highest-rated salons in your area',
        <Star size={18} />,
        'TOP RATED',
        topRatedSalons
      )}

      {/* 3. Trending This Week */}
      {renderHorizontalSection(
        'Trending This Week',
        'Based on bookings, reviews, QR payments & repeat visits',
        <TrendingUp size={18} />,
        'TRENDING',
        trendingSalons
      )}

      {/* 4. Recommended For You */}
      {renderHorizontalSection(
        'Recommended For You',
        'Based on your bookings, favourites and area',
        <Sparkles size={18} />,
        'FOR YOU',
        recommendedSalons
      )}
    </div>
  );
};
