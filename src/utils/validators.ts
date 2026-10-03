/**
 * Validation utilities for GlowSlot
 */

export const validateIndianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // Must be 10 digits starting with 6-9, or 12 digits starting with 91 followed by 6-9
  if (cleaned.length === 10) {
    return /^[6-9]\d{9}$/.test(cleaned);
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(cleaned);
  }
  return false;
};

export const validateOtp = (otp: string): boolean => {
  return /^\d{6}$/.test(otp.trim());
};

export const validatePincode = (pincode: string): boolean => {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
};

export const validateEmail = (email: string): boolean => {
  if (!email) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const validateCouponCode = (code: string): boolean => {
  return /^[A-Z0-9_-]{3,20}$/i.test(code.trim());
};
