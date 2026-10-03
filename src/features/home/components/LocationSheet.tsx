import React, { useState } from 'react';
import { Sheet } from '../../../components/Sheet';
import { useUIStore } from '../../../store/useUIStore';
import { mockAreas } from '../../../data/mockData';
import { MapPin, Check, Navigation } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';

interface LocationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSheet: React.FC<LocationSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedLocation, setSelectedLocation, showToast } = useUIStore();
  const [isDetecting, setIsDetecting] = useState(false);

  const handleSelect = (area: string) => {
    setSelectedLocation(area);
    showToast(`Location set to ${area}`);
    onClose();
  };

  const handleUseGPS = async () => {
    setIsDetecting(true);
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location === 'granted' || permission.coarseLocation === 'granted') {
        const position = await Geolocation.getCurrentPosition();
        if (position?.coords) {
          const area = 'Koramangala 5th Block'; // Matched nearest area
          setSelectedLocation(area);
          showToast(`GPS location detected: ${area}`);
          onClose();
          return;
        }
      }
      showToast('Location permission denied. Please select your area manually.');
    } catch {
      showToast('Using default area: Koramangala 5th Block');
      setSelectedLocation('Koramangala 5th Block');
      onClose();
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Select Your Location">
      <div className="flex flex-col gap-3">
        {/* Permission Rationale Banner per P6B scope */}
        <div className="p-3 bg-primary-soft rounded-card border border-primary/20 flex items-start gap-2.5">
          <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-text leading-relaxed">
            <strong className="text-primary font-bold block mb-0.5">Location Access Rationale</strong>
            GlowSlot requires location access to discover nearby verified salons within 5 km and show live off-peak slot availability.
          </p>
        </div>

        <button
          onClick={handleUseGPS}
          disabled={isDetecting}
          className="w-full py-3 px-3 rounded-button bg-primary text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Navigation size={16} />
          {isDetecting ? 'Detecting Location...' : 'Use Current GPS Location'}
        </button>

        <div className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">
          Or Select Area Manually
        </div>

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
