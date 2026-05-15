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
}
