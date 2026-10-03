import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: 'flat' | '1' | '2';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = '1',
  interactive = false,
  className = '',
  ...props
}) => {
  let shadowClass = 'shadow-level-1';
  if (elevation === 'flat') shadowClass = 'shadow-level-0';
  if (elevation === '2') shadowClass = 'shadow-level-2';

  return (
    <div
      className={`bg-surface rounded-card border border-border/80 ${shadowClass} p-3.5 sm:p-4 ${
        interactive
          ? 'cursor-pointer hover:border-primary/40 hover:shadow-level-2 transition-all duration-150'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
