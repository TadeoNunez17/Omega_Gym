import { create } from 'zustand'
import { authService } from '@/services/auth.service'
import type { Profile } from '@/services/auth.service'

interface AuthState {
  user: Profile | null
  loading: boolean
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

async function fetchProfile(): Promise<Profile | null> {
  try {
    const res = await fetch('/api/auth/profile')
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
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
        const profile = await fetchProfile()
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
    const profile = await fetchProfile()
    set({ user: profile })
  },

  register: async (email: string, password: string, fullName: string) => {
    await authService.register(email, password, fullName)
    const session = await authService.getSession()
    if (session?.user) {
      const profile = await fetchProfile()
      set({ user: profile })
    }
  },

  logout: async () => {
    await authService.logout()
    set({ user: null })
  },
}))
