import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { membersService } from '@/services/members.service'
import { toast } from 'sonner'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const register = useAuthStore((s) => s.register)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [claimProfileId, setClaimProfileId] = useState<string | null>(null)

  useEffect(() => {
    const claimId = searchParams.get('claimProfileId')
    const claimEmail = searchParams.get('claimEmail')
    if (claimId) {
      setClaimProfileId(claimId)
      if (claimEmail) {
        setEmail(decodeURIComponent(claimEmail))
      }
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Completa todos los campos')
      return
    }
    setSubmitting(true)
    try {
      await register(email, password, name)

      if (claimProfileId) {
        const user = useAuthStore.getState().user
        if (user) {
          try {
            await membersService.claimProfile(claimProfileId, user.id)
          } catch {
            // fallback: trigger should have linked it
          }
        }
      }

      const user = useAuthStore.getState().user
      if (user?.role === 'admin') navigate('/dashboard')
      else if (user?.role === 'trainer') navigate('/trainer/panel')
      else if (user?.role === 'member') navigate('/my-plan')
      else navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded p-8">
      <div className="mb-6">
        <div className="text-[18px] font-semibold">{claimProfileId ? 'Completa tu registro' : 'Crear cuenta'}</div>
        <div className="text-[12px] text-text-3 mt-1">
          {claimProfileId
            ? 'Ya verificaste tu identidad. Solo falta crear tu contraseña.'
            : 'Regístrate en el sistema del gimnasio'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[12px] font-medium text-text-2 mb-1.5">Nombre completo</label>
          <input type="text" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg border border-border text-text text-[13px] px-3.5 py-2.5 rounded-sm outline-none font-sans" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-text-2 mb-1.5">Correo electrónico</label>
          <input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bg border border-border text-text text-[13px] px-3.5 py-2.5 rounded-sm outline-none font-sans" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-text-2 mb-1.5">Contraseña</label>
          <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-bg border border-border text-text text-[13px] px-3.5 py-2.5 rounded-sm outline-none font-sans" />
        </div>
        <button type="submit" disabled={submitting}
          className={`w-full py-[11px] rounded-sm border-none text-[14px] font-semibold cursor-pointer font-sans mt-1
            ${submitting ? 'bg-accent-dim text-black/60' : 'bg-accent text-black'}`}>
          {submitting ? 'Registrando...' : claimProfileId ? 'Activar y entrar' : 'Crear cuenta'}
        </button>
      </form>

      <div className="text-center mt-5 text-[12px] text-text-3">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-accent-text no-underline font-medium">Iniciar sesión</Link>
      </div>
    </div>
  )
}
