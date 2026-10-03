import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Dim Scrim 40% */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content: Top radius 24 */}
      <div
        className="relative z-10 w-full max-w-lg mx-auto bg-surface rounded-t-[24px] border-t border-border shadow-level-2 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250 ease-out"
        role="dialog"
        aria-modal="true"
      >
        {/* Drag handle 36x4 */}
        <div className="w-full flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        {title && (
          <div className="px-5 pb-3 flex items-center justify-between border-b border-border">
            <h2 className="text-base font-bold text-text">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-muted hover:text-text hover:bg-primary-soft transition-colors cursor-pointer"
              aria-label="Close sheet"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
