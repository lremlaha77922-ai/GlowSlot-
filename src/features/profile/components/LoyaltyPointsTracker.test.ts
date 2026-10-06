import { describe, it, expect } from 'vitest';
import { LOYALTY_TIERS } from './LoyaltyPointsTracker';

describe('LoyaltyPointsTracker Tier Calculations', () => {
  it('correctly orders loyalty tiers by minPoints', () => {
    expect(LOYALTY_TIERS[0].name).toBe('Bronze Glow');
    expect(LOYALTY_TIERS[0].minPoints).toBe(0);
    expect(LOYALTY_TIERS[0].discountPercent).toBe(5);

    expect(LOYALTY_TIERS[1].name).toBe('Silver Glow');
    expect(LOYALTY_TIERS[1].minPoints).toBe(200);
    expect(LOYALTY_TIERS[1].discountPercent).toBe(10);

    expect(LOYALTY_TIERS[2].name).toBe('Gold VIP');
    expect(LOYALTY_TIERS[2].minPoints).toBe(500);
    expect(LOYALTY_TIERS[2].discountPercent).toBe(15);

    expect(LOYALTY_TIERS[3].name).toBe('Platinum Elite');
    expect(LOYALTY_TIERS[3].minPoints).toBe(1000);
    expect(LOYALTY_TIERS[3].discountPercent).toBe(20);
  });

  it('determines the correct tier and next tier progress for 120 points (Bronze -> Silver)', () => {
    const points = 120;
    const currentTier = LOYALTY_TIERS.slice().reverse().find((t) => points >= t.minPoints)!;
    expect(currentTier.id).toBe('bronze');

    const nextTier = LOYALTY_TIERS[1];
    const tierRange = nextTier.minPoints - currentTier.minPoints; // 200 - 0 = 200
    const pointsInTier = points - currentTier.minPoints; // 120
    const progressPercent = Math.round((pointsInTier / tierRange) * 100);
    const pointsNeeded = nextTier.minPoints - points;

    expect(progressPercent).toBe(60);
    expect(pointsNeeded).toBe(80);
  });

  it('determines the correct tier and next tier progress for 350 points (Silver -> Gold)', () => {
    const points = 350;
    const currentTier = LOYALTY_TIERS.slice().reverse().find((t) => points >= t.minPoints)!;
    expect(currentTier.id).toBe('silver');

    const nextTier = LOYALTY_TIERS[2]; // Gold at 500
    const tierRange = nextTier.minPoints - currentTier.minPoints; // 500 - 200 = 300
    const pointsInTier = points - currentTier.minPoints; // 150
    const progressPercent = Math.round((pointsInTier / tierRange) * 100);
    const pointsNeeded = nextTier.minPoints - points; // 150

    expect(progressPercent).toBe(50);
    expect(pointsNeeded).toBe(150);
  });

  it('identifies top tier for points >= 1000', () => {
    const points = 1250;
    const currentTier = LOYALTY_TIERS.slice().reverse().find((t) => points >= t.minPoints)!;
    expect(currentTier.id).toBe('platinum');
    expect(currentTier.discountPercent).toBe(20);
  });
});
