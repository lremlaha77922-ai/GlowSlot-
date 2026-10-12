import React, { useState } from 'react';
import { useFavoritesStore } from '../../../store/useFavoritesStore';
import { SalonCard } from '../../../components/SalonCard';
import { EmptyState } from '../../../components/EmptyState';
import { Button } from '../../../components/Button';
import { ArrowLeft, Heart, Clock, ChevronRight } from 'lucide-react';
import { formatMoney } from '../../../utils/money';

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
  const [activeTab, setActiveTab] = useState<'salons' | 'services'>('salons');
  const {
    getFavoriteSalons,
    toggleFavorite,
    isFavorite,
    getFavoriteServices,
    toggleFavoriteService,
  } = useFavoritesStore();

  const salons = getFavoriteSalons();
  const services = getFavoriteServices();

  return (
    <div className="min-h-screen bg-bg text-text pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-text leading-tight">
                My Favorites
              </h1>
              <span className="text-[11px] text-muted">
                {salons.length} Salons • {services.length} Services saved
              </span>
            </div>
          </div>
        </div>

        {/* Tabs: Salons vs Services */}
        <div className="grid grid-cols-2 gap-1 bg-muted/15 p-1 rounded-button border border-border">
          <button
            onClick={() => setActiveTab('salons')}
            className={`py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'salons'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-muted hover:text-text'
            }`}
          >
            Favourite Salons ({salons.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-muted hover:text-text'
            }`}
          >
            Favorite Services ({services.length})
          </button>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto w-full">
        {activeTab === 'salons' ? (
          salons.length === 0 ? (
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
          )
        ) : (
          services.length === 0 ? (
            <EmptyState
              icon={<Heart size={32} className="text-accent" />}
              title="No favorite services yet"
              helperText="Tap the heart icon on any salon service to save it to your favorites."
              actionLabel="Explore Salons & Services"
              onAction={onExploreSalons}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {services.map((item) => (
                <div
                  key={`${item.salonId}-${item.service.id}`}
                  onClick={() => onSelectSalon(item.salonId)}
                  className="bg-surface rounded-card border border-border/80 p-4 shadow-level-1 flex flex-col gap-3 cursor-pointer hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                        {item.salonName}
                      </span>
                      <h3 className="text-sm font-bold text-text mt-0.5">{item.service.name}</h3>
                      {item.service.description && (
                        <p className="text-xs text-muted mt-1 line-clamp-2">
                          {item.service.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteService(item.salonId, item.salonName, item.service);
                      }}
                      className="p-2 rounded-full hover:bg-primary-soft text-accent transition-colors cursor-pointer shrink-0"
                      aria-label="Remove from favorites"
                      title="Remove from favorites"
                    >
                      <Heart size={18} className="fill-accent text-accent" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-3 text-muted">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock size={12} className="text-primary" /> {item.service.durationMin} mins
                      </span>
                      <span className="font-mono font-bold text-text tabular-nums text-sm">
                        {formatMoney(item.service.basePrice)}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSalon(item.salonId);
                      }}
                      className="font-bold text-xs"
                    >
                      Book Slot <ChevronRight size={14} className="ml-0.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};
