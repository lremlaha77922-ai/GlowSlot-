import { create } from 'zustand';
import { UserSession, Gender } from '../types';
import { authService } from '../features/auth/services/authService';

interface SessionState {
  user: UserSession | null;
  isGuest: boolean;
  hasSeenOnboarding: boolean;
  returnTarget: string | null;
  setUser: (user: UserSession | null) => void;
  setReturnTarget: (target: string | null) => void;
  markOnboardingSeen: () => void;
  continueAsGuest: () => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
    gender: Gender,
    referralCode?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
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

  setReturnTarget: (returnTarget) => set({ returnTarget }),

  markOnboardingSeen: () => {
    safeStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');
    set({ hasSeenOnboarding: true });
  },

  continueAsGuest: () => {
    safeStorage.setItem(STORAGE_KEY_GUEST, 'true');
    set({ isGuest: true, user: null });
  },

  loginWithEmail: async (email: string, password: string) => {
    const res = await authService.signInWithEmail(email, password);
    if (!res.success || !res.session) {
      return { success: false, error: res.error || 'Invalid email or password' };
    }

    const sessionUser = res.session;
    safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
    safeStorage.removeItem(STORAGE_KEY_GUEST);

    set({
      user: sessionUser,
      isGuest: false,
      hasSeenOnboarding: true,
    });

    return { success: true };
  },

  signUpWithEmail: async (email: string, password: string, name: string, gender: Gender, referralCode?: string) => {
    const res = await authService.signUpWithEmail(email, password, name, gender, referralCode);
    if (!res.success) {
      return { success: false, error: res.error || 'Registration failed' };
    }

    if (res.message) {
      return { success: true, message: res.message };
    }

    if (res.session) {
      const sessionUser = res.session;
      safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
      safeStorage.removeItem(STORAGE_KEY_GUEST);

      set({
        user: sessionUser,
        isGuest: false,
        hasSeenOnboarding: true,
      });
    }

    return { success: true };
  },

  resetPassword: async (email: string) => {
    return await authService.resetPassword(email);
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
