import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Handle Supabase email confirmation, magic link, and password recovery callbacks.
// Supabase sends users to this route with either a `code` (PKCE) or
// `token_hash` + `type` (legacy verifyOtp) — we exchange/verify and redirect.
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as
    | 'email'
    | 'recovery'
    | 'signup'
    | 'invite'
    | 'magiclink'
    | null
  const next = url.searchParams.get('next') ?? '/groups'

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (error) {
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }
  } else {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Recovery flow: send the user to the new-password screen, not the app.
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/auth/reset', request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}
