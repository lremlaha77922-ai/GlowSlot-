import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface AddStepperProps {
  qty: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
}

export const AddStepper: React.FC<AddStepperProps> = ({
  qty,
  onAdd,
  onIncrement,
  onDecrement,
  className = '',
}) => {
  if (qty <= 0) {
    return (
      <button
        onClick={onAdd}
        className={`h-9 px-4 rounded-button border border-primary text-primary font-semibold text-xs tracking-wide uppercase hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 shadow-sm ${className}`}
        aria-label="Add service"
      >
        <Plus size={14} />
        <span>ADD</span>
      </button>
    );
  }

  return (
    <div
      className={`h-9 px-2 rounded-button bg-primary text-white font-semibold text-xs transition-all duration-200 flex items-center justify-between shadow-sm min-w-[92px] ${className}`}
    >
      <button
        onClick={onDecrement}
        className="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-white/20 active:bg-white/30 transition-colors cursor-pointer"
        aria-label="Decrease quantity"
      >
        <Minus size={13} />
      </button>
      <span className="tabular-nums font-bold px-1 text-sm">{qty}</span>
      <button
        onClick={onIncrement}
        className="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-white/20 active:bg-white/30 transition-colors cursor-pointer"
        aria-label="Increase quantity"
      >
        <Plus size={13} />
      </button>
    </div>
  );
};
