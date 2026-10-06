import React, { useState } from 'react';
import { useSessionStore } from '../../../store/useSessionStore';
import { formatMoney } from '../../../utils/money';
import {
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Gift,
  QrCode,
  Info,
  Zap,
} from 'lucide-react';

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  discountPercent: number;
  perk: string;
  badgeColor: string;
  activeColor: string;
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Glow',
    minPoints: 0,
    discountPercent: 5,
    perk: '5% off on off-peak slots',
    badgeColor: 'text-amber-800 bg-amber-100/80 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    activeColor: 'from-amber-600 to-amber-700',
  },
  {
    id: 'silver',
    name: 'Silver Glow',
    minPoints: 200,
    discountPercent: 10,
    perk: '10% off salon bookings + Priority 10-min slot hold',
    badgeColor: 'text-slate-800 bg-slate-200/80 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    activeColor: 'from-slate-600 to-slate-700',
  },
  {
    id: 'gold',
    name: 'Gold VIP',
    minPoints: 500,
    discountPercent: 15,
    perk: '15% off all services + Free scalp & hair consultation',
    badgeColor: 'text-yellow-900 bg-yellow-100 border-yellow-400 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-700',
    activeColor: 'from-amber-500 via-yellow-500 to-amber-600',
  },
  {
    id: 'platinum',
    name: 'Platinum Elite',
    minPoints: 1000,
    discountPercent: 20,
    perk: '20% VIP bill deduction + Dedicated master stylist priority',
    badgeColor: 'text-purple-900 bg-purple-100 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    activeColor: 'from-purple-600 via-pink-600 to-primary',
  },
];

interface LoyaltyPointsTrackerProps {
  customPoints?: number;
  onPayQR?: () => void;
  onReferClick?: () => void;
  showTiersBreakdown?: boolean;
}

