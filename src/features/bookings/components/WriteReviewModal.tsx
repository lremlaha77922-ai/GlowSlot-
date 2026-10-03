import React, { useState } from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { Booking } from '../../../types';
import { bookingService } from '../services/bookingService';
import { Star } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onReviewSubmitted: (updatedBooking: Booking) => void;
}

const REVIEW_TAGS = [
  'Clean & Sanitized',
  'Punctual Stylist',
  'Great Haircut',
  'Relaxing Ambiance',
  'Value for Money',
  'Polite Staff',
  'Zero Wait Time',
];

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual Stylist', 'Clean & Sanitized']);
  const [comment, setComment] = useState('');
  const { showToast } = useUIStore();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please add a few words to your review.');
      return;
    }

    const updated = bookingService.addReview(booking.id, {
      rating,
      tags: selectedTags,
      text: comment.trim(),
      submittedAt: new Date().toISOString(),
    });

    if (updated) {
      showToast('Thank you! Your review has been submitted.');
      onReviewSubmitted(updated);
      onClose();
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Write a Review (S12)">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-4">
        <div className="text-center py-2">
          <span className="text-xs text-muted block mb-1">Rate your experience with</span>
          <h3 className="text-sm font-bold text-text">{booking.salonName}</h3>

          {/* Star selector */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setRating(s)}
                className="p-1 cursor-pointer transition-transform hover:scale-110"
                aria-label={`${s} star`}
              >
                <Star
                  size={28}
                  className={s <= rating ? 'fill-deal text-deal' : 'text-border'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-bold text-text uppercase tracking-wider block mb-2">
            What went well?
          </label>
          <div className="flex flex-wrap gap-1.5">
            {REVIEW_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-chip border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white border-primary font-semibold'
                      : 'bg-surface text-muted border-border hover:bg-primary-soft/40'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback text */}
        <div>
          <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
            Detailed Feedback
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about the stylist haircut quality, service timing..."
            rows={3}
            className="w-full p-3 rounded-input border border-border bg-bg text-xs text-text outline-none focus:border-primary"
            required
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="mt-2">
          Submit Review
        </Button>
      </form>
    </Sheet>
  );
};
