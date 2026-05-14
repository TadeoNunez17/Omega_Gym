interface ChipProps {
  value: string | number;
  label: string;
  accent?: boolean;
}

export function Chip({ value, label, accent }: ChipProps) {
  return (
    <div
      className={`flex flex-col items-center rounded-sm px-2.5 py-1 min-w-[48px]
        ${accent
          ? 'bg-accent-dim border border-[rgba(232,255,71,0.2)]'
          : 'bg-surface2 border border-border'
        }`}
    >
      <span
        className={`text-sm font-semibold font-mono leading-none
          ${accent ? 'text-accent' : 'text-text'}`}
      >
        {value}
      </span>
      <span className="text-[9px] text-text-3 uppercase tracking-wider mt-0.5">
        {label}
      </span>
    </div>
  );
}
