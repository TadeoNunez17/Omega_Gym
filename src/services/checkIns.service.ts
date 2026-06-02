import { supabase } from '@/lib/supabase'

export interface CheckIn {
  id: string
  member_id: string
  membership_id: string | null
  check_in_time: string
  check_out_time: string | null
  method: 'fingerprint' | 'manual' | 'card'
  device_id: string | null
  notes: string | null
  created_at: string
}

export interface CheckInWithMember extends CheckIn {
  member_name: string
  member_email: string | null
}

export const checkInsService = {
  getByMember: async (memberId: string): Promise<CheckIn[]> => {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('member_id', memberId)
      .order('check_in_time', { ascending: false })
      .limit(50)

    if (error) throw error
    return (data || []) as CheckIn[]
  },

  create: async (input: {
    member_id: string
    membership_id?: string
    method?: 'fingerprint' | 'manual' | 'card'
    device_id?: string
    notes?: string
  }) => {
    const { data, error } = await supabase
      .from('check_ins')
      .insert({
        member_id: input.member_id,
        membership_id: input.membership_id || null,
        method: input.method || 'fingerprint',
        device_id: input.device_id || null,
        notes: input.notes || null,
      })
      .select()
      .single()

    if (error) throw error
    return data as CheckIn
  },

  getToday: async (): Promise<CheckInWithMember[]> => {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        *,
        profiles!member_id(full_name, email)
      `)
      .gte('check_in_time', today)
      .lt('check_in_time', `${today}T23:59:59.999Z`)
      .order('check_in_time', { ascending: false })

    if (error) throw error

    return (data || []).map((c: any) => ({
      ...c,
      member_name: c.profiles?.full_name ?? '—',
      member_email: c.profiles?.email ?? null,
    }))
  },

  getMonthlyCounts: async (year?: number): Promise<{ month: number; count: number }[]> => {
    const y = year || new Date().getFullYear()
    const startDate = `${y}-01-01`
    const endDate = `${y}-12-31`

    const { data, error } = await supabase
      .from('check_ins')
      .select('check_in_time')
      .gte('check_in_time', startDate)
      .lt('check_in_time', `${endDate}T23:59:59.999Z`)

    if (error) throw error

    const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 }))
    for (const c of data || []) {
      const m = new Date(c.check_in_time).getMonth()
      months[m].count++
    }

    return months
  },
}
