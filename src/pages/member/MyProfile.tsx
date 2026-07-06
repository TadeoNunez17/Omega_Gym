import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth.store'
import { fmtDate, fmtPhone, avatarColor, initials } from '@/lib/helpers'
import { Badge } from '@/components/ui/atoms/Badge'
import { MetricCard } from '@/components/ui/atoms/MetricCard'
import { LoadingSpinner } from '@/components/ui/atoms/LoadingSpinner'
import { Modal } from '@/components/ui/molecules/Modal'
import { membershipsService } from '@/services/memberships.service'
import { checkInsService } from '@/services/checkIns.service'

const staggerClass = (i: number) => {
  const map = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5']
  return map[i] || ''
}

function IconMember() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
}

export default function MyProfilePage() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [membership, setMembership] = useState<any>(null)
  const [checkinCount, setCheckinCount] = useState(0)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    const ctrl = { ignore: false }
    ;(async () => {
      try {
        const [active, checkins] = await Promise.all([
          membershipsService.getActiveWithType(user.id),
          checkInsService.getByMember(user.id),
        ])
        if (ctrl.ignore) return
        if (active) setMembership(active)
        setCheckinCount(checkins.length)
      } catch (err) {
        console.error('Error loading profile data:', err)
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

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    trainer: 'Entrenador',
    member: 'Miembro',
  }

  const memberSince = new Date(user.created_at)
  const now = new Date()
  const monthsAsMember = (now.getFullYear() - memberSince.getFullYear()) * 12 + now.getMonth() - memberSince.getMonth()

  const handleLogout = () => {
    useAuthStore.getState().logout()
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await useAuthStore.getState().deleteAccount()
      toast.success('Tu cuenta ha sido eliminada')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar la cuenta')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const nameMatches = confirmName.trim() === user.full_name

  return (<>
    <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-surface2 sticky top-0 z-9">
      <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
        <div className="w-4 h-4 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full" width="16" height="16">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span className="text-text-4 mx-0.5">/</span>
        <span className="font-medium text-text-1">Mi perfil</span>
      </div>
      <div />
    </header>
    <div className="p-4 sm:p-7 flex-1">

      <div className={`bg-surface border border-border rounded-xl p-5 sm:p-6 flex flex-col items-center animate-slide-up ${staggerClass(1)}`}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-[26px] font-semibold mb-3"
          style={{ background: ac.bg, color: ac.fg }}>
          {inits}
        </div>
        <div className="text-[18px] font-semibold text-center truncate w-full">{user.full_name}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="accent">{roleLabel[user.role] || user.role}</Badge>
          {membership && (
            <Badge variant="green" dot>{membership.membership_types?.name || 'Activo'}</Badge>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-2.5 mt-4 animate-slide-up ${staggerClass(2)}`}>
        <MetricCard icon={<IconMember />} label="Meses como miembro" value={monthsAsMember} color="accent" />
        <MetricCard icon={<IconCheck />} label="Visitas totales" value={checkinCount} color="green" />
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
                <div className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Miembro desde</div>
                <div className="text-[13px] font-medium mt-0.5">{fmtDate(user.created_at?.split('T')[0] || null)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-6 animate-slide-up ${staggerClass(4)}`}>
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-150"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </button>
      </div>

      <div className={`mt-3 animate-slide-up ${staggerClass(5)}`}>
        <button onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-150"
          style={{ background: 'rgba(220,38,38,0.06)', color: 'rgba(248,113,113,0.7)', border: '1px solid rgba(220,38,38,0.12)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Eliminar cuenta
        </button>
      </div>
    </div>

    <Modal
      open={showDeleteModal}
      onClose={() => { if (!deleting) { setShowDeleteModal(false); setConfirmName('') } }}
      title="Eliminar cuenta"
      compact
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: '#f87171' }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      }
    >
      <div className="text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(220,38,38,0.12)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </div>

        <p className="text-sm font-semibold text-text-1 mb-1">¿Eliminar tu cuenta?</p>
        <p className="text-xs text-text-3 leading-relaxed">
          Perderás acceso a tu cuenta. Tus membresías, pagos e historial se conservarán para que el administrador pueda re-vincular tu perfil después.
        </p>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-3">
        <label className="text-[11px] uppercase tracking-[0.08em] text-text-3 font-semibold">
          Escribe tu nombre completo para confirmar
        </label>
        <input
          type="text"
          value={confirmName}
          onChange={e => setConfirmName(e.target.value)}
          placeholder={user.full_name}
          disabled={deleting}
          className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-sm font-medium text-text-1 outline-none transition-all duration-150 placeholder:text-text-4 disabled:opacity-40"
        />
      </div>

      <button
        onClick={handleDeleteAccount}
        disabled={!nameMatches || deleting}
        className="w-full py-3 rounded-xl text-[13px] font-bold cursor-pointer transition-all duration-150 disabled:cursor-not-allowed"
        style={{
          background: nameMatches && !deleting ? 'rgba(220,38,38,0.9)' : 'rgba(220,38,38,0.15)',
          color: nameMatches && !deleting ? '#fff' : 'rgba(248,113,113,0.4)',
          border: nameMatches && !deleting ? '1px solid rgba(220,38,38,0.4)' : '1px solid rgba(220,38,38,0.08)',
        }}>
        {deleting ? 'Eliminando...' : 'Eliminar mi cuenta'}
      </button>
    </Modal>
    </>
  )
}
