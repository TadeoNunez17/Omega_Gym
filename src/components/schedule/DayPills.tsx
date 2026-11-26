import { DAY_LABELS } from '@/lib/dates'

interface Props {
  selected: number[]
  onToggle: (day: number) => void
  compact?: boolean
}

export function DayPills({ selected, onToggle, compact = false }: Props) {
  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'grid grid-cols-4 gap-2'}>
      {DAY_LABELS.map((label, day) => {
        const active = selected.includes(day)
        return (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(day)}
            className={`${compact ? 'h-9 px-3 min-w-[46px]' : 'h-11'} rounded-full text-[13px] font-semibold border-none cursor-pointer active:opacity-70 transition-colors ${
              active ? 'bg-accent text-accent-contrast' : 'bg-surface2 text-text-2'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
