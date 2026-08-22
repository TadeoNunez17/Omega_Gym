import { Link, useLocation } from 'react-router-dom'

export interface BottomNavItem {
  label: string
  href?: string
  icon: string
  action?: 'navigate' | 'settings'
}

const defaultItems: BottomNavItem[] = [
  { label: 'Plan', href: '/my-plan', icon: 'plan' },
  { label: 'Membresía', href: '/my-membership', icon: 'membership' },
  ...(import.meta.env.DEV ? [{ label: 'Asistencia', href: '/my-checkins', icon: 'checkin' }] : []),
  { label: 'Perfil', href: '/my-profile', icon: 'profile' },
]

const defaultIcons: Record<string, string> = {
  plan: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>',
  membership: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  payment: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
  checkin: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><polyline points="9 13 12 16 17 11"/>',
  profile: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>',
}

interface Props {
  items?: BottomNavItem[]
  icons?: Record<string, string>
  onSettings?: () => void
}

export function BottomNav({ items, icons, onSettings }: Props) {
  const pathname = useLocation().pathname
  const navItems = items || defaultItems
  const iconPaths = icons || defaultIcons

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border flex items-center justify-around pb-[env(safe-area-inset-bottom,0px)]">
      {navItems.map((item) => {
        const isActive = item.href ? pathname === item.href : false

        if (item.action === 'settings') {
          return (
            <button
              key="settings"
              onClick={onSettings}
              className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1 transition-colors cursor-pointer border-none font-sans bg-transparent"
              style={{ color: 'var(--text-3)' }}
            >
              <svg
                width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                dangerouslySetInnerHTML={{ __html: iconPaths[item.icon] || '' }}
              />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          )
        }

        return (
          <Link
            key={item.href}
            to={item.href || '#'}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1 transition-colors no-underline ${
              isActive ? 'text-accent' : 'text-text-3'
            }`}
          >
            <svg
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={isActive ? 2.2 : 1.8}
              strokeLinecap="round" strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: iconPaths[item.icon] || '' }}
            />
            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
