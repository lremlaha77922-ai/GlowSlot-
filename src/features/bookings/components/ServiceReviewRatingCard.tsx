import React, { useState } from 'react';
import { Booking, BookingReview } from '../../../types';
import { bookingService } from '../services/bookingService';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';
import { Button } from '../../../components/Button';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Calendar,
  Clock,
  Scissors,
  Building2,
  ShieldCheck,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface ServiceReviewRatingCardProps {
  booking: Booking;
  onReviewSubmitted?: (updatedBooking: Booking) => void;
  className?: string;
  isModalMode?: boolean;
  onCloseModal?: () => void;
}

const FEEDBACK_TAGS = [
  'Punctual & Zero Wait',
  'Clean & Sanitized Kit',
  'Expert Stylist',
  'Polite & Professional',
  'Value for Money',
  'Exact Style Delivered',
  'Gentle Care',
];

const RATING_SENTIMENTS: Record<number, { text: string; color: string }> = {
  1: { text: 'Poor Experience', color: 'text-error' },
  2: { text: 'Fair / Below Expectation', color: 'text-amber-600' },
  3: { text: 'Good Service', color: 'text-yellow-600' },
  4: { text: 'Very Good & Professional', color: 'text-primary' },
  5: { text: 'Exceptional 5-Star Experience!', color: 'text-deal' },
};

