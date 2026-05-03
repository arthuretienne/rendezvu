import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  // 3 attempts per IP per hour — deletion is rare and intentional.
  const rl = rateLimit(`delete:${clientIp(req.headers)}`, {
    limit: 3,
    windowMs: 60 * 60_000,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString(), visibility: 'private' })
    .eq('id', session.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}
