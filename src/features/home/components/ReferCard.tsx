import React from 'react';
import { Gift, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';

export const ReferCard: React.FC = () => {
  const { showToast } = useUIStore();

  const handleShare = () => {
    showToast('Referral program unlocks in Phase 4C.');
  };

  return (
    <section className="px-4 pt-3 pb-6">
      <div className="bg-gradient-to-r from-primary-soft to-surface border border-primary/30 rounded-card p-4 shadow-level-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Gift size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text">Invite Friends, Earn 200 Pts</h4>
            <p className="text-[11px] text-muted">
              Get reward credits after their first completed booking.
            </p>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="shrink-0 p-2 rounded-button bg-primary text-white hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Refer a friend"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};