export const ServiceReviewRatingCard: React.FC<ServiceReviewRatingCardProps> = ({
  booking,
  onReviewSubmitted,
  className = '',
  isModalMode = false,
  onCloseModal,
}) => {
  const { user } = useSessionStore();
  const { showToast } = useUIStore();

  const existingReview = booking.review;
  const [isEditing, setIsEditing] = useState(!existingReview);

  const [rating, setRating] = useState<number>(existingReview?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingReview?.tags ?? ['Clean & Sanitized Kit', 'Expert Stylist']
  );
  const [comment, setComment] = useState<string>(existingReview?.text ?? '');
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCompleted = booking.status === 'completed';

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCompleted) {
      showToast('Reviews can only be submitted for completed appointments.');
      return;
    }

    if (!comment.trim()) {
      showToast('Please add a few words about your salon service.');
      return;
    }

    const reviewPayload: BookingReview = {
      rating,
      tags: selectedTags,
      text: comment.trim(),
      submittedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    const res = await bookingService.addReview(booking.id, reviewPayload, user?.id);
    setIsSubmitting(false);

    if (res.success) {
      showToast('Thank you! Your feedback has been published.');
      const updated: Booking = {
        ...booking,
        review: reviewPayload,
      };
      setIsEditing(false);
      if (onReviewSubmitted) {
        onReviewSubmitted(updated);
      }
      if (onCloseModal) {
        onCloseModal();
      }
    } else {
      showToast(res.error || 'Failed to submit feedback.');
    }
  };

  const activeRating = hoverRating || rating;
  const sentiment = RATING_SENTIMENTS[activeRating] || RATING_SENTIMENTS[5];

  // If already reviewed and not in edit mode, display the submitted review summary
  if (existingReview && !isEditing) {
    return (
      <div className={`bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3 ${className}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-text">Your Service Review</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-chip bg-success/10 text-success border border-success/20">
                <ShieldCheck size={11} /> Verified Customer
              </span>
            </div>
            <p className="text-[10px] text-muted mt-0.5">
              Submitted for {booking.salonName}
            </p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit2 size={12} /> Edit Review
          </button>
        </div>

        {/* Stars given */}
        <div className="flex items-center gap-2 bg-primary-soft/30 p-2.5 rounded-button border border-primary/20">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={
                  star <= existingReview.rating
                    ? 'text-deal fill-deal'
                    : 'text-border fill-transparent'
                }
              />
            ))}
          </div>
          <span className="font-mono font-black text-xs text-text tabular-nums">
            {existingReview.rating}.0
          </span>
          <span className="text-[10px] text-muted">•</span>
          <span className="text-[10px] font-bold text-primary">
            {RATING_SENTIMENTS[existingReview.rating]?.text}
          </span>
        </div>

        {/* Comment */}
        <p className="text-xs text-text italic bg-bg/60 p-3 rounded-button border border-border/60 leading-relaxed">
          "{existingReview.text}"
        </p>

        {/* Tags */}
        {existingReview.tags && existingReview.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {existingReview.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold px-2.5 py-0.5 rounded-chip bg-muted/15 text-text border border-border/60"
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Interactive Review Submission Form
  return (
    <div className={`bg-surface rounded-card border border-border p-4 sm:p-5 shadow-xs flex flex-col gap-4 ${className}`}>
      {/* Header Context */}
      <div className="flex items-start justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-text">
            <MessageSquare size={14} className="text-primary" />
            <span>Rate &amp; Review Your Experience</span>
          </div>
          <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1">
            <Building2 size={11} className="text-primary shrink-0" />
            <span className="truncate">{booking.salonName}</span>
          </p>
        </div>

        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-chip bg-success/10 text-success border border-success/20">
          <CheckCircle2 size={10} /> Completed Visit
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Services Rendered Reminder */}
        {booking.services && booking.services.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-muted overflow-x-auto pb-0.5 no-scrollbar">
            <span className="font-semibold text-text shrink-0 flex items-center gap-1">
              <Scissors size={11} className="text-primary" /> Services:
            </span>
            {booking.services.map((s, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-chip bg-bg border border-border text-[10px] shrink-0 font-medium"
              >
                {s.name}
              </span>
            ))}
          </div>
        )}

        {/* 1 to 5 Interactive Star Rating */}
        <div className="flex flex-col items-center justify-center bg-primary-soft/30 p-4 rounded-card border border-primary/20 gap-2">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Tap Stars to Rate
          </span>

          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 cursor-pointer transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                aria-label={`Rate ${star} star`}
              >
                <Star
                  size={32}
                  className={`transition-colors ${
                    star <= activeRating
                      ? 'text-deal fill-deal drop-shadow-xs'
                      : 'text-border fill-transparent hover:text-deal/40'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="text-center">
            <span className={`text-xs font-black ${sentiment.color}`}>
              {sentiment.text}
            </span>
            <span className="font-mono text-[10px] text-muted block mt-0.5">
              {activeRating} of 5 Stars
            </span>
          </div>
        </div>

        {/* Highlight Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-text uppercase tracking-wider">
            What stood out? (Select Highlights)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {FEEDBACK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-chip border transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface text-muted border-border hover:border-primary/40'
                  }`}
                >
                  {isSelected && <CheckCircle2 size={11} />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Comment Box */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-text uppercase tracking-wider">
              Your Feedback &amp; Review
            </label>
            <span className="text-[10px] text-muted">
              {comment.length} / 500 characters
            </span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Share feedback on stylist skill, hygiene, chair comfort, zero wait time..."
            className="w-full p-3 text-xs bg-bg border border-border rounded-input text-text placeholder:text-muted focus:border-primary focus:outline-none resize-none leading-relaxed"
            required
          />
        </div>

        {/* Would Recommend Toggle */}
        <div className="flex items-center justify-between bg-bg p-3 rounded-button border border-border/60">
          <span className="text-xs font-semibold text-text">
            Would you recommend this salon to friends?
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWouldRecommend(true)}
              className={`px-2.5 py-1 rounded-chip text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                wouldRecommend
                  ? 'bg-success text-white border-success'
                  : 'bg-surface text-muted border-border'
              }`}
            >
              <ThumbsUp size={12} /> Yes
            </button>
            <button
              type="button"
              onClick={() => setWouldRecommend(false)}
              className={`px-2.5 py-1 rounded-chip text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                !wouldRecommend
                  ? 'bg-error text-white border-error'
                  : 'bg-surface text-muted border-border'
              }`}
            >
              <ThumbsDown size={12} /> No
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {existingReview && (
            <Button
              type="button"
              variant="outline"
              size="md"
              className="flex-1 text-xs font-bold"
              onClick={() => setIsEditing(false)}
            >
              Cancel Edit
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth={!existingReview}
            disabled={isSubmitting}
            className="flex-1 font-bold shadow-xs text-xs h-11"
          >
            {isSubmitting ? 'Publishing Review...' : existingReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </div>
  );
};
