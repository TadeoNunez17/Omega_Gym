import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.user)
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id)
        if (profile?.role === 'admin') navigate('/dashboard', { replace: true })
        else if (profile?.role === 'trainer') navigate('/dashboard', { replace: true })
        else if (profile?.role === 'member') navigate('/my-plan', { replace: true })
        else navigate('/', { replace: true })
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login', { replace: true })
      }
    })

    return () => { subscription.unsubscribe() }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <div className="text-[13px] text-text-3">Completando inicio de sesión…</div>
      </div>
    </div>
  )
}
