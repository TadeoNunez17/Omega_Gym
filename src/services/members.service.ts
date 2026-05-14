import { supabase } from '@/lib/supabase'

export interface Member {
  id: string
  email: string | null
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: 'admin' | 'trainer' | 'member'
  is_active: boolean
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
  membership_type: string | null
  membership_end: string | null
  plan_name: string | null
  created_at: string
}

export interface MemberFilters {
  search?: string
  role?: string
  status?: 'active' | 'inactive'
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

  getById: async (id: string): Promise<Member | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Member
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

    if (err1 || err2) throw err1 || err2
    return {
      total: total ?? 0,
      active: active ?? 0,
      inactive: (total ?? 0) - (active ?? 0),
    }
  },
}
