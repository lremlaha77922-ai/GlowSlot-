import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionStore } from '../../store/useSessionStore';
import { supabase } from '../../lib/supabase';

// In-memory mock for tests
const storageMock: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => storageMock[key] || null,
  setItem: (key: string, value: string) => {
    storageMock[key] = value;
  },
  removeItem: (key: string) => {
    delete storageMock[key];
  },
  clear: () => {
    Object.keys(storageMock).forEach((k) => delete storageMock[k]);
  },
  key: () => null,
  length: 0,
};

describe('Auth & Session Store (Email + Password Auth)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await useSessionStore.getState().logout();
    vi.restoreAllMocks();
  });

  it('signs up a new user with email, password, full name, and gender', async () => {
    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
      data: {
        user: { id: '00000000-0000-0000-0000-000000000001', email: 'aarav@glowslot.com' } as any,
        session: { access_token: 'fake-token' } as any,
      },
      error: null,
    });

    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    } as any);

    const res = await useSessionStore
      .getState()
      .signUpWithEmail('aarav@glowslot.com', 'secret123', 'Aarav Sharma', 'male');

    expect(res.success).toBe(true);
    expect(useSessionStore.getState().user).not.toBeNull();
    expect(useSessionStore.getState().user?.email).toBe('aarav@glowslot.com');
    expect(useSessionStore.getState().user?.name).toBe('Aarav Sharma');
    expect(useSessionStore.getState().isGuest).toBe(false);
  });

  it('signs in an existing user with email and password', async () => {
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: {
        user: { id: '00000000-0000-0000-0000-000000000001', email: 'aarav@glowslot.com' } as any,
        session: { access_token: 'fake-token' } as any,
      },
      error: null,
    });

    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: '00000000-0000-0000-0000-000000000001', full_name: 'Aarav Sharma', gender: 'male', points: 120 },
        error: null,
      }),
    } as any);

    const res = await useSessionStore
      .getState()
      .loginWithEmail('aarav@glowslot.com', 'secret123');

    expect(res.success).toBe(true);
    expect(useSessionStore.getState().user).not.toBeNull();
    expect(useSessionStore.getState().user?.email).toBe('aarav@glowslot.com');
    expect(useSessionStore.getState().isGuest).toBe(false);
  });

  it('requests password reset email for registered email', async () => {
    vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockResolvedValueOnce({
      data: {} as any,
      error: null,
    });

    const res = await useSessionStore.getState().resetPassword('aarav@glowslot.com');
    expect(res.success).toBe(true);
  });

  it('updates user profile with name and gender', async () => {
    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
      data: {
        user: { id: '00000000-0000-0000-0000-000000000002', email: 'priya@glowslot.com' } as any,
        session: { access_token: 'fake-token' } as any,
      },
      error: null,
    });

    vi.spyOn(supabase, 'from').mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    } as any);

    await useSessionStore
      .getState()
      .signUpWithEmail('priya@glowslot.com', 'secret123', 'Priya', 'female');

    await useSessionStore.getState().setProfile('Priya Sharma', 'female');

    expect(useSessionStore.getState().user?.name).toBe('Priya Sharma');
    expect(useSessionStore.getState().user?.gender).toBe('female');
  });

  it('sets guest mode correctly', () => {
    useSessionStore.getState().continueAsGuest();
    expect(useSessionStore.getState().isGuest).toBe(true);
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('marks onboarding as seen', () => {
    useSessionStore.getState().markOnboardingSeen();
    expect(useSessionStore.getState().hasSeenOnboarding).toBe(true);
  });
});
