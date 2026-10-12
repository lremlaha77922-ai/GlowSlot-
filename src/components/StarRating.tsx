import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 5,
  size = 16,
  className = '',
  onRatingChange,
  readonly = false,
}) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => onRatingChange?.(starValue)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
            aria-label={`Rate ${starValue} star`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'fill-deal text-deal'
                  : 'text-border fill-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
