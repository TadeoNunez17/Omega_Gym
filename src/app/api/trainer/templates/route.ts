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

    const { data: templates, error } = await admin
      .from('training_plans')
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at
      `)
      .eq('created_by', session.user.id)
      .eq('is_template', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = await Promise.all(templates.map(async (t) => {
      const { count } = await admin
        .from('plan_exercises')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', t.id)

      return {
        ...t,
        exercise_count: count || 0,
      }
    }))

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
