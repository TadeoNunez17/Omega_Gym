import type { ReactNode } from 'react';

type BadgeVariant = 'green' | 'amber' | 'red' | 'accent' | 'gray' | 'blue' | 'purple' | 'pink';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: 'bg-green-bg text-green-text',
  amber: 'bg-amber-bg text-amber-text',
  red: 'bg-red-bg text-red-text',
  accent: 'bg-accent-dim text-accent',
  gray: 'bg-surface2 text-text-3 border border-border',
  blue: 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa]',
  purple: 'bg-[rgba(168,85,247,0.1)] text-[#c084fc]',
  pink: 'bg-[rgba(236,72,153,0.1)] text-[#f472b6]',
};

const dotColors: Record<string, string> = {
  green: 'bg-green',
  amber: 'bg-amber',
  red: 'bg-red',
  accent: 'bg-accent',
  gray: 'bg-text-3',
  blue: 'bg-[#60a5fa]',
  purple: 'bg-[#c084fc]',
};

export function Badge({ variant = 'gray', dot, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
