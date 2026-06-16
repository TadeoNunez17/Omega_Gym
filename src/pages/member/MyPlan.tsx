import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store'
import { membershipsService } from '@/services/memberships.service'
import { Chip } from '@/components/ui/atoms/Chip'
import { Badge } from '@/components/ui/atoms/Badge'
import { IconButton } from '@/components/ui/atoms/IconButton'
import { Modal } from '@/components/ui/molecules/Modal'
import { trainingService, type TrainingPlan, type PlanExercise } from '@/services/training.service'
import { paymentsService, type Payment } from '@/services/payments.service'

const DAY_NAMES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const METHOD_LABEL: Record<string, string> = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };

const NOISE = "data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

const staggerClass = (i: number) => {
  const map = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6', 'stagger-7'];
  return map[i] || '';
};

function IconMembership() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>;
}

function IconPlan() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
}
function IconPayment() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}
function IconRenewal() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
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
  const [membership, setMembership] = useState<any>(null)
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [exercises, setExercises] = useState<PlanExercise[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null)


  useEffect(() => {
    if (!user) return;
    const ctrl = { ignore: false }
    ;(async () => {
      const [membershipResult, planResult, paymentsResult] = await Promise.allSettled([
        membershipsService.getActiveWithType(user.id),
        trainingService.getByMember(user.id),
        paymentsService.getByMember(user.id),
      ])

      if (ctrl.ignore) return

      if (membershipResult.status === 'fulfilled') {
        setMembership(membershipResult.value)
      }
      if (paymentsResult.status === 'fulfilled') {
        setPayments(paymentsResult.value)
      }
      if (planResult.status === 'fulfilled' && planResult.value) {
        setPlan(planResult.value)
        try {
          const exs = await trainingService.getExercises(planResult.value.id)
          if (!ctrl.ignore) setExercises(exs)
        } catch (err) {
          console.error('Error loading exercises:', err)
        }

      }

      if (!ctrl.ignore) setLoading(false)
    })()
    return () => { ctrl.ignore = true }
  }, [user])

  if (loading || !user) {
    return (
      <div className="max-w-[860px] mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
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

  const now = new Date()
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysRemaining = membership
    ? (() => {
        const [y, mo, d] = membership.end_date.split('-').map(Number)
        const endLocal = new Date(y, mo - 1, d)
        return Math.max(0, Math.round((endLocal.getTime() - todayLocal.getTime()) / 86400000))
      })()
    : 0

  const totalDays = membership
    ? Math.round((new Date(membership.end_date).getTime() - new Date(membership.start_date).getTime()) / 86400000)
    : 1
  const progressPct = totalDays > 0 ? Math.min(100, Math.round(((totalDays - daysRemaining) / totalDays) * 100)) : 0

  const initials = user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'
  const memberSince = new Date(user.created_at)
  const memberSinceStr = memberSince.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })

  const dayOfWeek = now.getDay()
  const hour = now.getHours() + now.getMinutes() / 60
  const isOpen = dayOfWeek !== 0 && (dayOfWeek !== 6 ? (hour >= 7 && hour < 22) : (hour >= 7 && hour < 13))

  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = user.full_name.split(' ')[0]
  const avatarColors = ['#60a5fa', '#f59e0b', '#22c55e', '#a78bfa', '#f472b6', '#38bdf8', '#fb923c']
  const avatarColor = avatarColors[user.full_name.length % avatarColors.length]

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtMoney = (n: number) => '$' + n.toLocaleString('es-MX')

  const lastPayment = payments.length > 0 ? payments[0] : null
  const nextPeriodEnd = membership
    ? new Date(new Date(membership.end_date).getTime() + 86400000 * (membership.membership_types?.duration_days ?? 30))
    : null

  return (
    <div className="max-w-[860px] mx-auto px-6 py-8">
      <div className={`animate-slide-up ${staggerClass(0)}`}>
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
                <div className="text-[28px] sm:text-[34px] leading-tight font-display italic -tracking-[0.02em]">¡{greeting}, {firstName}! 👋</div>
                <div className="text-xs text-text-3 mt-1 truncate">{user.email} · Miembro desde {memberSinceStr}</div>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="bg-surface2 border border-border rounded-[var(--radius-sm)] px-4 py-3 text-center min-w-[90px]">
                <div className="text-xl font-semibold tracking-tight font-mono" style={{ color: membership ? 'var(--accent)' : 'var(--text-3)' }}>{membership ? daysRemaining : '—'}</div>
                <div className="text-[10px] text-text-3 mt-[1px]">Días rest.</div>
              </div>
              <div className="bg-surface2 border border-border rounded-[var(--radius-sm)] px-4 py-3 text-center min-w-[90px]">
                <div className="text-xl font-semibold tracking-tight font-mono" style={{ color: hasExercises ? 'var(--green-text)' : 'var(--text-3)' }}>{hasExercises ? todayExs.length : '—'}</div>
                <div className="text-[10px] text-text-3 mt-[1px]">Ejerc. hoy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`mb-5 animate-slide-up ${staggerClass(1)}`}>
        <div className="bg-surface border border-border rounded overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>
                <div className="w-3.5 h-3.5"><IconMembership /></div>
              </div>
              <div>
                <div className="text-[13px] font-semibold">Mi membresía</div>
                <div className="text-[11px] text-text-3 mt-0.5">Estado actual de tu suscripción</div>
              </div>
            </div>
            {membership ? (
              <span className="inline-flex items-center gap-[5px] px-[10px] py-[3px] rounded-full text-[11px] font-medium bg-green-bg text-green-text">
                <span className="w-[5px] h-[5px] rounded-full bg-green"></span>Activa
              </span>
            ) : (
              <span className="inline-flex items-center gap-[5px] px-[10px] py-[3px] rounded-full text-[11px] font-medium bg-red-bg text-red-text">
                <span className="w-[5px] h-[5px] rounded-full bg-red"></span>Sin membresía
              </span>
            )}
          </div>
          <div className="p-5 flex flex-col gap-4">
            {membership ? [
              ['Tipo de plan', membership.membership_types?.name ?? '—'],
              ['Fecha de inicio', fmtDate(membership.start_date)],
              ['Fecha de vencimiento', fmtDate(membership.end_date)],
              ['Último pago', lastPayment ? `${fmtMoney(lastPayment.amount)} · ${METHOD_LABEL[lastPayment.method] || lastPayment.method}` : '—'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between items-center">
                <span className="text-[11px] text-text-3">{l}</span>
                <span className="text-[13px] font-mono font-medium">{v}</span>
              </div>
            )) : (
              <div className="text-[13px] text-text-3 text-center py-3">No tienes una membresía activa. Acércate a recepción para contratar una.</div>
            )}
            {membership && (
              <>
                <div className="h-px bg-border mx-0" />
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[11px] text-text-3">Progreso de membresía</span>
                    <span className="text-[11px] font-medium text-accent">{progressPct}%</span>
                  </div>
                  <div className="h-[5px] bg-surface2 rounded-[3px] overflow-hidden">
                    <div className="h-full rounded-[3px] bg-accent transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-text-3 font-mono">{fmtDate(membership.start_date)}</span>
                    <span className="text-[10px] text-text-3 font-mono">{totalDays - daysRemaining}/{totalDays} días</span>
                    <span className="text-[10px] text-text-3 font-mono">{fmtDate(membership.end_date)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      <div className={`bg-surface border border-border rounded overflow-hidden mb-5 animate-slide-up ${staggerClass(3)}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>
              <div className="w-3.5 h-3.5"><IconPlan /></div>
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
            <div className="flex gap-1.5 px-5 py-4 border-b border-border overflow-x-auto">
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
              <div className="flex flex-col">
                {todayExs.length === 0 && !isRest && exercises.length > 0 ? (
                  <div className="py-10 text-center text-text-3 text-[13px]">No hay ejercicios registrados para este día.</div>
                ) : todayExs.length === 0 ? (
                  <div className="py-10 text-center text-text-3 text-[13px]">No hay ejercicios en este plan aún.</div>
                ) : (
                  todayExs.map((e, i) => (
                    <div key={e.id} className={`flex items-center gap-4 px-5 py-3.5 row-hover transition-colors cursor-default ${i < todayExs.length - 1 ? 'border-b border-border' : ''}`}>
                      <div className="w-7 h-7 rounded-full bg-surface2 border border-border2 flex items-center justify-center text-[11px] font-semibold text-text-3 shrink-0">{i + 1}</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium">{e.exercise_name}</div>
                        {e.notes && <div className="text-[11px] text-text-3 mt-0.5"> · {e.notes}</div>}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Chip value={e.sets ?? '—'} label="Series" accent />
                        <Chip value={e.reps ?? '—'} label="Reps" />
                        <Chip value={e.rest_seconds ? `${e.rest_seconds}s` : '—'} label="Descanso" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up ${staggerClass(4)}`}>
        <div className="bg-surface border border-border rounded overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                <div className="w-3.5 h-3.5"><IconPayment /></div>
              </div>
              <div>
                <div className="text-[13px] font-semibold">Historial de pagos</div>
                <div className="text-[11px] text-text-3 mt-0.5">Últimas transacciones</div>
              </div>
            </div>
          </div>
          {payments.length === 0 ? (
            <div className="py-10 text-center text-text-3 text-[13px]">Sin pagos registrados.</div>
          ) : (
            <div className="flex flex-col">
              {payments.slice(0, 10).map((p, i) => (
                <div key={p.id} className={`flex items-center justify-between px-5 py-3 row-hover transition-colors group/row ${i < Math.min(payments.length, 10) - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-center gap-[10px] min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${p.status === 'paid' ? 'bg-green-bg/20 text-green-text' : 'bg-amber-bg/20 text-amber-text'}`}>
                      {p.method === 'cash' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /></svg>}
                      {p.method === 'card' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>}
                      {p.method === 'transfer' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate">{p.concept || 'Membresía'}</div>
                      <div className="text-[11px] text-text-3 mt-0.5">{METHOD_LABEL[p.method] || p.method} · {fmtDate(p.payment_date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className={`text-[13px] font-semibold font-mono ${p.status === 'paid' ? 'text-green-text' : 'text-amber-text'}`}>{fmtMoney(p.amount)}</div>
                    <div className="flex items-center gap-1">
                      <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${p.status === 'paid' ? 'bg-green' : 'bg-amber'}`} />
                      <span className="text-[10px] text-text-3">{p.status === 'paid' ? 'Pagado' : 'Pendiente'}</span>
                    </div>
                    <IconButton title="Ver recibo" onClick={() => setReceiptPayment(p)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40 group-hover/row:opacity-100 transition-opacity"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>
                  <div className="w-3.5 h-3.5"><IconRenewal /></div>
                </div>
                <div className="text-[13px] font-semibold">Próxima renovación</div>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3.5">
              {membership ? (
                <>
                  <div className={`flex items-center gap-4 px-4 py-3.5 rounded-[var(--radius-sm)] ${
                    daysRemaining <= 7
                      ? 'bg-amber-bg/20 border border-[rgba(245,158,11,0.2)]'
                      : 'bg-surface2 border border-border'
                  }`}>
                    <div className="text-center shrink-0">
                      <div className={`text-[26px] font-semibold font-mono leading-none tracking-tight ${
                        daysRemaining <= 7 ? 'text-amber-text' : 'text-accent'
                      }`}>{daysRemaining}</div>
                      <div className="text-[10px] text-text-3 mt-[2px]">días rest.</div>
                    </div>
                    <div className="h-9 w-px bg-border" />
                    <div className="flex items-center gap-2 min-w-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="shrink-0 text-text-3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium">Vence el <span className="font-mono">{fmtDate(membership.end_date)}</span></div>
                        <div className="text-[10px] text-text-3 mt-[1px]">Renueva antes para mantener tu plan activo.</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-text-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" className="shrink-0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    <span>Renueva en el gym · Aceptamos</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-flex items-center gap-[3px] bg-surface2 text-text-2 text-[10px] font-medium px-1.5 py-[2px] rounded-[3px]">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /></svg>
                        Efectivo
                      </span>
                      <span className="inline-flex items-center gap-[3px] bg-surface2 text-text-2 text-[10px] font-medium px-1.5 py-[2px] rounded-[3px]">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                        Tarjeta
                      </span>
                      <span className="inline-flex items-center gap-[3px] bg-surface2 text-text-2 text-[10px] font-medium px-1.5 py-[2px] rounded-[3px]">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
                        Transferencia
                      </span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-border pt-3">
                    <span className="text-[11px] text-text-3">Siguiente periodo</span>
                    <span className="font-mono text-[12px] text-text-2 font-medium">
                      {fmtDate(membership.end_date)} → {nextPeriodEnd ? fmtDate(nextPeriodEnd.toISOString().split('T')[0]) : '—'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[11px] text-text-3">Costo estimado</span>
                    <span className="text-accent font-semibold font-mono text-[13px]">
                      {membership.membership_types ? fmtMoney(membership.membership_types.price) : '—'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-[13px] text-text-3 text-center py-3">No tienes una membresía activa para renovar.</div>
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: isOpen ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: isOpen ? '#22c55e' : '#ef4444' }}>
                  <div className="w-3.5 h-3.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                </div>
                <div className="text-[13px] font-semibold">Horario del gym</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-[7px] h-[7px] rounded-full ${isOpen ? 'bg-green' : 'bg-red'}`} />
                <span className={`text-[11px] ${isOpen ? 'text-green-text' : 'text-red-text'}`}>{isOpen ? 'Abierto ahora' : 'Cerrado ahora'}</span>
              </div>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              {([
                ['Lunes – Viernes', '7:00 – 22:00', false],
                ['Sábados', '7:00 – 13:00', false],
                ['Domingos', 'Cerrado', true],
              ] as [string, string, boolean][]).map(([l, v, isClosed]) => (
                <div key={l} className="flex justify-between items-center">
                  <span className="text-[12px] font-medium text-text-2">{l}</span>
                  {isClosed ? (
                    <span className="inline-flex items-center gap-1 bg-red-bg/20 text-red-text text-[10px] font-medium px-1.5 py-[2px] rounded-[3px]">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      Cerrado
                    </span>
                  ) : (
                    <span className="font-mono text-[12px] text-text-2">{v}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal compact icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
      } title="COMPROBANTE" open={receiptPayment !== null} onClose={() => setReceiptPayment(null)}>
        {receiptPayment && (
          <>
            <div className="flex flex-col items-center mb-5">
              <div className="w-11 h-11 rounded-full flex items-center justify-center bg-accent-dim mb-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
              </div>
              <div className="text-[28px] font-semibold font-mono leading-none -tracking-[0.03em]" style={{ color: receiptPayment.status === 'paid' ? 'var(--green-text)' : 'var(--amber-text)' }}>
                <span>{fmtMoney(receiptPayment.amount)}</span>
              </div>
              <div className="mt-2">
                {receiptPayment.status === 'paid' ? <Badge variant="green" dot>Pagado</Badge> : receiptPayment.status === 'pending' ? <Badge variant="amber" dot>Pendiente</Badge> : <Badge variant="red" dot>Cancelado</Badge>}
              </div>
            </div>

            <div className="border-t border-dashed border-border pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Concepto</span>
                <span className="text-[12px] text-right max-w-[200px]">{receiptPayment.concept || 'Membresía'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Método</span>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium">
                  {receiptPayment.method === 'cash' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /></svg>}
                  {receiptPayment.method === 'card' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>}
                  {receiptPayment.method === 'transfer' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>}
                  {METHOD_LABEL[receiptPayment.method] || receiptPayment.method}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Fecha</span>
                <span className="text-[12px]">{fmtDate(receiptPayment.payment_date)}</span>
              </div>

              {receiptPayment.notes && (
                <div className="flex justify-between items-start">
                  <span className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Notas</span>
                  <span className="text-[11px] text-text-2 text-right max-w-[200px] italic">{receiptPayment.notes}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-border mt-4 pt-3 flex justify-center">
              <span className="text-[10px] text-text-3 tracking-[0.08em]">omega gym · recibo #{receiptPayment.id.slice(0, 8)}</span>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}



