import { supabase } from '@/lib/supabase'
import type { TrainingPlan, PlanExercise, ExerciseInput } from '@/services/training.service'

export type Routine = TrainingPlan & {
  kind: 'trainer' | 'personal'
  share_code: string | null
}

export interface RoutineListItem {
  id: string
  name: string
  description: string | null
  share_code: string | null
  show_in_plan: boolean
  exercise_count: number
  created_at: string
  updated_at: string
}

export const routinesService = {
  /** Rutinas personales del dueño (RLS garantiza que solo sean las propias) */
  getMine: async (ownerId: string): Promise<RoutineListItem[]> => {
    const { data, error } = await supabase
      .from('training_plans')
      .select('id, name, description, share_code, show_in_plan, created_at, updated_at, plan_exercises(count)')
      .eq('created_by', ownerId)
      .eq('kind', 'personal')
      .order('updated_at', { ascending: false })

    if (error) throw error

    return (data || []).map((r: any): RoutineListItem => ({
      id: r.id,
      name: r.name,
      description: r.description,
      share_code: r.share_code ?? null,
      show_in_plan: r.show_in_plan ?? true,
      exercise_count: r.plan_exercises?.[0]?.count ?? 0,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }))
  },

  /** Detalle completo (plan + ejercicios) para editar o ver */
  getDetail: async (routineId: string): Promise<{ routine: Routine; exercises: PlanExercise[] }> => {
    const [planRes, exercisesRes] = await Promise.all([
      supabase.from('training_plans').select('*').eq('id', routineId).single(),
      supabase
        .from('plan_exercises')
        .select('*')
        .eq('plan_id', routineId)
        .order('day', { ascending: true, nullsFirst: false })
        .order('order_index'),
    ])

    if (planRes.error) throw planRes.error
    if (exercisesRes.error) throw exercisesRes.error

    return {
      routine: planRes.data as Routine,
      exercises: (exercisesRes.data || []) as PlanExercise[],
    }
  },

  createPersonal: async (input: {
    name: string
    description?: string | null
    created_by: string
  }): Promise<Routine> => {
    const { data, error } = await supabase
      .from('training_plans')
      .insert({
        name: input.name,
        description: input.description || null,
        created_by: input.created_by,
        kind: 'personal',
      })
      .select()
      .single()

    if (error) throw error
    return data as Routine
  },

  updatePersonal: async (id: string, input: {
    name?: string
    description?: string | null
  }): Promise<void> => {
    const payload: Record<string, unknown> = {}
    if (input.name !== undefined) payload.name = input.name
    if (input.description !== undefined) payload.description = input.description

    const { error } = await supabase
      .from('training_plans')
      .update(payload)
      .eq('id', id)

    if (error) throw error
  },

  /** Muestra u oculta una rutina propia en la vista Mi plan */
  setPlanVisibility: async (id: string, visible: boolean): Promise<void> => {
    const { error } = await supabase
      .from('training_plans')
      .update({ show_in_plan: visible })
      .eq('id', id)

    if (error) throw error
  },

  deletePersonal: async (id: string): Promise<void> => {
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

  saveExercises: async (routineId: string, exercises: ExerciseInput[]): Promise<void> => {
    const { error: delError } = await supabase
      .from('plan_exercises')
      .delete()
      .eq('plan_id', routineId)

    if (delError) throw delError
    if (exercises.length === 0) return

    const { error } = await supabase
      .from('plan_exercises')
      .insert(exercises.map((ex, i) => ({
        plan_id: routineId,
        exercise_id: ex.exercise_id || null,
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

  /** Código vigente o nuevo; regenerate=true invalida el anterior */
  generateShareCode: async (routineId: string, regenerate = false): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_share_code', {
      p_plan_id: routineId,
      p_regenerate: regenerate,
    })

    if (error) throw error
    return data as string
  },

  revokeShareCode: async (routineId: string): Promise<void> => {
    const { error } = await supabase.rpc('revoke_share_code', {
      p_plan_id: routineId,
    })

    if (error) throw error
  },

  /** Crea una copia independiente a nombre del llamador; retorna id de la nueva rutina */
  importByCode: async (code: string): Promise<string> => {
    const { data, error } = await supabase.rpc('import_routine_by_code', {
      p_code: code,
    })

    if (error) throw error
    return data as string
  },
}
