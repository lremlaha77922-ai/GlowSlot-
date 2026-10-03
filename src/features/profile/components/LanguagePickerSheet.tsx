import React from 'react';
import { Sheet } from '../../../components/Sheet';
import { useUIStore } from '../../../store/useUIStore';
import { Check } from 'lucide-react';

interface LanguagePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguagePickerSheet: React.FC<LanguagePickerSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, setLanguage, showToast } = useUIStore();

  const options = [
    { code: 'en' as const, label: 'English', sub: 'English (Default)' },
    { code: 'hi' as const, label: 'हिन्दी', sub: 'Hindi' },
  ];

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Choose Language (O07)">
      <div className="flex flex-col gap-2 pb-4">
        {options.map((opt) => {
          const isSelected = language === opt.code;
          return (
            <div
              key={opt.code}
              onClick={() => {
                setLanguage(opt.code);
                showToast(`Language updated to ${opt.label}`);
                onClose();
              }}
              className={`p-3.5 rounded-button border flex items-center justify-between cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-primary-soft border-primary text-primary font-bold'
                  : 'bg-surface border-border text-text hover:bg-primary-soft/30'
              }`}
            >
              <div>
                <span className="text-sm block">{opt.label}</span>
                <span className="text-[11px] text-muted">{opt.sub}</span>
              </div>
              {isSelected && <Check size={18} className="text-primary" />}
            </div>
          );
        })}
      </div>
    </Sheet>
  );
};
