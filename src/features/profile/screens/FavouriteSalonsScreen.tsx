import React from 'react';
import { useFavoritesStore } from '../../../store/useFavoritesStore';
import { SalonCard } from '../../../components/SalonCard';
import { EmptyState } from '../../../components/EmptyState';
import { ArrowLeft, Heart } from 'lucide-react';

interface FavouriteSalonsScreenProps {
  onBack: () => void;
  onSelectSalon: (salonId: string) => void;
  onExploreSalons: () => void;
}

export const FavouriteSalonsScreen: React.FC<FavouriteSalonsScreenProps> = ({
  onBack,
  onSelectSalon,
  onExploreSalons,
}) => {
  const { getFavoriteSalons, toggleFavorite, isFavorite } = useFavoritesStore();
  const salons = getFavoriteSalons();

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-text leading-tight">
              Favourite Salons (S25)
            </h1>
            <span className="text-[10px] text-muted">
              {salons.length} bookmarked places
            </span>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto w-full">
        {salons.length === 0 ? (
          <EmptyState
            icon={<Heart size={32} className="text-accent" />}
            title="No favourite salons yet"
            helperText="Tap the heart icon on any salon to save it here for fast re-booking."
            actionLabel="Explore Salons"
            onAction={onExploreSalons}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {salons.map((salon) => (
              <SalonCard
                key={salon.id}
                salon={salon}
                onClick={() => onSelectSalon(salon.id)}
                isFavorite={isFavorite(salon.id)}
                onToggleFavorite={() => toggleFavorite(salon.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
