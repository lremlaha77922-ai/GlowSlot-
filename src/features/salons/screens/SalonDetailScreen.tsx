import React, { useState, useEffect } from 'react';
import { Salon, SalonServiceItem, PackageItem, ReviewItem } from '../../../types';
import { salonService } from '../services/salonService';
import { ReviewPhotoGallery } from '../components/ReviewPhotoGallery';
import { WriteReviewModal } from '../components/WriteReviewModal';
import { InteractiveSalonMap } from '../../../components/InteractiveSalonMap';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { Skeleton } from '../../../components/Skeleton';
import { useFavoritesStore } from '../../../store/useFavoritesStore';
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
  Flame,
  CheckCircle2,
  Navigation,
  Calendar,
} from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';
import { openInGoogleMaps } from '../../../utils/mapHelper';

interface SalonDetailScreenProps {
  salonId: string;
  onBack: () => void;
  onSelectServiceForSlot: (salon: Salon, service: { id: string; name: string; durationMin: number; basePrice: number }) => void;
  onSelectSalon?: (salonId: string) => void;
  onBookNowModal?: (salon: Salon, initialSelectedServiceIds?: string[]) => void;
}

export const SalonDetailScreen: React.FC<SalonDetailScreenProps> = ({
  salonId,
  onBack,
  onSelectServiceForSlot,
  onSelectSalon,
  onBookNowModal,
}) => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [similarSalons, setSimilarSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'packages' | 'reviews' | 'about'>('services');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await salonService.get(salonId);
      setSalon(data);
      if (data?.reviews) {
        setReviewsList(data.reviews);
      }

      // Load similar salons nearby
      const allSalons = await salonService.list();
      const nearby = allSalons
        .filter((s) => s.id !== salonId)
        .sort((a, b) => a.distanceKm - b.distanceKm);
      setSimilarSalons(nearby);

      setIsLoading(false);
    };
    load();
  }, [salonId]);

  const handleAddReview = (newReview: ReviewItem) => {
    setReviewsList((prev) => [newReview, ...prev]);
  };

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
    if (onBookNowModal) {
      onBookNowModal(salon, [srv.id]);
    } else {
      onSelectServiceForSlot(salon, {
        id: srv.id,
        name: srv.name,
        durationMin: srv.durationMin,
        basePrice: srv.basePrice,
      });
    }
  };

  const handleSelectPackage = (pkg: PackageItem) => {
    if (onBookNowModal) {
      onBookNowModal(salon, [pkg.id]);
    } else {
      onSelectServiceForSlot(salon, {
        id: pkg.id,
        name: pkg.name,
        durationMin: pkg.durationMin,
        basePrice: pkg.price,
      });
    }
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

      <main className="p-4 max-w-lg mx-auto flex flex-col gap-5">
        {/* Salon Header Details */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-2.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-extrabold text-text tracking-tight">{salon.name}</h1>
                <CheckCircle2 size={16} className="text-primary fill-primary/10 shrink-0" />
              </div>
              <p className="text-xs text-muted mt-0.5">{salon.categories?.join(', ')}</p>
            </div>

            <div className="flex items-center gap-1 bg-deal/15 text-deal px-2.5 py-1 rounded-chip font-extrabold text-xs">
              <Star size={13} className="fill-deal" />
              <span>{salon.rating}</span>
            </div>
          </div>

            <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-primary" /> {salon.area} ({salon.distanceKm} km)
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-primary" /> {salon.isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>
            <button
              onClick={() => openInGoogleMaps(salon.name, salon.address, salon.latitude, salon.longitude)}
              className="flex items-center gap-1 text-primary font-bold hover:underline cursor-pointer"
              aria-label={`Get directions to ${salon.name}`}
            >
              <Navigation size={13} />
              <span>Directions</span>
            </button>
          </div>
        </div>

        {/* Tabs: Services, Packages, Reviews, About */}
        <div className="flex items-center gap-1 bg-muted/15 p-1 rounded-button border border-border">
          {(['services', 'packages', 'reviews', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-[8px] text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'services' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">
              Available Services & Slots
            </h3>
            <div className="flex flex-col gap-2.5">
              {salon.services?.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-surface rounded-card border border-border/80 p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-primary/40 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-text">{srv.name}</h4>
                    <p className="text-[11px] text-muted mt-0.5">{srv.durationMin} mins • Popular grooming</p>
                    <span className="text-xs font-extrabold text-primary block mt-1 tabular-nums">
                      {formatMoney(srv.basePrice)}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSelectService(srv)}
                    className="shrink-0 font-bold"
                  >
                    Select Slot
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">
              Combo Packages & Deals
            </h3>
            <div className="flex flex-col gap-2.5">
              {salon.packages && salon.packages.length > 0 ? (
                salon.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-surface rounded-card border border-border/80 p-3.5 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-text">{pkg.name}</h4>
                      <p className="text-[11px] text-muted mt-0.5">{pkg.durationMin} mins • Best Value</p>
                      <span className="text-xs font-extrabold text-deal block mt-1 tabular-nums">
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
                ))
              ) : (
                <p className="text-xs text-muted text-center py-8">
                  No active packages available for this salon.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-4">
            <div className="bg-surface rounded-card border border-border p-4 flex items-center justify-around shadow-xs">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-text">{salon.rating}</span>
                <div className="flex items-center justify-center gap-0.5 text-deal mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-deal" />
                  ))}
                </div>
                <span className="text-[11px] text-muted mt-1 block">
                  Based on {reviewsList.length || salon.reviewCount} verified reviews
                </span>
              </div>
            </div>

            <ReviewPhotoGallery
              reviews={reviewsList}
              onOpenWriteReview={() => setIsWriteReviewOpen(true)}
            />

            <WriteReviewModal
              isOpen={isWriteReviewOpen}
              onClose={() => setIsWriteReviewOpen(false)}
              salonName={salon.name}
              onSubmitReview={handleAddReview}
            />
          </div>
        )}

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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                  Location & Address
                </h3>
                <button
                  onClick={() => openInGoogleMaps(salon.name, salon.address, salon.latitude, salon.longitude)}
                  className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer"
                  aria-label={`Get directions to ${salon.name}`}
                >
                  <Navigation size={14} />
                  <span>Get Directions</span>
                </button>
              </div>
              <p className="text-xs text-text">{salon.address}</p>
            </div>

            {/* Interactive Salon Map Integration */}
            <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-2.5">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                Salon Location & Nearby Radar
              </h3>
              <InteractiveSalonMap
                salons={[salon, ...similarSalons]}
                selectedSalonId={salon.id}
                onSelectSalon={(id) => {
                  if (onSelectSalon) onSelectSalon(id);
                }}
                onBookNow={(s) => {
                  if (onBookNowModal) onBookNowModal(s);
                  else if (onSelectSalon) onSelectSalon(s.id);
                }}
                className="h-[280px]"
              />
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

        {/* SIMILAR SALONS NEARBY RECOMMENDATION SECTION */}
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
          <h3 className="text-xs font-extrabold text-text uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={15} className="text-primary" /> Similar salons nearby
          </h3>

          <div className="flex overflow-x-auto gap-3.5 no-scrollbar pb-2 pt-1 -mx-4 px-4">
            {similarSalons.map((sim) => {
              const simFav = isFavorite(sim.id);
              const staffCount = sim.availableSlotsToday ? Math.min(5, Math.max(2, sim.availableSlotsToday % 6)) : 3;

              return (
                <div
                  key={sim.id}
                  onClick={() => {
                    if (onSelectSalon) onSelectSalon(sim.id);
                  }}
                  className="w-[260px] sm:w-[280px] shrink-0 bg-surface rounded-card border border-border/80 shadow-level-1 overflow-hidden flex flex-col justify-between cursor-pointer hover:border-primary/50 transition-all group"
                >
                  <div>
                    {/* Cover Image & Badges */}
                    <div className="h-32 w-full relative bg-muted/20 overflow-hidden">
                      <img
                        src={sim.images[0]}
                        alt={sim.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Offer badge */}
                      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase bg-deal text-white px-2 py-0.5 rounded-chip shadow-xs">
                          15% OFF on first online booking
                        </span>
                        {sim.rating >= 4.8 && (
                          <span className="text-[9px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded-chip shadow-xs flex items-center gap-0.5 w-fit">
                            <Flame size={10} /> Trending
                          </span>
                        )}
                      </div>

                      {/* Favourite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const added = toggleFavorite(sim.id);
                          showToast(added ? `Saved ${sim.name} to favorites` : `Removed ${sim.name} from favorites`);
                        }}
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-accent transition-colors cursor-pointer"
                        aria-label="Favourite"
                      >
                        <Heart size={14} className={simFav ? 'fill-accent text-accent' : ''} />
                      </button>

                      {/* Open Now Badge */}
                      <div className="absolute bottom-2 left-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-chip bg-emerald-600/90 text-white backdrop-blur-xs">
                          {sim.isOpen ? 'Open Now' : 'Closed'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 min-w-0">
                          <h4 className="text-xs font-bold text-text truncate">{sim.name}</h4>
                          <CheckCircle2 size={13} className="text-primary shrink-0" />
                        </div>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-text shrink-0">
                          <Star size={11} className="fill-deal text-deal" /> {sim.rating}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted truncate">{sim.categories?.[0] || 'Grooming & Salon'}</p>

                      <div className="flex items-center gap-1 text-[11px] text-muted">
                        <MapPin size={11} className="text-primary shrink-0" />
                        <span className="truncate">{sim.area}</span>
                        <span>•</span>
                        <span className="font-semibold">{sim.distanceKm} km</span>
                      </div>

                      <span className="text-[10px] text-muted font-medium capitalize">
                        Gender: {sim.gender || 'Unisex'}
                      </span>
                    </div>
                  </div>

                  {/* Pricing & Book CTA */}
                  <div className="p-3 pt-0 flex items-center justify-between border-t border-border/60 mt-1">
                    <div>
                      <span className="text-[9px] text-muted uppercase font-semibold block">Starts from</span>
                      <span className="text-xs font-extrabold text-primary tabular-nums">
                        {formatMoney(sim.startingPrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        🟢 {staffCount} staff
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onBookNowModal) {
                            onBookNowModal(sim);
                          } else if (onSelectSalon) {
                            onSelectSalon(sim.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-button bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
