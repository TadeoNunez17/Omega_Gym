import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { membershipsService } from '@/services/memberships.service'
import { Badge } from '@/components/ui/atoms/Badge'
import { LoadingSpinner } from '@/components/ui/atoms/LoadingSpinner'
import { fmtDate, fmtMoney } from '@/lib/helpers'

const staggerClass = (i: number) => {
  const map = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5']
  return map[i] || ''
}

export default function MyMembershipPage() {
  const user = useAuthStore(s => s.user)
  const [loading, setLoading] = useState(true)
  const [membership, setMembership] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    const ctrl = { ignore: false }
    ;(async () => {
      const [active, all] = await Promise.all([
        membershipsService.getActiveWithType(user.id),
        membershipsService.getByMember(user.id),
      ])
      if (ctrl.ignore) return
      if (active) setMembership(active)
      setHistory(all || [])
      setLoading(false)
    })()
    return () => { ctrl.ignore = true }
  }, [user])

  if (loading) return <LoadingSpinner text="Cargando membresía…" />

  const now = new Date()
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysRemaining = membership
    ? Math.max(0, Math.round((new Date(membership.end_date).getTime() - todayLocal.getTime()) / 86400000))
    : 0

  const totalDays = membership
    ? Math.round((new Date(membership.end_date).getTime() - new Date(membership.start_date).getTime()) / 86400000)
    : 1
  const progressPct = totalDays > 0 ? Math.min(100, Math.round(((totalDays - daysRemaining) / totalDays) * 100)) : 0

  return (
    <div className="p-4 sm:p-7 flex-1">
      <div className={`flex items-center gap-3 mb-6 animate-slide-up ${staggerClass(0)}`}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-accent">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
          </svg>
        </div>
        <div>
          <div className="text-[11px] text-text-3">Omega Gym</div>
          <div className="text-[17px] font-semibold -tracking-[0.01em]">Mi membresía</div>
        </div>
      </div>

      {!membership ? (
        <div className={`bg-surface border border-border rounded-xl p-10 flex flex-col items-center gap-4 text-center animate-slide-up ${staggerClass(1)}`}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <div>
            <div className="text-[15px] font-semibold mb-1">Sin membresía activa</div>
            <div className="text-[13px] text-text-3">Acércate a recepción para contratar una membresía.</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_320px] lg:gap-4">
          <div className={`flex flex-col gap-4 animate-slide-up ${staggerClass(1)}`}>
            {daysRemaining <= 7 && (
              <div className="bg-[#2a1f00] border border-[#5a3e00] rounded-xl p-3.5 flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <div className="text-[13px] font-semibold text-[#facc15]">Vence en {daysRemaining} días</div>
                  <div className="text-[12px] text-[#a07a00] mt-0.5">Habla con el gym para renovar tu membresía</div>
                </div>
              </div>
            )}

            <div className="bg-surface border border-border rounded-xl p-5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-[120px] h-[120px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)', opacity: 0.06 }} />
              <div className="absolute -bottom-12 left-8 w-[140px] h-[140px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)', opacity: 0.04 }} />
              <div className="flex justify-between items-start mb-5 relative">
                <div className="min-w-0">
                  <div className="text-[10px] text-text-3 uppercase tracking-[0.5px]">Tipo de membresía</div>
                  <div className="text-[20px] font-medium mt-1 truncate">{membership.membership_types?.name || 'Membresía'}</div>
                </div>
                <Badge variant="green" dot>Activa</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 relative">
                <div>
                  <div className="text-[10px] text-text-3 uppercase tracking-[0.3px]">Inicio</div>
                  <div className="text-[14px] font-medium mt-1">{fmtDate(membership.start_date)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-3 uppercase tracking-[0.3px]">Vence</div>
                  <div className="text-[14px] font-medium mt-1" style={{ color: 'var(--accent)' }}>{fmtDate(membership.end_date)}</div>
                </div>
              </div>
              <div className="mt-[18px] relative">
                <div className="flex justify-between text-[11px] text-text-3 mb-1.5">
                  <span>Período</span>
                  <span className="font-mono" style={{ color: daysRemaining <= 7 ? 'var(--amber-text)' : 'var(--accent)' }}>{progressPct}%</span>
                </div>
                <div className="h-[4px] bg-surface2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, background: daysRemaining <= 7 ? 'var(--amber)' : 'var(--accent)' }} />
                </div>
                <div className="text-[11px] text-text-3 mt-1.5">{daysRemaining} días restantes de {totalDays}</div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-[11px] font-medium text-text-3 uppercase tracking-[0.4px] mb-3">Detalles</div>
              <div className="divide-y divide-[#222]">
                <div className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-[13px] text-text-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Duración
                  </span>
                  <span className="text-[13px] font-medium">{totalDays} días</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-[13px] text-text-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Precio
                  </span>
                  <span className="text-[13px] font-medium">{fmtMoney(membership.membership_types?.price || 0)} MXN</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-[13px] text-text-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Miembro desde
                  </span>
                  <span className="text-[13px] font-medium">{fmtDate(membership.created_at?.split('T')[0] || null)}</span>
                </div>
              </div>
            </div>
          </div>

          {history.length > 1 && (
            <div className={`bg-surface border border-border rounded-xl overflow-hidden animate-slide-up ${staggerClass(2)}`}>
              <div className="px-5 py-4 border-b border-border">
                <div className="text-[11px] font-medium text-text-3 uppercase tracking-[0.4px]">Historial</div>
              </div>
              <div className="flex flex-col px-5">
                {history.map((m, i) => (
                  <div key={m.id} className={`flex items-center justify-between py-2.5 ${i < history.length - 1 ? 'border-b border-[#222]' : ''}`}>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate">{m.membership_types?.name || 'Membresía'}</div>
                      <div className="text-[11px] text-text-3 mt-0.5">{fmtDate(m.start_date)} — {fmtDate(m.end_date)}</div>
                    </div>
                    <span className={`shrink-0 text-[11px] font-medium px-2 py-[3px] rounded-[5px] ${m.status === 'expired' ? 'bg-green-bg text-green-text' : 'bg-red-bg text-red-text'}`}>
                      {m.status === 'expired' ? 'Completada' : 'Cancelada'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
