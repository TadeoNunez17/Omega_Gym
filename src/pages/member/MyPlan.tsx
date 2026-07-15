import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store'
import { trainingService, type TrainingPlan, type PlanExercise } from '@/services/training.service'
import { workoutService, type WorkoutLog } from '@/services/workout.service'
import { exercisesService, type Exercise } from '@/services/exercises.service'

const COMPLETION_MESSAGES = [
  '¡Rutina completada! 💪',
  '¡Excelente trabajo! Sigue así.',
  'Hoy diste todo. Mañana también. 🔥',
  'Entrenamiento finalizado. El descanso también entrena.',
  'Un día más fuerte. ¡Bien hecho!',
  '¡Meta alcanzada! Cada rep cuenta. 💯',
  'Rutina del día lista. ¡Nos vemos mañana!',
]

const DAY_NAMES = ['Lun','Mar','Mié','Jue','Vie','Sáb'];
const NOISE = "data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

const staggerClass = (i: number) => {
  const map = ['stagger-1','stagger-2','stagger-3','stagger-4','stagger-5','stagger-6','stagger-7'];
  return map[i] || '';
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

type LogKey = string
type LogMap = Record<LogKey, WorkoutLog>

function mkKey(exerciseId: string, setNum: number): LogKey {
  return `${exerciseId}-${setNum}`
}

export default function MyPlanPage() {
  const user = useAuthStore(s => s.user)
  const [day, setDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [plan, setPlan] = useState<(TrainingPlan & { creator: { id: string; full_name: string } | null }) | null>(null)
  const [exercises, setExercises] = useState<PlanExercise[]>([])
  const [logs, setLogs] = useState<LogMap>({})
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerRemaining, setTimerRemaining] = useState(0)
  const timerRef = useRef<number | null>(null)
  const debounceRef = useRef<Record<string, number>>({})
  const logsRef = useRef<LogMap>({})
  const [lastSessionLogs, setLastSessionLogs] = useState<LogMap>({})
  const [completionMessage] = useState(() => COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)])
  const [catalogMap, setCatalogMap] = useState<Map<string, Exercise>>(new Map())
  const [expandedInstructions, setExpandedInstructions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return;
    const ctrl = { ignore: false }
    ;(async () => {
      try {
        const planResult = await trainingService.getByMember(user.id)
        if (ctrl.ignore) return
        if (planResult) {
          setPlan(planResult)
          const [exs, todayLogs, lastSession] = await Promise.all([
            trainingService.getExercises(planResult.id),
            workoutService.getTodayLogs(user.id, planResult.id),
            workoutService.getLastSessionData(user.id, planResult.id),
          ])
          if (!ctrl.ignore) {
            setExercises(exs)
            const map: LogMap = {}
            todayLogs.forEach(l => {
              map[mkKey(l.exercise_id, l.set_number)] = l
            })
            const lastMap: LogMap = {}
            lastSession.forEach(l => {
              lastMap[mkKey(l.exercise_id, l.set_number)] = l
            })
            setLastSessionLogs(lastMap)
            exs.forEach(e => {
              for (let i = 1; i <= (e.sets ?? 0); i++) {
                const key = mkKey(e.id, i)
                if (!map[key] && lastMap[key]) {
                  const prev = lastMap[key]
                  map[key] = {
                    id: '',
                    member_id: user.id,
                    plan_id: planResult.id,
                    exercise_id: e.id,
                    logged_date: new Date().toISOString().split('T')[0],
                    set_number: i,
                    weight: prev.weight,
                    reps: prev.reps,
                    completed: false,
                    notes: null,
                    created_at: '',
                  }
                }
              }
            })
            setLogs(map)

            // Load catalog data for exercises linked to catalog
            const catalogIds = [...new Set(exs.filter(e => e.exercise_id).map(e => e.exercise_id!))]
            if (catalogIds.length > 0) {
              try {
                const catalogExs = await exercisesService.getByIds(catalogIds)
                if (!ctrl.ignore) {
                  const newMap = new Map<string, Exercise>()
                  catalogExs.forEach(ce => newMap.set(ce.id, ce))
                  setCatalogMap(newMap)
                }
              } catch {
                // Silently fail - catalog data is optional
              }
            }
          }
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
      Object.values(debounceRef.current).forEach(id => clearTimeout(id))
    }
  }, [])

  const scheduleSave = useCallback((exerciseId: string, setNumber: number, memberId: string, planId: string, partial: Partial<WorkoutLog>) => {
    const key = mkKey(exerciseId, setNumber)
    const existing = debounceRef.current[key]
    if (existing) clearTimeout(existing)
    debounceRef.current[key] = window.setTimeout(async () => {
      setSaving(prev => ({ ...prev, [key]: true }))
      try {
        const current = logsRef.current[key]
        await workoutService.upsertSet(memberId, {
          plan_id: planId,
          exercise_id: exerciseId,
          set_number: setNumber,
          weight: partial.weight ?? current?.weight ?? null,
          reps: partial.reps ?? current?.reps ?? null,
          completed: partial.completed ?? true,
        })
      } catch (err) {
        console.error('Error saving set:', err)
      } finally {
        setSaving(prev => ({ ...prev, [key]: false }))
      }
    }, 500)
  }, [])

  const updateLog = useCallback((exerciseId: string, setNumber: number, partial: Partial<WorkoutLog>) => {
    const key = mkKey(exerciseId, setNumber)
    setLogs(prev => {
      const existing = prev[key]
      const updated: WorkoutLog = {
        id: existing?.id ?? '',
        member_id: existing?.member_id ?? user!.id,
        plan_id: existing?.plan_id ?? plan!.id,
        exercise_id: exerciseId,
        logged_date: existing?.logged_date ?? new Date().toISOString().split('T')[0],
        set_number: setNumber,
        weight: partial.weight ?? existing?.weight ?? null,
        reps: partial.reps ?? existing?.reps ?? null,
        completed: partial.completed ?? existing?.completed ?? true,
        notes: partial.notes ?? existing?.notes ?? null,
        created_at: existing?.created_at ?? new Date().toISOString(),
      }
      return { ...prev, [key]: updated }
    })
    if (user && plan) {
      scheduleSave(exerciseId, setNumber, user.id, plan.id, partial)
    }
  }, [user, plan, scheduleSave])

  const toggleTimer = useCallback((exerciseId: string, seconds: number) => {
    if (activeTimerId === exerciseId && timerRunning) {
      if (timerRef.current !== null) clearInterval(timerRef.current)
      timerRef.current = null
      setTimerRunning(false)
      return
    }

    if (timerRef.current !== null) clearInterval(timerRef.current)
    const isDone = activeTimerId === exerciseId && timerRemaining === 0 && !timerRunning
    const isSamePaused = activeTimerId === exerciseId && timerRemaining > 0 && !timerRunning
    const startSec = isSamePaused ? timerRemaining : seconds
    setActiveTimerId(exerciseId)
    setTimerRemaining(startSec)
    setTimerRunning(true)
    timerRef.current = window.setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current !== null) clearInterval(timerRef.current)
          timerRef.current = null
          setTimerRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [activeTimerId, timerRunning, timerRemaining])

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) clearInterval(timerRef.current)
    timerRef.current = null
    setActiveTimerId(null)
    setTimerRunning(false)
    setTimerRemaining(0)
  }, [])

  logsRef.current = logs

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

  const totalSets = todayExs.reduce((sum, e) => sum + (e.sets ?? 0), 0)
  const completedSets = todayExs.reduce((sum, e) => {
    let done = 0
    for (let i = 1; i <= (e.sets ?? 0); i++) {
      const log = logs[mkKey(e.id, i)]
      if (log?.completed) done++
    }
    return sum + done
  }, 0)
  const showProgress = hasExercises && !isRest && totalSets > 0
  const isComplete = completedSets === totalSets && totalSets > 0

  const initials = user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'
  const memberSince = new Date(user.created_at)
  const memberSinceStr = memberSince.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })

  const hour = new Date().getHours() + new Date().getMinutes() / 60
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = user.full_name.split(' ')[0]
  const avatarColors = ['#60a5fa','#f59e0b','#22c55e','#a78bfa','#f472b6','#38bdf8','#fb923c']
  const avatarColor = avatarColors[user.full_name.length % avatarColors.length]

  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  return (<>
    <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-surface2 sticky top-0 z-9">
      <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 9M5 10v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V10"/></svg>
        <span className="text-text-4 mx-0.5">/</span>
        <span className="font-medium text-text-1">Mi plan</span>
      </div>
    </header>

    <div className="p-4 sm:p-7 flex-1 max-w-4xl mx-auto w-full">

      {/* Greeting card */}
      <div className={`bg-surface border border-border rounded-2xl p-6 sm:p-7 mb-5 relative overflow-hidden animate-slide-up ${staggerClass(1)}`}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-transparent" />
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)', opacity: 0.07 }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url("${NOISE}")`, backgroundSize: '200px 200px', opacity: 0.015 }} />
        <div className="flex items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold shrink-0"
              style={{ background: `${avatarColor}18`, color: avatarColor }}>{initials}</div>
            <div className="min-w-0">
              <div className="text-[28px] sm:text-[34px] leading-tight font-display italic -tracking-[0.02em]">¡{greeting}, {firstName}!</div>
              <div className="text-xs text-text-3 mt-1 truncate">{user.email} · Miembro desde {memberSinceStr}</div>
            </div>
          </div>
          <div className="text-center bg-surface2 border border-border rounded-xl px-5 py-3 min-w-[90px] shrink-0">
            <div className="text-2xl font-bold leading-none mb-1" style={{ color: hasExercises ? 'var(--accent)' : 'var(--text-3)' }}>
              {showProgress ? `${completedSets}/${totalSets}` : (hasExercises ? todayExs.length : '—')}
            </div>
            <div className="text-[10px] text-text-3 uppercase tracking-[0.06em]">{showProgress ? 'Sets hoy' : 'Ejerc. hoy'}</div>
          </div>
        </div>
        {showProgress && (
          <div className="mt-4 h-1 bg-surface2 rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }} />
          </div>
        )}
        {isComplete && (
          <div className="mt-4 animate-slide-up bg-green/10 border border-green/30 rounded-xl p-[14px] flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-green/20 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-green-text">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="text-sm font-semibold text-green-text">{completionMessage}</div>
          </div>
        )}
      </div>

      {/* Plan header */}
      <div className={`bg-surface border border-border rounded-xl p-[18px] sm:p-5 flex items-center gap-3.5 mb-4 animate-slide-up ${staggerClass(2)}`}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold">{plan ? plan.name : 'Mi plan de entrenamiento'}</div>
          {plan && plan.creator && (
            <div className="text-xs text-text-3 mt-0.5">{plan.creator.full_name}</div>
          )}
        </div>
        {plan && (
          <div className="ml-auto text-[11px] font-bold text-accent bg-accent-dim border border-accent/40 px-2.5 py-[3px] rounded-full whitespace-nowrap">
            Activo
          </div>
        )}
      </div>

      {!plan ? (
        <div className={`bg-surface border border-border rounded-xl p-12 text-center flex flex-col items-center gap-3 animate-slide-up ${staggerClass(3)}`}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--amber-bg)', color: 'var(--amber-text)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <div className="text-sm font-semibold">Sin plan de entrenamiento</div>
          <div className="text-sm text-text-3 max-w-xs">Tu entrenador aún no te ha asignado un plan. Pregúntale en tu próxima sesión.</div>
        </div>
      ) : (
        <>
          {/* Day tabs */}
          <div className="flex gap-1.5 mb-[18px] overflow-x-auto animate-slide-up" style={{ animationDelay: '120ms' }}>
            {DAY_NAMES.map((d, i) => {
              const count = (exsByDay[i] || []).length
              const isRestDay = count === 0 && exercises.length > 0
              return (
                <button key={d} onClick={() => setDay(i)}
                  className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all duration-150 font-inherit border ${
                    i === day
                      ? 'bg-accent text-black border-accent'
                      : isRestDay
                        ? 'bg-transparent text-text-3 border-border opacity-60 italic'
                        : 'bg-transparent text-text-2 border-border'
                  }`}>
                  {d}
                  {count > 0 && (
                    <span className={`inline-block ml-1.5 rounded-full px-[5px] py-[1px] text-[10px] ${
                      i === day ? 'bg-black/20 text-black/80' : 'bg-surface2 text-text-3'
                    }`}>{count}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Exercises */}
          <div className={`flex flex-col gap-2.5 animate-slide-up ${staggerClass(3)}`}>
            {isRest ? (
              <div className="bg-surface border border-border rounded-xl p-12 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--purple-bg)', color: 'var(--purple-text)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div className="text-sm font-semibold">Día de descanso</div>
                <div className="text-sm text-text-3">El descanso es parte del entrenamiento. Descansa, hidrátate y recupera.</div>
              </div>
            ) : todayExs.length === 0 && exercises.length > 0 ? (
              <div className="bg-surface border border-border rounded-xl p-12 text-center text-text-3 text-sm">No hay ejercicios registrados para este día.</div>
            ) : todayExs.length === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-12 text-center text-text-3 text-sm">No hay ejercicios en este plan aún.</div>
            ) : (
              todayExs.map((e, i) => {
                const isTimerActive = activeTimerId === e.id
                const timerDone = isTimerActive && timerRemaining === 0 && !timerRunning
                const setCount = e.sets ?? 0
                const catalogEx = e.exercise_id ? catalogMap.get(e.exercise_id) : null
                const gifUrl = catalogEx?.gif_url
                const instructions = catalogEx?.instructions_es
                const isExpanded = expandedInstructions.has(e.id)

                return (
                  <div key={e.id}
                    className="bg-surface border border-border rounded-xl p-4 sm:p-[18px]">
                    {/* GIF animation */}
                    {gifUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden bg-surface2 border border-border">
                        <img
                          src={gifUrl}
                          alt={e.exercise_name}
                          className="w-full h-auto max-h-[220px] object-contain"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {/* Exercise header */}
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="text-sm font-bold">{e.exercise_name}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {e.muscle && (
                            <span className="bg-accent-dim text-accent text-[10px] font-bold uppercase px-2 py-[2px] rounded-[5px] tracking-wide">{e.muscle}</span>
                          )}
                          {catalogEx?.equipment && catalogEx.equipment !== 'bodyweight' && (
                            <span className="bg-surface3 text-text-3 text-[10px] px-2 py-[2px] rounded-[5px]">{catalogEx.equipment}</span>
                          )}
                          {e.notes && (
                            <span className="text-[11px] text-text-3">{e.notes}</span>
                          )}
                          {e.reference_link && (
                            <a href={e.reference_link} target="_blank" rel="noopener noreferrer"
                              className="text-[11px] text-text-3 inline-flex items-center gap-1 border border-border px-2 py-[2px] rounded-[6px] no-underline hover:text-accent hover:border-accent/40 transition-colors">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                              Referencia
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center hidden sm:block">
                          <div className="text-xl font-bold leading-none">{setCount || '—'}</div>
                          <div className="text-[10px] text-text-3 uppercase tracking-[0.04em] mt-[2px]">Series</div>
                        </div>
                        <span className="text-border2 text-lg hidden sm:inline">×</span>
                        <div className="text-center hidden sm:block">
                          <div className="text-xl font-bold leading-none">{e.reps ?? '—'}</div>
                          <div className="text-[10px] text-text-3 uppercase tracking-[0.04em] mt-[2px]">Reps</div>
                        </div>
                        {e.rest_seconds && (
                          <div className={`flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 min-w-[88px] justify-center ${
                            isTimerActive && timerRunning ? 'timer-running' : ''
                          }`}>
                            <button onClick={() => toggleTimer(e.id, e.rest_seconds!)}
                              className="bg-none border-none text-text-3 cursor-pointer text-sm flex items-center p-0 hover:text-accent transition-colors"
                              title={isTimerActive && timerRunning ? 'Pausar' : 'Iniciar descanso'}>
                              {isTimerActive && timerRunning ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                              ) : timerDone ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              )}
                            </button>
                            <span className={`text-sm font-bold font-mono tabular-nums ${
                              isTimerActive ? (timerRunning ? 'text-accent' : 'text-text-2') : 'text-text-2'
                            } ${timerDone ? 'text-green-text' : ''}`}>
                              {timerDone ? 'Listo!' : formatTime(isTimerActive ? timerRemaining : e.rest_seconds)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sets grid */}
                    {setCount > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {Array.from({ length: setCount }, (_, si) => {
                          const setNum = si + 1
                          const key = mkKey(e.id, setNum)
                          const log = logs[key]
                          const isCompleted = log?.completed ?? false
                          const isSaving = saving[key]
                          const weight = log?.weight
                          const reps = log?.reps

                          return (
                            <div key={setNum}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 border transition-all duration-150 ${
                                isCompleted
                                  ? 'bg-surface2 border-green/30'
                                  : 'bg-surface2 border-border'
                              }`}>
                              {/* Set number */}
                              <span className={`text-[11px] font-bold w-5 shrink-0 ${isCompleted ? 'text-green-text' : 'text-text-3'}`}>
                                {setNum}
                              </span>

                              {/* Weight input */}
                              <div className="relative flex-1 min-w-0">
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  placeholder="kg"
                                  value={weight ?? ''}
                                  onChange={ev => updateLog(e.id, setNum, { weight: ev.target.value === '' ? null : Number(ev.target.value) })}
                                  className={`w-full bg-transparent border rounded-md px-2 py-1 text-xs font-mono font-semibold text-right outline-none transition-colors ${
                                    isCompleted ? 'border-green/20 text-green-text' : 'border-border text-text hover:border-text-3'
                                  } ${isSaving ? 'opacity-60' : ''}`}
                                />
                              </div>

                              {/* Reps input */}
                              <div className="relative flex-1 min-w-0">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  placeholder="rep"
                                  value={reps ?? ''}
                                  onChange={ev => updateLog(e.id, setNum, { reps: ev.target.value === '' ? null : Number(ev.target.value) })}
                                  className={`w-full bg-transparent border rounded-md px-2 py-1 text-xs font-mono font-semibold text-right outline-none transition-colors ${
                                    isCompleted ? 'border-green/20 text-green-text' : 'border-border text-text hover:border-text-3'
                                  } ${isSaving ? 'opacity-60' : ''}`}
                                />
                              </div>

                              {/* Checkbox */}
                              <button onClick={() => updateLog(e.id, setNum, { completed: !isCompleted })}
                                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border cursor-pointer transition-all duration-150 ${
                                  isCompleted
                                    ? 'bg-green border-green text-black'
                                    : 'bg-transparent border-border2 text-transparent hover:border-text-3'
                                }`}>
                                {isCompleted && (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                )}
                              </button>

                              {/* Saving indicator */}
                              {isSaving && (
                                <div className="w-3 h-3 rounded-full border border-accent border-t-transparent animate-spin shrink-0" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Instructions from catalog */}
                    {instructions && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setExpandedInstructions(prev => {
                              const next = new Set(prev)
                              if (next.has(e.id)) next.delete(e.id)
                              else next.add(e.id)
                              return next
                            })
                          }}
                          className="flex items-center gap-1.5 text-[11px] text-text-3 hover:text-accent transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                          Cómo hacer este ejercicio
                        </button>
                        {isExpanded && (
                          <div className="mt-2 text-[12px] text-text-2 leading-relaxed pl-4 border-l-2 border-border2">
                            {instructions}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Notes */}
          {plan.description && (
            <div className={`bg-surface border border-border rounded-xl p-[18px] sm:p-5 mt-4 animate-slide-up ${staggerClass(4)}`}>
              <div className="text-xs font-bold text-text-3 uppercase tracking-[0.05em] mb-2">Notas del plan</div>
              <div className="text-sm text-text-2 leading-relaxed">{plan.description}</div>
            </div>
          )}
        </>
      )}
    </div>

    <style>{`
      .timer-running {
        border-color: var(--accent);
        box-shadow: 0 0 0 1px var(--accent-dim);
      }
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }
    `}</style>
  </>
  );
}
