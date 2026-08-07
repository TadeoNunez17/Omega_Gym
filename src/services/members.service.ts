import { supabase } from '@/lib/supabase'

function escapeSearch(s: string): string {
  return s.replace(/[%_\\]/g, '\\$&')
}

export interface Member {
  id: string
  email: string | null
  full_name: string
  alias: string | null
  phone: string | null
  avatar_url: string | null
  role: 'admin' | 'trainer' | 'member'
  is_active: boolean
  auth_user_id: string | null
  registration_status: 'pending' | 'claimed' | 'registered'
  created_at: string
  updated_at: string
}

export interface MemberListItem {
  id: string
  full_name: string
  alias: string | null
  email: string | null
  phone: string | null
  role: 'admin' | 'trainer' | 'member'
  is_active: boolean
  registration_status: 'pending' | 'claimed' | 'registered'
  membership_type: string | null
  membership_end: string | null
  plan_names: string[]
  created_at: string
}

export interface MemberFilters {
  search?: string
  role?: string
  status?: 'active' | 'inactive'
  registration?: 'pending' | 'claimed' | 'registered'
  page?: number
  pageSize?: number
}

function toMemberListItem(raw: any): MemberListItem {
  const valid = (raw.memberships ?? []).filter((m: any) => m.membership_types?.name !== 'Visita')
  const membership = valid.find((m: any) => m.status === 'active') ?? null
  const legacyPlans = (raw.training_plans ?? []).map((p: any) => p.name).filter(Boolean)
  return {
    id: raw.id,
    full_name: raw.full_name,
    alias: raw.alias,
    email: raw.email,
    phone: raw.phone,
    role: raw.role,
    is_active: raw.is_active,
    registration_status: raw.registration_status ?? 'registered',
    membership_type: membership?.membership_types?.name ?? null,
    membership_end: membership?.end_date ?? null,
    plan_names: Array.from(new Set(legacyPlans)),
    created_at: raw.created_at,
  }
}

const ROLE_PRIORITY: Record<string, number> = { member: 1, trainer: 2, admin: 3 }

export function deduplicateProfiles(rows: any[]): any[] {
  const seen = new Map<string, any>()
  for (const row of rows) {
    if (!row.email) {
      seen.set(row.id, row)
      continue
    }
    const key = `${row.full_name}|${row.email}`.toLowerCase()
    const existing = seen.get(key)
    if (!existing) {
      seen.set(key, row)
    } else if (row.alias && !existing.alias) {
      seen.set(key, row)
    }
  }
  return Array.from(seen.values())
}

