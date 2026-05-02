import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BucketClient from './BucketClient'
import type { Item, ListEntry } from '@/lib/types'

export const dynamic = 'force-dynamic'

type EntryWithItem = ListEntry & { item: Item }

export default async function BucketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params
  const supabase = await createClient()

  // Auth + membership are already enforced by the parent g/[id] layout.
  // Use getSession (cookie-only, no network) for the user id.
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const { data: entries } = await supabase
    .from('list_entries')
    .select(`
      id, group_id, item_id, added_by, status, selected_at, watched_at,
      draw_count, added_at,
      item:items!inner (
        id, kind, tmdb_id, title, year, poster_path, overview, runtime, genres
      )
    `)
    .eq('group_id', groupId)
    .in('status', ['bucket', 'selected'])
    .order('added_at', { ascending: false })
    .returns<EntryWithItem[]>()

  return (
    <BucketClient
      groupId={groupId}
      userId={session.user.id}
      initialEntries={entries ?? []}
    />
  )
}
