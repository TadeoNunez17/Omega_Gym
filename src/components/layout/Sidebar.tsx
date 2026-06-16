import { useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { useSidebarStore } from '@/store/sidebar.store'
import { baseNavItems as defaultNavItems, icons as defaultIcons } from './sidebar-config'
import type { NavItem, NavSection } from './sidebar-config'

interface SidebarProps {
  pendingPaymentsCount?: number
  onOpenSettings?: () => void
  navItems?: NavSection[]
  icons?: Record<string, string>
  subtitle?: string
}

export function Sidebar({
  pendingPaymentsCount = 0,
  onOpenSettings,
  navItems: customNavItems,
  icons: customIcons,
  subtitle,
}: SidebarProps) {
  const { isOpen, close } = useSidebarStore()
  const pathname = useLocation().pathname
  const user = useAuthStore((s) => s.user)
  const initials = user ? user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AD'

  const activeNavItems = customNavItems || defaultNavItems
  const activeIcons = customIcons || defaultIcons
  const displayRole = subtitle || (user?.role === 'admin' ? 'Administrador' : user?.role === 'trainer' ? 'Entrenador' : 'Miembro')

  const closeCb = useCallback(() => { close() }, [close])
  useEffect(() => { closeCb() }, [pathname, closeCb])

  const badgeValues: Record<string, number | undefined> = {
    pendingPayments: pendingPaymentsCount || undefined,
  }

  const navItems = activeNavItems.map(section => ({
    ...section,
    items: section.items.map((item: NavItem) => ({
      ...item,
      badge: item.badgeKey ? badgeValues[item.badgeKey] : undefined,
    })),
  }))

  return (
    <>
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--logo-bg)', border: '1px solid var(--logo-border)' }}>
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <text x="12" y="18" fontFamily="serif" fontSize="18" fontWeight="bold" style={{ fill: 'var(--logo-omega)' }} textAnchor="middle">Ω</text>
              </svg>
            </div>
            <div>
              <div className="text-[15px] font-semibold -tracking-[0.01em]">Omega Gym</div>
              <div className="text-[10px] text-text-3 mt-0.5 tracking-[0.08em] uppercase">{displayRole}</div>
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
          {navItems.map((section) => (
            <div key={section.section} className="mb-5">
              <div className="text-[10px] text-text-3 tracking-[0.1em] uppercase px-2.5 mb-1.5">{section.section}</div>
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.label} to={item.href} onClick={close}
                    className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-sm text-[13px] no-underline mb-0.5 transition-all duration-150
                      ${isActive ? 'text-accent bg-accent-dim font-medium' : 'text-text-2 bg-transparent hover:bg-surface2'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                      dangerouslySetInnerHTML={{ __html: activeIcons[item.icon] || '' }}
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
          <button onClick={onOpenSettings}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-sm bg-transparent border-none cursor-pointer font-sans hover:bg-surface2 transition-colors duration-150">
            <div className="w-[30px] h-[30px] rounded-full bg-accent flex items-center justify-center text-[11px] font-semibold text-black flex-shrink-0">{initials}</div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-[12px] font-medium truncate">{user?.full_name || 'Administrador'}</div>
              <div className="text-[10px] text-text-3 truncate">{user?.role === 'admin' ? 'Administrador' : user?.role === 'trainer' ? 'Entrenador' : 'Miembro'}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-3 shrink-0">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  )
}
