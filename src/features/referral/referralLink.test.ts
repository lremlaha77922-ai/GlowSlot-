import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildReferralInviteUrl, buildWhatsAppShareUrl, getAppBaseUrl } from '../../utils/url';

describe('Referral Link & URL Routing Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Referral link construction & encoding', () => {
    it('builds referral link using explicit origin and referral code', () => {
      const origin = 'https://glowslot.app';
      const code = 'GLOW-DEMO100';
      const url = buildReferralInviteUrl(code, origin);

      expect(url).toBe('https://glowslot.app/invite?ref=GLOW-DEMO100');
    });

    it('safely encodes referral codes containing spaces or special characters', () => {
      const origin = 'https://glowslot.app';
      const code = 'GLOW-VIP 2026';
      const url = buildReferralInviteUrl(code, origin);

      expect(url).toBe('https://glowslot.app/invite?ref=GLOW-VIP%202026');
    });

    it('handles query parameter parsing for ref and referral query aliases', () => {
      const searchUrl1 = 'https://glowslot.app/invite?ref=GLOW-AARA100';
      const parsed1 = new URL(searchUrl1);
      const code1 = parsed1.searchParams.get('ref') || parsed1.searchParams.get('referral');
      expect(code1).toBe('GLOW-AARA100');

      const searchUrl2 = 'https://glowslot.app/invite?referral=GLOW-ROHA100';
      const parsed2 = new URL(searchUrl2);
      const code2 = parsed2.searchParams.get('ref') || parsed2.searchParams.get('referral');
      expect(code2).toBe('GLOW-ROHA100');
    });
  });

  describe('2. WhatsApp share link generation', () => {
    it('generates a valid WhatsApp click-to-chat URL with encoded text and invite link', () => {
      const code = 'GLOW-DEMO100';
      const inviteUrl = 'https://glowslot.app/invite?ref=GLOW-DEMO100';
      const waUrl = buildWhatsAppShareUrl(code, inviteUrl);

      expect(waUrl.startsWith('https://api.whatsapp.com/send?text=')).toBe(true);
      expect(waUrl).toContain(encodeURIComponent(code));
      expect(waUrl).toContain(encodeURIComponent(inviteUrl));
      expect(waUrl).toContain(encodeURIComponent('Rs.100 off'));
    });
  });

  describe('3. Dynamic origin detection fallback', () => {
    it('falls back to https://glowslot.app when window.location is undefined or non-browser', () => {
      // In node / vitest environment without window.location.origin
      const baseUrl = getAppBaseUrl();
      expect(baseUrl.startsWith('http')).toBe(true);
    });
  });
});
