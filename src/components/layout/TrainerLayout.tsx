import { useEffect, useCallback } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { useSidebarStore } from '@/store/sidebar.store'

const icons: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  members: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M19 11l2 2 4-4"/>',
  plans: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  templates: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
}

interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}

const navItems: NavItem[] = [
  { label: 'Mi panel', href: '/trainer/panel', icon: 'dashboard' },
  { label: 'Mis miembros', href: '/trainer/members', icon: 'members' },
  { label: 'Mis planes', href: '/trainer/plans', icon: 'plans' },
  { label: 'Plantillas', href: '/trainer/templates', icon: 'templates', badge: 2 },
]

export function TrainerLayout() {
  const { isOpen, toggle, close } = useSidebarStore()
  const pathname = useLocation().pathname
  const user = useAuthStore((s) => s.user)
  const initials = user?.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'TR'

  const closeCb = useCallback(() => { close() }, [close])
  useEffect(() => { closeCb() }, [pathname, closeCb])

  return (
    <div className="min-h-screen bg-bg">
      <div className="hidden lg:flex fixed top-0 left-0 bottom-0 z-10 flex-col items-center border-r border-border bg-surface w-14">
        <button onClick={toggle} className="p-3 border-b border-border w-full flex justify-center hover:bg-surface2 transition-colors text-text-3 hover:text-text">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex-1 flex flex-col items-center gap-1 pt-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} to={item.href}
                className={`p-2.5 rounded-sm transition-colors ${isActive ? 'text-accent bg-accent-dim' : 'text-text-3 hover:text-text-2 hover:bg-surface2'}`}
                title={item.label}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  dangerouslySetInnerHTML={{ __html: icons[item.icon] || '' }} />
              </Link>
            )
          })}
        </div>
        <div className="pb-3 flex flex-col items-center gap-1">
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-semibold"
            style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6' }}
            title={user?.full_name || 'Entrenador'}>
            {initials}
          </div>
          <button onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login' }}
            className="p-2.5 rounded-sm text-text-3 hover:bg-red-bg hover:text-red-text transition-colors"
            title="Cerrar sesión">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={close} />
      )}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col border-r border-border transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 'var(--sidebar-w)', background: 'var(--surface)' }}
      >
        <div className="px-5 py-[18px] border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,45,45,0.35)' }}>
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <text x="12" y="18" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#ff2d2d" textAnchor="middle">Ω</text>
              </svg>
            </div>
            <div>
              <div className="text-[15px] font-semibold -tracking-[0.01em]">Omega Gym</div>
              <div className="text-[10px] text-text-3 mt-0.5 tracking-[0.08em] uppercase">Entrenador</div>
            </div>
          </div>
          <button onClick={close} className="p-1.5 rounded-sm hover:bg-surface2 text-text-3 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2.5">
          <div className="mb-5">
            <div className="flex items-center gap-1.5 px-2.5 py-2 mb-1 rounded-sm bg-accent-dim border border-accent/15">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[11px] text-accent font-medium">Sesión de entrenador</span>
            </div>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.label} to={item.href} onClick={close}
                className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-sm text-[13px] no-underline mb-0.5 transition-all duration-150
                  ${isActive ? 'text-accent bg-accent-dim font-medium' : 'text-text-2 hover:bg-surface2'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  dangerouslySetInnerHTML={{ __html: icons[item.icon] || '' }}
                  className={`flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-red-bg text-red-text text-[10px] font-medium px-[7px] py-[2px] rounded-full">{item.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="px-2.5 py-[14px] border-t border-border">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-sm">
            <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
              style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6' }}>
              {initials}
            </div>
            <div>
              <div className="text-[12px] font-medium">{user?.full_name || 'Entrenador'}</div>
              <div className="text-[10px] text-text-3">Entrenador</div>
            </div>
          </div>
          <button onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login' }}
            className="flex items-center gap-2 w-full px-2.5 py-[9px] mt-1 rounded-sm bg-transparent border-none text-text-3 text-[12px] cursor-pointer font-sans hover:bg-red-bg hover:text-red-text transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex flex-col min-h-screen lg:ml-14">
        <div className="lg:hidden fixed top-3 left-3 z-20">
          <button onClick={toggle} className="p-2 rounded-sm bg-surface border border-border text-text-3 hover:text-text transition-colors">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
