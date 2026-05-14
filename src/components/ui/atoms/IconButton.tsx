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
      className={`w-7 h-7 rounded-sm bg-transparent border border-border
        ${danger ? 'text-red-text' : 'text-text-3'}
        flex items-center justify-center cursor-pointer transition-all duration-150
        hover:bg-surface2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
