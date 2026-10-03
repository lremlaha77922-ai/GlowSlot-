import React, { useRef, useState } from 'react';
import { Play, Star, Eye, ChevronLeft, ChevronRight, Sparkles, Flame } from 'lucide-react';
import { Button } from '../../../components/Button';

interface ReelItem {
  id: string;
  salonId: string;
  salonName: string;
  salonLogo: string;
  serviceTitle: string;
  pricePaise: number;
  rating: number;
  views: string;
  duration: string;
  thumbnailUrl: string;
  category: string;
}

const REELS_DATA: ReelItem[] = [
  {
    id: 'reel-1',
    salonId: 'luxe-cut-style',
    salonName: 'Luxe Cut & Style',
    salonLogo: '✂️',
    serviceTitle: 'Signature Textured Fade & Crop',
    pricePaise: 39900,
    rating: 4.9,
    views: '12.4K',
    duration: '0:30',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80',
    category: 'Hair Styling',
  },
  {
    id: 'reel-2',
    salonId: 'luxe-cut-style',
    salonName: 'Luxe Cut & Style',
    salonLogo: '💆',
    serviceTitle: 'Royal Charcoal Detan Facial',
    pricePaise: 59900,
    rating: 4.8,
    views: '8.9K',
    duration: '0:45',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80',
    category: 'Facials',
  },
  {
    id: 'reel-3',
    salonId: 'luxe-cut-style',
    salonName: 'GlowSlot Salon',
    salonLogo: '🌸',
    serviceTitle: 'Ayurvedic Hot Warm-Oil Spa',
    pricePaise: 49900,
    rating: 4.9,
    views: '15.2K',
    duration: '0:55',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    category: 'Therapy',
  },
  {
    id: 'reel-4',
    salonId: 'luxe-cut-style',
    salonName: 'Luxe Cut & Style',
    salonLogo: '🧔',
    serviceTitle: 'Premium Beard Styling & Trim',
    pricePaise: 29900,
    rating: 4.7,
    views: '6.5K',
    duration: '0:25',
    thumbnailUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&q=80',
    category: 'Grooming',
  },
];

const CATEGORIES = ['All', 'Hair Styling', 'Facials', 'Therapy', 'Grooming'];

interface PromotionalReelsSectionProps {
  onSelectSalon: (salonId: string) => void;
}

export const PromotionalReelsSection: React.FC<PromotionalReelsSectionProps> = ({
  onSelectSalon,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredReels = selectedCategory === 'All'
    ? REELS_DATA
    : REELS_DATA.filter((r) => r.category === selectedCategory);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth * 0.75
        : scrollLeft + clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-6 px-4 bg-gradient-to-b from-surface via-bg to-surface border-y border-border/40 relative overflow-hidden" aria-labelledby="promotional-reels-heading">
      
      {/* Decorative premium glow lines */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Badges and Indicators */}
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold tracking-wider bg-gradient-to-r from-primary to-accent text-white px-2 py-0.5 rounded-chip uppercase shadow-xs">
          <Sparkles size={10} />
          PROMOTIONAL REELS
        </span>
        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-chip uppercase">
          <Flame size={10} className="animate-bounce" />
          Trending Now
        </span>
      </div>

      {/* Main Heading Row */}
      <div className="flex items-center justify-between mb-1.5">
        <h2 id="promotional-reels-heading" className="text-base font-extrabold tracking-tight text-text">
          Watch Salon Promotional Videos
        </h2>
        
        {/* Navigation Arrows for Carousel */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 rounded-full border border-border bg-surface text-muted hover:text-text hover:border-primary transition-all shadow-level-1 cursor-pointer"
            aria-label="Previous Reels"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 rounded-full border border-border bg-surface text-muted hover:text-text hover:border-primary transition-all shadow-level-1 cursor-pointer"
            aria-label="Next Reels"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted mb-4">See hair, skin, and styling makeovers before you secure your slot</p>

      {/* Category Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-chip border transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-text text-bg border-text shadow-level-1 scale-102'
                  : 'bg-surface text-muted border-border hover:border-primary-soft hover:text-text'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Horizontal Swipe/Scroll Video Cards Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {filteredReels.map((reel) => (
          <div
            key={reel.id}
            className="w-[200px] sm:w-[240px] md:w-[260px] shrink-0 snap-start bg-surface rounded-card border border-border/80 shadow-level-1 hover:shadow-level-2 transition-all duration-300 flex flex-col justify-between overflow-hidden group border-b-primary/20 hover:border-primary"
          >
            {/* Cinematic Video Reel Thumbnail */}
            <div className="h-64 sm:h-72 w-full relative bg-black overflow-hidden flex items-center justify-center">
              <img
                src={reel.thumbnailUrl}
                alt={reel.serviceTitle}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              
              {/* Premium Top Gradient Overlay for Salon Name & Rating */}
              <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />

              {/* Top Row Overlay: Salon details and Logo */}
              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-chip border border-white/10">
                  <span className="text-xs" role="img" aria-hidden="true">{reel.salonLogo}</span>
                  <span className="text-[10px] font-extrabold text-white truncate max-w-[80px]">
                    {reel.salonName}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-primary/95 text-white text-[9px] font-black px-1.5 py-0.5 rounded-chip">
                  <Star size={8} className="fill-white stroke-white" />
                  <span>{reel.rating}</span>
                </div>
              </div>

              {/* Pulsing Play Button overlay in center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary pointer-events-auto cursor-pointer">
                  <Play size={20} className="text-white fill-white ml-0.5" />
                </div>
              </div>

              {/* Bottom Row Overlay: Duration and Views */}
              <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-[10px] font-bold text-white z-10">
                <span className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-chip border border-white/10">
                  {reel.duration}
                </span>
                <span className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-chip border border-white/10 flex items-center gap-1">
                  <Eye size={10} />
                  <span>{reel.views}</span>
                </span>
              </div>

              {/* Bottom Gradient overlay */}
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            </div>

            {/* Reel Details Body */}
            <div className="p-3 bg-surface flex-1 flex flex-col justify-between">
              <div>
                {/* Title */}
                <h3 className="text-xs font-bold text-text truncate line-clamp-1 leading-snug group-hover:text-primary transition-colors mb-2" title={reel.serviceTitle}>
                  {reel.serviceTitle}
                </h3>

                {/* Starting Price with premium pink/orange label */}
                <div className="flex items-center justify-between bg-primary-soft/40 px-2 py-1 rounded-chip mb-3">
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider">FROM</span>
                  <span className="text-xs font-black text-primary tabular-nums">
                    ₹{(reel.pricePaise / 100).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Direct Booking CTA */}
              <Button
                onClick={() => onSelectSalon(reel.salonId)}
                variant="primary"
                size="sm"
                fullWidth
                className="font-extrabold text-[11px] py-1.5 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1"
              >
                <span>Book at {reel.salonName}</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
