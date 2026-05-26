import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { membersService } from '@/services/members.service'
import { toast } from 'sonner'

type Step = 'identify' | 'code' | 'email'

export default function ClaimAccountPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('identify')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [profileId, setProfileId] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleIdentify(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier.trim()) {
      toast.error('Ingresa tu teléfono o correo electrónico')
      return
    }
    setSubmitting(true)
    try {
      const result = await membersService.verifyClaimCode(identifier.trim(), '')
      if (result.valid) {
        setProfileId(result.profileId)
      }
    } catch {}
    // Always proceed to code step (we'll send the code now)
    setStep('code')
    sendCode()
  }

  async function sendCode() {
    try {
      setSubmitting(true)
      const { data: profiles } = await membersService.getAll({
        search: identifier,
        pageSize: 1,
      })
      if (profiles.length > 0) {
        await membersService.sendClaimCode(profiles[0].id)
        setProfileId(profiles[0].id)
        setProfileEmail(profiles[0].email ?? '')
        toast.success('Código enviado')
      }
    } catch (e: any) {
      toast.error(e.message || 'Error al enviar código')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCodeChange(index: number, value: string) {
    if (value && !/^\d$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`)
      next?.focus()
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'BackwardDelete' || e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        const prev = document.getElementById(`code-${index - 1}`)
        prev?.focus()
      }
    }
  }

  async function handleVerifyCode() {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      toast.error('Ingresa el código completo de 6 dígitos')
      return
    }
    setSubmitting(true)
    try {
      const result = await membersService.verifyClaimCode(identifier, fullCode)
      if (!result.valid) {
        toast.error('Código inválido o expirado')
        setSubmitting(false)
        return
      }
      setProfileId(result.profileId)
      if (!profileEmail) {
        setStep('email')
      } else {
        toast.success('Código verificado')
        navigate(`/register?claimProfileId=${result.profileId}&claimEmail=${encodeURIComponent(profileEmail)}`)
      }
    } catch (e: any) {
      toast.error(e.message || 'Error al verificar código')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSetEmail() {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      toast.error('Ingresa un correo válido')
      return
    }
    setSubmitting(true)
    try {
      await membersService.update(profileId, { email: newEmail.trim() })
      toast.success('Correo guardado')
      navigate(`/register?claimProfileId=${profileId}&claimEmail=${encodeURIComponent(newEmail.trim())}`)
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar correo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded p-8">
      <div className="mb-6">
        <div className="text-[18px] font-semibold">Activar mi cuenta</div>
        <div className="text-[12px] text-text-3 mt-1">
          {step === 'identify' && 'Ingresa tu teléfono o correo para recibir tu código de activación'}
          {step === 'code' && `Ingresa el código de 6 dígitos que enviamos`}
          {step === 'email' && 'Tu cuenta no tiene correo. Ingresa uno para continuar'}
        </div>
      </div>

      {step === 'identify' && (
        <form onSubmit={handleIdentify} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium text-text-2 mb-1.5">
              Teléfono o correo electrónico
            </label>
            <input
              type="text"
              placeholder="ej. 311 234 5678 o correo@ejemplo.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-bg border border-border text-text text-[13px] px-3.5 py-2.5 rounded-sm outline-none font-sans"
            />
          </div>
          <button type="submit" disabled={submitting}
            className={`w-full py-[11px] rounded-sm border-none text-[14px] font-semibold cursor-pointer font-sans mt-1
              ${submitting ? 'bg-accent-dim text-black/60' : 'bg-accent text-black'}`}>
            {submitting ? 'Enviando...' : 'Enviar código'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                className="w-11 h-12 text-center bg-bg border border-border text-text text-[20px] font-semibold rounded-sm outline-none font-sans [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            ))}
          </div>

          <button onClick={handleVerifyCode} disabled={submitting}
            className={`w-full py-[11px] rounded-sm border-none text-[14px] font-semibold cursor-pointer font-sans
              ${submitting ? 'bg-accent-dim text-black/60' : 'bg-accent text-black'}`}>
            {submitting ? 'Verificando...' : 'Verificar código'}
          </button>

          <div className="text-center">
            <button onClick={sendCode} disabled={submitting}
              className="bg-none border-none text-accent-text text-[12px] cursor-pointer font-sans">
              Reenviar código
            </button>
          </div>
        </div>
      )}

      {step === 'email' && (
        <form onSubmit={(e) => { e.preventDefault(); handleSetEmail(); }} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium text-text-2 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full bg-bg border border-border text-text text-[13px] px-3.5 py-2.5 rounded-sm outline-none font-sans"
            />
            <div className="text-[11px] text-text-3 mt-1.5">
              Usaremos este correo para crear tu cuenta. Debe ser el mismo que usarás al registrarte.
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className={`w-full py-[11px] rounded-sm border-none text-[14px] font-semibold cursor-pointer font-sans mt-1
              ${submitting ? 'bg-accent-dim text-black/60' : 'bg-accent text-black'}`}>
            {submitting ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      )}

      <div className="text-center mt-5 text-[12px] text-text-3">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-accent-text no-underline font-medium">Iniciar sesión</Link>
      </div>
    </div>
  )
}
