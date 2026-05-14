import { supabase } from '@/lib/supabase'

export interface TrainingPlan {
  id: string
  name: string
  description: string | null
  assigned_to: string | null
  created_by: string
  is_template: boolean
  created_at: string
  updated_at: string
}

export interface PlanExercise {
  id: string
  plan_id: string
  exercise_name: string
  muscle: string | null
  sets: number | null
  reps: number | null
  rest_seconds: number | null
  day: number | null
  notes: string | null
  order_index: number
  created_at: string
}

export interface PlanListItem {
  id: string
  name: string
  description: string | null
  type: 'assigned' | 'template' | 'draft'
  trainer_name: string
  member_name: string | null
  exercise_count: number
  days: number
  created_at: string
}

export interface PlanFilters {
  search?: string
  type?: string
  page?: number
  pageSize?: number
}

export const trainingService = {
  getAll: async (filters?: PlanFilters): Promise<{ data: PlanListItem[]; count: number }> => {
    let query = supabase
      .from('training_plans')
      .select(`
        *,
        creator:profiles!training_plans_created_by_fkey(full_name),
        assignee:profiles!training_plans_assigned_to_fkey(full_name),
        plan_exercises(count)
      `, { count: 'exact' })

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const from = ((filters?.page ?? 1) - 1) * (filters?.pageSize ?? 20)
    const to = from + (filters?.pageSize ?? 20) - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      data: (data || []).map((p: any): PlanListItem => {
        const type = p.is_template ? 'template' : p.assigned_to ? 'assigned' : 'draft'
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          type,
          trainer_name: p.creator?.full_name ?? '—',
          member_name: p.assignee?.full_name ?? null,
          exercise_count: p.plan_exercises?.[0]?.count ?? 0,
          days: 0,
          created_at: p.created_at,
        }
      }),
      count: count ?? 0,
    }
  },

  getById: async (id: string) => {
    const { data: plan, error } = await supabase
      .from('training_plans')
      .select(`
        *,
        creator:profiles!training_plans_created_by_fkey(full_name),
        assignee:profiles!training_plans_assigned_to_fkey(full_name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    const { data: exercises, error: exError } = await supabase
      .from('plan_exercises')
      .select('*')
      .eq('plan_id', id)
      .order('day', { ascending: true, nullsFirst: false })
      .order('order_index')

    if (exError) throw exError

    return {
      ...plan,
      exercises: (exercises || []) as PlanExercise[],
    }
  },

  create: async (input: {
    name: string
    description?: string
    is_template?: boolean
    created_by: string
    assigned_to?: string
  }) => {
    const { data, error } = await supabase
      .from('training_plans')
      .insert({
        name: input.name,
        description: input.description || null,
        is_template: input.is_template ?? false,
        created_by: input.created_by,
        assigned_to: input.assigned_to || null,
      })
      .select()
      .single()

    if (error) throw error
    return data as TrainingPlan
  },

  update: async (id: string, input: Partial<{
    name: string
    description: string
    assigned_to: string | null
    is_template: boolean
  }>) => {
    const { data, error } = await supabase
      .from('training_plans')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as TrainingPlan
  },

  delete: async (id: string) => {
    const { error: exError } = await supabase
      .from('plan_exercises')
      .delete()
      .eq('plan_id', id)
    if (exError) throw exError

    const { error } = await supabase
      .from('training_plans')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  getTemplates: async (): Promise<PlanListItem[]> => {
    const { data, error } = await supabase
      .from('training_plans')
      .select(`
        *,
        creator:profiles!training_plans_created_by_fkey(full_name),
        plan_exercises(count)
      `)
      .eq('is_template', true)
      .order('name')

    if (error) throw error

    return (data || []).map((p: any): PlanListItem => ({
      id: p.id,
      name: p.name,
      description: p.description,
      type: 'template',
      trainer_name: p.creator?.full_name ?? '—',
      member_name: null,
      exercise_count: p.plan_exercises?.[0]?.count ?? 0,
      days: 0,
      created_at: p.created_at,
    }))
  },

  getByMember: async (memberId: string) => {
    const { data, error } = await supabase
      .from('training_plans')
      .select(`*, creator:profiles!training_plans_created_by_fkey(id, full_name)`)
      .eq('assigned_to', memberId)
      .maybeSingle()

    if (error) throw error
    return data as (TrainingPlan & { creator: { id: string; full_name: string } | null }) | null
  },

  // ---- Exercises ----

  getExercises: async (planId: string): Promise<PlanExercise[]> => {
    const { data, error } = await supabase
      .from('plan_exercises')
      .select('*')
      .eq('plan_id', planId)
      .order('day', { ascending: true, nullsFirst: false })
      .order('order_index')

    if (error) throw error
    return (data || []) as PlanExercise[]
  },

  addExercise: async (input: {
    plan_id: string
    exercise_name: string
    sets?: number
    reps?: number
    rest_seconds?: number
    day?: number
    notes?: string
    order_index?: number
  }) => {
    const { data, error } = await supabase
      .from('plan_exercises')
      .insert({
        plan_id: input.plan_id,
        exercise_name: input.exercise_name,
        sets: input.sets ?? null,
        reps: input.reps ?? null,
        rest_seconds: input.rest_seconds ?? null,
        day: input.day ?? null,
        notes: input.notes ?? null,
        order_index: input.order_index ?? 0,
      })
      .select()
      .single()

    if (error) throw error
    return data as PlanExercise
  },

  updateExercise: async (id: string, input: Partial<{
    exercise_name: string
    sets: number
    reps: number
    rest_seconds: number
    day: number
    notes: string
    order_index: number
  }>) => {
    const { data, error } = await supabase
      .from('plan_exercises')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as PlanExercise
  },

  removeExercise: async (id: string) => {
    const { error } = await supabase
      .from('plan_exercises')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // ---- Assignment ----

  assignToMember: async (planId: string, memberId: string) => {
    const { data, error } = await supabase
      .from('training_plans')
      .update({ assigned_to: memberId })
      .eq('id', planId)
      .select()
      .single()

    if (error) throw error
    return data as TrainingPlan
  },

  unassignMember: async (planId: string) => {
    const { data, error } = await supabase
      .from('training_plans')
      .update({ assigned_to: null })
      .eq('id', planId)
      .select()
      .single()

    if (error) throw error
    return data as TrainingPlan
  },

  getUnassignedMembers: async () => {
    const { data: assignedIds, error: err1 } = await supabase
      .from('training_plans')
      .select('assigned_to')
      .not('assigned_to', 'is', null)

    if (err1) throw err1

    const excludedIds = (assignedIds || [])
      .map((p: any) => p.assigned_to)
      .filter(Boolean)

    let query = supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'member')
      .eq('is_active', true)

    if (excludedIds.length > 0) {
      query = query.not('id', 'in', `(${excludedIds.join(',')})`)
    }

    const { data, error } = await query.order('full_name')
    if (error) throw error
    return data || []
  },
}
