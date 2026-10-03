import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Scissors, HeartHandshake, Smile, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../../components/Button';
import { formatMoney } from '../../../utils/money';
import { useCartStore } from '../../../store/useCartStore';
import { useUIStore } from '../../../store/useUIStore';

interface AtHomeScreenProps {
  onBookService: (service: { id: string; name: string; durationMin: number; basePrice: number }) => void;
}

export const AtHomeScreen: React.FC<AtHomeScreenProps> = ({ onBookService }) => {
  const [gender, setGender] = useState<'men' | 'women'>('men');
  const { showToast } = useUIStore();

  const categories = [
    { id: 'c1', title: 'Haircut & Styling', desc: 'Wash, precision cut & blowdry', icon: Scissors, count: '6 Services' },
    { id: 'c2', title: 'Beard & Grooming', desc: 'Hot towel shave, trims & shape', icon: Sparkles, count: '4 Services' },
    { id: 'c3', title: 'Skin & Facials', desc: 'Detox, cleanup & glow masks', icon: Smile, count: '5 Services' },
    { id: 'c4', title: 'Spa & Relaxation', desc: 'Head, neck & back warm oil massages', icon: HeartHandshake, count: '3 Services' },
  ];

  const packages = [
    {
      id: 'athome-pkg-1',
      name: 'Men Complete Home Refresh',
      durationMin: 60,
      price: 49900,
      originalPrice: 75000,
      inclusions: ['Precision Haircut', 'Beard Styling / Clean Shave', '15min Scalp Massage', 'Post-Service Cleanup'],
    },
    {
      id: 'athome-pkg-2',
      name: 'Detox Glow & Cut Duo',
      durationMin: 75,
      price: 64900,
      originalPrice: 90000,
      inclusions: ['Haircut & Wash', 'Charcoal Detan Facial', 'Eyebrow Shaping', 'Complimentary Serum'],
    },
    {
      id: 'athome-pkg-3',
      name: 'Stress Relief Massage Combo',
      durationMin: 50,
      price: 44900,
      originalPrice: 60000,
      inclusions: ['30min Head Massage', '20min Neck & Shoulder Massage', 'Herbal Warm Oils'],
    },
  ];

  const hygieneFeatures = [
    '100% Single-use kits',
    'Sanitized equipment',
    'Post-service cleanup',
    'Certified stylists',
  ];

  return (
    <div className="flex-1 pb-24 bg-bg text-text">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 h-14 flex items-center justify-between">
        <h1 className="text-base font-bold text-text">At-Home Grooming</h1>

        {/* Gender Toggle per Design.md 8.7 */}
        <div className="h-8 p-0.5 rounded-button bg-muted/15 border border-border flex items-center">
          {(['men', 'women'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`h-full px-3 rounded-[10px] text-xs font-semibold capitalize transition-all cursor-pointer ${
                gender === g
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Banner per Design.md 8.7 */}
      <section className="px-4 pt-3 pb-2">
        <div className="w-full aspect-[16/7] rounded-card bg-gradient-to-r from-teal-700 to-indigo-900 text-white p-4 sm:p-5 flex flex-col justify-between shadow-level-1 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-chip bg-white/20 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider mb-1">
              <ShieldCheck size={11} className="text-teal-300" />
              Verified & Safe
            </span>
            <h2 className="text-base sm:text-lg font-bold leading-tight max-w-[80%]">
              Salon Comfort Delivered to Your Living Room
            </h2>
          </div>
          <p className="text-xs text-white/90">
            Professional stylists bring sanitized kits, zero mess guaranteed.
          </p>
        </div>
      </section>

      {/* Hygiene Badges Row per Design.md 8.7 */}
      <section className="px-4 py-2">
        <div className="bg-surface rounded-card border border-border p-3 shadow-xs">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {hygieneFeatures.map((feat) => (
              <div key={feat} className="flex items-center gap-1.5 text-text font-medium">
                <CheckCircle size={13} className="text-success shrink-0" />
                <span className="text-[11px] truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2x2 Categories Grid per Design.md 8.7 */}
      <section className="px-4 pt-3 pb-2">
        <h2 className="text-xs font-bold text-text uppercase tracking-wider mb-2.5">
          Browse by Service
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() =>
                  onBookService({
                    id: `athome-${cat.id}`,
                    name: `${gender === 'men' ? 'Men' : 'Women'} ${cat.title}`,
                    durationMin: 45,
                    basePrice: 34900,
                  })
                }
                className="bg-surface rounded-card border border-border/80 shadow-level-1 p-3.5 flex flex-col justify-between hover:border-primary/40 cursor-pointer transition-all"
              >
                <div className="w-10 h-10 rounded-button bg-primary-soft text-primary flex items-center justify-center mb-2">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text">{cat.title}</h3>
                  <p className="text-[10px] text-muted line-clamp-1 mt-0.5">{cat.desc}</p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-primary">
                  {cat.count}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Packages Section per Design.md 8.7 */}
      <section className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-text uppercase tracking-wider">
            Popular Home Combos
          </h2>
          <span className="text-[10px] font-bold text-deal bg-deal/10 px-2 py-0.5 rounded-chip">
            SAVE UP TO 35%
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-surface rounded-card border border-border/80 shadow-level-1 p-4 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-text">{pkg.name}</h3>
                  <span className="text-xs text-muted flex items-center gap-1 shrink-0">
                    <Clock size={11} /> {pkg.durationMin}m
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pkg.inclusions.map((inc) => (
                    <span
                      key={inc}
                      className="text-[10px] px-2 py-0.5 rounded-chip bg-muted/15 text-text font-medium"
                    >
                      • {inc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-border mt-1">
                <div>
                  <span className="text-[10px] text-muted block">Combo Price</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-primary tabular-nums">
                      {formatMoney(pkg.price)}
                    </span>
                    <span className="text-xs text-muted line-through tabular-nums">
                      {formatMoney(pkg.originalPrice)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    onBookService({
                      id: pkg.id,
                      name: pkg.name,
                      durationMin: pkg.durationMin,
                      basePrice: pkg.price,
                    })
                  }
                >
                  Book at Home
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
