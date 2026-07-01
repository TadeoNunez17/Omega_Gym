import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { supabase } from '@/lib/supabase'
import { fmtDate, fmtPhone, avatarColor, initials } from '@/lib/helpers'
import { Badge } from '@/components/ui/atoms/Badge'
import { MetricCard } from '@/components/ui/atoms/MetricCard'
import { LoadingSpinner } from '@/components/ui/atoms/LoadingSpinner'
import { IconEdit } from '@/lib/icons'

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function todayStr() {
  const n = new Date()
  return `${n.getDate()} ${MONTHS[n.getMonth()]} ${n.getFullYear()}`
}

const staggerClass = (i: number) => {
  const map = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6']
  return map[i] || ''
}

function IconPlan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function IconTemplate() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function IconMember() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function TrainerProfilePage() {
  const user = useAuthStore(s => s.user)
  const [loading, setLoading] = useState(true)
  const [totalPlans, setTotalPlans] = useState(0)
  const [totalTemplates, setTotalTemplates] = useState(0)
  const [membersTraining, setMembersTraining] = useState(0)
  const [recentPlans, setRecentPlans] = useState<{ id: string; name: string; assigned_to_name: string | null; created_at: string }[]>([])

  useEffect(() => {
    if (!user) return
    const ctrl = { ignore: false }
    ;(async () => {
      try {
        const userId = user.id

        const [{ count: tp }, { count: tt }, { data: assigned }, { data: plans }] = await Promise.all([
          supabase.from('training_plans').select('*', { count: 'exact', head: true }).eq('created_by', userId).eq('is_template', false),
          supabase.from('training_plans').select('*', { count: 'exact', head: true }).eq('created_by', userId).eq('is_template', true),
          supabase.from('training_plans').select('assigned_to').eq('created_by', userId).eq('is_template', false).not('assigned_to', 'is', null),
          supabase.from('training_plans').select(`
            id, name, created_at,
            member:profiles!training_plans_assigned_to_fkey(full_name)
          `).eq('created_by', userId).eq('is_template', false).not('assigned_to', 'is', null).order('created_at', { ascending: false }).limit(5),
        ])

        if (ctrl.ignore) return
        setTotalPlans(tp ?? 0)
        setTotalTemplates(tt ?? 0)
        setMembersTraining(new Set(assigned?.map(a => a.assigned_to).filter(Boolean) ?? []).size)
        setRecentPlans((plans ?? []).map(p => ({
          id: p.id,
          name: p.name,
          assigned_to_name: (p as any).member?.full_name ?? null,
          created_at: p.created_at,
        })))
      } catch (err) {
        console.error('Error loading trainer profile:', err)
      }
      if (!ctrl.ignore) setLoading(false)
    })()
    return () => { ctrl.ignore = true }
  }, [user])

  if (!user) {
    return (
      <div className="p-4 sm:p-7 flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-sm text-text-3">Inicia sesión para ver tu perfil.</div>
      </div>
    )
  }

  if (loading) return <LoadingSpinner text="Cargando perfil…" />

  const ac = avatarColor(user.full_name)
  const inits = initials(user.full_name)

  const handleLogout = () => {
    useAuthStore.getState().logout()
  }

  return (
    <>
      <div className="noise-overlay" />
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-surface2 sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          <div className="w-4 h-4 shrink-0 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          <span className="text-text-4 mx-0.5">/</span>
          <span className="font-medium text-text-1">Mi perfil</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[11px] sm:text-[12px] text-text-3 font-mono bg-surface border border-border px-2.5 sm:px-3 py-1.5 rounded-sm hidden sm:inline">{todayStr()}</span>
        </div>
      </header>
      <div className="p-4 sm:p-7 flex-1">

      <div className={`bg-surface border border-border rounded-xl p-5 sm:p-6 flex flex-col items-center animate-slide-up ${staggerClass(1)}`}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-[26px] font-semibold mb-3"
          style={{ background: ac.bg, color: ac.fg }}>
          {inits}
        </div>
        <div className="text-[18px] font-semibold text-center truncate w-full">{user.full_name}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="accent">Entrenador</Badge>
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-2.5 mt-4 animate-slide-up ${staggerClass(2)}`}>
        <MetricCard icon={<IconPlan />} label="Planes activos" value={totalPlans} color="blue" />
        <MetricCard icon={<IconTemplate />} label="Plantillas" value={totalTemplates} color="accent" />
        <MetricCard icon={<IconMember />} label="Miembros" value={membersTraining} color="green" />
      </div>

      <div className={`bg-surface border border-border rounded-xl overflow-hidden mt-4 animate-slide-up ${staggerClass(3)}`}>
        <div className="divide-y divide-[#222]">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Email</div>
                <div className="text-[13px] font-medium mt-0.5 truncate">{user.email || '—'}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <div>
                <div className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Teléfono</div>
                <div className="text-[13px] font-medium mt-0.5">{fmtPhone(user.phone)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><polyline points="9 13 12 16 17 11"/></svg>
              </div>
              <div>
                <div className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Entrenador desde</div>
                <div className="text-[13px] font-medium mt-0.5">{fmtDate(user.created_at?.split('T')[0] || null)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-2.5 mt-4 animate-slide-up ${staggerClass(4)}`}>
        <Link to="/trainer/plans"
          className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-150 hover:brightness-110"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
          <span>Ver mis planes</span>
          <IconArrowRight />
        </Link>
        <Link to="/trainer/members"
          className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-150 hover:brightness-110"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span>Ver miembros</span>
          <IconArrowRight />
        </Link>
      </div>

      {recentPlans.length > 0 && (
        <div className={`bg-surface border border-border rounded-xl overflow-hidden mt-4 animate-slide-up ${staggerClass(5)}`}>
          <div className="px-5 sm:px-6 py-4 border-b border-border">
            <div className="text-[13px] font-semibold">Planes recientes</div>
          </div>
          <div className="divide-y divide-[#222]">
            {recentPlans.map((plan) => (
              <Link key={plan.id} to="/trainer/plans"
                className="flex items-center justify-between px-5 sm:px-6 py-3.5 hover:bg-surface2 transition-colors">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{plan.name}</div>
                  {plan.assigned_to_name && (
                    <div className="text-[11px] text-text-3 mt-0.5">Para {plan.assigned_to_name}</div>
                  )}
                </div>
                <div className="text-[11px] text-text-3 shrink-0 ml-3">{fmtDate(plan.created_at?.split('T')[0] || null)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className={`mt-6 animate-slide-up ${staggerClass(5)}`}>
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-150"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </button>
      </div>
      </div>
    </>
  )
}
