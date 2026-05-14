import type { ReactNode } from 'react';

interface MetricCardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'amber' | 'red' | 'accent' | 'blue' | 'gray';
  children?: ReactNode;
  className?: string;
}

const colorMap: Record<string, { bar: string; bg: string; text: string; value: string }> = {
  green: { bar: 'bg-green', bg: 'bg-green-bg', text: 'text-green-text', value: 'text-green-text' },
  amber: { bar: 'bg-amber', bg: 'bg-amber-bg', text: 'text-amber-text', value: 'text-amber-text' },
  red: { bar: 'bg-red', bg: 'bg-red-bg', text: 'text-red-text', value: 'text-red-text' },
  accent: { bar: 'bg-accent', bg: 'bg-accent-dim', text: 'text-accent', value: 'text-accent' },
  blue: { bar: 'bg-[#3b82f6]', bg: 'bg-blue-bg', text: 'text-blue-text', value: 'text-[#60a5fa]' },
  gray: { bar: 'bg-surface2', bg: 'bg-gray-bg', text: 'text-gray-text', value: 'text-text-2' },
};

export function MetricCard({
  icon,
  label,
  value,
  sub,
  delta,
  deltaType = 'up',
  color = 'blue',
  children,
  className = '',
}: MetricCardProps) {
  const c = colorMap[color] || colorMap.blue;

  const deltaColors: Record<string, string> = {
    up: 'bg-green-bg text-green-text',
    down: 'bg-red-bg text-red-text',
    neutral: 'bg-surface2 text-text-3',
  };

  return (
    <div className={`relative bg-surface border border-border rounded overflow-hidden ${className}`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar}`} />
      {icon && (
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.bg} ${c.text}`}>
            <div className="w-4 h-4">{icon}</div>
          </div>
          {delta && (
            <span className={`text-[11px] font-medium px-2 py-[3px] rounded-full ${deltaColors[deltaType]}`}>
              {delta}
            </span>
          )}
        </div>
      )}
      {children ? (
        children
      ) : (
        <div className={`text-[28px] sm:text-[30px] font-semibold leading-none tracking-tight ${c.value}`}>
          {value}
        </div>
      )}
      <div className="text-[12px] text-text-3 mt-1.5">{label}</div>
      {sub && (
        <div className="text-[11px] text-text-3 mt-2">{sub}</div>
      )}
    </div>
  );
}
