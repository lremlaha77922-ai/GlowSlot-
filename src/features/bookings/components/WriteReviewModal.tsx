import React from 'react';
import { Sheet } from '../../../components/Sheet';
import { Booking } from '../../../types';
import { ServiceReviewRatingCard } from './ServiceReviewRatingCard';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onReviewSubmitted: (updatedBooking: Booking) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onReviewSubmitted,
}) => {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Service Feedback & Rating">
      <div className="pb-6">
        <ServiceReviewRatingCard
          booking={booking}
          onReviewSubmitted={onReviewSubmitted}
          onCloseModal={onClose}
          isModalMode={true}
        />
      </div>
    </Sheet>
  );
};
