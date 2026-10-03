import React from 'react';
import { Sheet } from '../../../components/Sheet';
import { Coupon } from '../../../types';
import { mockCoupons } from '../../../data/mockCoupons';
import { formatMoney } from '../../../utils/money';
import { Tag, Check, AlertCircle } from 'lucide-react';

interface OfferDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  subtotalPaise: number;
  onSelectCoupon: (coupon: Coupon) => void;
}

export const OfferDetailsSheet: React.FC<OfferDetailsSheetProps> = ({
  isOpen,
  onClose,
  subtotalPaise,
  onSelectCoupon,
}) => {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Available Coupons & Offers">
      <div className="flex flex-col gap-3 pb-4">
        <p className="text-xs text-muted">
          Select an offer to apply instant discounts on your grooming appointment.
        </p>

        <div className="divide-y divide-border">
          {mockCoupons.map((coupon) => {
            const isEligible = !coupon.isExpired && subtotalPaise >= coupon.minOrderPaise;

            return (
              <div
                key={coupon.code}
                className="py-3 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-[6px] border border-dashed border-primary bg-primary-soft text-primary flex items-center gap-1.5">
                    <Tag size={12} />
                    {coupon.code}
                  </span>

                  {coupon.isExpired ? (
                    <span className="text-[10px] font-semibold text-error flex items-center gap-1">
                      <AlertCircle size={11} /> Expired
                    </span>
                  ) : (
                    <button
                      disabled={!isEligible}
                      onClick={() => {
                        onSelectCoupon(coupon);
                        onClose();
                      }}
                      className="px-3 py-1 text-xs font-bold rounded-button bg-primary text-white hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Apply
                    </button>
                  )}
                </div>

                <h4 className="text-xs font-bold text-text mt-1">{coupon.title}</h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  {coupon.description}
                </p>

                {!coupon.isExpired && subtotalPaise < coupon.minOrderPaise && (
                  <span className="text-[10px] text-deal font-medium">
                    Add services worth {formatMoney(coupon.minOrderPaise - subtotalPaise)} more to unlock.
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
};
