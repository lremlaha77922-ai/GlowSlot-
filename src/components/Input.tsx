import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-text select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3.5 text-muted pointer-events-none flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        <input
          disabled={disabled}
          className={`h-[52px] w-full rounded-input border bg-surface text-text text-sm transition-all outline-none ${
            leftIcon ? 'pl-11' : 'pl-4'
          } ${rightIcon ? 'pr-11' : 'pr-4'} ${
            error
              ? 'border-error focus:ring-2 focus:ring-error focus:border-error'
              : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-muted/10' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3.5 text-muted flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <span className="text-xs font-medium text-error">{error}</span>}
      {!error && helperText && (
        <span className="text-xs text-muted">{helperText}</span>
      )}
    </div>
  );
};
