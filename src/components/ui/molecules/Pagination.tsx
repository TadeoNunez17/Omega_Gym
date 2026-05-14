'use client';

interface PaginationProps {
  current: number;
  total: number;
  start: number;
  end: number;
  totalItems: number;
  label: string;
  onChange: (page: number) => void;
}

export function Pagination({
  current,
  total,
  start,
  end,
  totalItems,
  label,
  onChange,
}: PaginationProps) {
  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4.5 py-3 border-t border-border bg-surface2">
      <span className="text-xs text-text-3">
        Mostrando {start + 1}–{end} de {totalItems} {label}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-7 h-7 rounded-sm text-xs flex items-center justify-center cursor-pointer font-sans
              ${p === current
                ? 'bg-accent text-black font-semibold'
                : 'bg-transparent text-text-2 border border-border'
              }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
