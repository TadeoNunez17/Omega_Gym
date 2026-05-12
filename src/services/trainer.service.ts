export interface TrainerMember {
  id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  membership: {
    id: string
    type: string
    price: number
    start_date: string
    end_date: string
    days_remaining: number
  } | null
  plan: { id: string; name: string; description: string | null } | null
}

export interface TrainerPlan {
  id: string
  name: string
  description: string | null
  is_template: boolean
  assigned_to: string | null
  assigned_to_name: string | null
  created_by: string
  created_at: string
  updated_at: string
  exercise_count: number
}

export interface TrainerTemplate {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  exercise_count: number
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const trainerService = {
  getMembers: () => fetchJson<TrainerMember[]>('/api/trainer/members'),

  getPlans: () => fetchJson<TrainerPlan[]>('/api/trainer/plans'),

  createPlan: (data: { name: string; description?: string; assigned_to?: string }) =>
    fetchJson<TrainerPlan>('/api/trainer/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getTemplates: () => fetchJson<TrainerTemplate[]>('/api/trainer/templates'),
}
