import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

const icons: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  members: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M19 11l2 2 4-4"/>',
  plans: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  templates: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
}

const navSections = [
  { label: 'Principal', items: [
    { label: 'Mi panel', href: '/trainer/panel', icon: 'dashboard' },
    { label: 'Mis miembros', href: '/trainer/members', icon: 'members' },
  ]},
  { label: 'Planes', items: [
    { label: 'Mis planes', href: '/trainer/plans', icon: 'plans' },
    { label: 'Plantillas', href: '/trainer/templates', icon: 'templates', badge: 2 },
  ]},
]

export function TrainerLayout() {
  const pathname = useLocation().pathname
  const user = useAuthStore((s) => s.user)
  const initials = user?.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'TR'

  const trainerNavItems = [
    { label: 'Panel', href: '/trainer/panel', icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
    { label: 'Miembros', href: '/trainer/members', icon: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M19 11l2 2 4-4"/>' },
    { label: 'Planes', href: '/trainer/plans', icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' },
  ]

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="fixed top-0 left-0 bottom-0 z-10 flex flex-col border-r border-border hidden lg:flex" style={{ width: 'var(--sidebar-w)', background: 'var(--surface)' }}>
        <div className="px-5 py-[18px] border-b border-border">
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
        </div>

        <nav className="flex-1 overflow-y-auto p-2.5">
          <div className="mb-5">
            <div className="flex items-center gap-1.5 px-2.5 py-2 mb-1 rounded-sm bg-accent-dim border border-accent/15">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[11px] text-accent font-medium">Sesión de entrenador</span>
            </div>
          </div>
          {navSections.map((section) => (
            <div key={section.label} className="mb-5">
              <div className="text-[10px] text-text-3 tracking-[0.1em] uppercase px-2.5 mb-1.5">{section.label}</div>
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.label} to={item.href}
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
            </div>
          ))}
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

      <main className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0" style={{ marginLeft: 'var(--sidebar-w)' }}>
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex items-center justify-around lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {trainerNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} to={item.href}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[56px] min-h-[44px] ${isActive ? 'text-accent' : 'text-text-3'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 1.8}>
                <path d={item.icon} />
              </svg>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
