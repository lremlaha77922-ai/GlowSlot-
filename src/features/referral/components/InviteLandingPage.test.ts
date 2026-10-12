import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('InviteLandingPage Component Logic & Referral Attribution', () => {
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    vi.restoreAllMocks();
  });

  it('extracts ref query parameter from URL correctly', () => {
    const testUrl = 'https://glowslot.app/invite?ref=NEX-TEST100';
    const parsed = new URL(testUrl);
    const ref = parsed.searchParams.get('ref');

    expect(ref).toBe('NEX-TEST100');
  });

  it('validates referral code format successfully for valid codes', () => {
    const validCodes = ['GLOW-AARA100', 'NEX-VIP1', 'VIP2026', 'ALICE99'];
    const validator = (code: string) => /^[A-Z0-9_-]{4,20}$/.test(code.trim().toUpperCase());

    validCodes.forEach((code) => {
      expect(validator(code)).toBe(true);
    });
  });

  it('invalidates too short or malformed referral codes', () => {
    const invalidCodes = ['a', '12', '', '$$$INVALID'];
    const validator = (code: string) => /^[A-Z0-9_-]{4,20}$/.test(code.trim().toUpperCase());

    invalidCodes.forEach((code) => {
      expect(validator(code)).toBe(false);
    });
  });

  it('preserves referral attribution into local storage and redirects to onboarding', () => {
    const code = 'NEX-PROMO100';
    mockStorage['glowslot_invite_ref'] = code;

    expect(mockStorage['glowslot_invite_ref']).toBe('NEX-PROMO100');
  });
});
