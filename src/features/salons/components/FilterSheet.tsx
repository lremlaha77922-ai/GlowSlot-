import React, { useState } from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { FilterOptions } from '../../../types';
import { formatMoney } from '../../../utils/money';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  filters: initialFilters,
  onApply,
}) => {
  const [draft, setDraft] = useState<FilterOptions>(initialFilters);

  // Sync draft when opened
  React.useEffect(() => {
    if (isOpen) {
      setDraft(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      gender: 'all',
      category: 'All',
      sortBy: 'distance',
      minPrice: 10000,
      maxPrice: 50000,
      openNowOnly: false,
      rating4PlusOnly: false,
      offersOnly: false,
    };
    setDraft(defaultFilters);
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Filter & Sort">
      <div className="flex flex-col gap-5 pb-4">
        {/* Sort Options */}
        <div>
          <label className="text-xs font-bold text-text uppercase tracking-wider block mb-2">
            Sort By
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'distance', label: 'Distance' },
              { id: 'rating', label: 'Rating' },
              { id: 'price', label: 'Price' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  setDraft({ ...draft, sortBy: option.id as FilterOptions['sortBy'] })
                }
                className={`py-2 px-3 rounded-button text-xs font-semibold border transition-all cursor-pointer ${
                  draft.sortBy === option.id
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface text-muted border-border hover:bg-primary-soft/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-text uppercase tracking-wider">
              Starting Price Range
            </label>
            <span className="text-xs font-semibold text-primary tabular-nums">
              Up to {formatMoney(draft.maxPrice)}
            </span>
          </div>
          <input
            type="range"
            min={15000}
            max={50000}
            step={5000}
            value={draft.maxPrice}
            onChange={(e) =>
              setDraft({ ...draft, maxPrice: parseInt(e.target.value, 10) })
            }
            className="w-full accent-primary h-2 bg-border rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-muted mt-1 tabular-nums">
            <span>{formatMoney(15000)}</span>
            <span>{formatMoney(50000)}</span>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold text-text uppercase tracking-wider block">
            Preferences
          </label>

          {/* Open Now */}
          <label className="flex items-center justify-between p-3 rounded-button bg-surface border border-border cursor-pointer hover:bg-primary-soft/30 transition-colors">
            <span className="text-xs font-medium text-text">Open Now Only</span>
            <input
              type="checkbox"
              checked={draft.openNowOnly}
              onChange={(e) =>
                setDraft({ ...draft, openNowOnly: e.target.checked })
              }
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
          </label>

          {/* Rating 4+ */}
          <label className="flex items-center justify-between p-3 rounded-button bg-surface border border-border cursor-pointer hover:bg-primary-soft/30 transition-colors">
            <span className="text-xs font-medium text-text">Rating 4.0 & Above</span>
            <input
              type="checkbox"
              checked={draft.rating4PlusOnly}
              onChange={(e) =>
                setDraft({ ...draft, rating4PlusOnly: e.target.checked })
              }
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
          </label>

          {/* Offers & Deals */}
          <label className="flex items-center justify-between p-3 rounded-button bg-surface border border-border cursor-pointer hover:bg-primary-soft/30 transition-colors">
            <span className="text-xs font-medium text-text">Salons with Active Deals</span>
            <input
              type="checkbox"
              checked={draft.offersOnly}
              onChange={(e) =>
                setDraft({ ...draft, offersOnly: e.target.checked })
              }
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
          </label>
        </div>

        {/* Action Buttons: Apply & Reset per Design.md 8.4 */}
        <div className="flex items-center gap-3 pt-3 border-t border-border mt-2">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
