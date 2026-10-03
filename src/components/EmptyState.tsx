import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  helperText: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  helperText,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center text-primary mb-4 shadow-xs">
        {icon || <ShoppingBag size={28} />}
      </div>
      <h3 className="text-base font-bold text-text mb-1">{title}</h3>
      <p className="text-xs text-muted leading-relaxed mb-6">{helperText}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