export const LoyaltyPointsTracker: React.FC<LoyaltyPointsTrackerProps> = ({
  customPoints,
  onPayQR,
  onReferClick,
  showTiersBreakdown = true,
}) => {
  const { user } = useSessionStore();
  const [showPerksModal, setShowPerksModal] = useState(false);

  const currentPoints = customPoints !== undefined ? customPoints : (user?.points ?? 0);
  const rupeeValuePaise = currentPoints * 100;

  // Determine current tier and next tier
  let currentTierIndex = 0;
  for (let i = LOYALTY_TIERS.length - 1; i >= 0; i--) {
    if (currentPoints >= LOYALTY_TIERS[i].minPoints) {
      currentTierIndex = i;
      break;
    }
  }

  const currentTier = LOYALTY_TIERS[currentTierIndex];
  const isMaxTier = currentTierIndex === LOYALTY_TIERS.length - 1;
  const nextTier = isMaxTier ? null : LOYALTY_TIERS[currentTierIndex + 1];

  // Calculate progress percentage
  let progressPercent = 100;
  let pointsNeeded = 0;

  if (nextTier) {
    const tierRange = nextTier.minPoints - currentTier.minPoints;
    const pointsInTier = currentPoints - currentTier.minPoints;
    progressPercent = Math.min(100, Math.max(0, Math.round((pointsInTier / tierRange) * 100)));
    pointsNeeded = Math.max(0, nextTier.minPoints - currentPoints);
  }

  return (
    <div className="bg-surface rounded-card border border-border p-4 sm:p-5 shadow-xs flex flex-col gap-4 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />

      {/* Header: Points Balance & Current Tier Badge */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
            <Sparkles size={13} className="text-deal" />
            <span>Salon Points Balance</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight tabular-nums text-text">
              {currentPoints}
            </span>
            <span className="text-xs font-bold text-primary">Points</span>
            <span className="text-[11px] text-muted">
              ({formatMoney(rupeeValuePaise)} value)
            </span>
          </div>
        </div>

        {/* Current Active Tier Badge */}
        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-chip text-[11px] font-black uppercase tracking-wider border shadow-2xs ${currentTier.badgeColor}`}
          >
            <Award size={12} />
            <span>{currentTier.name}</span>
          </span>
          <span className="text-[10px] text-deal font-extrabold">
            {currentTier.discountPercent}% Discount Tier
          </span>
        </div>
      </div>

      {/* Progress Bar To Next Discount Tier */}
      <div className="bg-bg/60 p-3.5 rounded-card border border-border/70 flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-primary shrink-0" />
            <span className="font-bold text-text">
              {isMaxTier ? (
                'Top Tier Unlocked!'
              ) : (
                <>
                  Next: <span className="text-primary font-black">{nextTier?.name}</span> ({nextTier?.discountPercent}% Off)
                </>
              )}
            </span>
          </div>

          {!isMaxTier && (
            <span className="font-mono text-[11px] font-extrabold text-muted tabular-nums">
              {progressPercent}%
            </span>
          )}
        </div>

        {/* Visual Progress Bar Track */}
        <div className="w-full h-3 rounded-full bg-border/60 overflow-hidden relative shadow-inner p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out shadow-xs`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Points Needed or Max Tier message */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          {isMaxTier ? (
            <span className="text-deal font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Maximum 20% discount &amp; Elite status active!
            </span>
          ) : (
            <>
              <span className="text-muted font-medium">
                Earn <strong className="text-text font-black">{pointsNeeded} more pts</strong> to reach {nextTier?.discountPercent}% discount
              </span>
              <span className="font-mono font-bold text-primary tabular-nums text-[10px]">
                {currentPoints} / {nextTier?.minPoints} pts
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tiers Breakdown Milestones */}
      {showTiersBreakdown && (
        <div className="flex flex-col gap-2 pt-1 border-t border-border/60 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1">
              <Zap size={11} className="text-deal" /> Loyalty Discount Tiers
            </span>
            <button
              onClick={() => setShowPerksModal(!showPerksModal)}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Info size={11} />
              <span>{showPerksModal ? 'Hide Perks' : 'View Tier Perks'}</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            {LOYALTY_TIERS.map((tier, idx) => {
              const isPassed = currentPoints >= tier.minPoints;
              const isCurrent = currentTier.id === tier.id;

              return (
                <div
                  key={tier.id}
                  className={`p-2 rounded-button border text-xs flex flex-col items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-primary-soft/60 border-primary ring-1 ring-primary/40 shadow-xs'
                      : isPassed
                      ? 'bg-surface border-border text-muted'
                      : 'bg-muted/10 border-border/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-0.5 mb-1">
                    {isPassed ? (
                      <CheckCircle2 size={11} className="text-success" />
                    ) : (
                      <Lock size={10} className="text-muted" />
                    )}
                    <span className="text-[9px] font-bold truncate max-w-[54px]">{tier.name.split(' ')[0]}</span>
                  </div>

                  <span className="text-xs font-black text-text block tabular-nums">
                    {tier.discountPercent}%
                  </span>

                  <span className="text-[9px] font-mono text-muted block mt-0.5">
                    {tier.minPoints} pts
                  </span>
                </div>
              );
            })}
          </div>

          {/* Expandable Perks Description */}
          {showPerksModal && (
            <div className="mt-2 p-3 rounded-card bg-bg border border-border flex flex-col gap-2 text-xs animate-in fade-in duration-200">
              <span className="font-bold text-[11px] text-text uppercase tracking-wider">
                Benefits at each tier:
              </span>
              <div className="flex flex-col gap-1.5">
                {LOYALTY_TIERS.map((t) => (
                  <div key={t.id} className="flex items-start gap-2 text-[11px]">
                    <span
                      className={`px-1.5 py-0.5 rounded-chip text-[9px] font-black shrink-0 ${
                        currentTier.id === t.id
                          ? 'bg-primary text-white'
                          : 'bg-muted/20 text-muted'
                      }`}
                    >
                      {t.name} ({t.discountPercent}%)
                    </span>
                    <span className="text-muted leading-tight">{t.perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions to Earn Points */}
      {(onPayQR || onReferClick) && (
        <div className="grid grid-cols-2 gap-2 pt-1 relative z-10">
          {onPayQR && (
            <button
              onClick={onPayQR}
              className="p-2.5 rounded-button bg-primary-soft text-primary border border-primary/20 text-xs font-bold hover:bg-primary-soft/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <QrCode size={14} />
              <span>Scan QR for 10% Back</span>
            </button>
          )}

          {onReferClick && (
            <button
              onClick={onReferClick}
              className="p-2.5 rounded-button bg-surface border border-border text-text hover:bg-muted/10 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Gift size={14} className="text-teal-600 dark:text-teal-400" />
              <span>Refer (+100 pts)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
