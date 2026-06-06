import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store'
import { membershipsService } from '@/services/memberships.service'
import { Chip } from '@/components/ui/atoms/Chip'
import { trainingService, type TrainingPlan, type PlanExercise } from '@/services/training.service'
import { paymentsService, type Payment } from '@/services/payments.service'

const DAY_NAMES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

export default function MyPlanPage() {
  const user = useAuthStore(s => s.user)
  const [day, setDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<any>(null)
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [exercises, setExercises] = useState<PlanExercise[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [trainer, setTrainer] = useState<{ full_name: string } | null>(null)

  useEffect(() => {
    if (!user) return;
    const ctrl = { ignore: false }
    ;(async () => {
      try {
        const [membershipData, planData, paymentsData] = await Promise.all([
          membershipsService.getActiveWithType(user.id),
          trainingService.getByMember(user.id),
          paymentsService.getByMember(user.id),
        ])

        if (ctrl.ignore) return
        setMembership(membershipData)
        setPayments(paymentsData)

        if (planData) {
          setPlan(planData)
          const exs = await trainingService.getExercises(planData.id)
          if (!ctrl.ignore) setExercises(exs)
          if (planData.creator) {
            setTrainer(planData.creator)
          }
        }
      } catch (err) {
        if (!ctrl.ignore) console.error('Error loading MyPlan:', err)
      } finally {
        if (!ctrl.ignore) setLoading(false)
      }
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

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtMoney = (n: number) => '$' + n.toLocaleString('es-MX')

  const lastPayment = payments.length > 0 ? payments[0] : null
  const nextPeriodEnd = membership
    ? new Date(new Date(membership.end_date).getTime() + 86400000 * (membership.membership_types?.duration_days ?? 30))
    : null

  return (
    <div className="max-w-[860px] mx-auto px-6 py-8">
      {/* Hero */}
      <div className="bg-surface border border-border rounded p-7 mb-5 flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent)] to-transparent" />
        <div className="flex items-center gap-[18px]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold shrink-0"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>{initials}</div>
          <div>
            <div className="text-[11px] text-text-3 uppercase tracking-[0.08em] mb-1">Bienvenido de vuelta</div>
            <div className="text-xl font-semibold tracking-tight">{user.full_name}</div>
            <div className="text-xs text-text-3 mt-[3px]">{user.email} · Miembro desde {memberSinceStr}</div>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-[22px] font-semibold tracking-tight" style={{ color: membership ? 'var(--accent)' : 'var(--text-3)' }}>{membership ? daysRemaining : '—'}</div>
            <div className="text-[11px] text-text-3 mt-0.5">Días restantes</div>
          </div>
          <div className="text-right">
            <div className="text-[22px] font-semibold tracking-tight" style={{ color: hasExercises ? 'var(--green-text)' : 'var(--text-3)' }}>{hasExercises ? todayExs.length : '—'}</div>
            <div className="text-[11px] text-text-3 mt-0.5">Ejercicios hoy</div>
          </div>
        </div>
      </div>

      {/* Grid 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Membresía */}
        <div className="bg-surface border border-border rounded overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <div className="text-[13px] font-semibold">Mi membresía</div>
              <div className="text-[11px] text-text-3 mt-0.5">Estado actual de tu suscripción</div>
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
              ['Último pago', lastPayment ? `${fmtMoney(lastPayment.amount)} · ${lastPayment.method}` : '—'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between items-center">
                <span className="text-xs text-text-3">{l}</span>
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
                    <span className="text-xs text-text-3">Progreso de membresía</span>
                    <span className="text-xs font-medium text-accent">{progressPct}%</span>
                  </div>
                  <div className="h-[5px] bg-surface2 rounded-[3px] overflow-hidden">
                    <div className="h-full rounded-[3px] bg-accent transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-text-3 font-mono">{fmtDate(membership.start_date)}</span>
                    <span className="text-[10px] text-text-3 font-mono">{fmtDate(membership.end_date)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Entrenador */}
        <div className="bg-surface border border-border rounded overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <div className="text-[13px] font-semibold">Tu entrenador</div>
              <div className="text-[11px] text-text-3 mt-0.5">Encargado de tu plan</div>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {trainer ? (
              <div className="flex items-center gap-[14px] pb-3.5 border-b border-border">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-semibold shrink-0"
                  style={{ background: 'rgba(244,114,182,0.15)', color: '#f472b6' }}>{trainer.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}</div>
                <div>
                  <div className="text-sm font-semibold">{trainer.full_name}</div>
                  <div className="text-[11px] text-text-3 mt-0.5">Entrenador asignado</div>
                </div>
              </div>
            ) : plan ? (
              <div className="text-xs text-text-3 py-2 text-center">No se pudo cargar la información del entrenador.</div>
            ) : (
              <div className="text-xs text-text-3 py-2 text-center">No tienes un entrenador asignado aún.</div>
            )}
            {trainer && (
              <>
                <ContactItem icon="phone" label="Teléfono" value="—" />
                <ContactItem icon="email" label="Email" value="—" />
                <ContactItem icon="clock" label="Horario de atención" value="—" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Plan de entrenamiento */}
      <div className="bg-surface border border-border rounded overflow-hidden mb-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <div className="text-[13px] font-semibold">Mi plan de entrenamiento</div>
            <div className="text-[11px] text-text-3 mt-0.5">{plan ? `${plan.name}${trainer ? ` · Asignado por ${trainer.full_name}` : ''}` : 'Sin plan asignado'}</div>
            {plan && (
              <div className="inline-flex items-center gap-[5px] bg-accent-dim text-accent text-[10px] font-medium px-2 py-[2px] rounded-full mt-1">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Activo
              </div>
            )}
          </div>
        </div>

        {!plan ? (
          <div className="py-10 text-center flex flex-col items-center gap-[10px]">
            <div className="text-4xl">🏋️</div>
            <div className="text-base font-semibold">Sin plan de entrenamiento</div>
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
                <div className="text-4xl">🧘</div>
                <div className="text-base font-semibold">Día de descanso</div>
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
                    <div key={e.id} className={`flex items-center gap-4 px-5 py-3.5 transition-colors cursor-default ${i < todayExs.length - 1 ? 'border-b border-border' : ''}`}>
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

      {/* Grid 2: pagos + renovación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Historial pagos */}
        <div className="bg-surface border border-border rounded overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <div className="text-[13px] font-semibold">Historial de pagos</div>
              <div className="text-[11px] text-text-3 mt-0.5">Últimas transacciones</div>
            </div>
          </div>
          {payments.length === 0 ? (
            <div className="py-10 text-center text-text-3 text-[13px]">Sin pagos registrados.</div>
          ) : (
            <div className="flex flex-col">
              {payments.slice(0, 10).map((p, i) => (
                <div key={p.id} className={`flex items-center justify-between px-5 py-3 ${i < Math.min(payments.length, 10) - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-center gap-[10px]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${p.status === 'paid' ? 'bg-green-bg text-green-text' : 'bg-amber-bg text-amber-text'}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">{p.method} · {new Date(p.payment_date).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}</div>
                      <div className="text-[11px] text-text-3 mt-0.5 font-mono">{fmtDate(p.payment_date)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[13px] font-semibold font-mono ${p.status === 'paid' ? 'text-green-text' : 'text-amber-text'}`}>{fmtMoney(p.amount)}</div>
                    <div className="text-[10px] text-text-3 mt-0.5">{p.status === 'paid' ? 'Pagado' : p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Renovación + horarios */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="text-[13px] font-semibold">Próxima renovación</div>
            </div>
            <div className="p-5 flex flex-col gap-3.5">
              {membership ? (
                <>
                  <div className={`flex items-center gap-[10px] text-xs px-3.5 py-3 rounded-[var(--radius-sm)] ${
                    daysRemaining <= 7
                      ? 'bg-amber-bg text-amber-text border border-[rgba(245,158,11,0.2)]'
                      : 'bg-surface2 text-text-2 border border-border'
                  }`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Tu membresía vence el <strong className="mx-0.5">{fmtDate(membership.end_date)}</strong>&nbsp;— {daysRemaining} días restantes.
                  </div>
                  <div className="text-xs text-text-3 leading-[1.6]">
                    Para renovar acércate al gym o comunícate con tu entrenador. Acepta: efectivo, tarjeta o transferencia.
                  </div>
                  <div className="flex justify-between text-xs border-t border-border pt-3">
                    <span className="text-text-3">Siguiente periodo</span>
                    <span className="text-text-2 font-medium">
                      {fmtDate(membership.end_date)} → {nextPeriodEnd ? fmtDate(nextPeriodEnd.toISOString().split('T')[0]) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-3">Costo estimado</span>
                    <span className="text-accent font-semibold font-mono">
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
              <div className="text-[13px] font-semibold">Horario del gym</div>
            </div>
            <div className="px-5 py-4 flex flex-col gap-2">
              {[
                ['Lunes – Viernes', '6:00 – 22:00', 'text-text-2'],
                ['Sábados', '7:00 – 18:00', 'text-text-2'],
                ['Domingos', 'Cerrado', 'text-red-text'],
              ].map(([l, v, c]) => (
                <div key={l} className="flex justify-between text-xs">
                  <span className="text-text-3">{l}</span>
                  <span className={`font-mono ${c}`}>{v}</span>
                </div>
              ))}
              <div className="h-px bg-border my-1" />
              <div className="flex items-center gap-1.5">
                <div className="w-[7px] h-[7px] rounded-full bg-green"></div>
                <span className="text-[11px] text-green-text">Abierto ahora</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



function ContactItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const paths: Record<string, string> = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>',
    email: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  };
  return (
    <div className="flex items-center gap-[10px]">
      <div className="w-[30px] h-[30px] rounded-[var(--radius-sm)] bg-surface2 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"
          dangerouslySetInnerHTML={{ __html: paths[icon] || '' }} className="text-text-3" />
      </div>
      <div>
        <div className="text-[11px] text-text-3">{label}</div>
        <div className="text-[13px] text-text-2">{value}</div>
      </div>
    </div>
  );
}
