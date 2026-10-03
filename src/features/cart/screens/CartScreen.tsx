import React from 'react';
import { useCartStore } from '../../../store/useCartStore';
import { useUIStore } from '../../../store/useUIStore';
import { formatMoney } from '../../../utils/money';
import { PLATFORM_FEE_PAISE, TAX_PERCENT } from '../../../utils/constants';
import { Button } from '../../../components/Button';
import { EmptyState } from '../../../components/EmptyState';
import {
  ArrowLeft,
  Trash2,
  Clock,
  ShieldCheck,
  ShoppingBag,
  Plus,
  Minus,
  Calendar,
  Sparkles,
  Package,
} from 'lucide-react';

interface CartScreenProps {
  onBack: () => void;
  onCheckout: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onBack, onCheckout }) => {
  const {
    items,
    updateQty,
    removeItem,
    clearCart,
    getSubtotalPaise,
    getTaxesPaise,
    getTotalPaise,
    getTotalCount,
    getPrimarySlot,
  } = useCartStore();
  const { showToast } = useUIStore();

  const subtotal = getSubtotalPaise();
  const taxes = getTaxesPaise();
  const total = getTotalPaise();
  const count = getTotalCount();
  const reservedSlot = getPrimarySlot();

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-bold text-text">Your Cart (S02)</h1>
          {count > 0 && (
            <span className="text-xs text-muted font-medium">({count} items)</span>
          )}
        </div>

        {count > 0 && (
          <button
            onClick={() => {
              clearCart();
              showToast('Cart cleared');
            }}
            className="text-xs font-semibold text-error hover:underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </header>

      {/* Cart Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {count === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={32} />}
            title="Your cart is empty"
            helperText="Looks like you haven't added any services or grooming products yet."
            actionLabel="Explore Services"
            onAction={onBack}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Slot summary card (if appointment slot is present) */}
            {reservedSlot && (
              <div className="bg-primary-soft border border-primary/30 rounded-card p-4 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wide">
                    <Calendar size={14} />
                    <span>Reserved Appointment Slot</span>
                  </div>
                  {reservedSlot.isFree && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-chip bg-success text-white">
                      Free Offer
                    </span>
                  )}
                  {reservedSlot.isPeak && !reservedSlot.isFree && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-chip bg-accent text-white">
                      Peak Slot
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between mt-1">
                  <div>
                    <h3 className="text-sm font-bold text-text">
                      {reservedSlot.salonName}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      Service: <span className="font-semibold text-text">{reservedSlot.serviceName}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-primary block">
                      {reservedSlot.time}
                    </span>
                    <span className="text-[11px] text-muted">
                      {reservedSlot.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted pt-2 border-t border-primary/15">
                  <Clock size={12} className="text-primary" />
                  <span>5-minute temporary hold active. Finalized at checkout.</span>
                </div>
              </div>
            )}

            {/* Cart Items List with Stepper */}
            <div className="bg-surface rounded-card border border-border shadow-level-1 overflow-hidden divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-3">
                  {/* Thumbnail if product */}
                  {item.imageUrl && (
                    <div className="w-12 h-12 rounded-button bg-muted/20 overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-text truncate">{item.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                      {item.type === 'product' ? (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Package size={11} className="text-primary" /> Salon Product
                        </span>
                      ) : (
                        <>
                          <Clock size={12} />
                          <span>{item.durationMin} mins</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="font-semibold text-text tabular-nums">
                        {item.slot?.isFree ? 'Free (Rs.0)' : `${formatMoney(item.price)} each`}
                      </span>
                    </div>
                    {item.slot && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary-soft px-1.5 py-0.5 rounded-[4px] font-semibold mt-1">
                        <Sparkles size={9} /> Slot: {item.slot.time} ({item.slot.date})
                      </span>
                    )}
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 px-2 rounded-button bg-surface border border-border flex items-center gap-2 shadow-xs">
                      <button
                        onClick={() => updateQty(item.serviceId, -1)}
                        className="w-5 h-5 flex items-center justify-center text-muted hover:text-text cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold tabular-nums min-w-[16px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.serviceId, 1)}
                        className="w-5 h-5 flex items-center justify-center text-muted hover:text-text cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.serviceId)}
                      className="p-1.5 text-muted hover:text-error transition-colors cursor-pointer"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown per Design.md 8.8 */}
            <div className="bg-surface rounded-card border border-border shadow-level-1 p-4 flex flex-col gap-2.5 text-xs">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-1">
                Bill Summary
              </h3>

              <div className="flex justify-between text-muted">
                <span>Items Subtotal ({count} items)</span>
                <span className="text-text font-medium tabular-nums">
                  {formatMoney(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-muted">
                <span>Platform Convenience Fee</span>
                <span className="text-text font-medium tabular-nums">
                  {formatMoney(PLATFORM_FEE_PAISE)}
                </span>
              </div>

              <div className="flex justify-between text-muted">
                <span>Taxes & GST ({TAX_PERCENT}%)</span>
                <span className="text-text font-medium tabular-nums">
                  {formatMoney(taxes)}
                </span>
              </div>

              <div className="border-t border-border pt-2.5 mt-1 flex justify-between text-sm font-bold text-text">
                <span>Total Amount</span>
                <span className="text-primary tabular-nums text-base">
                  {formatMoney(total)}
                </span>
              </div>
            </div>

            {/* Safe & Hygiene Trust Badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted pt-1">
              <ShieldCheck size={14} className="text-success shrink-0" />
              <span>100% genuine products • Fast delivery • Safe checkout</span>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Checkout Bar */}
      {count > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-level-2 p-3 max-w-lg mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-muted uppercase tracking-wider block">
              Total Pay
            </span>
            <span className="text-lg font-bold text-text tabular-nums">
              {formatMoney(total)}
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="flex-1 max-w-xs"
            onClick={onCheckout}
          >
            Proceed to Checkout
          </Button>
        </div>
      )}
    </div>
  );
};
