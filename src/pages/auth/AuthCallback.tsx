import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    async function finish() {
      let session = (await supabase.auth.getSession()).data.session

      const code = searchParams.get('code')
      if (!session && code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Auth callback exchange error:', error)
          toast.error('El link de confirmación es inválido o ha expirado.')
          navigate('/login', { replace: true })
          return
        }
        session = data.session
      }

      if (!session) {
        navigate('/login', { replace: true })
        return
      }

      const profile = await authService.getProfile(session.user.id).catch(() => null)
      if (profile?.role === 'admin' || profile?.role === 'trainer') {
        navigate('/dashboard', { replace: true })
        return
      }
      if (profile?.role === 'member') {
        navigate('/my-plan', { replace: true })
        return
      }
      toast.success('Correo confirmado. Inicia sesión para continuar.')
      navigate('/login', { replace: true })
    }

    finish()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <div className="text-[13px] text-text-3">Completando inicio de sesión…</div>
      </div>
    </div>
  )
}