import { supabase } from '@/lib/supabase'
import { deduplicateProfiles } from './members.service'

export interface DashboardKPIs {
  total_members: number
  active_memberships: number
  expiring_soon: number
  inactive_members: number
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
  type: 'check_in' | 'new_member' | 'payment' | 'expired_membership' | 'membership_assigned'
  userName: string
  action: string
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
    await supabase.rpc('sync_membership_status')
    const today = new Date().toISOString().split('T')[0]
    const future = new Date()
    future.setDate(future.getDate() + 7)
    const futureDate = future.toISOString().split('T')[0]

    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const monthStart = `${currentMonth}-01`

    const promises = await Promise.allSettled([
      supabase
        .from('profiles')
        .select('id, full_name, email, alias')
        .eq('role', 'member'),

      supabase
        .from('memberships')
        .select('member_id')
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

    const totalMembersResult = promises[0].status === 'fulfilled' ? promises[0].value : { data: null, error: promises[0].reason }
    const activeMembershipsResult = promises[1].status === 'fulfilled' ? promises[1].value : { data: null, error: promises[1].reason }
    const expiringMemberships = promises[2].status === 'fulfilled' ? promises[2].value : { count: null, error: promises[2].reason }
    const monthlyRevenue = promises[3].status === 'fulfilled' ? promises[3].value : { data: null, error: promises[3].reason }

    if (totalMembersResult.error) console.error('KPIs totalMembers query failed:', totalMembersResult.error)
    if (activeMembershipsResult.error) console.error('KPIs activeMemberships query failed:', activeMembershipsResult.error)
    if (expiringMemberships.error) console.error('KPIs expiringMemberships query failed:', expiringMemberships.error)
    if (monthlyRevenue.error) console.error('KPIs monthlyRevenue query failed:', monthlyRevenue.error)

    const dedupedProfiles = deduplicateProfiles(totalMembersResult.data || [])
    const activeMemberIds = new Set((activeMembershipsResult.data || []).map((m: any) => m.member_id))
    const activeMemberships = activeMemberIds.size
    const inactiveMembers = dedupedProfiles.filter(p => !activeMemberIds.has(p.id)).length

    const revenue =
      (monthlyRevenue.data || []).reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0
      )

    return {
      total_members: dedupedProfiles.length,
      active_memberships: activeMemberships,
      expiring_soon: expiringMemberships.count ?? 0,
      inactive_members: inactiveMembers,
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
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]

    const [checkIns, newMembers, expiredMemberships, recentPayments, recentAssignments] = await Promise.all([
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

      supabase
        .from('memberships')
        .select(`
          id, end_date,
          profiles!member_id(full_name),
          membership_types(name)
        `)
        .gte('end_date', thirtyDaysAgoStr)
        .lt('end_date', todayStr)
        .order('end_date', { ascending: false })
        .limit(5),

      supabase
        .from('payments')
        .select(`
          id, amount, created_at,
          memberships(
            member_id,
            profiles!member_id(full_name),
            membership_types(name)
          )
        `)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('memberships')
        .select(`
          id, created_at,
          profiles!member_id(full_name),
          membership_types(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const activities: RecentActivityItem[] = []

    for (const ci of checkIns.data || []) {
      activities.push({
        id: `check_in-${ci.id}`,
        type: 'check_in',
        userName: (ci as any).profiles?.full_name ?? 'Alguien',
        action: 'registró entrada',
        timestamp: ci.check_in_time,
      })
    }

    for (const nm of newMembers.data || []) {
      activities.push({
        id: `new_member-${nm.id}`,
        type: 'new_member',
        userName: nm.full_name,
        action: 'se unió al gimnasio',
        timestamp: nm.created_at,
      })
    }

    for (const em of (expiredMemberships.data || []) as any[]) {
      const typeName = em.membership_types?.name ?? ''
      if (typeName === 'Visita') continue
      activities.push({
        id: `expired_membership-${em.id}`,
        type: 'expired_membership',
        userName: em.profiles?.full_name ?? 'Alguien',
        action: `membresía ${typeName} vencida`,
        timestamp: em.end_date,
      })
    }

    for (const rp of (recentPayments.data || []) as any[]) {
      activities.push({
        id: `payment-${rp.id}`,
        type: 'payment',
        userName: rp.memberships?.profiles?.full_name ?? 'Alguien',
        action: `pagó ${rp.memberships?.membership_types?.name ?? 'membresía'} ($${Number(rp.amount).toLocaleString()})`,
        timestamp: rp.created_at,
      })
    }

    for (const ra of (recentAssignments.data || []) as any[]) {
      activities.push({
        id: `membership_assigned-${ra.id}`,
        type: 'membership_assigned',
        userName: ra.profiles?.full_name ?? 'Alguien',
        action: `nueva membresía ${ra.membership_types?.name ?? ''}`,
        timestamp: ra.created_at,
      })
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return activities.slice(0, limit)
  },

  getExpiringMemberships: async (days: number = 7) => {
    await supabase.rpc('sync_membership_status')
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
    const now = new Date()
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return (data || [])
      .map((m: any) => {
        if (!m.end_date) return null
        const [y, mo, d] = m.end_date.split('-').map(Number)
        const endLocal = new Date(y, mo - 1, d)
        return {
          id: m.id,
          member_name: m.profiles?.full_name ?? '—',
          member_email: m.profiles?.email ?? null,
          type_name: m.membership_types?.name ?? '—',
          end_date: m.end_date,
          days_remaining: Math.round((endLocal.getTime() - todayLocal.getTime()) / 86400000),
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null && m.days_remaining > 0)
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
