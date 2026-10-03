import React, { useState, useEffect } from 'react';
import { Salon, SalonServiceItem, PackageItem } from '../../../types';
import { salonService } from '../services/salonService';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { Skeleton } from '../../../components/Skeleton';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';

interface SalonDetailScreenProps {
  salonId: string;
  onBack: () => void;
  onSelectServiceForSlot: (salon: Salon, service: { id: string; name: string; durationMin: number; basePrice: number }) => void;
}

export const SalonDetailScreen: React.FC<SalonDetailScreenProps> = ({
  salonId,
  onBack,
  onSelectServiceForSlot,
}) => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'packages' | 'reviews' | 'about'>('services');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);

  const { showToast } = useUIStore();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await salonService.get(salonId);
      setSalon(data);
      setIsLoading(false);
    };
    load();
  }, [salonId]);

  if (isLoading || !salon) {
    return (
      <div className="min-h-screen bg-bg text-text pb-20 p-4">
        <Skeleton className="w-full h-56" radius="card" />
        <Skeleton className="w-2/3 h-6 mt-4" />
        <Skeleton className="w-1/3 h-4 mt-2" />
        <div className="flex gap-3 mt-6">
          <Skeleton className="w-20 h-8" radius="chip" />
          <Skeleton className="w-20 h-8" radius="chip" />
          <Skeleton className="w-20 h-8" radius="chip" />
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: salon.name, text: `Check out ${salon.name} on GlowSlot`, url: window.location.href });
    } else {
      showToast('Salon link copied to clipboard');
    }
  };

  const handleSelectService = (srv: SalonServiceItem) => {
    onSelectServiceForSlot(salon, {
      id: srv.id,
      name: srv.name,
      durationMin: srv.durationMin,
      basePrice: srv.basePrice,
    });
  };

  const handleSelectPackage = (pkg: PackageItem) => {
    onSelectServiceForSlot(salon, {
      id: pkg.id,
      name: pkg.name,
      durationMin: pkg.durationMin,
      basePrice: pkg.price,
    });
  };

  const firstService = salon.services?.[0];

  return (
    <div className="min-h-screen bg-bg text-text pb-28">
      {/* Top Floating App Bar */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border/80 h-14 px-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-bold text-text truncate max-w-[200px]">
          {salon.name}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsFav(!isFav);
              showToast(isFav ? 'Removed from favorites' : 'Saved to favorites');
            }}
            className="p-2 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Favorite"
          >
            <Heart size={18} className={isFav ? 'fill-accent text-accent' : ''} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
        </div>
      </header>

      {/* Image Gallery per Design.md 8.5 */}
      <div className="relative w-full h-64 bg-muted/20 overflow-hidden">
        <img
          src={salon.images[activeImageIndex] || salon.images[0]}
          alt={salon.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Page indicator dots */}
        {salon.images.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5">
            {salon.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === activeImageIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Salon Header Info */}
      <div className="p-4 bg-surface border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-text leading-tight">{salon.name}</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
              <MapPin size={13} className="text-primary shrink-0" />
              <span className="truncate">{salon.area}, {salon.city}</span>
              <span>•</span>
              <span className="shrink-0">{salon.distanceKm} km</span>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-chip bg-deal/15 text-stone-900 dark:text-deal font-bold text-xs">
              <Star size={13} className="fill-deal text-deal" />
              <span>{salon.rating}</span>
            </div>
            <span className="text-[10px] text-muted mt-0.5">
              {salon.reviewCount} reviews
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/60 text-xs">
          <div className="flex items-center gap-1.5 text-muted">
            <Clock size={13} />
            <span>{salon.openingHours}</span>
          </div>
          <span className="text-border">•</span>
          <span className={`font-semibold ${salon.isOpen ? 'text-success' : 'text-error'}`}>
            {salon.isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Sticky Tab Navigation per Design.md 8.5 */}
      <div className="sticky top-14 z-30 bg-surface border-b border-border flex items-center justify-around px-2 shadow-xs">
        {(['services', 'packages', 'reviews', 'about'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-3 text-xs font-bold capitalize transition-all border-b-2 cursor-pointer ${
              activeTab === tab
                ? 'text-primary border-primary'
                : 'text-muted border-transparent hover:text-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <main className="p-4">
        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="flex flex-col gap-3">
            {salon.services?.map((service) => (
              <div
                key={service.id}
                className="bg-surface rounded-card border border-border/80 shadow-level-1 p-3.5 flex items-center justify-between gap-3 hover:border-primary/40 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-soft px-1.5 py-0.5 rounded-[4px]">
                      {service.category}
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock size={11} /> {service.durationMin} mins
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text mt-1">{service.name}</h3>
                  {service.description && (
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">
                      {service.description}
                    </p>
                  )}
                  <div className="mt-2 text-sm font-bold text-text tabular-nums">
                    {formatMoney(service.basePrice)}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSelectService(service)}
                  className="shrink-0"
                >
                  Select Slot
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="flex flex-col gap-3.5">
            {salon.packages && salon.packages.length > 0 ? (
              salon.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-surface rounded-card border border-border/80 shadow-level-1 p-4 flex flex-col justify-between gap-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-deal text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-[8px]">
                    Value Pack
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-text">{pkg.name}</h3>
                    <p className="text-xs text-muted mt-0.5">{pkg.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {pkg.inclusions.map((inc, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-chip bg-primary-soft text-primary font-medium flex items-center gap-1"
                        >
                          <Sparkles size={10} /> {inc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
                    <div>
                      <span className="text-[10px] text-muted block uppercase">Package Price</span>
                      <span className="text-base font-bold text-primary tabular-nums">
                        {formatMoney(pkg.price)}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSelectPackage(pkg)}
                    >
                      Select Slot
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted text-center py-8">
                No active packages available for this salon.
              </p>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-4">
            {/* Rating summary */}
            <div className="bg-surface rounded-card border border-border p-4 flex items-center justify-around shadow-xs">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-text">{salon.rating}</span>
                <div className="flex items-center justify-center gap-0.5 text-deal mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-deal" />
                  ))}
                </div>
                <span className="text-[11px] text-muted mt-1 block">
                  Based on {salon.reviewCount} verified reviews
                </span>
              </div>
            </div>

            {/* Reviews List */}
            <div className="flex flex-col gap-3">
              {salon.reviews?.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-surface rounded-card border border-border p-3.5 flex flex-col gap-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text">{rev.authorName}</span>
                    <span className="text-[11px] text-muted">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-deal">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={12} className="fill-deal" />
                    ))}
                  </div>
                  <p className="text-xs text-text leading-relaxed">{rev.comment}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rev.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-chip bg-muted/15 text-muted font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="flex flex-col gap-4">
            <div className="bg-surface rounded-card border border-border p-4 shadow-xs">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-2">
                About the Salon
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                {salon.aboutText}
              </p>
            </div>

            <div className="bg-surface rounded-card border border-border p-4 shadow-xs">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-2">
                Location & Address
              </h3>
              <p className="text-xs text-text">{salon.address}</p>
            </div>

            <div className="bg-surface rounded-card border border-border p-4 shadow-xs">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-2">
                Amenities & Hygiene
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-text">
                {salon.amenities?.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-success shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Bar per Design.md 8.5: price hint + Book Appointment */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-level-2 p-3 max-w-lg mx-auto flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-muted uppercase tracking-wider block">
            Starting from
          </span>
          <span className="text-base font-bold text-primary tabular-nums">
            {formatMoney(salon.startingPrice)}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="flex-1 max-w-xs"
          onClick={() => {
            if (firstService) {
              handleSelectService(firstService);
            }
          }}
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
};
