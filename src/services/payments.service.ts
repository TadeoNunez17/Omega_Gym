import { supabase } from '@/lib/supabase'

export interface Payment {
  id: string
  membership_id: string
  amount: number
  payment_date: string
  method: 'cash' | 'card' | 'transfer'
  status: 'paid' | 'pending' | 'cancelled'
  notes: string | null
  created_at: string
}

export interface PaymentListItem {
  id: string
  member_name: string
  member_email: string | null
  concept: string
  amount: number
  date: string
  method: 'cash' | 'card' | 'transfer'
  status: 'paid' | 'pending' | 'cancelled'
}

export interface PaymentFilters {
  search?: string
  status?: string
  method?: string
  page?: number
  pageSize?: number
}

export interface RevenueSummary {
  total_collected: number
  total_pending: number
  total_cancelled: number
  today_collected: number
}

export const paymentsService = {
  getAll: async (filters?: PaymentFilters): Promise<{ data: PaymentListItem[]; count: number }> => {
    let query = supabase
      .from('payments')
      .select(`
        *,
        memberships(
          member_id,
          profiles!member_id(full_name, email),
          membership_types(name)
        )
      `, { count: 'exact' })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.method) {
      query = query.eq('method', filters.method)
    }

    const from = ((filters?.page ?? 1) - 1) * (filters?.pageSize ?? 20)
    const to = from + (filters?.pageSize ?? 20) - 1

    const { data, error, count } = await query
      .order('payment_date', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      data: (data || []).map((p: any) => ({
        id: p.id,
        member_name: p.memberships?.profiles?.full_name ?? '—',
        member_email: p.memberships?.profiles?.email ?? null,
        concept: `${p.memberships?.membership_types?.name ?? 'Membresía'} · ${p.payment_date}`,
        amount: p.amount,
        date: p.payment_date,
        method: p.method,
        status: p.status,
      })),
      count: count ?? 0,
    }
  },

  getByMembership: async (membershipId: string): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('membership_id', membershipId)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return (data || []) as Payment[]
  },

  create: async (input: {
    membership_id: string
    amount: number
    payment_date?: string
    method: 'cash' | 'card' | 'transfer'
    notes?: string
  }) => {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        membership_id: input.membership_id,
        amount: input.amount,
        payment_date: input.payment_date || new Date().toISOString().split('T')[0],
        method: input.method,
        notes: input.notes || null,
        status: 'paid',
      })
      .select()
      .single()

    if (error) throw error
    return data as Payment
  },

  getRevenueSummary: async (): Promise<RevenueSummary> => {
    const today = new Date().toISOString().split('T')[0]

    const [collected, pending, cancelled, todayCollected] = await Promise.all([
      supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid'),

      supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending'),

      supabase
        .from('payments')
        .select('amount')
        .eq('status', 'cancelled'),

      supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .eq('payment_date', today),
    ])

    const sum = (arr: any[] | null) =>
      (arr || []).reduce((acc: number, p: any) => acc + Number(p.amount), 0)

    return {
      total_collected: sum(collected.data),
      total_pending: sum(pending.data),
      total_cancelled: sum(cancelled.data),
      today_collected: sum(todayCollected.data),
    }
  },

  getByMember: async (memberId: string): Promise<Payment[]> => {
    const { data: memberships } = await supabase
      .from('memberships')
      .select('id')
      .eq('member_id', memberId)

    if (!memberships?.length) return []

    const ids = memberships.map(m => m.id)

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .in('membership_id', ids)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return (data || []) as Payment[]
  },

  getMonthlyRevenue: async (year?: number): Promise<{ month: number; amount: number }[]> => {
    const y = year || new Date().getFullYear()
    const startDate = `${y}-01-01`
    const endDate = `${y}-12-31`

    const { data, error } = await supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('status', 'paid')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)

    if (error) throw error

    const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, amount: 0 }))
    for (const p of data || []) {
      const m = new Date(p.payment_date).getMonth()
      months[m].amount += Number(p.amount)
    }

    return months
  },
}
