import React from 'react';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  selected = false,
  children,
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`h-9 px-3.5 rounded-chip font-medium text-xs tracking-tight transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap select-none ${
        selected
          ? 'bg-primary-soft text-primary border border-primary font-semibold shadow-xs'
          : 'bg-surface text-muted border border-border hover:bg-primary-soft/40 hover:text-text'
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
