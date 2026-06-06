import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { baseNavItems, icons } from './sidebar-config'
import { paymentsService } from '@/services/payments.service'
import { useSidebarStore } from '@/store/sidebar.store'
import { useAuthStore } from '@/store/auth.store'
import { SettingsModal } from '@/pages/settings/SettingsModal'

export function AdminLayout() {
  const [pendingCount, setPendingCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const { toggle } = useSidebarStore()
  const pathname = useLocation().pathname
  const user = useAuthStore((s) => s.user)
  const initials = user ? user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AD'

  useEffect(() => {
    paymentsService.getPendingCount().then(setPendingCount).catch(() => {})
  }, [])

  const collapsedItems = baseNavItems.flatMap(s => s.items)

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
          {collapsedItems.map((item) => {
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
          <button onClick={() => setShowSettings(true)}
            className="w-[30px] h-[30px] rounded-full bg-accent flex items-center justify-center text-[10px] font-semibold text-black cursor-pointer border-none hover:opacity-80 transition-opacity"
            title={user?.full_name || 'Administrador'}>
            {initials}
          </button>
          <button onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-sm text-text-3 hover:bg-surface2 hover:text-text transition-colors"
            title="Configuración">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      <Sidebar pendingPaymentsCount={pendingCount} onOpenSettings={() => setShowSettings(true)} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

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
