import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recommendationService } from './recommendationService';

describe('AI Smart Recommendation System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches smart recommendations successfully with default category', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          source: 'gemini-ai',
          recommendations: [
            {
              id: 'rec-1',
              title: 'Textured Crop & Low Skin Fade',
              category: 'Hair',
              suggestedSalon: 'Luxe Cut & Style Studio',
              pricePaise: 14900,
              durationMin: 35,
              reason: 'Top trending style this season.',
              tag: 'TRENDING #1',
            },
          ],
        }),
      })
    );

    const res = await recommendationService.getRecommendations({
      userName: 'Aarav Sharma',
      categoryFilter: 'all',
    });

    expect(res.success).toBe(true);
    expect(res.recommendations.length).toBeGreaterThan(0);

    const first = res.recommendations[0];
    expect(first.title).toBeDefined();
    expect(first.category).toBeDefined();
    expect(first.pricePaise).toBeGreaterThan(0);
    expect(first.reason).toBeDefined();
    expect(first.tag).toBeDefined();
  });

  it('filters recommendations by Hair category', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          source: 'gemini-ai',
          recommendations: [
            {
              id: 'rec-1',
              title: 'Textured Crop & Low Skin Fade',
              category: 'Hair',
              suggestedSalon: 'Luxe Cut & Style Studio',
              pricePaise: 14900,
              durationMin: 35,
              reason: 'Top trending style this season.',
              tag: 'TRENDING #1',
            },
          ],
        }),
      })
    );

    const res = await recommendationService.getRecommendations({
      userName: 'Aarav Sharma',
      categoryFilter: 'Hair',
    });

    expect(res.success).toBe(true);
    expect(res.recommendations.length).toBeGreaterThan(0);
    res.recommendations.forEach((item) => {
      expect(item.category.toLowerCase()).toContain('hair');
    });
  });

  it('filters recommendations by Beard category', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          source: 'gemini-ai',
          recommendations: [
            {
              id: 'rec-2',
              title: 'Beard Sculpting & Charcoal Spa',
              category: 'Beard',
              suggestedSalon: 'GlowSlot At-Home Pro',
              pricePaise: 11900,
              durationMin: 30,
              reason: 'Pairs well with sharp haircuts.',
              tag: 'POPULAR COMBO',
            },
          ],
        }),
      })
    );

    const res = await recommendationService.getRecommendations({
      userName: 'Aarav Sharma',
      categoryFilter: 'Beard',
    });

    expect(res.success).toBe(true);
    expect(res.recommendations.length).toBeGreaterThan(0);
    res.recommendations.forEach((item) => {
      expect(item.category.toLowerCase()).toContain('beard');
    });
  });

  it('handles server network failure gracefully by returning client heuristic recommendations', async () => {
    // Mock global fetch to simulate offline/failure
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const res = await recommendationService.getRecommendations({
      userName: 'Aarav Sharma',
      categoryFilter: 'Skin',
    });

    expect(res.success).toBe(true);
    expect(res.source).toBe('smart-engine');
    expect(res.recommendations.length).toBeGreaterThan(0);
    expect(res.recommendations[0].category.toLowerCase()).toBe('skin');
  });
});
