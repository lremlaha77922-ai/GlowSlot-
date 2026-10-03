export interface AppError {
  code: string;
  message: string;
}

export const ERROR_CODE_MAP: Record<string, string> = {
  SLOT_NOT_FOUND: 'The requested slot was not found or is no longer available.',
  SLOT_ALREADY_HELD: 'This slot was just selected by another customer. Please choose another time.',
  SLOT_ALREADY_BOOKED: 'This slot has already been booked.',
  HOLD_EXPIRED: 'Your 5-minute slot reservation has expired. Please select a slot again.',
  BOOKING_NOT_FOUND: 'Appointment booking details could not be found.',
  CANCELLATION_WINDOW_CLOSED: 'Bookings starting in less than 1 hour cannot be cancelled online.',
  RESCHEDULE_LIMIT_EXCEEDED: 'This booking has already reached the maximum of 1 free reschedule.',
  RESCHEDULE_WINDOW_CLOSED: 'Appointments can only be rescheduled at least 2 hours in advance.',
  INVALID_COUPON: 'The coupon code entered is invalid or does not meet minimum order value.',
  INSUFFICIENT_POINTS: 'You do not have enough Glow Points for this redemption.',
  REVIEW_NOT_PERMITTED: 'Reviews can only be submitted after your appointment is completed.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'Please sign in to continue.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

export const getFriendlyErrorMessage = (codeOrMessage?: string): string => {
  if (!codeOrMessage) return ERROR_CODE_MAP.UNKNOWN_ERROR;
  if (ERROR_CODE_MAP[codeOrMessage]) {
    return ERROR_CODE_MAP[codeOrMessage];
  }
  // If message contains known error string
  for (const [code, friendly] of Object.entries(ERROR_CODE_MAP)) {
    if (codeOrMessage.toUpperCase().includes(code)) {
      return friendly;
    }
  }
  return codeOrMessage;
};
