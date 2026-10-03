import React, { useState } from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { ReviewItem } from '../../../types';
import { Star, Camera, X, Image as ImageIcon, Upload, Check } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonName: string;
  onSubmitReview: (review: ReviewItem) => void;
}

const REVIEW_TAGS = [
  'Great Service',
  'Clean Environment',
  'Punctual',
  'Hygienic',
  'Friendly Staff',
  'Value for Money',
  'Expert Stylists',
];

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
];

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  salonName,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Great Service', 'Clean Environment']);
  const [photos, setPhotos] = useState<string[]>([]);
  const { showToast } = useUIStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    showToast('Photos attached to review');
  };

  const addPresetPhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos((prev) => [...prev, url]);
      showToast('Sample photo attached');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please add a comment for your review');
      return;
    }

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      authorName: 'You (Verified Customer)',
      rating,
      date: 'Just now',
      tags: selectedTags,
      comment: comment.trim(),
      images: photos,
    };

    onSubmitReview(newReview);
    showToast('Review and photos published successfully!');
    onClose();

    // Reset
    setComment('');
    setPhotos([]);
    setRating(5);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Write a Review">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-24">
        <div>
          <p className="text-xs text-muted">Share your grooming experience at</p>
          <h3 className="text-sm font-bold text-text">{salonName}</h3>
        </div>

        {/* Rating Stars */}
        <div className="flex flex-col items-center bg-primary-soft/30 p-4 rounded-card border border-primary/20">
          <span className="text-xs font-bold text-text mb-2">Overall Rating</span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 cursor-pointer transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={`${
                    (hoverRating || rating) >= star
                      ? 'fill-deal text-deal'
                      : 'text-border fill-transparent'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-[11px] font-bold text-primary mt-1">
            {rating === 5
              ? 'Excellent!'
              : rating === 4
              ? 'Very Good'
              : rating === 3
              ? 'Average'
              : rating === 2
              ? 'Poor'
              : 'Terrible'}
          </span>
        </div>

        {/* Comment Textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="How was your haircut/styling? Mention staff behavior, hygiene, or timing..."
            className="w-full p-3 text-xs bg-bg border border-border rounded-input text-text placeholder:text-muted focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Tags Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text">Select Highlights</label>
          <div className="flex flex-wrap gap-1.5">
            {REVIEW_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-chip transition-colors cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-muted/15 text-text hover:bg-muted/25 border border-border/80'
                  }`}
                >
                  {isSelected && <Check size={11} />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PHOTO ATTACHMENT / UPLOAD SECTION */}
        <div className="flex flex-col gap-2 bg-surface p-3.5 rounded-card border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Camera size={16} className="text-primary" />
              <span className="text-xs font-bold text-text">Attach Photos ({photos.length})</span>
            </div>
            <span className="text-[10px] text-muted">Show off your new look!</span>
          </div>

          {/* Upload Drop Zone / Button */}
          <div className="relative mt-1">
            <label className="w-full h-20 border-2 border-dashed border-border hover:border-primary/60 rounded-card flex flex-col items-center justify-center gap-1 cursor-pointer bg-bg/50 hover:bg-primary-soft/20 transition-all">
              <Upload size={18} className="text-primary" />
              <span className="text-xs font-bold text-text">Upload Photos</span>
              <span className="text-[10px] text-muted">PNG, JPG up to 10MB</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Sample Presets to easily attach demo photos */}
          <div className="mt-2 pt-2 border-t border-border/50">
            <span className="text-[10px] font-semibold text-muted block mb-1.5">
              Quick Attach Result Photos:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {SAMPLE_PHOTO_PRESETS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addPresetPhoto(url)}
                  className="w-12 h-12 rounded-button overflow-hidden shrink-0 border border-border hover:border-primary cursor-pointer relative group"
                >
                  <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-primary/40 flex items-center justify-center text-white text-[10px] font-bold">
                    +
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Attached Photos Preview Grid */}
          {photos.length > 0 && (
            <div className="mt-3">
              <span className="text-[11px] font-bold text-text block mb-1.5">
                Attached Photos ({photos.length})
              </span>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative w-full h-16 rounded-button overflow-hidden border border-border">
                    <img src={photo} alt={`Attached ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                      aria-label="Remove photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button variant="primary" size="lg" type="submit" className="w-full shadow-xs mt-2">
          Submit Review & Photos
        </Button>
      </form>
    </Sheet>
  );
};
