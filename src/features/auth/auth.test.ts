import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from '../../store/useSessionStore';
import { authService } from './services/authService';

// Simple in-memory mock for tests
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

describe('Auth & Session Store (Phase 5B Supabase Auth)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await useSessionStore.getState().logout();
  });

  it('rejects invalid OTP code', async () => {
    useSessionStore.getState().setPendingPhone('+91 98765 43210');
    const result = await useSessionStore.getState().verifyOtp('000000');
    expect(result.success).toBe(false);
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('verifies valid mock OTP code 123456 and creates user session', async () => {
    useSessionStore.getState().setPendingPhone('+91 98765 43210');
    const result = await useSessionStore.getState().verifyOtp('123456');
    expect(result.success).toBe(true);
    expect(useSessionStore.getState().user).not.toBeNull();
    expect(useSessionStore.getState().user?.phone).toBe('+91 98765 43210');
    expect(useSessionStore.getState().isGuest).toBe(false);
  });

  it('updates user profile with name and gender', async () => {
    useSessionStore.getState().setPendingPhone('+91 98765 43210');
    await useSessionStore.getState().verifyOtp('123456');
    await useSessionStore.getState().setProfile('Priya Sharma', 'female');

    expect(useSessionStore.getState().user?.name).toBe('Priya Sharma');
    expect(useSessionStore.getState().user?.gender).toBe('female');
    expect(useSessionStore.getState().user?.isNewUser).toBe(false);
  });

  it('supports email sign-in fallback for testing', async () => {
    const res = await authService.signInWithEmail('test@glowslot.com', 'password123');
    expect(res.success).toBe(true);
    expect(res.session?.email).toBe('test@glowslot.com');
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
