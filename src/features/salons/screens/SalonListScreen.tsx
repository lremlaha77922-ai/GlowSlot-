import React, { useState, useEffect } from 'react';
import { Salon, FilterOptions } from '../../../types';
import { salonService } from '../services/salonService';
import { FilterSheet } from '../components/FilterSheet';
import { formatMoney } from '../../../utils/money';
import { Chip } from '../../../components/Chip';
import { Skeleton } from '../../../components/Skeleton';
import { EmptyState } from '../../../components/EmptyState';
import { PullToRefresh } from '../../../components/PullToRefresh';
import { useFavoritesStore } from '../../../store/useFavoritesStore';
import { useUIStore } from '../../../store/useUIStore';
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

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { showToast } = useUIStore();

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

  const handleRefresh = async () => {
    await loadSalons();
    showToast('Salons and live chair availability refreshed.');
  };

  const handleGenderToggle = (g: 'all' | 'male' | 'female') => {
    setFilters((prev) => ({ ...prev, gender: g }));
  };

  const handleCategorySelect = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat }));
  };

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    setIsSearchFocused(false);
    if (term.trim() && !recentSearches.includes(term.trim())) {
      setRecentSearches((prev) => [term.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleToggleFav = (salon: Salon, e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleFavorite(salon.id);
    showToast(added ? `Saved ${salon.name} to favorites` : `Removed ${salon.name} from favorites`);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex-1 pb-24 bg-bg text-text">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 pt-3 pb-2.5">
          {/* Search Bar + Filter Button */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
                placeholder="Search salons, services, areas..."
                className="w-full h-10 pl-9 pr-8 rounded-input bg-bg border border-border text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterSheetOpen(true)}
              className="h-10 px-3 rounded-button bg-surface border border-border flex items-center gap-1.5 text-xs font-semibold text-text hover:bg-primary-soft/50 transition-colors cursor-pointer shrink-0"
              aria-label="Open filters"
            >
              <SlidersHorizontal size={14} className="text-primary" />
              <span>Filter</span>
            </button>
          </div>

          {/* Gender Segmented Control per Design.md 8.4 */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="h-8 p-0.5 rounded-button bg-muted/15 border border-border flex items-center flex-1 max-w-[240px]">
              {(['all', 'male', 'female'] as const).map((g) => {
                const isActive = filters.gender === g;
                return (
                  <button
                    key={g}
                    onClick={() => handleGenderToggle(g)}
                    className={`flex-1 h-full rounded-[8px] text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                      isActive
                        ? 'bg-surface text-primary shadow-xs font-bold'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    {g === 'all' ? 'All' : g === 'male' ? 'Men' : 'Women'}
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] text-muted font-medium">
              {salons.length} places
            </span>
          </div>

          {/* Horizontal Category Chips per Design.md 8.4 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                selected={filters.category === cat}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat}
              </Chip>
            ))}
          </div>
        </header>

        {/* Search Autocomplete / Recent Suggestions Overlay */}
        {isSearchFocused && searchQuery.length === 0 && (
          <div className="bg-surface border-b border-border p-4 shadow-level-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <History size={12} /> Recent Searches
              </span>
              <button
                onClick={() => setIsSearchFocused(false)}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                Done
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => handleSearchSubmit(term)}
                  className="px-2.5 py-1 rounded-chip bg-muted/10 border border-border text-xs text-text hover:bg-primary-soft/50 transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Salon Cards List */}
        <main className="p-4 flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface rounded-card border border-border p-3 flex gap-3 shadow-level-1"
              >
                <Skeleton className="w-24 h-24" radius="button" />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <Skeleton className="w-3/5 h-4" />
                    <Skeleton className="w-2/5 h-3 mt-2" />
                  </div>
                  <Skeleton className="w-1/2 h-3.5" />
                </div>
              </div>
            ))
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
              const isFav = isFavorite(salon.id);

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
                    onClick={(e) => handleToggleFav(salon, e)}
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
    </PullToRefresh>
  );
};
