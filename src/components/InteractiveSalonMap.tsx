import React, { useState } from 'react';
import { Salon } from '../types';
import { formatMoney } from '../utils/money';
import { Star, MapPin, Navigation, Compass, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Button } from './Button';

interface InteractiveSalonMapProps {
  salons: Salon[];
  selectedSalonId?: string;
  onSelectSalon: (salonId: string) => void;
  onBookNow: (salon: Salon) => void;
  className?: string;
}

export const InteractiveSalonMap: React.FC<InteractiveSalonMapProps> = ({
  salons,
  selectedSalonId,
  onSelectSalon,
  onBookNow,
  className = '',
}) => {
  const [activeMarker, setActiveMarker] = useState<Salon | null>(
    salons.find((s) => s.id === selectedSalonId) || salons[0] || null
  );

  return (
    <div className={`relative w-full h-[380px] bg-surface rounded-card border border-border overflow-hidden shadow-level-1 flex flex-col ${className}`}>
      {/* Simulated Map Header */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-surface/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-chip shadow-xs pointer-events-auto flex items-center gap-1.5 text-xs font-bold text-text">
          <Compass size={14} className="text-primary animate-spin" style={{ animationDuration: '10s' }} />
          <span>Live Bengaluru Salon Radar (Interactive Map)</span>
        </div>
        <div className="bg-surface/90 backdrop-blur-md border border-border px-2.5 py-1.5 rounded-chip shadow-xs pointer-events-auto text-[11px] font-medium text-muted">
          {salons.length} Salons Nearby
        </div>
      </div>

      {/* Interactive Map Canvas / Grid Background */}
      <div className="relative flex-1 bg-gradient-to-br from-indigo-950/20 via-pink-950/10 to-surface overflow-hidden flex items-center justify-center">
        {/* Radar concentric circles */}
        <div className="absolute w-[300px] h-[300px] rounded-full border border-primary/20 animate-ping opacity-25" style={{ animationDuration: '4s' }} />
        <div className="absolute w-[200px] h-[200px] rounded-full border border-primary/30" />
        <div className="absolute w-[100px] h-[100px] rounded-full border border-primary/40" />
        <div className="absolute w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />

        {/* Salon Markers Positioned on Grid */}
        {salons.map((salon, index) => {
          // Compute pseudo-coordinates for display on map canvas
          const angle = (index / salons.length) * 2 * Math.PI;
          const radius = Math.min(130, 45 + (salon.distanceKm || 1) * 35);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isSelected = activeMarker?.id === salon.id;

          return (
            <button
              key={salon.id}
              onClick={() => setActiveMarker(salon)}
              className={`absolute z-10 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-md ${
                isSelected
                  ? 'bg-primary text-white scale-125 ring-4 ring-primary/30 z-30'
                  : 'bg-surface text-primary border border-primary/40 hover:scale-110'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              title={salon.name}
            >
              <MapPin size={16} className={isSelected ? 'fill-white text-primary' : 'text-primary'} />
              <span className="absolute -bottom-5 bg-surface/90 backdrop-blur-xs text-[10px] font-bold text-text px-1.5 py-0.5 rounded-chip border border-border whitespace-nowrap shadow-xs">
                {salon.distanceKm} km
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Marker Floating Preview Card */}
      {activeMarker && (
        <div className="absolute bottom-3 left-3 right-3 z-30 bg-surface/95 backdrop-blur-md rounded-card border border-border p-3 shadow-level-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <img
            src={activeMarker.images[0]}
            alt={activeMarker.name}
            className="w-16 h-16 rounded-button object-cover shrink-0 bg-muted/20"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h4 className="text-xs font-bold text-text truncate">{activeMarker.name}</h4>
              <CheckCircle2 size={13} className="text-primary shrink-0" />
            </div>
            <p className="text-[11px] text-muted truncate">{activeMarker.area} • {activeMarker.distanceKm} km away</p>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="flex items-center gap-0.5 font-bold text-text">
                <Star size={11} className="fill-deal text-deal" /> {activeMarker.rating}
              </span>
              <span className="text-primary font-extrabold tabular-nums">
                {formatMoney(activeMarker.startingPrice)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              onClick={() => onSelectSalon(activeMarker.id)}
              className="px-2.5 py-1.5 rounded-button border border-border bg-surface hover:bg-primary-soft text-text text-[11px] font-bold transition-colors cursor-pointer"
            >
              View
            </button>
            <button
              onClick={() => onBookNow(activeMarker)}
              className="px-2.5 py-1.5 rounded-button bg-primary hover:bg-primary-hover text-white text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
            >
              Book
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
