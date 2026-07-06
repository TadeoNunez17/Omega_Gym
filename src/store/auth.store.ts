import { create } from 'zustand'
import { authService } from '@/services/auth.service'
import type { Profile } from '@/services/auth.service'

interface AuthState {
  user: Profile | null
  loading: boolean
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (params: { email?: string; phone?: string; password: string; fullName: string }) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
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
    await authService.register(params)
    const session = await authService.getSession()
    if (session?.user) {
      const profile = await authService.getProfile(session.user.id)
      set({ user: profile })
    }
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
}))
