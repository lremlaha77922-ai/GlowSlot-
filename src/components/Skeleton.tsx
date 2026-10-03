import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  radius?: 'card' | 'button' | 'chip' | 'circle' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  radius = 'button',
  ...props
}) => {
  let radiusClass = 'rounded-button';
  if (radius === 'card') radiusClass = 'rounded-card';
  if (radius === 'chip') radiusClass = 'rounded-chip';
  if (radius === 'circle' || radius === 'full') radiusClass = 'rounded-full';

  return (
    <div
      className={`animate-pulse bg-muted/15 ${radiusClass} ${className}`}
      {...props}
    />
  );
};
