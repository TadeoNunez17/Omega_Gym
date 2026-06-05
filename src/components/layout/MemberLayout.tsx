import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function MemberLayout() {
  const user = useAuthStore((s) => s.user)
  const initials = user?.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'MB'

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <header className="sticky top-0 z-20 bg-bg/92 backdrop-blur-[10px] border-b border-border px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center"
            style={{ background: '#0f0f0f', border: '1px solid rgba(255,45,45,0.35)' }}>
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
              <text x="12" y="18" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#ff2d2d" textAnchor="middle">Ω</text>
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
    </div>
  )
}
