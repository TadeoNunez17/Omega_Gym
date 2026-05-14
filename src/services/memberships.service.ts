import { supabase } from '@/lib/supabase'

export interface MembershipType {
  id: string
  name: string
  price: number
  duration_days: number
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Membership {
  id: string
  member_id: string
  type_id: string
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled'
  created_at: string
}

export interface MembershipListItem {
  id: string
  member_id: string
  member_name: string
  member_email: string | null
  type_name: string
  start_date: string
  end_date: string
  status: string
  days_remaining: number
  payment_status: 'paid' | 'pending' | null
}

export const membershipsService = {
  // ---- Membership Types ----

  getTypes: async (): Promise<MembershipType[]> => {
    const { data, error } = await supabase
      .from('membership_types')
      .select('*')
      .order('price')

    if (error) throw error
    return (data || []) as MembershipType[]
  },

  getActiveTypes: async (): Promise<MembershipType[]> => {
    const { data, error } = await supabase
      .from('membership_types')
      .select('*')
      .eq('is_active', true)
      .order('price')

    if (error) throw error
    return (data || []) as MembershipType[]
  },

  createType: async (input: {
    name: string
    price: number
    duration_days: number
    description?: string
  }) => {
    const { data, error } = await supabase
      .from('membership_types')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data as MembershipType
  },

  updateType: async (id: string, input: Partial<{
    name: string
    price: number
    duration_days: number
    description: string
  }>) => {
    const { data, error } = await supabase
      .from('membership_types')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as MembershipType
  },

  toggleTypeActive: async (id: string) => {
    const { data: current } = await supabase
      .from('membership_types')
      .select('is_active')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('membership_types')
      .update({ is_active: !current?.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as MembershipType
  },

  // ---- Memberships ----

  getAll: async (filters?: {
    status?: string
    search?: string
    page?: number
    pageSize?: number
  }): Promise<{ data: MembershipListItem[]; count: number }> => {
    let query = supabase
      .from('memberships')
      .select(`
        *,
        profiles!member_id(full_name, email),
        membership_types(name)
      `, { count: 'exact' })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const from = ((filters?.page ?? 1) - 1) * (filters?.pageSize ?? 20)
    const to = from + (filters?.pageSize ?? 20) - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    const now = new Date()
    const items: MembershipListItem[] = (data || []).map((m: any) => {
      const end = new Date(m.end_date)
      const daysRemaining = Math.round((end.getTime() - now.getTime()) / 86400000)
      return {
        id: m.id,
        member_id: m.member_id,
        member_name: m.profiles?.full_name ?? '—',
        member_email: m.profiles?.email ?? null,
        type_name: m.membership_types?.name ?? '—',
        start_date: m.start_date,
        end_date: m.end_date,
        status: m.status,
        days_remaining: daysRemaining,
        payment_status: null,
      }
    })

    return { data: items, count: count ?? 0 }
  },

  getByMember: async (memberId: string): Promise<Membership[]> => {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Membership[]
  },

  getActiveByMember: async (memberId: string): Promise<Membership | null> => {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('member_id', memberId)
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString().split('T')[0])
      .gte('end_date', new Date().toISOString().split('T')[0])
      .maybeSingle()

    if (error) throw error
    return data as Membership | null
  },

  assign: async (input: {
    member_id: string
    type_id: string
    start_date?: string
  }) => {
    const { data: typeData, error: typeError } = await supabase
      .from('membership_types')
      .select('duration_days')
      .eq('id', input.type_id)
      .single()

    if (typeError) throw typeError

    const start = input.start_date
      ? new Date(input.start_date)
      : new Date()

    const end = new Date(start)
    end.setDate(end.getDate() + typeData.duration_days)

    const { data, error } = await supabase
      .from('memberships')
      .insert({
        member_id: input.member_id,
        type_id: input.type_id,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data as Membership
  },

  renew: async (membershipId: string, typeId: string) => {
    const { data: typeData } = await supabase
      .from('membership_types')
      .select('duration_days')
      .eq('id', typeId)
      .single()

    const now = new Date()
    const end = new Date(now)
    end.setDate(end.getDate() + (typeData?.duration_days ?? 30))

    const { data, error } = await supabase
      .from('memberships')
      .insert({
        member_id: null,
        type_id: typeId,
        start_date: now.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data as Membership
  },

  getActiveWithType: async (memberId: string) => {
    const { data, error } = await supabase
      .from('memberships')
      .select(`*, membership_types(*)`)
      .eq('member_id', memberId)
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString().split('T')[0])
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data as (Membership & { membership_types: MembershipType }) | null
  },

  cancel: async (membershipId: string) => {
    const { data, error } = await supabase
      .from('memberships')
      .update({ status: 'cancelled' })
      .eq('id', membershipId)
      .select()
      .single()

    if (error) throw error
    return data as Membership
  },

  getExpiring: async (days: number = 7): Promise<MembershipListItem[]> => {
    const now = new Date()
    const future = new Date(now)
    future.setDate(future.getDate() + days)

    const today = now.toISOString().split('T')[0]
    const futureDate = future.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('memberships')
      .select(`
        *,
        profiles!member_id(full_name, email),
        membership_types(name)
      `)
      .eq('status', 'active')
      .gte('end_date', today)
      .lte('end_date', futureDate)
      .order('end_date')

    if (error) throw error

    return (data || []).map((m: any) => ({
      id: m.id,
      member_id: m.member_id,
      member_name: m.profiles?.full_name ?? '—',
      member_email: m.profiles?.email ?? null,
      type_name: m.membership_types?.name ?? '—',
      start_date: m.start_date,
      end_date: m.end_date,
      status: m.status,
      days_remaining: Math.round(
        (new Date(m.end_date).getTime() - now.getTime()) / 86400000
      ),
      payment_status: null,
    }))
  },

  getDistribution: async (): Promise<{ name: string; count: number; percentage: number }[]> => {
    const { data, error } = await supabase
      .from('memberships')
      .select('membership_types(name)')
      .eq('status', 'active')

    if (error) throw error

    const counts: Record<string, number> = {}
    for (const item of data || []) {
      const name = (item as any).membership_types?.name ?? 'Otro'
      counts[name] = (counts[name] || 0) + 1
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
  },
}
