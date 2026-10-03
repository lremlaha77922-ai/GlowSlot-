import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles =
        'bg-primary text-white hover:brightness-95 active:brightness-90 shadow-level-1 disabled:opacity-40 disabled:shadow-none';
      break;
    case 'secondary':
      variantStyles =
        'bg-transparent border border-primary text-primary hover:bg-primary-soft/50 active:bg-primary-soft';
      break;
    case 'outline':
      variantStyles =
        'bg-transparent border border-border text-text hover:bg-primary-soft/30 active:bg-primary-soft/50';
      break;
    case 'danger':
      variantStyles =
        'bg-error text-white hover:brightness-95 active:brightness-90';
      break;
    case 'ghost':
      variantStyles =
        'bg-transparent text-muted hover:text-text hover:bg-primary-soft/20';
      break;
  }

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'h-9 px-3 text-xs font-semibold';
      break;
    case 'md':
      sizeStyles = 'h-12 px-5 text-sm font-semibold'; // height 48-52
      break;
    case 'lg':
      sizeStyles = 'h-[52px] px-6 text-base font-bold'; // Height 52 per Design.md
      break;
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-button font-medium transition-all duration-150 cursor-pointer select-none disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      } ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
