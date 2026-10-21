import React, { useState } from 'react';
import { FilterOptions } from '../../../types';
import { formatMoney } from '../../../utils/money';
import {
  MapPin,
  ArrowUpDown,
  Tag,
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';

interface SalonDiscoveryFilterBarProps {
  filters: FilterOptions;
  onChangeFilters: (newFilters: FilterOptions) => void;
  totalResults: number;
}

export const DISTANCE_PRESETS = [
  { label: 'Any Distance', value: undefined },
  { label: '< 2 km', value: 2 },
  { label: '< 5 km', value: 5 },
  { label: '< 10 km', value: 10 },
];

export const PRICE_PRESETS = [
  { label: 'All Prices', min: 0, max: 100000 },
  { label: 'Under ₹200', min: 0, max: 20000 },
  { label: '₹200 - ₹400', min: 20000, max: 40000 },
  { label: '₹400 - ₹600', min: 40000, max: 60000 },
  { label: '₹600+', min: 60000, max: 100000 },
];

export const SORT_OPTIONS: { id: FilterOptions['sortBy']; label: string; icon: string }[] = [
  { id: 'distance', label: 'Nearest First', icon: '📍' },
  { id: 'price', label: 'Price: Low to High', icon: '💰' },
  { id: 'price_desc', label: 'Price: High to Low', icon: '💎' },
  { id: 'rating', label: 'Top Rated', icon: '⭐' },
];

export const SalonDiscoveryFilterBar: React.FC<SalonDiscoveryFilterBarProps> = ({
  filters,
  onChangeFilters,
  totalResults,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'none' | 'sort' | 'distance' | 'price'>('none');

  // Check if any non-default filters are applied
  const isDistanceActive = filters.maxDistanceKm !== undefined;
  const isPriceActive = (filters.maxPrice !== undefined && filters.maxPrice < 80000) || (filters.minPrice !== undefined && filters.minPrice > 0);
  const isSortCustom = filters.sortBy !== 'distance';
  const isOpenNowActive = !!filters.openNowOnly;
  const isRatingActive = !!filters.rating4PlusOnly;
  const hasActiveFilters = isDistanceActive || isPriceActive || isSortCustom || isOpenNowActive || isRatingActive;

  const handleResetFilters = () => {
    onChangeFilters({
      ...filters,
      sortBy: 'distance',
      minPrice: 0,
      maxPrice: 100000,
      maxDistanceKm: undefined,
      openNowOnly: false,
      rating4PlusOnly: false,
    });
    setActiveMenu('none');
  };

  const handleSelectSort = (sortBy: FilterOptions['sortBy']) => {
    onChangeFilters({ ...filters, sortBy });
    setActiveMenu('none');
  };

  const handleSelectDistance = (maxDistanceKm?: number) => {
    onChangeFilters({ ...filters, maxDistanceKm });
    setActiveMenu('none');
  };

  const handleSelectPricePreset = (min: number, max: number) => {
    onChangeFilters({ ...filters, minPrice: min, maxPrice: max });
    setActiveMenu('none');
  };

  const currentSortLabel = SORT_OPTIONS.find((s) => s.id === filters.sortBy)?.label || 'Nearest';

  return (
    <div className="flex flex-col gap-2.5 bg-surface border-b border-border/80 px-4 py-2.5 shadow-2xs">
      {/* 1. HORIZONTAL QUICK FILTER BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* Sort Pill Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setActiveMenu((prev) => (prev === 'sort' ? 'none' : 'sort'))}
            className={`h-8 px-3 rounded-chip text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isSortCustom
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-bg text-text border-border hover:border-primary/50'
            }`}
          >
            <ArrowUpDown size={12} />
            <span>{currentSortLabel}</span>
            <ChevronDown size={12} className={activeMenu === 'sort' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          {/* Sort Dropdown Menu */}
          {activeMenu === 'sort' && (
            <div className="absolute top-10 left-0 z-40 w-48 bg-surface border border-border rounded-card p-1.5 shadow-level-2 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted px-2 py-1">
                Sort Salons By
              </span>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectSort(opt.id)}
                  className={`px-2.5 py-1.5 rounded-button text-xs font-semibold flex items-center justify-between text-left transition-colors cursor-pointer ${
                    filters.sortBy === opt.id
                      ? 'bg-primary-soft text-primary font-bold'
                      : 'text-text hover:bg-muted/15'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </span>
                  {filters.sortBy === opt.id && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Distance Filter Pill Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setActiveMenu((prev) => (prev === 'distance' ? 'none' : 'distance'))}
            className={`h-8 px-3 rounded-chip text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isDistanceActive
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-bg text-text border-border hover:border-primary/50'
            }`}
          >
            <MapPin size={12} />
            <span>{filters.maxDistanceKm ? `< ${filters.maxDistanceKm} km` : 'Distance'}</span>
            <ChevronDown size={12} className={activeMenu === 'distance' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          {/* Distance Dropdown Menu */}
          {activeMenu === 'distance' && (
            <div className="absolute top-10 left-0 z-40 w-44 bg-surface border border-border rounded-card p-2 shadow-level-2 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted px-1">
                Maximum Radius
              </span>
              {DISTANCE_PRESETS.map((p) => {
                const isSelected = filters.maxDistanceKm === p.value;
                return (
                  <button
                    key={p.label}
                    onClick={() => handleSelectDistance(p.value)}
                    className={`px-2.5 py-1.5 rounded-button text-xs font-semibold flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary-soft text-primary font-bold'
                        : 'text-text hover:bg-muted/15'
                    }`}
                  >
                    <span>{p.label}</span>
                    {isSelected && <Check size={14} className="text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Price Range Filter Pill Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setActiveMenu((prev) => (prev === 'price' ? 'none' : 'price'))}
            className={`h-8 px-3 rounded-chip text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isPriceActive
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-bg text-text border-border hover:border-primary/50'
            }`}
          >
            <Tag size={12} />
            <span>
              {filters.maxPrice < 80000 || filters.minPrice > 0
                ? filters.minPrice > 0
                  ? `${formatMoney(filters.minPrice)} - ${formatMoney(filters.maxPrice)}`
                  : `Up to ${formatMoney(filters.maxPrice)}`
                : 'Price Range'}
            </span>
            <ChevronDown size={12} className={activeMenu === 'price' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          {/* Price Range Dropdown Menu */}
          {activeMenu === 'price' && (
            <div className="absolute top-10 left-0 z-40 w-56 bg-surface border border-border rounded-card p-2.5 shadow-level-2 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Starting Service Price
              </span>
              <div className="flex flex-col gap-1">
                {PRICE_PRESETS.map((preset) => {
                  const isSelected =
                    filters.minPrice === preset.min &&
                    (filters.maxPrice === preset.max || (preset.max === 100000 && filters.maxPrice >= 80000));
                  return (
                    <button
                      key={preset.label}
                      onClick={() => handleSelectPricePreset(preset.min, preset.max)}
                      className={`px-2 py-1.5 rounded-button text-xs font-semibold flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-primary-soft text-primary font-bold'
                          : 'text-text hover:bg-muted/15'
                      }`}
                    >
                      <span>{preset.label}</span>
                      {isSelected && <Check size={14} className="text-primary" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Slider in Price Dropdown */}
              <div className="pt-2 border-t border-border/80 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-muted">Max Price:</span>
                  <span className="text-primary tabular-nums">{formatMoney(filters.maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={80000}
                  step={5000}
                  value={Math.min(filters.maxPrice, 80000)}
                  onChange={(e) =>
                    onChangeFilters({ ...filters, maxPrice: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Open Now Quick Toggle */}
        <button
          onClick={() => onChangeFilters({ ...filters, openNowOnly: !filters.openNowOnly })}
          className={`h-8 px-2.5 rounded-chip text-xs font-bold border flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
            isOpenNowActive
              ? 'bg-success/15 text-success border-success'
              : 'bg-bg text-muted border-border hover:text-text'
          }`}
          aria-label="Toggle open now only"
        >
          <Sparkles size={11} className={isOpenNowActive ? 'text-success' : 'text-muted'} />
          <span>Open Now</span>
        </button>

        {/* 4.0+ Rating Quick Toggle */}
        <button
          onClick={() => onChangeFilters({ ...filters, rating4PlusOnly: !filters.rating4PlusOnly })}
          className={`h-8 px-2.5 rounded-chip text-xs font-bold border flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
            isRatingActive
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/50'
              : 'bg-bg text-muted border-border hover:text-text'
          }`}
          aria-label="Toggle 4.0 and above rating only"
        >
          <span>⭐</span>
          <span>4.0+</span>
        </button>

        {/* Toggle Detailed Filter Panel */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`h-8 px-2.5 rounded-chip text-xs font-bold border flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
            isExpanded
              ? 'bg-primary-soft text-primary border-primary/40'
              : 'bg-bg text-muted border-border hover:text-text'
          }`}
          title="Toggle Distance & Price Sliders"
        >
          <SlidersHorizontal size={12} />
          <span>Adjust</span>
        </button>

        {/* Reset Button (Only shown if filters active) */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="h-8 px-2.5 rounded-chip text-[11px] font-bold text-muted hover:text-deal border border-dashed border-border hover:border-deal/50 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 2. EXPANDABLE SLIDER CONTROL PANEL FOR DISTANCE & PRICE */}
      {isExpanded && (
        <div className="bg-bg rounded-card border border-border p-3.5 flex flex-col gap-3.5 mt-1 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text flex items-center gap-1.5">
              <SlidersHorizontal size={13} className="text-primary" />
              <span>Precision Distance & Price Sliders</span>
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-muted hover:text-text p-1 cursor-pointer"
              aria-label="Close adjust panel"
            >
              <X size={14} />
            </button>
          </div>

          {/* Distance Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text flex items-center gap-1">
                <MapPin size={12} className="text-primary" /> Max Distance
              </span>
              <span className="font-bold text-primary tabular-nums">
                {filters.maxDistanceKm ? `${filters.maxDistanceKm} km` : 'Any distance'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={1}
              value={filters.maxDistanceKm || 15}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onChangeFilters({ ...filters, maxDistanceKm: val >= 15 ? undefined : val });
              }}
              className="w-full accent-primary h-2 bg-border rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted font-medium">
              <span>1 km (Walking)</span>
              <span>5 km (Neighbourhood)</span>
              <span>15+ km (All City)</span>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-border/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text flex items-center gap-1">
                <Tag size={12} className="text-deal" /> Starting Service Budget
              </span>
              <span className="font-bold text-deal tabular-nums">
                Up to {formatMoney(filters.maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={80000}
              step={5000}
              value={Math.min(filters.maxPrice, 80000)}
              onChange={(e) =>
                onChangeFilters({ ...filters, maxPrice: parseInt(e.target.value, 10) })
              }
              className="w-full accent-deal h-2 bg-border rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted font-medium">
              <span>₹100 (Budget)</span>
              <span>₹400 (Standard)</span>
              <span>₹800+ (Premium)</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE FILTERS SUMMARY STRIP & RESULTS COUNT */}
      <div className="flex items-center justify-between text-[11px] text-muted pt-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-text">
            {totalResults} {totalResults === 1 ? 'salon' : 'salons'} found
          </span>
          {isDistanceActive && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-chip bg-primary-soft text-primary font-bold text-[10px]">
              Within {filters.maxDistanceKm} km
              <button
                onClick={() => handleSelectDistance(undefined)}
                className="hover:text-primary-hover cursor-pointer"
                aria-label="Remove distance filter"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {isPriceActive && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-chip bg-deal/15 text-deal font-bold text-[10px]">
              {filters.minPrice !== undefined && filters.minPrice > 0
                ? `${formatMoney(filters.minPrice)} - ${formatMoney(filters.maxPrice)}`
                : `≤ ${formatMoney(filters.maxPrice)}`}
              <button
                onClick={() => handleSelectPricePreset(0, 100000)}
                className="hover:text-red-700 cursor-pointer"
                aria-label="Remove price filter"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {isOpenNowActive && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-chip bg-success/15 text-success font-bold text-[10px]">
              Open Now
              <button
                onClick={() => onChangeFilters({ ...filters, openNowOnly: false })}
                className="hover:text-emerald-700 cursor-pointer"
                aria-label="Remove open now filter"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {isRatingActive && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-chip bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
              Rating 4.0+
              <button
                onClick={() => onChangeFilters({ ...filters, rating4PlusOnly: false })}
                className="hover:text-amber-700 cursor-pointer"
                aria-label="Remove rating filter"
              >
                <X size={10} />
              </button>
            </span>
          )}
        </div>

        <span className="text-[10px] font-medium text-muted shrink-0">
          Sorted: <span className="font-bold text-text">{currentSortLabel}</span>
        </span>
      </div>

      {/* Click outside backdrop to close dropdown menus */}
      {activeMenu !== 'none' && (
        <div
          onClick={() => setActiveMenu('none')}
          className="fixed inset-0 z-30 bg-transparent"
        />
      )}
    </div>
  );
};
