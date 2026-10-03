import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from '../../store/useSessionStore';

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

describe('Auth & Session Store (03_APPFLOW.md Flow A)', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.getState().logout();
  });

  it('rejects invalid OTP code', () => {
    useSessionStore.getState().setPendingPhone('+91 98765 43210');
    const result = useSessionStore.getState().verifyOtp('000000');
    expect(result.success).toBe(false);
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('verifies valid mock OTP code 123456 and creates user session', () => {
    useSessionStore.getState().setPendingPhone('+91 98765 43210');
    const result = useSessionStore.getState().verifyOtp('123456');
    expect(result.success).toBe(true);
    expect(useSessionStore.getState().user).not.toBeNull();
    expect(useSessionStore.getState().user?.phone).toBe('+91 98765 43210');
    expect(useSessionStore.getState().isGuest).toBe(false);
  });

  it('updates user profile with name and gender', () => {
    useSessionStore.getState().setPendingPhone('+91 98765 43210');
    useSessionStore.getState().verifyOtp('123456');
    useSessionStore.getState().setProfile('Priya Sharma', 'female');

    expect(useSessionStore.getState().user?.name).toBe('Priya Sharma');
    expect(useSessionStore.getState().user?.gender).toBe('female');
    expect(useSessionStore.getState().user?.isNewUser).toBe(false);
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
