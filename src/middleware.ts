import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function getProfileRole(sessionUserId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !svcKey) return undefined
    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(supabaseUrl, svcKey)
    const { data } = await admin
      .from('profiles')
      .select('role')
      .eq('id', sessionUserId)
      .single()
    return data?.role as string | undefined
  } catch {
    return undefined
  }
}

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()

    const pathname = req.nextUrl.pathname

    if (pathname === '/' || pathname === '/login' || pathname === '/register') {
      if (session) {
        const role = await getProfileRole(session.user.id)
        if (role === 'admin') return NextResponse.redirect(new URL('/dashboard', req.url))
        if (role === 'trainer') return NextResponse.redirect(new URL('/trainer/panel', req.url))
        if (role === 'member') return NextResponse.redirect(new URL('/my-plan', req.url))
      }
      return res
    }

    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const role = await getProfileRole(session.user.id)
    if (!role) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const adminPrefixes = ['/dashboard', '/members', '/memberships', '/payments', '/training-plans', '/fingerprint', '/reports']
    if (adminPrefixes.some(p => pathname.startsWith(p))) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    if (pathname.startsWith('/trainer')) {
      if (role !== 'trainer' && role !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    if (pathname.startsWith('/member')) {
      if (role !== 'member' && role !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return res
  } catch {
    const pathname = req.nextUrl.pathname
    if (pathname === '/' || pathname === '/login' || pathname === '/register') {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
