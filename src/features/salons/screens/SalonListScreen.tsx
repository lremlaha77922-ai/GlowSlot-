import React, { useState, useEffect } from 'react';
import { Salon, FilterOptions } from '../../../types';
import { salonService } from '../services/salonService';
import { FilterSheet } from '../components/FilterSheet';
import { formatMoney } from '../../../utils/money';
import { Chip } from '../../../components/Chip';
import { Skeleton } from '../../../components/Skeleton';
import { EmptyState } from '../../../components/EmptyState';
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Heart,
  X,
  History,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';

const CATEGORIES = ['All', 'Haircut', 'Shave & Beard', 'Facial', 'Massage'];

interface SalonListScreenProps {
  onSelectSalon: (salonId: string) => void;
}

export const SalonListScreen: React.FC<SalonListScreenProps> = ({
  onSelectSalon,
}) => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Haircut Koramangala',
    'Beard Trim',
    'Spa Lounge',
  ]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const [filters, setFilters] = useState<FilterOptions>({
    gender: 'all',
    category: 'All',
    sortBy: 'distance',
    minPrice: 10000,
    maxPrice: 50000,
    openNowOnly: false,
    rating4PlusOnly: false,
    offersOnly: false,
  });

  const { showToast } = useUIStore();

  const loadSalons = async () => {
    setIsLoading(true);
    try {
      const data = await salonService.list(filters, searchQuery);
      setSalons(data);
    } catch {
      showToast('Error loading salons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSalons();
  }, [filters, searchQuery]);

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setIsSearchFocused(false);
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches([query.trim(), ...recentSearches.slice(0, 4)]);
    }
  };

  const toggleFavorite = (salonId: string, name: string) => {
    setFavorites((prev) => {
      const next = !prev[salonId];
      showToast(next ? `Saved ${name} to favorites` : `Removed ${name} from favorites`);
      return { ...prev, [salonId]: next };
    });
  };

  return (
    <div className="flex-1 pb-24 bg-bg text-text">
      {/* Sticky Top Filter & Search Bar */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 pt-3 pb-2.5">
        {/* Title & Gender Segmented Toggle */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-text">At Salon</h1>

          {/* Gender segmented toggle per Design.md 8.4 */}
          <div className="h-8 p-0.5 rounded-button bg-muted/15 border border-border flex items-center">
            {(['all', 'male', 'female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setFilters({ ...filters, gender: g })}
                className={`h-full px-2.5 rounded-[10px] text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filters.gender === g
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                {g === 'all' ? 'All' : g === 'male' ? 'Men' : 'Women'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar with Suggestions */}
        <div className="relative mb-2.5">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search salon name, area, service..."
              className="h-10 w-full pl-9 pr-8 rounded-button border border-border bg-surface text-xs text-text placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-muted hover:text-text cursor-pointer p-0.5"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown & Recent Searches */}
          {isSearchFocused && !searchQuery && (
            <div className="absolute top-11 inset-x-0 z-40 bg-surface border border-border rounded-card shadow-level-2 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-muted uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <History size={12} /> Recent Searches
                </span>
                <button
                  onClick={() => setIsSearchFocused(false)}
                  className="text-primary hover:underline text-[10px]"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {recentSearches.map((rec) => (
                  <button
                    key={rec}
                    onClick={() => handleSearchSubmit(rec)}
                    className="px-2.5 py-1 rounded-chip bg-primary-soft text-primary text-xs hover:opacity-90 cursor-pointer"
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Chips (horizontal scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              selected={filters.category === cat}
              onClick={() => setFilters({ ...filters, category: cat })}
            >
              {cat}
            </Chip>
          ))}
        </div>

        {/* Quick Filter Chips & Sheet Trigger */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-border/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setIsFilterSheetOpen(true)}
            className="h-7 px-2.5 rounded-chip border border-border bg-surface text-text text-[11px] font-semibold flex items-center gap-1 shrink-0 hover:bg-primary-soft/50 cursor-pointer"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={12} className="text-primary" />
            <span>Filters</span>
          </button>

          <button
            onClick={() =>
              setFilters({ ...filters, rating4PlusOnly: !filters.rating4PlusOnly })
            }
            className={`h-7 px-2.5 rounded-chip border text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-all ${
              filters.rating4PlusOnly
                ? 'bg-primary-soft text-primary border-primary'
                : 'bg-surface text-muted border-border hover:text-text'
            }`}
          >
            <Star size={11} className={filters.rating4PlusOnly ? 'fill-primary' : ''} />
            <span>Rating 4.0+</span>
          </button>

          <button
            onClick={() =>
              setFilters({ ...filters, offersOnly: !filters.offersOnly })
            }
            className={`h-7 px-2.5 rounded-chip border text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-all ${
              filters.offersOnly
                ? 'bg-primary-soft text-primary border-primary'
                : 'bg-surface text-muted border-border hover:text-text'
            }`}
          >
            <Sparkles size={11} />
            <span>Deals</span>
          </button>

          <button
            onClick={() =>
              setFilters({ ...filters, openNowOnly: !filters.openNowOnly })
            }
            className={`h-7 px-2.5 rounded-chip border text-[11px] font-semibold shrink-0 cursor-pointer transition-all ${
              filters.openNowOnly
                ? 'bg-primary-soft text-primary border-primary'
                : 'bg-surface text-muted border-border hover:text-text'
            }`}
          >
            Open Now
          </button>
        </div>
      </header>

      {/* Main Salon Cards List */}
      <main className="px-4 pt-3 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-surface rounded-card border border-border p-3 flex gap-3"
              >
                <Skeleton className="w-24 h-24 shrink-0" radius="button" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-1/2 h-3" />
                  <Skeleton className="w-1/4 h-3 mt-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : salons.length === 0 ? (
          <EmptyState
            title="No salons found"
            helperText="Try adjusting your filters, selecting a different category, or broadening your search."
            actionLabel="Reset Filters"
            onAction={() =>
              setFilters({
                gender: 'all',
                category: 'All',
                sortBy: 'distance',
                minPrice: 10000,
                maxPrice: 50000,
                openNowOnly: false,
                rating4PlusOnly: false,
                offersOnly: false,
              })
            }
          />
        ) : (
          salons.map((salon) => {
            const isFav = !!favorites[salon.id];

            return (
              <div
                key={salon.id}
                onClick={() => onSelectSalon(salon.id)}
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
                    className={`absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider ${
                      salon.isOpen
                        ? 'bg-success text-white'
                        : 'bg-muted text-white'
                    }`}
                  >
                    {salon.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>

                {/* Info */}
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
                    <span className="text-[11px] text-muted">Services from</span>
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
          })
        )}
      </main>

      {/* O02 Filter Sheet */}
      <FilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onApply={(updated) => setFilters(updated)}
      />
    </div>
  );
};
