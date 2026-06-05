'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  danger?: boolean;
  title: string;
}

export function IconButton({ children, danger, title, className = '', ...props }: IconButtonProps) {
  return (
    <button
      title={title}
      className={`w-12 sm:w-9 h-12 sm:h-9 [&>svg]:w-[22px] [&>svg]:h-[22px] sm:[&>svg]:w-4 sm:[&>svg]:h-4 rounded-sm bg-transparent border border-border
        ${danger ? 'text-red-text' : 'text-text-3'}
        flex items-center justify-center cursor-pointer transition-all duration-150
        hover:bg-surface2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
