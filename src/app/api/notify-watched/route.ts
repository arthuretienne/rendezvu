import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { watchedEmail, EMAIL_FROM } from '@/lib/email/templates'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // Require an authenticated session — without this, the endpoint could be
  // abused to spam arbitrary email addresses.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // 10 sends per user per hour. Reasonable for movie-watching cadence.
  const rl = rateLimit(`notify:${user.id}:${clientIp(req.headers)}`, {
    limit: 10,
    windowMs: 60 * 60_000,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop d\'envois. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  const { movieTitle, memberEmails, groupName } = await req.json()

  if (!movieTitle || !memberEmails?.length) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: memberEmails,
      subject: `🎬 ${movieTitle} — watched`,
      html: watchedEmail({ movieTitle, groupName }),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
