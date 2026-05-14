import { supabase } from '@/lib/supabase'

export type TrainerMember = {
  id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
  membership: {
    type: string
    days_remaining: number
  } | null
  plan: {
    name: string
    description: string | null
  } | null
}

export type TrainerPlan = {
  id: string
  name: string
  description: string | null
  assigned_to_name: string | null
  exercise_count: number
  created_at: string
}

export type TrainerTemplate = {
  id: string
  name: string
  description: string | null
  exercise_count: number
  created_at: string
}

export const trainerService = {
  getMembers: async (): Promise<TrainerMember[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, created_at')
      .eq('role', 'member')
    if (error) throw error
    return (data || []).map(m => ({
      ...m,
      membership: null,
      plan: null,
    }))
  },

  getPlans: async (): Promise<TrainerPlan[]> => {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
    if (error) throw error
    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || null,
      assigned_to_name: p.assigned_to_name || null,
      exercise_count: p.exercise_count || 0,
      created_at: p.created_at,
    }))
  },

  getTemplates: async (): Promise<TrainerTemplate[]> => {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('is_template', true)
    if (error) throw error
    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || null,
      exercise_count: p.exercise_count || 0,
      created_at: p.created_at,
    }))
  },

  createPlan: async (input: {
    name: string
    description?: string
    assigned_to?: string
  }): Promise<TrainerPlan> => {
    const { data, error } = await supabase
      .from('training_plans')
      .insert({
        name: input.name,
        description: input.description || null,
        assigned_to: input.assigned_to || null,
      })
      .select()
      .single()
    if (error) throw error
    return {
      id: data.id,
      name: data.name,
      description: data.description || null,
      assigned_to_name: null,
      exercise_count: 0,
      created_at: data.created_at,
    }
  },
}
