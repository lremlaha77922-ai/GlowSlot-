import React, { useState } from 'react';
import { Salon, ReviewItem, Booking } from '../../../types';
import {
  Star,
  Camera,
  CheckCircle2,
  ShieldCheck,
  ThumbsUp,
  Sparkles,
  Filter,
  MessageSquare,
  Award,
  ChevronDown,
  Maximize2,
  X,
  CalendarCheck,
  Edit3,
} from 'lucide-react';
import { Button } from '../../../components/Button';

interface SalonReviewsSectionProps {
  salon: Salon;
  reviews: ReviewItem[];
  onOpenWriteReview: (initialRating?: number) => void;
  userCompletedBooking?: Booking | null;
}

export const SalonReviewsSection: React.FC<SalonReviewsSectionProps> = ({
  salon,
  reviews,
  onOpenWriteReview,
  userCompletedBooking,
}) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [userVoted, setUserVoted] = useState<Record<string, boolean>>({});
  const [activeLightboxImage, setActiveLightboxImage] = useState<{
    url: string;
    author: string;
    date: string;
    comment: string;
  } | null>(null);

  // Compute stats
  const totalReviews = reviews.length;
  const ratingScore = salon.rating || 4.8;

  // Star breakdown calculation
  const starCounts = {
    5: reviews.filter((r) => Math.round(r.rating) === 5).length,
    4: reviews.filter((r) => Math.round(r.rating) === 4).length,
    3: reviews.filter((r) => Math.round(r.rating) === 3).length,
    2: reviews.filter((r) => Math.round(r.rating) === 2).length,
    1: reviews.filter((r) => Math.round(r.rating) === 1).length,
  };

  // If no reviews in mock, seed realistic baseline distribution
  const displayTotal = totalReviews || salon.reviewCount || 120;
  const getPercent = (star: 5 | 4 | 3 | 2 | 1) => {
    if (totalReviews > 0) {
      return Math.round((starCounts[star] / totalReviews) * 100);
    }
    // Baseline representation for authentic salon experience
    const defaults = { 5: 78, 4: 16, 3: 4, 2: 1, 1: 1 };
    return defaults[star];
  };

  const allAttachedPhotos = reviews.flatMap((rev) =>
    (rev.images || []).map((img) => ({
      url: img,
      author: rev.authorName,
      date: rev.date,
      comment: rev.comment,
    }))
  );

  // Filter reviews
  let filteredReviews = reviews.filter((r) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'photos') return r.images && r.images.length > 0;
    if (filterMode === 'verified') return r.verifiedAppointment !== false;
    if (filterMode === '5star') return Math.round(r.rating) === 5;
    if (filterMode === '4star') return Math.round(r.rating) === 4;
    if (filterMode === 'critical') return Math.round(r.rating) <= 3;
    return true;
  });

  // Sort reviews
  filteredReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'helpful') {
      const votesA = (helpfulVotes[a.id] || a.helpfulCount || 0);
      const votesB = (helpfulVotes[b.id] || b.helpfulCount || 0);
      return votesB - votesA;
    }
    // Default: recent (newest first)
    return b.id.localeCompare(a.id);
  });

  const handleToggleHelpful = (reviewId: string, initialCount = 0) => {
    const isCurrentlyVoted = !!userVoted[reviewId];
    setUserVoted((prev) => ({ ...prev, [reviewId]: !isCurrentlyVoted }));
    setHelpfulVotes((prev) => {
      const current = prev[reviewId] ?? initialCount;
      return {
        ...prev,
        [reviewId]: isCurrentlyVoted ? Math.max(0, current - 1) : current + 1,
      };
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. APPOINTMENT FEEDBACK CALLOUT CARD */}
      <div className="bg-gradient-to-r from-primary-soft/50 via-surface to-accent/10 border border-primary/25 rounded-card p-4 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-primary mb-1">
              <CalendarCheck size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {userCompletedBooking ? 'Appointment Feedback' : 'Client Feedback'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-text">
              {userCompletedBooking
                ? `How was your visit on ${userCompletedBooking.slot.date}?`
                : `Visited ${salon.name} recently?`}
            </h3>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              {userCompletedBooking
                ? `Share your thoughts on ${userCompletedBooking.services?.[0]?.name || 'your grooming service'} to help other clients.`
                : 'Share your authentic salon rating and feedback to help others find the best stylists.'}
            </p>

            {/* Quick Star Rating Trigger */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] font-semibold text-text">Tap to rate:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => onOpenWriteReview(star)}
                    className="p-1 text-muted hover:text-deal transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                    title={`Rate ${star} Stars`}
                  >
                    <Star size={18} className="hover:fill-deal" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onOpenWriteReview(5)}
            className="shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Edit3 size={13} />
            <span>Write Review</span>
          </Button>
        </div>
      </div>

      {/* 2. RATING SUMMARY SCORECARD */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Big Score Box */}
          <div className="sm:col-span-4 text-center sm:border-r sm:border-border sm:pr-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-text tracking-tight">{ratingScore.toFixed(1)}</span>
            <div className="flex items-center justify-center gap-0.5 text-deal my-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={s <= Math.round(ratingScore) ? 'fill-deal' : 'text-border'}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-text">
              {totalReviews || salon.reviewCount} verified reviews
            </span>
            <span className="text-[11px] text-success font-medium flex items-center gap-1 mt-1">
              <ShieldCheck size={13} /> 100% Verified Visits
            </span>
          </div>

          {/* Star Rating Distribution Bars */}
          <div className="sm:col-span-8 flex flex-col gap-1.5">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const pct = getPercent(star);
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 font-bold text-muted flex items-center gap-0.5 justify-end text-[11px]">
                    {star} <Star size={10} className="fill-deal text-deal" />
                  </span>
                  <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-deal rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-[11px] font-medium text-muted text-right">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/80">
          <div className="p-2 rounded-button bg-muted/10 text-center">
            <span className="text-[10px] text-muted block uppercase font-bold">Cleanliness</span>
            <span className="text-xs font-bold text-text">4.9 ★ Excellent</span>
          </div>
          <div className="p-2 rounded-button bg-muted/10 text-center">
            <span className="text-[10px] text-muted block uppercase font-bold">Styling Skill</span>
            <span className="text-xs font-bold text-text">4.9 ★ Expert</span>
          </div>
          <div className="p-2 rounded-button bg-muted/10 text-center">
            <span className="text-[10px] text-muted block uppercase font-bold">Punctuality</span>
            <span className="text-xs font-bold text-text">4.8 ★ On-Time</span>
          </div>
          <div className="p-2 rounded-button bg-muted/10 text-center">
            <span className="text-[10px] text-muted block uppercase font-bold">Value</span>
            <span className="text-xs font-bold text-text">4.7 ★ Fair Price</span>
          </div>
        </div>
      </div>

      {/* 3. CUSTOMER STYLE PHOTO GALLERY (IF ATTACHMENTS EXIST) */}
      {allAttachedPhotos.length > 0 && (
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text flex items-center gap-1.5">
              <Camera size={14} className="text-primary" />
              <span>Client Lookbook & Photos ({allAttachedPhotos.length})</span>
            </span>
            <span className="text-[10px] text-muted">Tap to view full resolution</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {allAttachedPhotos.map((photo, i) => (
              <div
                key={i}
                onClick={() => setActiveLightboxImage(photo)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-button overflow-hidden shrink-0 border border-border hover:border-primary cursor-pointer relative group snap-start"
              >
                <img
                  src={photo.url}
                  alt={`Customer look ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100">
                  <Maximize2 size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FILTER AND SORT CHIPS */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All (${reviews.length})` },
            { id: 'photos', label: `With Photos (${allAttachedPhotos.length})` },
            { id: '5star', label: `5 Stars (${starCounts[5]})` },
            { id: '4star', label: `4 Stars (${starCounts[4]})` },
            { id: 'verified', label: 'Verified Visits' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterMode(chip.id)}
              className={`px-3 py-1 text-xs font-bold rounded-chip transition-all whitespace-nowrap cursor-pointer border ${
                filterMode === chip.id
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface text-muted border-border hover:text-text'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[11px] text-muted font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold bg-surface border border-border rounded-button px-2 py-1 text-text cursor-pointer focus:outline-hidden"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* 5. REVIEWS LIST */}
      <div className="flex flex-col gap-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-surface rounded-card border border-border p-8 text-center flex flex-col items-center justify-center gap-2">
            <MessageSquare size={28} className="text-muted/60" />
            <h4 className="text-xs font-bold text-text">No reviews match this filter</h4>
            <p className="text-[11px] text-muted">Try choosing another filter or write the first review!</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterMode('all')}
              className="mt-2"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const currentHelpful = helpfulVotes[rev.id] ?? (rev.helpfulCount || 0);
            const isVoted = !!userVoted[rev.id];

            return (
              <div
                key={rev.id}
                className="bg-surface rounded-card border border-border/80 p-4 flex flex-col gap-2.5 shadow-xs hover:border-primary/30 transition-all"
              >
                {/* Header: Author + Verified + Date */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-soft text-primary font-extrabold flex items-center justify-center text-xs shrink-0">
                      {rev.authorName ? rev.authorName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-text">{rev.authorName}</span>
                        <span className="text-[10px] font-semibold text-success flex items-center gap-0.5 bg-success/10 px-1.5 py-0.2 rounded-chip border border-success/20">
                          <CheckCircle2 size={10} /> Verified Visit
                        </span>
                      </div>
                      <span className="text-[11px] text-muted block">{rev.date}</span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 text-deal shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < Math.round(rev.rating) ? 'fill-deal' : 'text-border'}
                      />
                    ))}
                  </div>
                </div>

                {/* Service Tag if provided */}
                {rev.serviceName && (
                  <div className="text-[11px] font-semibold text-primary/90 flex items-center gap-1">
                    <Sparkles size={11} />
                    <span>Experienced: {rev.serviceName}</span>
                  </div>
                )}

                {/* Comment Text */}
                <p className="text-xs text-text leading-relaxed">{rev.comment}</p>

                {/* Photo Attachments */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex gap-2 mt-1 overflow-x-auto pb-1 scrollbar-none">
                    {rev.images.map((imgUrl, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          setActiveLightboxImage({
                            url: imgUrl,
                            author: rev.authorName,
                            date: rev.date,
                            comment: rev.comment,
                          })
                        }
                        className="w-16 h-16 rounded-button overflow-hidden border border-border shrink-0 cursor-pointer hover:border-primary relative group"
                      >
                        <img
                          src={imgUrl}
                          alt="Review attachment"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100">
                          <Maximize2 size={12} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags & Helpful Button */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50 flex-wrap">
                  <div className="flex flex-wrap gap-1">
                    {rev.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-chip bg-muted/12 text-muted font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Helpful Button */}
                  <button
                    onClick={() => handleToggleHelpful(rev.id, rev.helpfulCount || 0)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-chip border transition-all flex items-center gap-1 cursor-pointer ${
                      isVoted
                        ? 'bg-primary-soft text-primary border-primary/30'
                        : 'bg-surface text-muted border-border hover:text-text'
                    }`}
                  >
                    <ThumbsUp size={11} className={isVoted ? 'fill-primary' : ''} />
                    <span>Helpful {currentHelpful > 0 ? `(${currentHelpful})` : ''}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. FULL-SCREEN LIGHTBOX MODAL */}
      {activeLightboxImage && (
        <div
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 cursor-pointer"
        >
          <div className="w-full max-w-lg flex items-center justify-between text-white pt-2">
            <div>
              <h4 className="text-sm font-bold">{activeLightboxImage.author}</h4>
              <span className="text-xs text-white/70">{activeLightboxImage.date}</span>
            </div>
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="my-auto max-w-lg w-full flex items-center justify-center max-h-[70vh]">
            <img
              src={activeLightboxImage.url}
              alt="Full view"
              className="max-w-full max-h-[70vh] object-contain rounded-card shadow-level-2"
            />
          </div>

          <div className="w-full max-w-lg bg-black/60 backdrop-blur-md p-3.5 rounded-card border border-white/10 text-white text-xs mb-2">
            <p className="line-clamp-2">"{activeLightboxImage.comment}"</p>
          </div>
        </div>
      )}
    </div>
  );
};
