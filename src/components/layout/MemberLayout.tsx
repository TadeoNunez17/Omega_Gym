import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { SettingsModal } from '@/pages/settings/SettingsModal'

export function MemberLayout() {
  const user = useAuthStore((s) => s.user)
  const initials = user?.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'MB'
  const [showSettings, setShowSettings] = useState(false)

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
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 bg-surface border border-border py-1.5 pl-1.5 pr-3 rounded-full cursor-pointer font-sans hover:bg-surface2 transition-colors">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
              style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>{initials}</div>
            <span className="text-[12px] font-medium text-text-2">{user?.full_name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-3">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>
      <Outlet />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
