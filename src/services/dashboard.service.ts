import { supabase } from '@/lib/supabase'

export interface DashboardKPIs {
  total_members: number
  active_memberships: number
  expiring_soon: number
  monthly_revenue: number
}

export interface MonthlyRevenueItem {
  month: string
  amount: number
  is_current: boolean
}

export interface MembershipDistributionItem {
  name: string
  count: number
  percentage: number
}

export interface RecentActivityItem {
  id: string
  type: 'check_in' | 'new_member' | 'payment'
  description: string
  timestamp: string
}

export interface PendingPaymentItem {
  id: string
  member_name: string
  amount: number
  due_date: string
}

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const dashboardService = {
  getKPIs: async (): Promise<DashboardKPIs> => {
    const today = new Date().toISOString().split('T')[0]
    const future = new Date()
    future.setDate(future.getDate() + 7)
    const futureDate = future.toISOString().split('T')[0]

    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const monthStart = `${currentMonth}-01`

    const [totalMembers, activeMemberships, expiringMemberships, monthlyRevenue] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'member')
          .eq('is_active', true),

        supabase
          .from('memberships')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .lte('start_date', today)
          .gte('end_date', today),

        supabase
          .from('memberships')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .gte('end_date', today)
          .lte('end_date', futureDate),

        supabase
          .from('payments')
          .select('amount')
          .eq('status', 'paid')
          .gte('payment_date', monthStart),
      ])

    const revenue =
      (monthlyRevenue.data || []).reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0
      )

    return {
      total_members: totalMembers.count ?? 0,
      active_memberships: activeMemberships.count ?? 0,
      expiring_soon: expiringMemberships.count ?? 0,
      monthly_revenue: revenue,
    }
  },

  getMonthlyRevenue: async (year?: number): Promise<MonthlyRevenueItem[]> => {
    const y = year || new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    const start = `${y}-01-01`
    const end = `${y}-12-31`

    const { data, error } = await supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('status', 'paid')
      .gte('payment_date', start)
      .lte('payment_date', end)
      .order('payment_date')

    if (error) throw error

    const monthly: Record<number, number> = {}
    for (let i = 0; i < 12; i++) monthly[i] = 0

    for (const p of data || []) {
      const m = new Date(p.payment_date).getMonth()
      monthly[m] += Number(p.amount)
    }

    return Object.entries(monthly).map(([monthIdx, amount]) => ({
      month: MONTHS_SHORT[Number(monthIdx)],
      amount,
      is_current: Number(monthIdx) === currentMonth,
    }))
  },

  getMembershipDistribution: async (): Promise<MembershipDistributionItem[]> => {
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

  getRecentActivity: async (limit: number = 10): Promise<RecentActivityItem[]> => {
    const [checkIns, newMembers] = await Promise.all([
      supabase
        .from('check_ins')
        .select('id, check_in_time, profiles!member_id(full_name)')
        .order('check_in_time', { ascending: false })
        .limit(limit),

      supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .eq('role', 'member')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const activities: RecentActivityItem[] = []

    for (const ci of checkIns.data || []) {
      activities.push({
        id: ci.id,
        type: 'check_in',
        description: `${(ci as any).profiles?.full_name ?? 'Alguien'} registró entrada`,
        timestamp: ci.check_in_time,
      })
    }

    for (const nm of newMembers.data || []) {
      activities.push({
        id: nm.id,
        type: 'new_member',
        description: `${nm.full_name} se unió al gimnasio`,
        timestamp: nm.created_at,
      })
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return activities.slice(0, limit)
  },

  getExpiringMemberships: async (days: number = 7) => {
    const today = new Date().toISOString().split('T')[0]
    const future = new Date()
    future.setDate(future.getDate() + days)
    const futureDate = future.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('memberships')
      .select(`
        id, end_date,
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
      member_name: m.profiles?.full_name ?? '—',
      member_email: m.profiles?.email ?? null,
      type_name: m.membership_types?.name ?? '—',
      end_date: m.end_date,
      days_remaining: Math.round(
        (new Date(m.end_date).getTime() - new Date().getTime()) / 86400000
      ),
    }))
  },

  getPendingPayments: async (): Promise<PendingPaymentItem[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id, amount, payment_date,
        memberships(
          member_id,
          profiles!member_id(full_name)
        )
      `)
      .eq('status', 'pending')
      .order('payment_date')

    if (error) throw error

    return (data || []).map((p: any) => ({
      id: p.id,
      member_name: p.memberships?.profiles?.full_name ?? '—',
      amount: Number(p.amount),
      due_date: p.payment_date,
    }))
  },
}
