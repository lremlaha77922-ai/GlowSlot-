import { describe, it, expect } from 'vitest';
import {
  validateIndianPhone,
  validateOtp,
  validatePincode,
  validateEmail,
  validateCouponCode,
} from './validators';

describe('Validation Utilities (P6A)', () => {
  describe('validateIndianPhone', () => {
    it('accepts valid 10-digit mobile numbers starting with 6, 7, 8, 9', () => {
      expect(validateIndianPhone('9876543210')).toBe(true);
      expect(validateIndianPhone('8123456789')).toBe(true);
      expect(validateIndianPhone('7000000000')).toBe(true);
      expect(validateIndianPhone('6366123456')).toBe(true);
    });

    it('accepts valid mobile numbers with +91 or 91 prefix', () => {
      expect(validateIndianPhone('+91 9876543210')).toBe(true);
      expect(validateIndianPhone('919876543210')).toBe(true);
    });

    it('rejects invalid numbers', () => {
      expect(validateIndianPhone('1234567890')).toBe(false); // starts with 1
      expect(validateIndianPhone('5876543210')).toBe(false); // starts with 5
      expect(validateIndianPhone('987654321')).toBe(false); // 9 digits
      expect(validateIndianPhone('987654321000')).toBe(false); // 12 digits not 91
    });
  });

  describe('validateOtp', () => {
    it('accepts 6-digit numeric OTP', () => {
      expect(validateOtp('123456')).toBe(true);
      expect(validateOtp('000000')).toBe(true);
    });

    it('rejects non-6-digit or non-numeric OTP', () => {
      expect(validateOtp('12345')).toBe(false);
      expect(validateOtp('1234567')).toBe(false);
      expect(validateOtp('12345a')).toBe(false);
      expect(validateOtp('      ')).toBe(false);
    });
  });

  describe('validatePincode', () => {
    it('accepts 6-digit Indian postal code not starting with 0', () => {
      expect(validatePincode('560001')).toBe(true);
      expect(validatePincode('110001')).toBe(true);
      expect(validatePincode('400001')).toBe(true);
    });

    it('rejects invalid pincodes', () => {
      expect(validatePincode('060001')).toBe(false);
      expect(validatePincode('56001')).toBe(false);
      expect(validatePincode('5600001')).toBe(false);
      expect(validatePincode('56000A')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('accepts valid email and empty optional email', () => {
      expect(validateEmail('')).toBe(true);
      expect(validateEmail('test@glowslot.com')).toBe(true);
      expect(validateEmail('rahul.k@gmail.com')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('validateCouponCode', () => {
    it('accepts valid alphanumeric coupon codes', () => {
      expect(validateCouponCode('GLOW50')).toBe(true);
      expect(validateCouponCode('WELCOME100')).toBe(true);
      expect(validateCouponCode('OFF_20')).toBe(true);
    });

    it('rejects too short or special characters', () => {
      expect(validateCouponCode('G')).toBe(false);
      expect(validateCouponCode('GLOW!50')).toBe(false);
    });
  });
});
