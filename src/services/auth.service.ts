import { supabase } from '@/lib/supabase'

export const authService = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  register: async (params: {
    email?: string
    phone?: string
    password: string
    fullName: string
  }) => {
    if (params.email) {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: { data: { full_name: params.fullName, phone: params.phone } },
      })
      if (error) throw error
      return data
    }
    if (params.phone) {
      const { data, error } = await supabase.auth.signUp({
        phone: params.phone,
        password: params.password,
        options: { data: { full_name: params.fullName } },
      })
      if (error) throw error
      return data
    }
    throw new Error('Se requiere correo electrónico o teléfono')
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
    return data
  },

  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data as Profile | null
  },
}

export interface Profile {
  id: string
  email: string | null
  full_name: string
  alias: string | null
  phone: string | null
  avatar_url: string | null
  role: 'admin' | 'trainer' | 'member'
  is_active: boolean | null
  auth_user_id: string | null
  registration_status: 'pending' | 'claimed' | 'registered'
  created_at: string
  updated_at: string
}
