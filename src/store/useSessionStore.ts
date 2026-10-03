import { create } from 'zustand';
import { UserSession, Gender } from '../types';
import { authService } from '../features/auth/services/authService';

interface SessionState {
  user: UserSession | null;
  isGuest: boolean;
  hasSeenOnboarding: boolean;
  pendingPhone: string;
  returnTarget: string | null;
  setUser: (user: UserSession | null) => void;
  setPendingPhone: (phone: string) => void;
  setReturnTarget: (target: string | null) => void;
  markOnboardingSeen: () => void;
  continueAsGuest: () => void;
  verifyOtp: (code: string) => Promise<{ success: boolean; isNewUser: boolean; error?: string }>;
  setProfile: (name: string, gender: Gender) => Promise<void>;
  updatePoints: (points: number) => void;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
}

const STORAGE_KEY_USER = 'glowslot_session_user';
const STORAGE_KEY_ONBOARDING = 'glowslot_onboarding_seen';
const STORAGE_KEY_GUEST = 'glowslot_is_guest';

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Ignore
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  },
};

const getInitialUser = (): UserSession | null => {
  try {
    const data = safeStorage.getItem(STORAGE_KEY_USER);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed reading user session:', e);
  }
  return null;
};

const getInitialOnboarding = (): boolean => {
  return safeStorage.getItem(STORAGE_KEY_ONBOARDING) === 'true';
};

const getInitialGuest = (): boolean => {
  return safeStorage.getItem(STORAGE_KEY_GUEST) === 'true';
};

export const useSessionStore = create<SessionState>((set, get) => ({
  user: getInitialUser(),
  isGuest: getInitialGuest(),
  hasSeenOnboarding: getInitialOnboarding(),
  pendingPhone: '',
  returnTarget: null,

  setUser: (user) => {
    if (user) {
      safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      safeStorage.removeItem(STORAGE_KEY_GUEST);
      set({ user, isGuest: false });
    } else {
      safeStorage.removeItem(STORAGE_KEY_USER);
      set({ user: null });
    }
  },

  setPendingPhone: (phone) => set({ pendingPhone: phone }),

  setReturnTarget: (returnTarget) => set({ returnTarget }),

  markOnboardingSeen: () => {
    safeStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');
    set({ hasSeenOnboarding: true });
  },

  continueAsGuest: () => {
    safeStorage.setItem(STORAGE_KEY_GUEST, 'true');
    set({ isGuest: true, user: null });
  },

  verifyOtp: async (code: string) => {
    const phone = get().pendingPhone || '+91 98765 43210';
    const result = await authService.verifyOtp(phone, code);

    if (!result.success || !result.session) {
      return {
        success: false,
        isNewUser: false,
        error: result.error || 'Invalid OTP code',
      };
    }

    const sessionUser = result.session;
    safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
    safeStorage.removeItem(STORAGE_KEY_GUEST);

    set({
      user: sessionUser,
      isGuest: false,
      hasSeenOnboarding: true,
    });

    return {
      success: true,
      isNewUser: !!result.isNewUser,
    };
  },

  setProfile: async (name: string, gender: Gender) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser: UserSession = {
      ...currentUser,
      name,
      gender,
      isNewUser: false,
    };

    safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    set({ user: updatedUser });

    // Sync with Supabase profiles table
    await authService.updateProfile(currentUser.id, {
      full_name: name,
      gender,
    });
  },

  updatePoints: (points: number) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, points };
    safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    set({ user: updated });
  },

  logout: async () => {
    await authService.signOut();
    safeStorage.removeItem(STORAGE_KEY_USER);
    safeStorage.removeItem(STORAGE_KEY_GUEST);
    set({ user: null, isGuest: false });
  },

  deleteAccount: async () => {
    const currentUser = get().user;
    if (currentUser) {
      await authService.deleteAccount(currentUser.id);
    }
    safeStorage.removeItem(STORAGE_KEY_USER);
    safeStorage.removeItem(STORAGE_KEY_GUEST);
    set({ user: null, isGuest: false });
    return true;
  },
}));
