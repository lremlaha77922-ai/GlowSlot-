import React from 'react';
import { useUIStore } from '../store/useUIStore';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto max-w-sm w-full bg-text text-bg rounded-button px-4 py-3 shadow-level-2 flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="status"
        >
          <span className="flex-1">{toast.message}</span>
          {toast.actionLabel && (
            <button
              onClick={() => {
                toast.onAction?.();
                dismissToast(toast.id);
              }}
              className="text-primary-soft hover:underline font-bold shrink-0 cursor-pointer"
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
