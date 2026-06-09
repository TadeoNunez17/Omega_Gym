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

const syncExpired = async () => {
  await supabase.rpc('sync_membership_status')
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
    dateFrom?: string
    dateTo?: string
  }): Promise<{ data: MembershipListItem[]; count: number }> => {
    await syncExpired()
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
    if (filters?.dateFrom) {
      query = query.gte('start_date', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('start_date', filters.dateTo)
    }

    const from = ((filters?.page ?? 1) - 1) * (filters?.pageSize ?? 20)
    const to = from + (filters?.pageSize ?? 20) - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    const now = new Date()
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const items: MembershipListItem[] = (data || []).map((m: any) => {
      const [y, mo, d] = m.end_date.split('-').map(Number)
      const endLocal = new Date(y, mo - 1, d)
      const daysRemaining = Math.round((endLocal.getTime() - todayLocal.getTime()) / 86400000)
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
    await syncExpired()
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Membership[]
  },

  getActiveByMember: async (memberId: string): Promise<Membership | null> => {
    await syncExpired()
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
    await syncExpired()
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

  update: async (id: string, input: Partial<{
    type_id: string
    start_date: string
    end_date: string
    status: 'active' | 'expired' | 'cancelled'
  }>): Promise<void> => {
    const { error } = await supabase
      .from('memberships')
      .update(input)
      .eq('id', id)
      .select()

    if (error) throw error
  },

  create: async (input: {
    member_id: string
    type_id: string
    start_date: string
    end_date?: string
    status?: 'active' | 'expired' | 'cancelled'
    payment_method?: 'cash' | 'card' | 'transfer' | 'pending'
  }): Promise<Membership> => {
    const { data, error } = await supabase.rpc('create_membership_with_payment', {
      p_member_id: input.member_id,
      p_type_id: input.type_id,
      p_start_date: input.start_date,
      p_end_date: input.end_date || null,
      p_status: input.status || 'active',
      p_payment_method: input.payment_method || null,
    })

    if (error) throw error
    return data as Membership
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  getExpiring: async (days: number = 7): Promise<MembershipListItem[]> => {
    await syncExpired()
    const now = new Date()
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const future = new Date(todayLocal)
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

    return (data || []).map((m: any) => {
      const [y, mo, d] = m.end_date.split('-').map(Number)
      const endLocal = new Date(y, mo - 1, d)
      return {
        id: m.id,
        member_id: m.member_id,
        member_name: m.profiles?.full_name ?? '—',
        member_email: m.profiles?.email ?? null,
        type_name: m.membership_types?.name ?? '—',
        start_date: m.start_date,
        end_date: m.end_date,
        status: m.status,
        days_remaining: Math.round((endLocal.getTime() - todayLocal.getTime()) / 86400000),
        payment_status: null,
      }
    })
  },
}
