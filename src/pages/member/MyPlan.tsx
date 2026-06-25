import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store'
import { trainingService, type TrainingPlan, type PlanExercise } from '@/services/training.service'
import { Chip } from '@/components/ui/atoms/Chip'

const DAY_NAMES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

const NOISE = "data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

const staggerClass = (i: number) => {
  const map = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6', 'stagger-7'];
  return map[i] || '';
};

function IconRest() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 6v6l4 2" /></svg>;
}
function IconNoPlan() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>;
}

export default function MyPlanPage() {
  const user = useAuthStore(s => s.user)
  const [day, setDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [exercises, setExercises] = useState<PlanExercise[]>([])
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!user) return;
    const ctrl = { ignore: false }
    ;(async () => {
      try {
        const planResult = await trainingService.getByMember(user.id)
        if (ctrl.ignore) return
        if (planResult) {
          setPlan(planResult)
          const exs = await trainingService.getExercises(planResult.id)
          if (!ctrl.ignore) setExercises(exs)
        }
      } catch (err) {
        console.error('Error loading plan:', err)
      }
      if (!ctrl.ignore) setLoading(false)
    })()
    return () => { ctrl.ignore = true }
  }, [user])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current)
    }
  }, [])

  const startTimer = useCallback((exerciseId: string, seconds: number) => {
    if (timerRef.current !== null) clearInterval(timerRef.current)
    setActiveTimerId(exerciseId)
    setTimerSeconds(seconds)
    timerRef.current = window.setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          if (timerRef.current !== null) clearInterval(timerRef.current)
          timerRef.current = null
          setActiveTimerId(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) clearInterval(timerRef.current)
    timerRef.current = null
    setActiveTimerId(null)
    setTimerSeconds(0)
  }, [])

  if (loading || !user) {
    return (
      <div className="p-4 sm:p-7 flex items-center justify-center min-h-[60vh]">
        <div className="text-sm text-text-3">{loading ? 'Cargando...' : 'Inicia sesión para ver tu plan'}</div>
      </div>
    )
  }

  const exsByDay: Record<number, PlanExercise[]> = {}
  exercises.forEach(e => {
    const d = e.day ?? 0
    if (!exsByDay[d]) exsByDay[d] = []
    exsByDay[d].push(e)
  })

  const todayExs = exsByDay[day] || []
  const isRest = todayExs.length === 0 && exercises.length > 0
  const hasExercises = exercises.length > 0

  const initials = user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'
  const memberSince = new Date(user.created_at)
  const memberSinceStr = memberSince.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })

  const hour = new Date().getHours() + new Date().getMinutes() / 60
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = user.full_name.split(' ')[0]
  const avatarColors = ['#60a5fa', '#f59e0b', '#22c55e', '#a78bfa', '#f472b6', '#38bdf8', '#fb923c']
  const avatarColor = avatarColors[user.full_name.length % avatarColors.length]

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="p-4 sm:p-7 flex-1">
      <div className={`flex items-center gap-3 mb-5 animate-slide-up ${staggerClass(0)}`}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-accent">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
          </svg>
        </div>
        <div>
          <div className="text-[11px] text-text-3">Omega Gym</div>
          <div className="text-[17px] font-semibold -tracking-[0.01em]">Mi plan</div>
        </div>
      </div>

      <div className={`animate-slide-up ${staggerClass(1)}`}>
        <div className="bg-surface border border-border rounded p-6 mb-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent)] to-transparent" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)', opacity: 0.08 }} />
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url("${NOISE}")`, backgroundSize: '200px 200px', opacity: 0.015 }} />
          <div className="flex items-center justify-between gap-6 z-10 relative">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold shrink-0"
                style={{ background: `${avatarColor}20`, color: avatarColor }}>{initials}</div>
              <div className="min-w-0">
                <div className="text-[28px] sm:text-[34px] leading-tight font-display italic -tracking-[0.02em]">¡{greeting}, {firstName}!</div>
                <div className="text-xs text-text-3 mt-1 truncate">{user.email} · Miembro desde {memberSinceStr}</div>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="bg-surface2 border border-border rounded-[var(--radius-sm)] px-4 py-3 text-center min-w-[90px]">
                <div className="text-xl font-semibold tracking-tight font-mono" style={{ color: hasExercises ? 'var(--green-text)' : 'var(--text-3)' }}>{hasExercises ? todayExs.length : '—'}</div>
                <div className="text-[10px] text-text-3 mt-[1px]">Ejerc. hoy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`bg-surface border border-border rounded overflow-hidden mb-4 animate-slide-up ${staggerClass(2)}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
            </div>
            <div>
              <div className="text-[13px] font-semibold">Mi plan de entrenamiento</div>
              <div className="text-[11px] text-text-3 mt-0.5">{plan ? plan.name : 'Sin plan asignado'}</div>
              {plan && (
                <div className="inline-flex items-center gap-[5px] bg-accent-dim text-accent text-xs font-medium px-2 py-[2px] rounded-full mt-1">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  Activo
                </div>
              )}
            </div>
          </div>
        </div>

        {!plan ? (
          <div className="py-10 text-center flex flex-col items-center gap-[10px]">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
              <div className="w-6 h-6"><IconNoPlan /></div>
            </div>
            <div className="text-[13px] font-semibold">Sin plan de entrenamiento</div>
            <div className="text-[13px] text-text-3">Tu entrenador aún no te ha asignado un plan. Pregúntale en tu próxima sesión.</div>
          </div>
        ) : (
          <>
            <div className="flex gap-1.5 px-5 py-4 border-b border-border overflow-x-auto lg:justify-center">
              {DAY_NAMES.map((d, i) => {
                const hasExs = (exsByDay[i] || []).length > 0
                return (
                  <button key={d} onClick={() => setDay(i)}
                    className={`shrink-0 px-3.5 py-[7px] rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer transition-all duration-150 font-inherit ${
                      i === day
                        ? 'bg-accent text-black border border-accent'
                        : 'bg-transparent border ' + (hasExs ? 'text-text-2 border-border' : 'text-text-3 border-border')
                    }`}>
                    {d}
                  </button>
                )
              })}
            </div>

            {isRest ? (
              <div className="py-10 text-center flex flex-col items-center gap-[10px]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>
                  <div className="w-6 h-6"><IconRest /></div>
                </div>
                <div className="text-[13px] font-semibold">Día de descanso</div>
                <div className="text-[13px] text-text-3">El descanso es parte del entrenamiento. Descansa, hidrátate y recupera.</div>
              </div>
            ) : (
              <div className="flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:gap-[1px] lg:bg-border">
                {todayExs.length === 0 && !isRest && exercises.length > 0 ? (
                  <div className="py-10 text-center text-text-3 text-[13px] lg:col-span-full">No hay ejercicios registrados para este día.</div>
                ) : todayExs.length === 0 ? (
                  <div className="py-10 text-center text-text-3 text-[13px] lg:col-span-full">No hay ejercicios en este plan aún.</div>
                ) : (
                  todayExs.map((e, i) => (
                    <div key={e.id} className="flex items-center gap-4 px-5 py-3.5 row-hover transition-colors border-b border-border lg:border-0 lg:bg-surface">
                      <div className="w-7 h-7 rounded-full bg-surface2 border border-border2 flex items-center justify-center text-[11px] font-semibold text-text-3 shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium">{e.exercise_name}</div>
                      </div>
                      <div className="flex gap-1.5 shrink-0 items-center">
                        <Chip value={e.sets ?? '—'} label="Series" accent />
                        <Chip value={e.reps ?? '—'} label="Reps" />
                        {e.rest_seconds ? (
                          <div className="flex items-center gap-1.5">
                            {activeTimerId === e.id && timerSeconds === 0 ? (
                              <span className="text-[11px] font-semibold text-green-text animate-fade-in">Listo!</span>
                            ) : (
                              <span className={`text-[13px] font-mono font-semibold ${activeTimerId === e.id ? (timerSeconds <= 10 ? 'text-red-text' : 'text-accent') : 'text-text-2'}`}>
                                {activeTimerId === e.id ? formatTime(timerSeconds) : formatTime(e.rest_seconds)}
                              </span>
                            )}
                            {activeTimerId === e.id ? (
                              timerSeconds > 0 ? (
                                <button onClick={stopTimer}
                                  className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-surface2 border border-border text-text-3 hover:text-text cursor-pointer transition-colors shrink-0">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                </button>
                              ) : null
                            ) : (
                              <button onClick={() => startTimer(e.id, e.rest_seconds!)}
                                className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-accent text-black cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                                title="Iniciar descanso">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              </button>
                            )}
                          </div>
                        ) : (
                          <Chip value="—" label="Descanso" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {plan && plan.description && (
        <div className={`bg-surface border border-border rounded-xl p-4 animate-slide-up ${staggerClass(3)}`}>
          <div className="text-[11px] font-medium text-text-3 uppercase tracking-[0.4px] mb-2">Notas del plan</div>
          <div className="text-[13px] text-text-2 leading-relaxed">{plan.description}</div>
        </div>
      )}
    </div>
  );
}
