import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
      const user = useAuthStore.getState().user
      if (user?.role === 'admin') navigate('/dashboard')
      else if (user?.role === 'trainer') navigate('/dashboard')
      else if (user?.role === 'member') navigate('/my-plan')
      else navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  function handleGoogle() {
    toast.info('Próximamente disponible')
  }

  return (
    <div className="bg-surface border border-border rounded p-8">
      <div className="mb-6">
        <div className="text-[18px] font-semibold">Iniciar sesión</div>
        <div className="text-[12px] text-text-3 mt-1">Accede a tu cuenta del gimnasio</div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[12px] font-medium text-text-2 mb-1.5">Correo electrónico</label>
          <input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bg border border-border text-text text-[13px] px-3.5 py-2.5 rounded-sm outline-none font-sans" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-text-2 mb-1.5">Contraseña</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg border border-border text-text text-[13px] px-3.5 py-2.5 rounded-sm outline-none font-sans" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-none border-none text-text-3 cursor-pointer text-[11px] font-sans">
              {showPw ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="button" className="bg-none border-none text-accent-text text-[12px] cursor-pointer font-sans">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <button type="submit" disabled={submitting}
          className={`w-full py-[11px] rounded-sm border-none text-[14px] font-semibold cursor-pointer font-sans mt-1
            ${submitting ? 'bg-accent-dim text-black/60' : 'bg-accent text-black'}`}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-[1px] bg-border" />
        <span className="text-[11px] text-text-3 uppercase tracking-[0.06em] font-medium">o continúa con</span>
        <div className="flex-1 h-[1px] bg-border" />
      </div>

      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 py-[10px] rounded-sm border border-border bg-bg text-text text-[13px] font-medium cursor-pointer hover:bg-surface2 transition-colors duration-150 font-sans"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuar con Google
      </button>

      <div className="text-center mt-5 text-[12px] text-text-3">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-accent-text no-underline font-medium">Registrarse</Link>
      </div>

      {import.meta.env.DEV && (
        <div className="mt-5 p-3 bg-amber-bg/50 rounded-sm text-[11px] text-amber-text leading-relaxed border border-amber/20">
          <strong>Demo:</strong> admin@omega.com / Admin123! &nbsp;·&nbsp; trainer@omega.com / Trainer123! &nbsp;·&nbsp; member@omega.com / Member123!
        </div>
      )}
    </div>
  )
}
