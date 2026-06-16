import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function formatPhone(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 10)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
  }

  function isValidPhone(v: string) {
    return /^\d{10}$/.test(v.replace(/[\s\-()]/g, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !password.trim()) {
      toast.error('Completa los campos obligatorios')
      return
    }
    if (password.trim().length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (!email.trim() && !phone.trim()) {
      toast.error('Ingresa al menos correo electrónico o teléfono')
      return
    }
    if (phone.trim() && !isValidPhone(phone)) {
      toast.error('Ingresa un teléfono válido de 10 dígitos')
      return
    }
    setSubmitting(true)
    try {
      await register({
        email: email.trim() || undefined,
        phone: phone.replace(/[\s\-()]/g, '') || undefined,
        password,
        fullName: name.trim(),
      })
      const user = useAuthStore.getState().user
      if (user?.role === 'admin') navigate('/dashboard')
      else if (user?.role === 'trainer') navigate('/trainer/panel')
      else if (user?.role === 'member') navigate('/my-plan')
      else navigate('/')
    } catch (err: unknown) {
      const msg = (err as any)?.message || (err as any)?.error_description || 'Error al registrarse'
      console.error('Register error:', err)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded p-8">
      <div className="mb-6">
        <div className="text-[18px] font-semibold">Crear cuenta</div>
        <div className="text-[12px] text-text-3 mt-1">Regístrate en el sistema del gimnasio</div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[12px] font-medium text-text-2 mb-1.5">Nombre completo</label>
          <input type="text" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg border border-border text-text text-[13px] px-3.5 py-2.5 rounded-sm outline-none font-sans" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[12px] font-medium text-text-2">Correo electrónico</label>
            <span className="text-[10px] text-text-3">o teléfono</span>
          </div>
          <input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bg border border-border text-text text-[13px] px-3.5 py-2.5 rounded-sm outline-none font-sans" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-text-2 mb-1.5">Teléfono <span className="text-text-3 font-normal">(opcional si tienes correo)</span></label>
          <input type="tel" placeholder="311-234-5678" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))}
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
          {submitting ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>

      <div className="text-center mt-5 text-[12px] text-text-3">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-accent-text no-underline font-medium">Iniciar sesión</Link>
      </div>
    </div>
  )
}
