'use client';

type Size = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  size?: Size;
  className?: string;
}

const sizeStyles: Record<Size, { container: string; font: string }> = {
  sm: { container: 'w-7 h-7', font: 'text-[10px]' },
  md: { container: 'w-8 h-8', font: 'text-[11px]' },
  lg: { container: 'w-9 h-9', font: 'text-xs' },
};

const AVATAR_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
  { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
  { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
  { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const color = getColor(name);
  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold flex-shrink-0
        ${sizeStyles[size].container} ${sizeStyles[size].font} ${className}`}
      style={{ background: color.bg, color: color.fg }}
    >
      {getInitials(name)}
    </div>
  );
}
