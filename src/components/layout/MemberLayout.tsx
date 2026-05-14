import { Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function MemberLayout() {
  const user = useAuthStore((s) => s.user)
  const initials = user?.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'MB'

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <header className="sticky top-0 z-20 bg-bg/92 backdrop-blur-[10px] border-b border-border px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] bg-accent rounded-[7px] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" width="16" height="16">
              <path d="M6 6h1v12H6M17 6h1v12h-1M3 9h3M18 9h3M3 15h3M18 15h3M9 12h6"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold -tracking-[0.01em]">Omega Gym</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border py-1.5 pl-1.5 pr-3 rounded-full">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
              style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>{initials}</div>
            <span className="text-[12px] font-medium text-text-2">{user?.full_name}</span>
          </div>
          <button onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login' }}
            className="bg-transparent border border-border text-text-3 text-[12px] px-3 py-1.5 rounded-sm cursor-pointer font-sans">
            Salir
          </button>
        </div>
      </header>
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex items-center justify-around lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <Link to="/my-plan" className="flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[56px] min-h-[44px] text-accent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span className="text-[10px] font-medium">Mi Plan</span>
        </Link>
      </nav>
    </div>
  )
}
