import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!svcKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const adminClient = createClient(supabaseUrl, svcKey)

    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
