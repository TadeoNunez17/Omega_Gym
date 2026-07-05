import { supabase } from '@/lib/supabase'

export interface WorkoutLog {
  id: string
  member_id: string
  plan_id: string
  exercise_id: string
  logged_date: string
  set_number: number
  weight: number | null
  reps: number | null
  completed: boolean
  notes: string | null
  created_at: string
}

export type SetInput = {
  plan_id: string
  exercise_id: string
  set_number: number
  weight?: number | null
  reps?: number | null
  completed?: boolean
  notes?: string | null
}

export const workoutService = {
  getTodayLogs: async (memberId: string, planId: string): Promise<WorkoutLog[]> => {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('member_id', memberId)
      .eq('plan_id', planId)
      .eq('logged_date', today)

    if (error) throw error
    return (data || []) as WorkoutLog[]
  },

  upsertSet: async (memberId: string, input: SetInput): Promise<void> => {
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('workout_logs')
      .upsert({
        member_id: memberId,
        plan_id: input.plan_id,
        exercise_id: input.exercise_id,
        logged_date: today,
        set_number: input.set_number,
        weight: input.weight ?? null,
        reps: input.reps ?? null,
        completed: input.completed ?? true,
        notes: input.notes ?? null,
      }, {
        onConflict: 'member_id,exercise_id,logged_date,set_number',
      })

    if (error) throw error
  },

  getLastSessionData: async (memberId: string, planId: string): Promise<WorkoutLog[]> => {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('member_id', memberId)
      .eq('plan_id', planId)
      .lt('logged_date', today)
      .order('logged_date', { ascending: false })
      .limit(100)

    if (error) throw error
    if (!data || data.length === 0) return []

    const grouped: Record<string, WorkoutLog[]> = {}
    for (const log of data) {
      if (!grouped[log.logged_date]) grouped[log.logged_date] = []
      grouped[log.logged_date].push(log)
    }
    const dates = Object.keys(grouped).sort().reverse()
    return grouped[dates[0]] || []
  },

  getHistory: async (memberId: string, exerciseId: string, days: number = 30): Promise<WorkoutLog[]> => {
    const from = new Date()
    from.setDate(from.getDate() - days)
    const fromStr = from.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('member_id', memberId)
      .eq('exercise_id', exerciseId)
      .gte('logged_date', fromStr)
      .order('logged_date', { ascending: false })
      .order('set_number')

    if (error) throw error
    return (data || []) as WorkoutLog[]
  },
}
