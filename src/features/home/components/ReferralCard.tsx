import React from 'react';
import { Gift, ChevronRight, Sparkles } from 'lucide-react';

interface ReferralCardProps {
  onReferClick?: () => void;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ onReferClick }) => {
  return (
    <section className="px-4 py-2">
      <div
        onClick={onReferClick}
        className="w-full rounded-card bg-gradient-to-r from-teal-700 via-primary to-indigo-800 text-white p-4 shadow-level-1 flex items-center justify-between gap-3 cursor-pointer hover:opacity-95 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Gift size={22} className="text-deal" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold leading-tight">Refer a Friend, Get Rs.100</span>
              <Sparkles size={11} className="text-deal" />
            </div>
            <p className="text-[11px] text-white/80 leading-snug mt-0.5">
              Give Rs.100 discount, earn 100 points on their first visit.
            </p>
          </div>
        </div>

        <ChevronRight size={18} className="text-white/70 shrink-0" />
      </div>
    </section>
  );
};
