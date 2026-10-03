import React, { useState, useEffect } from 'react';
import { PromoBanner } from '../../../types';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface PromoCarouselProps {
  sectionTitle?: string;
  banners: PromoBanner[];
  autoScrollIntervalMs?: number;
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({
  sectionTitle,
  banners,
  autoScrollIntervalMs = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (banners.length <= 1 || isInteracting) return;
    const interval = setInterval(() => {
      handleNext();
    }, autoScrollIntervalMs);

    return () => clearInterval(interval);
  }, [banners.length, isInteracting, autoScrollIntervalMs]);

  if (!banners.length) return null;

  const currentBanner = banners[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsInteracting(true);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const distance = touchStartX - touchEndX;
      const minSwipeDistance = 40;
      if (distance > minSwipeDistance) {
        handleNext();
      } else if (distance < -minSwipeDistance) {
        handlePrev();
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
    setTimeout(() => setIsInteracting(false), 2500);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsInteracting(true);
    setTouchStartX(e.clientX);
    setTouchEndX(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchStartX !== null) {
      setTouchEndX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    handleTouchEnd();
  };

  return (
    <section className="px-4 pt-3 pb-2" aria-label={sectionTitle || 'Promotional Offers'}>
      {/* Optional Section Header */}
      {sectionTitle && (
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-text flex items-center gap-1.5">
            <span>{sectionTitle}</span>
            <Sparkles size={14} className="text-primary animate-pulse" />
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="w-7 h-7 rounded-full bg-surface border border-border/80 flex items-center justify-center text-muted hover:text-text hover:border-primary transition-colors cursor-pointer shadow-xs active:scale-95"
              aria-label="Previous banner"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              className="w-7 h-7 rounded-full bg-surface border border-border/80 flex items-center justify-center text-muted hover:text-text hover:border-primary transition-colors cursor-pointer shadow-xs active:scale-95"
              aria-label="Next banner"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 16:7 aspect ratio card with cinematic photography & touch/drag support */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full aspect-[16/7.5] sm:aspect-[16/7] rounded-card text-white p-4 sm:p-5 flex flex-col justify-between shadow-level-2 relative overflow-hidden transition-all duration-300 group border border-stone-800/60 select-none cursor-grab active:cursor-grabbing"
      >
        {/* Background Image Layer */}
        {currentBanner.imageUrl ? (
          <img
            key={currentBanner.id}
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.bgGradient}`} />
        )}

        {/* Dual Gradient Overlay for Maximum Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-900/65 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/30 to-black/20 pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-chip bg-stone-900/80 border border-amber-400/30 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-1.5 text-amber-300 shadow-sm">
            <Sparkles size={11} className="text-amber-400 animate-pulse" />
            {currentBanner.tag}
          </span>
          <h3 className="text-base sm:text-xl font-extrabold leading-tight max-w-[85%] text-white drop-shadow-md">
            {currentBanner.title}
          </h3>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-2">
          <p className="text-xs text-stone-200 font-medium max-w-[80%] line-clamp-1 drop-shadow-sm">
            {currentBanner.subtitle}
          </p>
          <span className="w-8 h-8 rounded-full bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shrink-0 text-white shadow-md group-hover:bg-primary group-hover:border-primary transition-colors">
            <ArrowRight size={15} />
          </span>
        </div>
      </div>

      {/* Pagination Dot Indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setIsInteracting(true);
              setTimeout(() => setIsInteracting(false), 2000);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentIndex ? 'w-6 bg-primary shadow-xs' : 'w-1.5 bg-border hover:bg-muted'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
