import { create } from 'zustand'
import { authService } from '@/services/auth.service'
import type { Profile } from '@/services/auth.service'

export type RegisterResult = { requiresConfirmation: boolean }

interface AuthState {
  user: Profile | null
  loading: boolean
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (params: { email?: string; phone?: string; password: string; fullName: string }) => Promise<RegisterResult>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
  updateProfile: (payload: { full_name: string; phone: string | null; alias: string | null }) => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    set({ loading: true })
    try {
      const session = await authService.getSession()
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id)
        set({ user: profile, initialized: true, loading: false })
      } else {
        set({ initialized: true, loading: false })
      }
    } catch {
      set({ initialized: true, loading: false })
    }
  },

  login: async (email: string, password: string) => {
    await authService.login(email, password)
    const session = await authService.getSession()
    if (session?.user) {
      const profile = await authService.getProfile(session.user.id)
      set({ user: profile })
    }
  },

  register: async (params: { email?: string; phone?: string; password: string; fullName: string }) => {
    const { session, requiresConfirmation } = await authService.register(params)
    if (requiresConfirmation) {
      set({ user: null })
      return { requiresConfirmation }
    }
    if (session?.user) {
      const profile = await authService.getProfile(session.user.id)
      set({ user: profile })
    } else {
      set({ user: null })
    }
    return { requiresConfirmation: false }
  },

  loginWithGoogle: async () => {
    await authService.loginWithGoogle()
  },

  logout: async () => {
    await authService.logout()
    set({ user: null })
  },

  deleteAccount: async () => {
    await authService.deleteAccount()
    await authService.logout()
    set({ user: null })
  },

  updateProfile: async (payload) => {
    const current = get().user
    if (!current) throw new Error('No hay sesión activa')
    const userId = current.auth_user_id || current.id
    await authService.updateProfile(userId, payload)
    const profile = await authService.getProfile(userId)
    set({ user: profile })
  },
}))
