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

const colorMap: Record<string, { bar: string; bg: string; text: string; value: string; glow: string }> = {
  green: { bar: 'bg-green', bg: 'bg-green-bg', text: 'text-green-text', value: 'text-green-text', glow: 'rgba(34,197,94,0.15)' },
  amber: { bar: 'bg-amber', bg: 'bg-amber-bg', text: 'text-amber-text', value: 'text-amber-text', glow: 'rgba(245,158,11,0.15)' },
  red: { bar: 'bg-red', bg: 'bg-red-bg', text: 'text-red-text', value: 'text-red-text', glow: 'rgba(239,68,68,0.15)' },
  accent: { bar: 'bg-accent', bg: 'bg-accent-dim', text: 'text-accent', value: 'text-accent', glow: 'rgba(232,93,93,0.15)' },
  blue: { bar: 'bg-[#3b82f6]', bg: 'bg-blue-bg', text: 'text-blue-text', value: 'text-[#60a5fa]', glow: 'rgba(59,130,246,0.15)' },
  gray: { bar: 'bg-surface2', bg: 'bg-gray-bg', text: 'text-gray-text', value: 'text-text-2', glow: 'rgba(255,255,255,0.05)' },
};

function ArrowUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="10" height="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="10" height="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

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
    <div
      className={`metric-card-hover relative bg-surface border border-border rounded overflow-hidden p-3 sm:p-4 shrink-0 min-w-[140px] sm:min-w-0 ${className}`}
      style={{ '--glow-color': c.glow } as React.CSSProperties}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar}`} />
      {icon && (
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>
            <div className="w-[18px] h-[18px]">{icon}</div>
          </div>
          {delta && (
            <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-[3px] rounded-full ${deltaColors[deltaType]}`}>
              {deltaType === 'up' ? <ArrowUp /> : deltaType === 'down' ? <ArrowDown /> : null}
              {delta}
            </span>
          )}
        </div>
      )}
      {children ? (
        children
      ) : (
        <div className={`text-xl sm:text-[28px] font-semibold leading-none tracking-tight font-mono ${c.value}`}>
          {value}
        </div>
      )}
      <div className="text-[11px] sm:text-[12px] text-text-3 mt-1 sm:mt-1.5">{label}</div>
      {sub && (
        <div className="text-[10px] sm:text-[11px] text-text-3 mt-1 sm:mt-2">{sub}</div>
      )}
    </div>
  );
}
