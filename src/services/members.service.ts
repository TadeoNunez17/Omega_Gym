import { supabase } from '@/lib/supabase'

export interface Member {
  id: string
  email: string | null
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: 'admin' | 'trainer' | 'member'
  is_active: boolean
  auth_user_id: string | null
  registration_status: 'pending' | 'claimed' | 'registered'
  created_at: string
  updated_at: string
}

export interface MemberListItem {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  role: 'admin' | 'trainer' | 'member'
  is_active: boolean
  registration_status: 'pending' | 'claimed' | 'registered'
  membership_type: string | null
  membership_end: string | null
  plan_name: string | null
  created_at: string
}

export interface MemberFilters {
  search?: string
  role?: string
  status?: 'active' | 'inactive'
  registration?: 'pending' | 'claimed' | 'registered'
  page?: number
  pageSize?: number
}

function toMemberListItem(raw: any): MemberListItem {
  const membership = raw.memberships?.length > 0 ? raw.memberships[0] : null
  const plan = raw.training_plans?.length > 0 ? raw.training_plans[0] : null
  return {
    id: raw.id,
    full_name: raw.full_name,
    email: raw.email,
    phone: raw.phone,
    role: raw.role,
    is_active: raw.is_active,
    registration_status: raw.registration_status ?? 'registered',
    membership_type: membership?.membership_types?.name ?? null,
    membership_end: membership?.end_date ?? null,
    plan_name: plan?.name ?? null,
    created_at: raw.created_at,
  }
}

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateClaimCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const membersService = {
  getAll: async (filters?: MemberFilters): Promise<{ data: MemberListItem[]; count: number }> => {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        memberships(status, end_date, membership_types(name)),
        training_plans!assigned_to(name)
      `, { count: 'exact' })

    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      )
    }

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }

    if (filters?.status === 'active') {
      query = query.eq('is_active', true)
    } else if (filters?.status === 'inactive') {
      query = query.eq('is_active', false)
    }

    if (filters?.registration) {
      query = query.eq('registration_status', filters.registration)
    }

    const from = ((filters?.page ?? 1) - 1) * (filters?.pageSize ?? 20)
    const to = from + (filters?.pageSize ?? 20) - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return {
      data: (data || []).map(toMemberListItem),
      count: count ?? 0,
    }
  },

  getById: async (id: string): Promise<MemberListItem> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        memberships(status, end_date, membership_types(name)),
        training_plans!assigned_to(name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return toMemberListItem(data)
  },

  create: async (input: {
    full_name: string
    email?: string
    phone?: string
    role?: 'admin' | 'trainer' | 'member'
  }) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        full_name: input.full_name,
        email: input.email || null,
        phone: input.phone || null,
        role: input.role || 'member',
        registration_status: 'pending',
        auth_user_id: null,
      })
      .select()
      .single()

    if (error) throw error
    return data as Member
  },

  update: async (id: string, input: Partial<{
    full_name: string
    email: string
    phone: string
    avatar_url: string
    role: 'admin' | 'trainer' | 'member'
  }>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Member
  },

  toggleActive: async (id: string, active: boolean) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Member
  },

  remove: async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  sendClaimCode: async (profileId: string): Promise<{ sentTo: string[] }> => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, phone, email, full_name')
      .eq('id', profileId)
      .single()

    if (profileError) throw profileError
    if (!profile.phone && !profile.email) {
      throw new Error('El miembro necesita teléfono o email para recibir el código')
    }

    const code = generateClaimCode()
    const hash = await sha256(code)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        claim_code_hash: hash,
        claim_code_expires_at: expiresAt,
      })
      .eq('id', profileId)

    if (updateError) throw updateError

    const sentTo: string[] = []

    if (profile.phone) {
      try {
        const { error: smsError } = await supabase.auth.signInWithOtp({
          phone: profile.phone,
          options: { shouldCreateUser: false },
        })
        if (!smsError) {
          console.log(`[SMS] Código ${code} enviado a ${profile.phone}`)
          sentTo.push(`tel:${profile.phone}`)
        }
      } catch {
        console.log(`[SMS SIMULATED] Código ${code} para ${profile.phone}`)
        sentTo.push(`tel:${profile.phone} (simulado)`)
      }
    }

    if (profile.email) {
      console.log(`[EMAIL SIMULATED] Código ${code} para ${profile.email}`)
      sentTo.push(`email:${profile.email} (simulado)`)
    }

    return { sentTo }
  },

  verifyClaimCode: async (identifier: string, code: string): Promise<{ valid: boolean; profileId: string }> => {
    const isEmail = identifier.includes('@')

    const query = isEmail
      ? supabase.from('profiles').select('id, claim_code_hash, claim_code_expires_at').eq('email', identifier)
      : supabase.from('profiles').select('id, claim_code_hash, claim_code_expires_at').eq('phone', identifier)

    const { data: profiles, error } = await query

    if (error) throw error
    if (!profiles || profiles.length === 0) {
      return { valid: false, profileId: '' }
    }

    const profile = profiles[0]
    if (!profile.claim_code_hash || !profile.claim_code_expires_at) {
      return { valid: false, profileId: '' }
    }

    if (new Date(profile.claim_code_expires_at) < new Date()) {
      return { valid: false, profileId: '' }
    }

    const inputHash = await sha256(code)
    if (inputHash !== profile.claim_code_hash) {
      return { valid: false, profileId: '' }
    }

    return { valid: true, profileId: profile.id }
  },

  getPendingMembers: async (): Promise<MemberListItem[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('registration_status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(toMemberListItem)
  },

  claimProfile: async (profileId: string, authUserId: string) => {
    const { data: duplicate } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', authUserId)
      .neq('id', profileId)
      .maybeSingle()

    if (duplicate) {
      await supabase.from('profiles').delete().eq('id', duplicate.id)
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        auth_user_id: authUserId,
        registration_status: 'claimed',
      })
      .eq('id', profileId)
      .eq('registration_status', 'pending')

    if (error) throw error
  },

  getMonthlyGrowth: async (year?: number): Promise<{ month: number; count: number }[]> => {
    const y = year || new Date().getFullYear()
    const startDate = `${y}-01-01`
    const endDate = `${y}-12-31`

    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('role', 'member')
      .gte('created_at', startDate)
      .lte('created_at', `${endDate}T23:59:59.999Z`)

    if (error) throw error

    const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 }))
    for (const p of data || []) {
      const m = new Date(p.created_at).getMonth()
      months[m].count++
    }

    return months
  },

  getStats: async () => {
    const { count: total, error: err1 } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member')

    const { count: active, error: err2 } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member')
      .eq('is_active', true)

    const { count: pending, error: err3 } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('registration_status', 'pending')

    if (err1 || err2 || err3) throw err1 || err2 || err3
    return {
      total: total ?? 0,
      active: active ?? 0,
      inactive: (total ?? 0) - (active ?? 0),
      pending: pending ?? 0,
    }
  },
}
