import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { baseNavItems, icons } from './sidebar-config'
import { paymentsService } from '@/services/payments.service'
import { useSidebarStore } from '@/store/sidebar.store'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import { SettingsModal } from '@/pages/settings/SettingsModal'

export function AdminLayout() {
  const [pendingCount, setPendingCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const { toggle } = useSidebarStore()
  const pathname = useLocation().pathname
  const user = useAuthStore((s) => s.user)
  const { theme, toggle: toggleTheme } = useThemeStore()
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
          <button onClick={toggleTheme}
            className="p-2.5 rounded-sm text-text hover:bg-surface2 transition-colors"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              dangerouslySetInnerHTML={{ __html: theme === 'dark'
                ? '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />'
                : '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />'
              }} />
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
