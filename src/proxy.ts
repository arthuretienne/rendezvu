import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic =
    path === '/'
    || path.startsWith('/auth')
    || path.startsWith('/invite/')
    || path.startsWith('/u/')
    || path === '/about'
    || path === '/how-it-works'
    || path === '/pricing'
    || path === '/changelog'
    || path === '/metrics'
    || path === '/press'
    || path === '/help'
    || path === '/contact'
    || path === '/security'
    || path === '/terms'
    || path === '/credits'
    || path === '/privacy'
    || path.startsWith('/api/stripe/webhook')
    || path.startsWith('/api/cron/')
    || path.startsWith('/monitoring')

  if (!user && !isPublic) {
    const loginUrl = new URL('/auth', request.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  if (user && path.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/groups', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|apple-icon|icon|invite).*)'],
}
