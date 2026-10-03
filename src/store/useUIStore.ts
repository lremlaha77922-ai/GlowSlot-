import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

interface UIState {
  theme: 'light' | 'dark';
  language: 'en' | 'hi';
  selectedLocation: string;
  isLocationSheetOpen: boolean;
  toasts: ToastMessage[];
  activeTab: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  setSelectedLocation: (loc: string) => void;
  setIsLocationSheetOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  showToast: (message: string, options?: Partial<Omit<ToastMessage, 'id' | 'message'>>) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  language: 'en',
  selectedLocation: 'Koramangala, Bengaluru',
  isLocationSheetOpen: false,
  toasts: [],
  activeTab: 'home',

  setTheme: (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    set({ theme });
  },

  setLanguage: (language) => set({ language }),

  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),

  setIsLocationSheetOpen: (isLocationSheetOpen) => set({ isLocationSheetOpen }),

  setActiveTab: (activeTab) => set({ activeTab }),

  showToast: (message, options) => {
    const id = `toast-${Date.now()}`;
    const newToast: ToastMessage = {
      id,
      message,
      type: options?.type || 'info',
      actionLabel: options?.actionLabel,
      onAction: options?.onAction,
    };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
