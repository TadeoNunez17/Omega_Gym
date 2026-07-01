'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-accent text-black border border-accent/25 shadow-[0_0_14px_-4px_var(--accent)] hover:brightness-110 hover:-translate-y-[0.5px] active:scale-[0.97]',
  ghost: 'bg-transparent text-text-2 border border-border2 hover:bg-surface2 active:scale-[0.97]',
  danger: 'bg-transparent text-red-text border border-red-bg hover:bg-red-bg active:scale-[0.97]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-5 py-2 text-sm',
};

export function Button({
  variant = 'ghost',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-sm
        transition-all duration-200 cursor-pointer font-sans
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
