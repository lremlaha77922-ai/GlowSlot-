import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../../store/useSessionStore';
import { formatMoney } from '../../../utils/money';
import { recommendationService, SmartRecommendationItem } from '../../../services/recommendationService';
import { mockSalons } from '../../../data/mockData';
import { Salon } from '../../../types';
import {
  Sparkles,
  RefreshCw,
  Clock,
  Scissors,
  CheckCircle2,
  TrendingUp,
  Building2,
  Lightbulb,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Button } from '../../../components/Button';
import { Skeleton } from '../../../components/Skeleton';

interface SmartRecommendationsSectionProps {
  onSelectSalon: (salonId: string) => void;
  onBookNow?: (salon: Salon, initialServiceId?: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Picks' },
  { id: 'Hair', label: 'Hair' },
  { id: 'Beard', label: 'Beard' },
  { id: 'Skin', label: 'Skin Glow' },
  { id: 'Spa', label: 'Scalp & Spa' },
];

export const SmartRecommendationsSection: React.FC<SmartRecommendationsSectionProps> = ({
  onSelectSalon,
  onBookNow,
}) => {
  const { user } = useSessionStore();
  const [recommendations, setRecommendations] = useState<SmartRecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [source, setSource] = useState<'gemini-ai' | 'smart-engine'>('gemini-ai');

  const fetchRecommendations = async (filter: string, isRefresh = false) => {
    setLoading(true);
    try {
      const res = await recommendationService.getRecommendations({
        userId: user?.id,
        userName: user?.name,
        categoryFilter: filter,
        gender: user?.gender || 'unisex',
        forceRefresh: isRefresh,
      });

      setRecommendations(res.recommendations);
      setSource(res.source);
    } catch (e) {
      console.error('[GlowSlot] Recommendation fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(activeCategory);
  }, [user?.id, activeCategory]);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
  };

  const handleBook = (item: SmartRecommendationItem) => {
    // Find matching salon from mockSalons or use default
    const matchedSalon = mockSalons.find(
      (s: Salon) => s.id === item.salonId || s.name.toLowerCase().includes(item.suggestedSalon.toLowerCase().slice(0, 8))
    ) || mockSalons[0];

    if (onBookNow) {
      onBookNow(matchedSalon);
    } else {
      onSelectSalon(matchedSalon.id);
    }
  };

  return (
    <section className="px-4 py-3 flex flex-col gap-3">
      {/* Header with AI Badge & Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-text">AI Smart Recommendations</h2>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-chip bg-primary/10 text-primary border border-primary/20">
                {source === 'gemini-ai' ? 'Gemini 3.8' : 'Smart AI'}
              </span>
            </div>
            <p className="text-[11px] text-muted">
              Picks based on your booking cycle &amp; 2026 trending styles
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchRecommendations(activeCategory, true)}
          disabled={loading}
          className="p-1.5 rounded-full text-muted hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer"
          aria-label="Refresh Recommendations"
          title="Refresh AI Recommendations"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-primary' : ''} />
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1 rounded-chip text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface border-border text-muted hover:text-text'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Recommendations Cards List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-44 w-full" radius="card" />
          <Skeleton className="h-44 w-full" radius="card" />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-surface rounded-card border border-border p-6 text-center text-xs text-muted">
          No recommendations found for this category right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-card border border-border p-3.5 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between gap-2.5 relative overflow-hidden group"
            >
              {/* Top Row: Tag & Duration */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-chip tracking-wider bg-deal/10 text-deal border border-deal/20">
                  <Flame size={10} />
                  <span>{item.tag}</span>
                </span>

                <div className="flex items-center gap-1 text-[11px] font-medium text-muted">
                  <Clock size={12} className="text-primary" />
                  <span>{item.durationMin} mins</span>
                </div>
              </div>

              {/* Title & Salon */}
              <div>
                <h3 className="text-xs font-bold text-text group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5 truncate">
                  <Building2 size={11} className="text-primary shrink-0" />
                  <span>{item.suggestedSalon}</span>
                </p>
              </div>

              {/* AI Context Reason Box */}
              <div className="bg-primary-soft/40 p-2.5 rounded-button border border-primary/20 flex flex-col gap-1">
                <div className="flex items-start gap-1.5 text-[11px] text-text font-medium leading-relaxed">
                  <Sparkles size={12} className="text-primary shrink-0 mt-0.5" />
                  <span>{item.reason}</span>
                </div>

                {item.stylistTip && (
                  <div className="flex items-center gap-1 text-[10px] text-muted italic pt-1 border-t border-primary/10">
                    <Lightbulb size={11} className="text-amber-500 shrink-0" />
                    <span className="truncate">Tip: {item.stylistTip}</span>
                  </div>
                )}
              </div>

              {/* Footer: Price & Book CTA */}
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <div>
                  <span className="text-[9px] text-muted uppercase font-bold block">Estimated</span>
                  <span className="text-sm font-black font-mono text-primary tabular-nums">
                    {formatMoney(item.pricePaise)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleBook(item)}
                  className="text-xs font-bold shadow-2xs group-hover:shadow-xs flex items-center gap-1"
                >
                  <span>Book Style</span>
                  <ArrowRight size={13} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
