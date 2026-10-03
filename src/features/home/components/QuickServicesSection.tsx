import React from 'react';
import { QuickService } from '../../../types';
import { AddStepper } from '../../../components/AddStepper';
import { formatMoney } from '../../../utils/money';
import { useCartStore } from '../../../store/useCartStore';
import { useUIStore } from '../../../store/useUIStore';
import { Clock, Scissors, Sparkles, HeartHandshake, Smile } from 'lucide-react';

interface QuickServicesSectionProps {
  services: QuickService[];
}

export const QuickServicesSection: React.FC<QuickServicesSectionProps> = ({
  services,
}) => {
  const { addItem, updateQty, getItemQty } = useCartStore();
  const { showToast } = useUIStore();

  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hair':
        return <Scissors size={24} className="text-primary" />;
      case 'beard':
        return <Sparkles size={24} className="text-accent" />;
      case 'relaxation':
        return <HeartHandshake size={24} className="text-deal" />;
      default:
        return <Smile size={24} className="text-success" />;
    }
  };

  const handleAdd = (service: QuickService) => {
    addItem(service);
    showToast(`Added ${service.name} to cart`);
  };

  return (
    <section className="pt-4 pb-2" aria-labelledby="quick-services-heading">
      <div className="px-4 flex items-center justify-between mb-3">
        <div>
          <h2 id="quick-services-heading" className="text-base font-bold text-text">
            Quick Services
          </h2>
          <p className="text-xs text-muted">Express 30-minute grooming slots</p>
        </div>
        <span className="text-[11px] font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-chip">
          30 MIN
        </span>
      </div>

      {/* Horizontal scroll container with 140px wide cards per Design.md 8.3 */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar scroll-smooth">
        {services.map((service) => {
          const qty = getItemQty(service.id);

          return (
            <div
              key={service.id}
              className="w-[140px] shrink-0 bg-surface rounded-card border border-border/80 shadow-level-1 p-3 flex flex-col justify-between hover:border-primary/40 transition-all"
            >
              {/* Service Icon / Placeholder Image with soft gradient */}
              <div className="w-full h-20 rounded-button bg-gradient-to-br from-primary-soft/80 to-surface border border-border/50 flex flex-col items-center justify-center mb-2.5">
                {getServiceIcon(service.category)}
              </div>

              {/* Service Details */}
              <div className="mb-3">
                <h3 className="text-xs font-bold text-text truncate line-clamp-1" title={service.name}>
                  {service.name}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                  <Clock size={11} />
                  <span>{service.durationMin}m</span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-sm font-bold text-text tabular-nums">
                    {formatMoney(service.price)}
                  </span>
                  {service.originalPrice && service.originalPrice > service.price && (
                    <span className="text-[10px] text-muted line-through tabular-nums">
                      {formatMoney(service.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Morphing ADD button per Design.md section 6 */}
              <AddStepper
                qty={qty}
                onAdd={() => handleAdd(service)}
                onIncrement={() => updateQty(service.id, 1)}
                onDecrement={() => updateQty(service.id, -1)}
                className="w-full"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
