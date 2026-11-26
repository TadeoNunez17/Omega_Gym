import { useState } from 'react'
import { BottomSheet } from '@/components/ui/molecules/BottomSheet'
import { DayPills } from './DayPills'

interface Props {
  open: boolean
  onClose: () => void
  planName?: string
  initialDays: number[] | null
  saving?: boolean
  promptMode?: boolean
  onSave: (days: number[]) => void
}

/**
 * Selector de días de la semana (0 = lunes … 6 = domingo).
 * El estado se siembra al montar: los padres lo remontan con `key` en cada
 * apertura, así no hace falta reiniciarlo desde un effect.
 */
export function ScheduleSheet({ open, onClose, planName, initialDays, saving, promptMode = false, onSave }: Props) {
  const [selected, setSelected] = useState<number[]>(() => initialDays ?? [])

  function toggle(day: number) {
    setSelected(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]))
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Programar días"
      subtitle={planName ? `${planName} · elige los días de la semana` : 'Elige los días de la semana'}
      maxWidth="480px"
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => (promptMode ? onSave([]) : setSelected([]))}
            className="flex-1 h-12 rounded-full bg-surface2 text-text-2 text-[14px] font-semibold border-none cursor-pointer active:opacity-70 transition-opacity"
          >
            Sin días
          </button>
          <button
            type="button"
            onClick={() => onSave([...selected].sort((a, b) => a - b))}
            disabled={saving}
            className="flex-1 h-12 rounded-full bg-accent text-accent-contrast text-[14px] font-bold border-none cursor-pointer active:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      }
    >
      <DayPills selected={selected} onToggle={toggle} />

      <p className="text-[12px] text-text-3 leading-relaxed mt-4">
        La rutina aparecerá en <span className="text-text">Inicio</span> los días seleccionados.
        Si no programas ninguno, no se mostrará como rutina del día.
      </p>
    </BottomSheet>
  )
}
