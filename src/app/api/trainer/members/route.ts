import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: members, error } = await admin
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        avatar_url,
        created_at
      `)
      .eq('role', 'member')
      .order('full_name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = await Promise.all(members.map(async (m) => {
      const { data: membership } = await admin
        .from('memberships')
        .select(`
          id,
          start_date,
          end_date,
          status,
          type:type_id(name, price, duration_days)
        `)
        .eq('member_id', m.id)
        .eq('status', 'active')
        .maybeSingle()

      const { data: plan } = await admin
        .from('training_plans')
        .select('id, name, description')
        .eq('assigned_to', m.id)
        .maybeSingle()

      return {
        ...m,
        email: m.email || '',
        membership: membership ? {
          id: membership.id,
          type: (membership.type as any)?.name || '',
          price: (membership.type as any)?.price || 0,
          start_date: membership.start_date,
          end_date: membership.end_date,
          days_remaining: Math.max(0, Math.ceil((new Date(membership.end_date).getTime() - Date.now()) / 86400000)),
        } : null,
        plan: plan || null,
      }
    }))

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
