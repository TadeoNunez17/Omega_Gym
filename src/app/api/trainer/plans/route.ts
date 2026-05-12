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

    const { data: plans, error } = await admin
      .from('training_plans')
      .select(`
        id,
        name,
        description,
        is_template,
        assigned_to,
        created_by,
        created_at,
        updated_at
      `)
      .eq('created_by', session.user.id)
      .or('is_template.is.null,is_template.eq.false')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = await Promise.all(plans.map(async (p) => {
      let memberName = null
      if (p.assigned_to) {
        const { data: profile } = await admin
          .from('profiles')
          .select('full_name')
          .eq('id', p.assigned_to)
          .single()
        memberName = profile?.full_name || null
      }

      const { count } = await admin
        .from('plan_exercises')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', p.id)

      return {
        ...p,
        assigned_to_name: memberName,
        exercise_count: count || 0,
      }
    }))

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, assigned_to } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('training_plans')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        assigned_to: assigned_to || null,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
