import React, { useState } from 'react';
import { ReviewItem } from '../../../types';
import { Camera, X, Star, Maximize2, Sparkles, Filter } from 'lucide-react';

interface ReviewPhotoGalleryProps {
  reviews: ReviewItem[];
  onOpenWriteReview: () => void;
}

export const ReviewPhotoGallery: React.FC<ReviewPhotoGalleryProps> = ({
  reviews,
  onOpenWriteReview,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'withPhotos'>('all');
  const [activeLightboxImage, setActiveLightboxImage] = useState<{
    url: string;
    author: string;
    date: string;
    comment: string;
  } | null>(null);

  // Extract all photos attached across all reviews
  const allAttachedPhotos = reviews.flatMap((rev) =>
    (rev.images || []).map((img) => ({
      url: img,
      author: rev.authorName,
      date: rev.date,
      comment: rev.comment,
    }))
  );

  const displayedReviews =
    filterMode === 'withPhotos'
      ? reviews.filter((r) => r.images && r.images.length > 0)
      : reviews;

  return (
    <div className="flex flex-col gap-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-muted/15 p-1 rounded-chip border border-border">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 text-xs font-bold rounded-chip transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-muted hover:text-text'
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setFilterMode('withPhotos')}
            className={`px-3 py-1 text-xs font-bold rounded-chip transition-colors cursor-pointer flex items-center gap-1 ${
              filterMode === 'withPhotos'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-muted hover:text-text'
            }`}
          >
            <Camera size={13} />
            <span>With Photos ({allAttachedPhotos.length})</span>
          </button>
        </div>

        <button
          onClick={onOpenWriteReview}
          className="py-1.5 px-3 rounded-button bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
        >
          <Camera size={13} />
          <span>Write Review</span>
        </button>
      </div>

      {/* Customer Photo Gallery Banner Grid */}
      {allAttachedPhotos.length > 0 && (
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text flex items-center gap-1.5">
              <Camera size={15} className="text-primary" />
              <span>Customer Style Gallery ({allAttachedPhotos.length} photos)</span>
            </span>
            <span className="text-[10px] text-muted">Tap image to expand</span>
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
                  alt={`Customer style ${i}`}
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

      {/* Reviews List */}
      <div className="flex flex-col gap-3">
        {displayedReviews.length === 0 ? (
          <div className="bg-surface rounded-card border border-border p-6 text-center text-muted text-xs">
            No reviews matching this filter.
          </div>
        ) : (
          displayedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-surface rounded-card border border-border/80 p-3.5 flex flex-col gap-2 shadow-xs hover:border-primary/30 transition-colors"
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

              {/* Review Photo Attachments */}
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
                      <img src={imgUrl} alt="Review attachment" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100">
                        <Maximize2 size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {rev.tags && rev.tags.length > 0 && (
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
              )}
            </div>
          ))
        )}
      </div>

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {activeLightboxImage && (
        <div
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 cursor-pointer"
        >
          {/* Top Bar */}
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

          {/* Main Image */}
          <div className="my-auto max-w-lg w-full flex items-center justify-center max-h-[70vh]">
            <img
              src={activeLightboxImage.url}
              alt="Full view"
              className="max-w-full max-h-[70vh] object-contain rounded-card shadow-level-2"
            />
          </div>

          {/* Bottom Comment Strip */}
          <div className="w-full max-w-lg bg-black/60 backdrop-blur-md p-3.5 rounded-card border border-white/10 text-white text-xs mb-2">
            <p className="line-clamp-2">"{activeLightboxImage.comment}"</p>
          </div>
        </div>
      )}
    </div>
  );
};
