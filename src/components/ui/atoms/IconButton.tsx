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
      className={`w-9 sm:w-7 h-9 sm:h-7 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-[13px] sm:[&>svg]:h-[13px] rounded-sm bg-transparent border border-border
        ${danger ? 'text-red-text' : 'text-text-3'}
        flex items-center justify-center cursor-pointer transition-all duration-150
        hover:bg-surface2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
