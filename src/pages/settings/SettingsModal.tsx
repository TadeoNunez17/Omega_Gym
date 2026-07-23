import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import { initials, avatarColor } from '@/lib/helpers'

interface Props {
  open: boolean
  onClose: () => void
}

const sunPath = 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
const moonPath = 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'

export function SettingsModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { theme, toggle } = useThemeStore()
  const ref = useRef<HTMLDivElement>(null)
  const [anim, setAnim] = useState(false)

  useEffect(() => {
    if (!open) { setAnim(false); return }
    const t = setTimeout(() => setAnim(true), 10)
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    ref.current?.focus()
    return () => { clearTimeout(t); document.removeEventListener('keydown', handler) }
  }, [open, onClose])

  if (!open) return null

  const col = avatarColor(user?.id || '')

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Configuración">
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 cursor-pointer ${anim ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div
        ref={ref} tabIndex={-1}
        className={`fixed inset-0 flex items-start justify-center pt-[8vh] sm:pt-[12vh] pointer-events-none transition-all duration-300 ${
          anim ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div
          className="relative w-[360px] max-w-[92vw] rounded-[10px] border border-border2 shadow-2xl outline-none pointer-events-auto"
          style={{ background: 'var(--surface)' }}
      >
        <button onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-sm bg-transparent border border-border text-text-3 cursor-pointer flex items-center justify-center text-[15px] font-sans hover:bg-surface2 transition-colors z-10"
        >✕</button>

        <div className="flex flex-col items-center pt-9 pb-6 px-6">
          <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center text-[18px] font-bold mb-3.5 select-none"
            style={{ background: col.bg, color: col.fg }}>
            {user ? initials(user.full_name) : '??'}
          </div>
          <div className="text-[16px] font-semibold -tracking-[0.01em]">{user?.full_name || 'Usuario'}</div>
          <div className="text-[12px] text-text-3 mt-0.5">{user?.email || '—'}</div>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-[10px] py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.08em]"
            style={{
              background: user?.role === 'admin' ? 'var(--accent-dim)' : user?.role === 'trainer' ? 'var(--pink-bg)' : 'var(--blue-bg)',
              color: user?.role === 'admin' ? 'var(--accent-text)' : user?.role === 'trainer' ? 'var(--pink-text)' : 'var(--blue-text)',
            }}>
            {user?.role === 'admin' ? 'Administrador' : user?.role === 'trainer' ? 'Entrenador' : 'Miembro'}
          </div>
        </div>

        <div className="h-px mx-6" style={{ background: 'var(--border)' }} />

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-text">
                <path d={theme === 'dark' ? moonPath : sunPath} />
              </svg>
              <div>
                <div className="text-[13px] font-medium">Tema {theme === 'dark' ? 'oscuro' : 'claro'}</div>
                <div className="text-[10px] text-text-3 mt-0.5">Cambiar apariencia</div>
              </div>
            </div>
            <button onClick={toggle}
              className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 cursor-pointer border-none outline-none
                ${theme === 'dark' ? 'bg-[#333]' : 'bg-[#ddd]'}`}
              aria-label="Cambiar tema"
            >
              <span className={`absolute left-0 top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200
                ${theme === 'light' ? 'translate-x-[3px]' : 'translate-x-[23px]'}`} />
            </button>
          </div>
        </div>

        <div className="h-px mx-6" style={{ background: 'var(--border)' }} />

        <div className="px-6 py-4 flex flex-col gap-0.5">
          <button onClick={() => { onClose(); navigate(user?.role === 'admin' ? `/members/${user?.id}` : '/my-profile') }}
            className="flex items-center gap-3 w-full px-3 py-[10px] rounded-sm bg-transparent border-none cursor-pointer font-sans transition-colors duration-150
              text-text-2 hover:bg-surface2 hover:text-text text-[13px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-text-3">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Ver perfil
          </button>
          <button onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login' }}
            className="flex items-center gap-3 w-full px-3 py-[10px] rounded-sm bg-transparent border-none cursor-pointer font-sans transition-colors duration-150
              text-red-text hover:bg-red-bg text-[13px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
