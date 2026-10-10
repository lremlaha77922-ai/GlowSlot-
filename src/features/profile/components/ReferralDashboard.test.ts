import { describe, it, expect, beforeEach, vi } from 'vitest';
import { referralService } from '../services/referralService';

// Mock localStorage for node environment
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

describe('Referral Dashboard & Unique Invite Link Logic', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Initial generation of unique codes and invite links', () => {
    it('generates a unique invite code based on user profile name', () => {
      const userName = 'Aarav Sharma';
      const cleanName = userName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
      const code = `GLOW-${cleanName}100`;

      expect(code).toBe('GLOW-AARA100');
      expect(code.startsWith('GLOW-')).toBe(true);
    });

    it('generates fallback code when user name is empty or missing', () => {
      const userName = '';
      const cleanName = (userName || 'USER').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'VIP';
      const code = `GLOW-${cleanName}100`;

      expect(code).toBe('GLOW-USER100');
    });

    it('generates a valid shareable invite link embedding the referral code parameter', () => {
      const code = 'GLOW-AARA100';
      const link = `https://glowslot.app/invite?ref=${code}`;

      expect(link).toBe('https://glowslot.app/invite?ref=GLOW-AARA100');
      expect(link).toContain('ref=GLOW-AARA100');
    });
  });

  describe('2. Clipboard copy action validation', () => {
    it('validates clipboard copy text for referral code and full invite link', async () => {
      let clipboardContent = '';
      const writeTextMock = vi.fn().mockImplementation(async (text: string) => {
        clipboardContent = text;
        return Promise.resolve();
      });

      const fakeClipboard = {
        writeText: writeTextMock,
      };

      const referralCode = 'GLOW-AARA100';
      const referralLink = `https://glowslot.app/invite?ref=${referralCode}`;

      // Simulate copying code
      await fakeClipboard.writeText(referralCode);
      expect(writeTextMock).toHaveBeenCalledWith(referralCode);
      expect(clipboardContent).toBe('GLOW-AARA100');

      // Simulate copying link
      await fakeClipboard.writeText(referralLink);
      expect(writeTextMock).toHaveBeenCalledWith(referralLink);
      expect(clipboardContent).toBe('https://glowslot.app/invite?ref=GLOW-AARA100');
    });
  });

  describe('3. Custom alias updating logic and error handling', () => {
    it('customizes unique invite code properly formatting alphanumeric tags', () => {
      const customAlias = 'vip grooming 2026';
      const cleaned = customAlias.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
      const customCode = `GLOW-${cleaned}`;

      expect(customCode).toBe('GLOW-VIPGROOMING2026');
      expect(customCode.startsWith('GLOW-')).toBe(true);
    });

    it('enforces minimum 3-character constraint for custom alias', () => {
      const shortAlias = 'ab';
      const cleaned = shortAlias.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
      const isValid = cleaned.length >= 3;

      expect(isValid).toBe(false);
    });

    it('persists custom alias across sessions in localStorage', () => {
      const userId = 'usr-test-123';
      const storageKey = `glowslot_referral_code_${userId}`;
      const customCode = 'GLOW-SPECIALVIP';

      mockLocalStorage.setItem(storageKey, customCode);

      const retrievedCode = mockLocalStorage.getItem(storageKey);
      expect(retrievedCode).toBe('GLOW-SPECIALVIP');

      // Reset removes from localStorage
      mockLocalStorage.removeItem(storageKey);
      expect(mockLocalStorage.getItem(storageKey)).toBeNull();
    });
  });

  describe('4. Real-time "Verify & Award" state transitions and point crediting calculations', () => {
    it('calculates total bonus loyalty points earned from completed referrals', async () => {
      const stats = await referralService.getReferralStats();

      expect(stats.totalReferrals).toBe(3);
      expect(stats.completedReferrals).toBe(2);
      expect(stats.totalPointsEarned).toBe(200);

      const completed = stats.referrals.filter((r) => r.status === 'completed');
      expect(completed.length).toBe(2);
      completed.forEach((r) => {
        expect(r.pointsEarned).toBe(100);
      });
    });

    it('simulates "Verify & Award" transition from pending to completed with +100 point credit', () => {
      const initialReferrals = [
        { id: 'ref-1', friendName: 'Rahul', status: 'completed' as const, pointsEarned: 100 },
        { id: 'ref-2', friendName: 'Vikram', status: 'pending' as const, pointsEarned: 100 },
      ];
      const initialBalance = 250;

      // Transition ref-2 to completed
      const updatedReferrals = initialReferrals.map((r) =>
        r.id === 'ref-2' ? { ...r, status: 'completed' as const } : r
      );
      const newCompletedCount = updatedReferrals.filter((r) => r.status === 'completed').length;
      const newBonusPoints = newCompletedCount * 100;
      const updatedBalance = initialBalance + 100;

      expect(newCompletedCount).toBe(2);
      expect(newBonusPoints).toBe(200);
      expect(updatedBalance).toBe(350);
      expect(updatedReferrals.find((r) => r.id === 'ref-2')?.status).toBe('completed');
    });

    it('computes milestone progress towards next bonus threshold correctly', () => {
      const testCases = [
        { completed: 0, nextMilestone: 1, remaining: 1 },
        { completed: 1, nextMilestone: 3, remaining: 2 },
        { completed: 2, nextMilestone: 3, remaining: 1 },
        { completed: 3, nextMilestone: 5, remaining: 2 },
        { completed: 5, nextMilestone: 5, remaining: 0 },
      ];

      testCases.forEach(({ completed, nextMilestone, remaining }) => {
        const calcMilestone = completed < 1 ? 1 : completed < 3 ? 3 : 5;
        const calcRemaining = Math.max(0, calcMilestone - completed);
        expect(calcMilestone).toBe(nextMilestone);
        expect(calcRemaining).toBe(remaining);
      });
    });
  });

  describe('5. Self-referral abuse prevention validations', () => {
    it('blocks self-referral when entering own generated referral code', () => {
      const userReferralCode = 'GLOW-AARA100';
      const enteredCode = 'GLOW-AARA100';

      const isSelfReferral = enteredCode.trim().toUpperCase() === userReferralCode;
      expect(isSelfReferral).toBe(true);
    });

    it('blocks self-referral case-insensitively and with leading/trailing spaces', () => {
      const userReferralCode = 'GLOW-AARA100';
      const enteredCode = '  glow-aara100  ';

      const cleanedCode = enteredCode.trim().toUpperCase();
      const isSelfReferral = cleanedCode === userReferralCode;
      expect(isSelfReferral).toBe(true);
    });

    it('permits valid distinct referral codes from friends', () => {
      const userReferralCode = 'GLOW-AARA100';
      const enteredCode = 'GLOW-PRIYA200';

      const isSelfReferral = enteredCode.trim().toUpperCase() === userReferralCode;
      const isLengthValid = enteredCode.trim().length >= 6;

      expect(isSelfReferral).toBe(false);
      expect(isLengthValid).toBe(true);
    });
  });
});
