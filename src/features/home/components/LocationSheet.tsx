import React from 'react';
import { Sheet } from '../../../components/Sheet';
import { useUIStore } from '../../../store/useUIStore';
import { mockAreas } from '../../../data/mockData';
import { MapPin, Check } from 'lucide-react';

interface LocationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSheet: React.FC<LocationSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedLocation, setSelectedLocation, showToast } = useUIStore();

  const handleSelect = (area: string) => {
    setSelectedLocation(area);
    showToast(`Location set to ${area}`);
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Select Your Location">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted mb-2">
          Choose your neighborhood to see available nearby salons and real-time slot pricing.
        </p>
        <div className="divide-y divide-border/60">
          {mockAreas.map((area) => {
            const isSelected = selectedLocation === area;
            return (
              <button
                key={area}
                onClick={() => handleSelect(area)}
                className={`w-full py-3 px-3 rounded-button flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-text hover:bg-primary-soft/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-muted/15 text-muted'
                    }`}
                  >
                    <MapPin size={16} />
                  </div>
                  <span className="text-sm">{area}</span>
                </div>
                {isSelected && <Check size={18} className="text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
};
