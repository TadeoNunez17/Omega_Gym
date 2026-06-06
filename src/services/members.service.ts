import { supabase } from '@/lib/supabase'

function escapeSearch(s: string): string {
  return s.replace(/[%_\\]/g, '\\$&')
}

export interface Member {
  id: string
  email: string | null
  full_name: string
  alias: string | null
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
  alias: string | null
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
    alias: raw.alias,
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
      const escaped = escapeSearch(filters.search)
      query = query.or(
        `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`
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
    role?: 'admin' | 'trainer' | 'member'
  }) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        full_name: input.full_name,
        role: input.role || 'member',
        registration_status: 'pending',
        auth_user_id: null,
      })
      .select()
      .single()

    if (error) throw error
    return data as Member
  },

  linkPendingProfile: async (pendingId: string, registeredId: string) => {
    const { data: registered, error: err1 } = await supabase
      .from('profiles')
      .select('auth_user_id, email, phone, full_name')
      .eq('id', registeredId)
      .single()

    if (err1 || !registered) throw new Error('Perfil registrado no encontrado')
    if (!registered.auth_user_id) throw new Error('El perfil registrado no tiene auth_user_id')

    const { error: err2 } = await supabase
      .from('profiles')
      .update({
        auth_user_id: registered.auth_user_id,
        email: registered.email,
        phone: registered.phone,
        full_name: registered.full_name,
        registration_status: 'registered',
      })
      .eq('id', pendingId)

    if (err2) throw err2

    const { error: err3 } = await supabase
      .from('profiles')
      .delete()
      .eq('id', registeredId)

    if (err3) throw err3
  },

  getUnlinkedCandidates: async (search?: string): Promise<{
    id: string
    full_name: string
    alias: string | null
    email: string | null
    phone: string | null
    created_at: string
  }[]> => {
    let query = supabase
      .from('profiles')
      .select('id, full_name, alias, email, phone, created_at')
      .not('auth_user_id', 'is', null)
      .eq('registration_status', 'registered')

    if (search) {
      const escaped = escapeSearch(search)
      query = query.or(
        `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`
      )
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return (data || []) as {
      id: string
      full_name: string
      alias: string | null
      email: string | null
      phone: string | null
      created_at: string
    }[]
  },

  update: async (id: string, input: Partial<{
    full_name: string
    email: string
    phone: string
    avatar_url: string
    alias: string
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

  getPendingMembers: async (): Promise<MemberListItem[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('registration_status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(toMemberListItem)
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
