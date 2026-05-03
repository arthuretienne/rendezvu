import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { drawReminderEmail, digestEmail, EMAIL_FROM } from '@/lib/email/templates'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  const header = req.headers.get('authorization')
  return header === `Bearer ${secret}`
}

async function isPrefEnabled(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  kind: string,
  channel: string,
): Promise<boolean> {
  const { data } = await admin
    .from('notification_prefs')
    .select('enabled')
    .eq('user_id', userId)
    .is('group_id', null)
    .eq('kind', kind)
    .eq('channel', channel)
    .maybeSingle()
  return data ? data.enabled : true
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true, skipped: 'no RESEND_API_KEY' })
  }

  const admin = createAdminClient()
  const resend = new Resend(process.env.RESEND_API_KEY)

  let drawSent = 0
  let digestSent = 0
  const errors: string[] = []

  const horizon = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
  const { data: upcomingGroups, error: groupsErr } = await admin
    .from('groups')
    .select('id, name, next_draw_at')
    .gt('next_draw_at', new Date().toISOString())
    .lt('next_draw_at', horizon)
  if (groupsErr) errors.push(`groups: ${groupsErr.message}`)

  for (const g of upcomingGroups ?? []) {
    const { data: members } = await admin
      .from('group_members')
      .select('user_id')
      .eq('group_id', g.id)
      .is('left_at', null)
    for (const m of members ?? []) {
      const enabled = await isPrefEnabled(admin, m.user_id, 'draw_imminent', 'email')
      if (!enabled) continue
      const { data: au } = await admin.auth.admin.getUserById(m.user_id)
      const email = au.user?.email
      if (!email) continue
      const when = new Date(g.next_draw_at!).toLocaleString('en-GB', { weekday: 'long', hour: '2-digit', minute: '2-digit' })
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: `🎬 ${g.name} draws ${when}`,
          html: drawReminderEmail({ groupName: g.name, when }),
        })
        await admin.from('notifications').insert({
          user_id: m.user_id,
          kind: 'draw_imminent',
          channel: 'email',
          payload: { group_id: g.id, group_name: g.name, when },
          sent_at: new Date().toISOString(),
        })
        drawSent++
      } catch (err) {
        errors.push(`draw ${g.id}/${m.user_id}: ${err instanceof Error ? err.message : 'send failed'}`)
      }
    }
  }

  const isSunday = new Date().getUTCDay() === 0
  if (isSunday) {
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    const { data: profiles } = await admin
      .from('profiles')
      .select('id')
      .is('deleted_at', null)

    for (const p of profiles ?? []) {
      const enabled = await isPrefEnabled(admin, p.id, 'weekly_digest', 'email')
      if (!enabled) continue

      const { data: groups } = await admin
        .from('group_members')
        .select('group_id, groups(id, name)')
        .eq('user_id', p.id)
        .is('left_at', null)
      const groupIds = (groups ?? []).map(g => g.group_id)
      if (!groupIds.length) continue

      const { count: watchedCount } = await admin
        .from('list_entries')
        .select('id', { count: 'exact', head: true })
        .in('group_id', groupIds)
        .gte('watched_at', since)

      const { count: addedCount } = await admin
        .from('list_entries')
        .select('id', { count: 'exact', head: true })
        .in('group_id', groupIds)
        .gte('added_at', since)

      const items: { title: string; body: string }[] = []
      if (addedCount) items.push({ title: `${addedCount} new film${addedCount > 1 ? 's' : ''} added`, body: 'Fresh entries landed in your buckets.' })
      if (watchedCount) items.push({ title: `${watchedCount} film${watchedCount > 1 ? 's' : ''} watched`, body: 'Reviews are waiting.' })

      const { data: au } = await admin.auth.admin.getUserById(p.id)
      const email = au.user?.email
      if (!email) continue

      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: `🎬 Your Rendezvu week`,
          html: digestEmail({ items }),
        })
        await admin.from('notifications').insert({
          user_id: p.id,
          kind: 'weekly_digest',
          channel: 'email',
          payload: { added: addedCount, watched: watchedCount },
          sent_at: new Date().toISOString(),
        })
        digestSent++
      } catch (err) {
        errors.push(`digest ${p.id}: ${err instanceof Error ? err.message : 'send failed'}`)
      }
    }
  }

  return NextResponse.json({ ok: true, drawSent, digestSent, errors })
}
