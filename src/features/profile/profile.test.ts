import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useUIStore } from '../../store/useUIStore';
import { useSessionStore } from '../../store/useSessionStore';
import { supabase } from '../../lib/supabase';

describe('Profile, Favorites & Settings (Phase 4C & 5B)', () => {
  beforeEach(() => {
    useFavoritesStore.getState().clearFavorites();
    vi.restoreAllMocks();
  });

  it('toggles salon favorites correctly', () => {
    expect(useFavoritesStore.getState().isFavorite('sal-1')).toBe(false);

    // Add to favorites
    const added = useFavoritesStore.getState().toggleFavorite('sal-1');
    expect(added).toBe(true);
    expect(useFavoritesStore.getState().isFavorite('sal-1')).toBe(true);
    expect(useFavoritesStore.getState().getFavoriteSalons().length).toBe(1);

    // Remove from favorites
    const removed = useFavoritesStore.getState().toggleFavorite('sal-1');
    expect(removed).toBe(false);
    expect(useFavoritesStore.getState().isFavorite('sal-1')).toBe(false);
  });

  it('switches languages and persists in UI store', () => {
    useUIStore.getState().setLanguage('hi');
    expect(useUIStore.getState().language).toBe('hi');

    useUIStore.getState().setLanguage('en');
    expect(useUIStore.getState().language).toBe('en');
  });

  it('toggles theme between dark and light', () => {
    const initialTheme = useUIStore.getState().theme;
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).not.toBe(initialTheme);
  });

  it('clears session upon logout', async () => {
    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
      data: {
        user: { id: '00000000-0000-0000-0000-000000000003', email: 'test@glowslot.com' } as any,
        session: { access_token: 'fake-token' } as any,
      },
      error: null,
    });

    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    } as any);

    await useSessionStore
      .getState()
      .signUpWithEmail('test@glowslot.com', 'password123', 'Test User', 'male');
    expect(useSessionStore.getState().user).not.toBeNull();

    await useSessionStore.getState().logout();
    expect(useSessionStore.getState().user).toBeNull();
    expect(useSessionStore.getState().isGuest).toBe(false);
  });
});
