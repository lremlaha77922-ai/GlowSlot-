import React, { useState, useEffect } from 'react';
import { PromoBanner } from '../../../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PromoCarouselProps {
  banners: PromoBanner[];
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Auto-scroll 5s per Design.md

    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners.length) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section className="px-4 pt-3 pb-2" aria-label="Promotional Offers">
      {/* 16:7 aspect ratio card per Design.md 8.3 & 5 */}
      <div
        className={`w-full aspect-[16/7] rounded-card bg-gradient-to-r ${currentBanner.bgGradient} text-white p-4 sm:p-5 flex flex-col justify-between shadow-level-1 relative overflow-hidden transition-all duration-300`}
      >
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-12 -top-10 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-chip bg-white/20 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles size={11} className="text-deal" />
            {currentBanner.tag}
          </span>
          <h2 className="text-base sm:text-lg font-bold leading-tight max-w-[85%]">
            {currentBanner.title}
          </h2>
        </div>

        <div className="flex items-end justify-between">
          <p className="text-xs text-white/90 max-w-[75%] line-clamp-1">
            {currentBanner.subtitle}
          </p>
          <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>

      {/* Dot indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              idx === currentIndex ? 'w-5 bg-primary' : 'w-1.5 bg-border hover:bg-muted'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