export const membersService = {
  getAll: async (filters?: MemberFilters): Promise<{ data: MemberListItem[]; count: number }> => {
    await supabase.rpc('sync_membership_status')
    let query = supabase
      .from('profiles')
      .select(`
        *,
        memberships(status, end_date, membership_types(name)),
        training_plans!assigned_to(name)
      `, { count: 'exact' })
      
    if (filters?.search) {
      const escaped = escapeSearch(filters.search)
      query = query.or(
        `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`
      )
    }

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }

    if (filters?.status === 'active') {
      query = query.eq('is_active', true)
    } else if (filters?.status === 'inactive') {
      query = query.eq('is_active', false)
    }

    if (filters?.registration) {
      query = query.eq('registration_status', filters.registration)
    }

    const { data, error } = await query
      .order('full_name', { ascending: true })

    if (error) throw error

    const deduped = deduplicateProfiles(data || [])

    const memberIds = deduped.map(d => d.id).filter(Boolean)
    let planAssignmentNames: Record<string, string[]> = {}
    if (memberIds.length > 0) {
      const { data: planAssignments } = await supabase
        .from('plan_assignments')
        .select('member_id, plan:training_plans(name)')
        .in('member_id', memberIds)
      for (const pa of planAssignments || []) {
        const name = (pa.plan as any)?.name
        if (name) {
          if (!planAssignmentNames[pa.member_id]) planAssignmentNames[pa.member_id] = []
          if (!planAssignmentNames[pa.member_id].includes(name)) {
            planAssignmentNames[pa.member_id].push(name)
          }
        }
      }
    }

    const sorted = deduped
      .map((raw) => {
        const item = toMemberListItem(raw)
        const merged = Array.from(new Set([...item.plan_names, ...(planAssignmentNames[raw.id] || [])]))
        item.plan_names = merged
        return item
      })
      .sort((a, b) =>
        (ROLE_PRIORITY[a.role] ?? 99) - (ROLE_PRIORITY[b.role] ?? 99) ||
        a.full_name.localeCompare(b.full_name)
      )

    const from = ((filters?.page ?? 1) - 1) * (filters?.pageSize ?? 20)
    const to = from + (filters?.pageSize ?? 20)

    return {
      data: sorted.slice(from, to),
      count: deduped.length,
    }
  },

  getById: async (id: string): Promise<MemberListItem> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        memberships(status, end_date, membership_types(name)),
        training_plans!assigned_to(name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    const item = toMemberListItem(data)
    const { data: pa } = await supabase
      .from('plan_assignments')
      .select('plan:training_plans(name)')
      .eq('member_id', id)
    const extra = (pa || []).map((p: any) => (p.plan as any)?.name).filter(Boolean)
    item.plan_names = Array.from(new Set([...item.plan_names, ...extra]))
    return item
  },

  create: async (input: {
    full_name: string
    role?: 'admin' | 'trainer' | 'member'
  }) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        full_name: input.full_name,
        role: input.role || 'member',
        registration_status: 'pending',
        auth_user_id: null,
      })
      .select()
      .single()

    if (error) throw error
    return data as Member
  },

  linkPendingProfile: async (pendingId: string, registeredId: string) => {
    const { data: registered, error: errR } = await supabase
      .from('profiles')
      .select('auth_user_id, email, phone, full_name')
      .eq('id', registeredId)
      .single()
    if (errR || !registered) throw new Error('No se encontró un usuario registrado con esos datos.')
    if (!registered.auth_user_id) throw new Error('El perfil del usuario no tiene una cuenta de autenticación vinculada.')

    const { data: pending } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', pendingId)
      .single()

    const { error: err1 } = await supabase.from('profiles').update({
      auth_user_id: registered.auth_user_id,
      full_name: registered.full_name,
      email: registered.email,
      phone: registered.phone,
      alias: pending?.full_name ?? null,
      registration_status: 'registered',
    }).eq('id', pendingId)
    if (err1) throw err1

    const { error: err2 } = await supabase.from('profiles').update({
      auth_user_id: null,
      registration_status: 'claimed',
    }).eq('id', registeredId)
    if (err2) throw err2

    await Promise.all([
      supabase.from('memberships').update({ member_id: pendingId }).eq('member_id', registeredId),
      supabase.from('training_plans').update({ assigned_to: pendingId }).eq('assigned_to', registeredId),
      supabase.from('check_ins').update({ member_id: pendingId }).eq('member_id', registeredId),
    ])

    const { error: errLink } = await supabase.from('auth_links').insert({
      profile_id: pendingId,
      auth_user_id: registered.auth_user_id,
      registered_profile_id: registeredId,
      status: 'linked',
    })
    if (errLink) throw errLink
  },

  unlink: async (id: string) => {
    const { error } = await supabase.rpc('unlink_profile_auth', {
      p_profile_id: id,
    })
    if (error) throw new Error(error.message)
  },

  getUnlinkedCandidates: async (search?: string): Promise<{
    id: string
    full_name: string
    alias: string | null
    email: string | null
    phone: string | null
    created_at: string
  }[]> => {
    const { data: links } = await supabase
      .from('auth_links')
      .select('profile_id')
      .eq('status', 'linked')
    const linkedIds = (links || []).map(l => l.profile_id)

    let query = supabase
      .from('profiles')
      .select('id, full_name, alias, email, phone, created_at')
      .not('auth_user_id', 'is', null)
      .eq('registration_status', 'registered')

    if (linkedIds.length > 0) {
      query = query.filter('id', 'not.in', `(${linkedIds.join(',')})`)
    }

    if (search) {
      const escaped = escapeSearch(search)
      query = query.or(
        `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`
      )
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return (data || []) as {
      id: string
      full_name: string
      alias: string | null
      email: string | null
      phone: string | null
      created_at: string
    }[]
  },

  update: async (id: string, input: Partial<{
    full_name: string
    email: string
    phone: string
    avatar_url: string
    alias: string
    role: 'admin' | 'trainer' | 'member'
  }>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Member
  },

  toggleActive: async (id: string, active: boolean) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Member
  },

  remove: async (id: string) => {
    const { data: profile, error: fetchErr } = await supabase
      .from('profiles')
      .select('auth_user_id, alias')
      .eq('id', id)
      .single()

    if (fetchErr || !profile) throw new Error('No se encontró el perfil.')

    await supabase
      .from('auth_links')
      .update({ status: 'unlinked', unlinked_at: new Date().toISOString() })
      .eq('profile_id', id)
      .eq('status', 'linked')

    const { error: updErr } = await supabase
      .from('profiles')
      .update({
        auth_user_id: null,
        full_name: profile.alias || undefined,
        alias: null,
        email: null,
        phone: null,
        registration_status: 'pending',
        is_active: true,
      })
      .eq('id', id)

    if (updErr) throw updErr

    await supabase.rpc('cleanup_orphan_auth_users')
  },

  getPendingMembers: async (): Promise<MemberListItem[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('registration_status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(toMemberListItem)
  },
    getStats: async () => {
    await supabase.rpc('sync_membership_status')

    const { data: allProfiles, error: err1 } = await supabase
      .from('profiles')
      .select('id, full_name, email, alias, registration_status')
      .eq('role', 'member')

    if (err1) throw err1

    const deduped = deduplicateProfiles(allProfiles || [])
    const total = deduped.length

    const pending = deduped.filter(p => p.registration_status === 'pending').length

    const { data: activeData, error: err2 } = await supabase
      .from('memberships')
      .select('member_id')
      .eq('status', 'active')

    if (err2) throw err2

    const activeIds = new Set((activeData || []).map((m: any) => m.member_id))
    const active = deduped.filter(p => activeIds.has(p.id)).length
    const inactive = deduped.filter(p => !activeIds.has(p.id) && p.registration_status !== 'pending').length

    return { total, active, pending, inactive }
  },
}
