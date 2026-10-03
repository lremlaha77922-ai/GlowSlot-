import { create } from 'zustand';
import { UserSession, Gender } from '../types';

interface SessionState {
  user: UserSession | null;
  isGuest: boolean;
  hasSeenOnboarding: boolean;
  pendingPhone: string;
  returnTarget: string | null;
  setPendingPhone: (phone: string) => void;
  setReturnTarget: (target: string | null) => void;
  markOnboardingSeen: () => void;
  continueAsGuest: () => void;
  verifyOtp: (code: string) => { success: boolean; isNewUser: boolean };
  setProfile: (name: string, gender: Gender) => void;
  updatePoints: (points: number) => void;
  logout: () => void;
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

  verifyOtp: (code: string) => {
    if (code !== '123456') {
      return { success: false, isNewUser: false };
    }

    const phone = get().pendingPhone || '+91 98765 43210';
    // If phone ends in 00, treat as existing user, otherwise new user
    const isNewUser = !phone.endsWith('00');

    const newUser: UserSession = {
      id: `usr_${Date.now()}`,
      name: isNewUser ? '' : 'Aarav Sharma',
      phone,
      points: 120,
      isNewUser,
    };

    safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    safeStorage.removeItem(STORAGE_KEY_GUEST);

    set({
      user: newUser,
      isGuest: false,
      hasSeenOnboarding: true,
    });

    return { success: true, isNewUser };
  },

  setProfile: (name: string, gender: Gender) => {
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
  },

  updatePoints: (points: number) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, points };
    safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    set({ user: updated });
  },

  logout: () => {
    safeStorage.removeItem(STORAGE_KEY_USER);
    safeStorage.removeItem(STORAGE_KEY_GUEST);
    set({ user: null, isGuest: false });
  },
}));
