import { supabase } from '@/lib/supabase'
import { membersService } from './members.service'
import { trainingService } from './training.service'
import { membershipsService } from './memberships.service'

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
    const { data: profiles } = await membersService.getAll({
      role: 'member',
      pageSize: 200,
    })

    const memberIds = profiles.map((p) => p.id)

    const [membershipsResult, plansResult] = await Promise.all([
      supabase
        .from('memberships')
        .select('member_id, end_date, membership_types(name)')
        .eq('status', 'active')
        .in('member_id', memberIds)
        .lte('start_date', new Date().toISOString().split('T')[0])
        .gte('end_date', new Date().toISOString().split('T')[0]),

      supabase
        .from('training_plans')
        .select('name, description, assigned_to')
        .in('assigned_to', memberIds),
    ])

    const membershipByMember: Record<string, any> = {}
    for (const m of membershipsResult.data || []) {
      membershipByMember[m.member_id] = m
    }

    const planByMember: Record<string, any> = {}
    for (const p of plansResult.data || []) {
      planByMember[p.assigned_to] = p
    }

    return profiles.map((profile): TrainerMember => {
      const now = new Date()
      const m = membershipByMember[profile.id]
      const plan = planByMember[profile.id]
      return {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email ?? '',
        phone: profile.phone,
        created_at: profile.created_at,
        membership: m
          ? {
              type: m.membership_types?.name ?? 'Membresía',
              days_remaining: Math.round(
                (new Date(m.end_date).getTime() - now.getTime()) / 86400000
              ),
            }
          : null,
        plan: plan
          ? { name: plan.name, description: plan.description }
          : null,
      }
    })
  },

  getPlans: async (): Promise<TrainerPlan[]> => {
    const { data } = await trainingService.getAll({ pageSize: 200 })
    return data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      assigned_to_name: p.member_name,
      exercise_count: p.exercise_count,
      created_at: p.created_at,
    }))
  },

  getTemplates: async (): Promise<TrainerTemplate[]> => {
    const templates = await trainingService.getTemplates()
    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      exercise_count: t.exercise_count,
      created_at: t.created_at,
    }))
  },

  createPlan: async (input: {
    name: string
    description?: string
    assigned_to?: string
  }): Promise<TrainerPlan> => {
    const { data: { session } } = await supabase.auth.getSession()
    const plan = await trainingService.create({
      name: input.name,
      description: input.description,
      assigned_to: input.assigned_to,
      created_by: session?.user?.id ?? '00000000-0000-0000-0000-000000000000',
    })
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      assigned_to_name: null,
      exercise_count: 0,
      created_at: plan.created_at,
    }
  },
}
