import { describe, it, expect, beforeEach, vi } from 'vitest';
import { referralService } from '../services/referralService';

describe('Referral Leaderboard Logic & Community Gamification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Leaderboard Data Retrieval & Top 5 Restriction', () => {
    it('retrieves exactly the top 5 community referrers by default', async () => {
      const leaderboard = await referralService.getTopReferrers(5);

      expect(leaderboard).toBeDefined();
      expect(leaderboard.length).toBe(5);
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[4].rank).toBe(5);
    });

    it('respects custom limit argument when requesting fewer or more referrers', async () => {
      const top3 = await referralService.getTopReferrers(3);
      expect(top3.length).toBe(3);
      expect(top3[2].rank).toBe(3);
    });

    it('orders referrers by descending number of completed referrals', async () => {
      const leaderboard = await referralService.getTopReferrers(5);

      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].completedReferrals).toBeGreaterThanOrEqual(
          leaderboard[i + 1].completedReferrals
        );
      }
    });
  });

  describe('2. Points and Tier Badge Calculations', () => {
    it('verifies points awarded matches 100 points per completed referral', async () => {
      const leaderboard = await referralService.getTopReferrers(5);

      leaderboard.forEach((referrer) => {
        expect(referrer.totalPointsEarned).toBe(referrer.completedReferrals * 100);
      });
    });

    it('assigns distinctive gamified tier badges for top ranks', async () => {
      const leaderboard = await referralService.getTopReferrers(5);

      expect(leaderboard[0].tierBadge).toBe('Diamond Champion');
      expect(leaderboard[1].tierBadge).toBe('Platinum Influencer');
      expect(leaderboard[2].tierBadge).toBe('Gold Ambassador');
      expect(leaderboard[3].tierBadge).toBe('Silver Star');
      expect(leaderboard[4].tierBadge).toBe('Rising Advocate');
    });

    it('formats referral codes with proper GLOW prefix', async () => {
      const leaderboard = await referralService.getTopReferrers(5);

      leaderboard.forEach((referrer) => {
        expect(referrer.referralCode.startsWith('GLOW-')).toBe(true);
      });
    });
  });

  describe('3. Current User Standing & Distance to Top 5', () => {
    it('calculates the number of referrals needed to break into Top 5', async () => {
      const leaderboard = await referralService.getTopReferrers(5);
      const lowestTop5Referrals = leaderboard[4].completedReferrals; // 9

      const userReferralCount = 2;
      const needed = Math.max(1, lowestTop5Referrals - userReferralCount + 1);

      expect(lowestTop5Referrals).toBe(9);
      expect(needed).toBe(8); // needs 8 more to beat 9 (2 + 8 = 10 > 9)
    });

    it('correctly detects when user is already ranked within the Top 5', async () => {
      const leaderboard = await referralService.getTopReferrers(5);
      const userCode = 'GLOW-ANAN100';

      const userIndex = leaderboard.findIndex(
        (item) => item.referralCode.toUpperCase() === userCode.toUpperCase()
      );

      expect(userIndex).toBe(0);
      expect(leaderboard[userIndex].rank).toBe(1);
    });

    it('handles user not in leaderboard gracefully with positive referral shortfall', async () => {
      const leaderboard = await referralService.getTopReferrers(5);
      const guestCode = 'GLOW-GUEST999';

      const userIndex = leaderboard.findIndex(
        (item) => item.referralCode.toUpperCase() === guestCode.toUpperCase()
      );

      expect(userIndex).toBe(-1);
      const needed = Math.max(1, leaderboard[4].completedReferrals - 0 + 1);
      expect(needed).toBe(10);
    });
  });

  describe('4. Timeframe Scaling Logic', () => {
    it('correctly simulates monthly active standings when timeframe is monthly', async () => {
      const data = await referralService.getTopReferrers(5);

      const monthlyData = data.map((item, idx) => ({
        ...item,
        completedReferrals: Math.max(1, Math.round(item.completedReferrals * 0.4) - idx),
        totalPointsEarned: Math.max(100, Math.round(item.completedReferrals * 0.4 - idx) * 100),
      }));

      expect(monthlyData.length).toBe(5);
      expect(monthlyData[0].completedReferrals).toBeGreaterThan(0);
      expect(monthlyData[0].totalPointsEarned).toBe(monthlyData[0].completedReferrals * 100);
    });
  });
});
