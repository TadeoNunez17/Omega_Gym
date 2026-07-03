import { supabase } from '@/lib/supabase'

function escapeSearch(s: string): string {
  return s.replace(/[%_\\]/g, '\\$&')
}

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
  reference_link: string | null
  order_index: number
  created_at: string
}

export type ExerciseInput = {
  exercise_name: string
  muscle?: string | null
  sets?: number | null
  reps?: number | null
  rest_seconds?: number | null
  notes?: string | null
  reference_link?: string | null
  day: number
  order_index: number
}

export interface PlanListItem {
  id: string
  name: string
  description: string | null
  type: 'assigned' | 'draft'
  trainer_name: string
  member_name: string | null
  member_names: string[]
  member_count: number
  assigned_to: string | null
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
      const escaped = escapeSearch(filters.search)
      query = query.or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%`)
    }

    const from = ((filters?.page ?? 1) - 1) * (filters?.pageSize ?? 20)
    const to = from + (filters?.pageSize ?? 20) - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    const planIds = (data || []).map(p => p.id)
    const { data: assignments } = await supabase
      .from('plan_assignments')
      .select('plan_id, member:profiles(full_name)')
      .in('plan_id', planIds)

    const assigneesByPlan: Record<string, string[]> = {}
    for (const a of assignments || []) {
      if (!assigneesByPlan[a.plan_id]) assigneesByPlan[a.plan_id] = []
      assigneesByPlan[a.plan_id].push((a.member as any).full_name)
    }

    return {
      data: (data || []).map((p: any): PlanListItem => {
        const memberNames = assigneesByPlan[p.id] || []
        if (p.assignee?.full_name && !memberNames.includes(p.assignee.full_name)) {
          memberNames.unshift(p.assignee.full_name)
        }
        const type = memberNames.length > 0 ? 'assigned' : 'draft'
        const memberName = memberNames[0] || null
        const extraCount = memberNames.length - 1
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          type,
          trainer_name: p.creator?.full_name ?? '—',
          member_name: extraCount > 0 ? `${memberName} +${extraCount}` : memberName,
          member_names: memberNames,
          member_count: memberNames.length,
          assigned_to: p.assigned_to ?? null,
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

    const [exercisesRes, assigneesRes] = await Promise.all([
      supabase
        .from('plan_exercises')
        .select('*')
        .eq('plan_id', id)
        .order('day', { ascending: true, nullsFirst: false })
        .order('order_index'),
      supabase
        .from('plan_assignments')
        .select('member_id, member:profiles(full_name)')
        .eq('plan_id', id),
    ])

    if (exercisesRes.error) throw exercisesRes.error

    return {
      ...plan,
      exercises: (exercisesRes.data || []) as PlanExercise[],
      assignees: (assigneesRes.data || []).map(a => ({ id: a.member_id, full_name: (a.member as any).full_name })),
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
      type: 'draft',
      trainer_name: p.creator?.full_name ?? '—',
      member_name: null,
      member_names: [],
      member_count: 0,
      assigned_to: null,
      exercise_count: p.plan_exercises?.[0]?.count ?? 0,
      days: 0,
      created_at: p.created_at,
    }))
  },

  delete: async (id: string): Promise<void> => {
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

  update: async (id: string, input: {
    name?: string
    description?: string | null
    assigned_to?: string | null
  }) => {
    const payload: Record<string, unknown> = {}
    if (input.name !== undefined) payload.name = input.name
    if (input.description !== undefined) payload.description = input.description
    if (input.assigned_to !== undefined) payload.assigned_to = input.assigned_to || null

    const { data, error } = await supabase
      .from('training_plans')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as TrainingPlan
  },

  duplicate: async (id: string): Promise<string> => {
    const plan = await trainingService.getById(id)

    const { data: newPlan, error } = await supabase
      .from('training_plans')
      .insert({
        name: plan.name + ' (copia)',
        description: plan.description,
        is_template: plan.is_template,
        created_by: plan.created_by,
        assigned_to: null,
      })
      .select()
      .single()

    if (error) throw error

    if (plan.exercises && plan.exercises.length > 0) {
      const { error: exError } = await supabase
        .from('plan_exercises')
        .insert(plan.exercises.map((ex: PlanExercise) => ({
          plan_id: newPlan.id,
          exercise_name: ex.exercise_name,
          muscle: ex.muscle,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          reference_link: ex.reference_link,
          day: ex.day,
          order_index: ex.order_index,
        })))

      if (exError) throw exError
    }

    return newPlan.id
  },

  unlink: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('training_plans')
      .update({ assigned_to: null })
      .eq('id', id)

    if (error) throw error

    const { error: aError } = await supabase
      .from('plan_assignments')
      .delete()
      .eq('plan_id', id)

    if (aError) throw aError
  },

  assign: async (id: string, memberId: string): Promise<void> => {
    const { error } = await supabase
      .from('training_plans')
      .update({ assigned_to: memberId })
      .eq('id', id)

    if (error) throw error

    const { error: aError } = await supabase
      .from('plan_assignments')
      .insert({ plan_id: id, member_id: memberId })

    if (aError && aError.code !== '23505') throw aError
  },

  getByMember: async (memberId: string) => {
    const { data: assignment } = await supabase
      .from('plan_assignments')
      .select('plan_id')
      .eq('member_id', memberId)
      .maybeSingle()

    const planId = assignment?.plan_id
    if (!planId) {
      const { data } = await supabase
        .from('training_plans')
        .select(`*, creator:profiles!training_plans_created_by_fkey(id, full_name)`)
        .eq('assigned_to', memberId)
        .maybeSingle()
      return data as (TrainingPlan & { creator: { id: string; full_name: string } | null }) | null
    }

    const { data, error } = await supabase
      .from('training_plans')
      .select(`*, creator:profiles!training_plans_created_by_fkey(id, full_name)`)
      .eq('id', planId)
      .single()

    if (error) throw error
    return data as (TrainingPlan & { creator: { id: string; full_name: string } | null }) | null
  },

  assignMultiple: async (planId: string, memberIds: string[]): Promise<void> => {
    if (memberIds.length === 0) return
    const { error } = await supabase
      .from('plan_assignments')
      .insert(memberIds.map(memberId => ({ plan_id: planId, member_id: memberId })))

    if (error) throw error
  },

  getAssignees: async (planId: string): Promise<{ id: string; full_name: string }[]> => {
    const { data, error } = await supabase
      .from('plan_assignments')
      .select('member_id, member:profiles(full_name)')
      .eq('plan_id', planId)

    if (error) throw error
    return (data || []).map(a => ({ id: a.member_id, full_name: (a.member as any).full_name }))
  },

  removeAssignment: async (planId: string, memberId: string): Promise<void> => {
    const { error } = await supabase
      .from('plan_assignments')
      .delete()
      .eq('plan_id', planId)
      .eq('member_id', memberId)

    if (error) throw error
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

  upsertExercises: async (planId: string, exercises: ExerciseInput[]): Promise<void> => {
    const { error: delError } = await supabase
      .from('plan_exercises')
      .delete()
      .eq('plan_id', planId)

    if (delError) throw delError
    if (exercises.length === 0) return

    const { error } = await supabase
      .from('plan_exercises')
      .insert(exercises.map((ex, i) => ({
        plan_id: planId,
        exercise_name: ex.exercise_name,
        muscle: ex.muscle || null,
        sets: ex.sets || null,
        reps: ex.reps || null,
        rest_seconds: ex.rest_seconds || null,
        notes: ex.notes || null,
        reference_link: ex.reference_link || null,
        day: ex.day,
        order_index: ex.order_index ?? i,
      })))

    if (error) throw error
  },
}
