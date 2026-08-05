import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { GoogleButton } from '@/components/ui/atoms/GoogleButton'
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

  return (
    <div className="bg-surface border border-border rounded p-8">
      <div className="mb-6">
        <div className="text-[18px] font-semibold">Iniciar sesión</div>
        <div className="text-[12px] text-text-3 mt-1">Accede a tu cuenta del gimnasio</div>
      </div>

      <GoogleButton />

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-[1px] bg-border" />
        <span className="text-[11px] text-text-3 uppercase tracking-[0.06em] font-medium">o con tu correo</span>
        <div className="flex-1 h-[1px] bg-border" />
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