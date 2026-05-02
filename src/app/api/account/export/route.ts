import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return new NextResponse('Unauthorized', { status: 401 })
  const userId = session.user.id

  const [
    profile,
    friendships,
    groupMemberships,
    listEntries,
    watches,
    reviews,
    reviewThreads,
    reviewReactions,
    messages,
    notificationPrefs,
    imports,
    donations,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('friendships').select('*').or(`user_a.eq.${userId},user_b.eq.${userId}`),
    supabase.from('group_members').select('group_id, joined_at, left_at, groups(*)').eq('user_id', userId),
    supabase.from('list_entries').select('*').eq('added_by', userId),
    supabase.from('watches').select('*').eq('user_id', userId),
    supabase.from('reviews').select('*').eq('user_id', userId),
    supabase.from('review_threads').select('*').eq('user_id', userId),
    supabase.from('review_reactions').select('*').eq('user_id', userId),
    supabase.from('messages').select('*').eq('user_id', userId),
    supabase.from('notification_prefs').select('*').eq('user_id', userId),
    supabase.from('imports').select('*').eq('user_id', userId),
    supabase.from('donations').select('*').eq('user_id', userId),
  ])

  const dump = {
    exported_at: new Date().toISOString(),
    user_id: userId,
    email: session.user.email,
    profile: profile.data,
    friendships: friendships.data ?? [],
    group_memberships: groupMemberships.data ?? [],
    list_entries: listEntries.data ?? [],
    watches: watches.data ?? [],
    reviews: reviews.data ?? [],
    review_threads: reviewThreads.data ?? [],
    review_reactions: reviewReactions.data ?? [],
    messages: messages.data ?? [],
    notification_prefs: notificationPrefs.data ?? [],
    imports: imports.data ?? [],
    donations: donations.data ?? [],
  }

  const filename = `rendezvu-export-${new Date().toISOString().slice(0, 10)}.json`
  return new NextResponse(JSON.stringify(dump, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
