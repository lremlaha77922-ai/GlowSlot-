import React, { useState, useEffect } from 'react';
import { Salon, FilterOptions } from '../../../types';
import { salonService } from '../services/salonService';
import { FilterSheet } from '../components/FilterSheet';
import { SalonCard } from '../../../components/SalonCard';
import { InteractiveSalonMap } from '../../../components/InteractiveSalonMap';
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
  List,
  Map,
} from 'lucide-react';

const CATEGORIES = ['All', 'Haircut', 'Shave & Beard', 'Facial', 'Massage'];

interface SalonListScreenProps {
  onSelectSalon: (salonId: string) => void;
  onBookNowModal?: (salon: Salon) => void;
}

export const SalonListScreen: React.FC<SalonListScreenProps> = ({
  onSelectSalon,
  onBookNowModal,
}) => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
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

          {/* Gender Segmented Control & View Mode Toggle (List vs Map) */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="h-8 p-0.5 rounded-button bg-muted/15 border border-border flex items-center flex-1 max-w-[200px]">
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

            {/* View Mode Toggle: List vs Map */}
            <div className="h-8 p-0.5 rounded-button bg-muted/15 border border-border flex items-center gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`h-full px-2.5 rounded-[8px] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-surface text-primary shadow-xs' : 'text-muted hover:text-text'
                }`}
              >
                <List size={13} /> List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`h-full px-2.5 rounded-[8px] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-surface text-primary shadow-xs' : 'text-muted hover:text-text'
                }`}
              >
                <Map size={13} /> Map
              </button>
            </div>
          </div>

          {/* Horizontal Category Chips */}
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

        {/* Main Content: List vs Map View */}
        <main className="p-4 flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface rounded-card border border-border p-3 flex gap-3 shadow-level-1"
              >
                <Skeleton className="w-32 h-32" radius="button" />
                <div className="flex-1 flex flex-col gap-2 justify-center">
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-1/2 h-3" />
                  <Skeleton className="w-1/4 h-4 mt-2" />
                </div>
              </div>
            ))
          ) : salons.length === 0 ? (
            <EmptyState
              title="No salons found"
              description="Try adjusting your filters, location, or search term."
              actionLabel="Reset Filters"
              onAction={() => {
                setFilters({
                  gender: 'all',
                  category: 'All',
                  sortBy: 'distance',
                  minPrice: 10000,
                  maxPrice: 50000,
                  openNowOnly: false,
                  rating4PlusOnly: false,
                  offersOnly: false,
                });
                setSearchQuery('');
              }}
            />
          ) : viewMode === 'map' ? (
            <InteractiveSalonMap
              salons={salons}
              onSelectSalon={onSelectSalon}
              onBookNow={(s) => {
                if (onBookNowModal) onBookNowModal(s);
                else onSelectSalon(s.id);
              }}
              className="h-[500px]"
            />
          ) : (
            salons.map((salon) => (
              <SalonCard
                key={salon.id}
                salon={salon}
                badge={salon.badgeType}
                variant="list"
                onClick={() => onSelectSalon(salon.id)}
                onViewProfile={() => onSelectSalon(salon.id)}
                onBookNow={() => {
                  if (onBookNowModal) {
                    onBookNowModal(salon);
                  } else {
                    onSelectSalon(salon.id);
                  }
                }}
                isFavorite={isFavorite(salon.id)}
                onToggleFavorite={(e) => handleToggleFav(salon, e)}
              />
            ))
          )}
        </main>

        {/* Filter Sheet Modal */}
        {isFilterSheetOpen && (
          <FilterSheet
            isOpen={isFilterSheetOpen}
            onClose={() => setIsFilterSheetOpen(false)}
            filters={filters}
            onApply={(newFilters) => {
              setFilters(newFilters);
              setIsFilterSheetOpen(false);
            }}
          />
        )}
      </div>
    </PullToRefresh>
  );
};
