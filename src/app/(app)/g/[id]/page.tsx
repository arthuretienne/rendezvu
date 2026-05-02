import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeClient from './HomeClient'
import type { Group, Item, ListEntry, Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

type EntryWithItem = ListEntry & { item: Item }

export default async function GroupHomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')
  const userId = session.user.id

  // Parallelize the four reads. Membership is enforced by RLS + the parent layout.
  const [groupRes, selectedRes, bucketCountRes, membersRes] = await Promise.all([
    supabase
      .from('groups')
      .select('id, name, emoji, cover_url, kind, visibility, rules, next_draw_at, invite_token, created_by, created_at')
      .eq('id', groupId)
      .single(),
    supabase
      .from('list_entries')
      .select(`
        id, group_id, item_id, added_by, status, selected_at, watched_at,
        draw_count, added_at,
        item:items!inner (
          id, kind, tmdb_id, title, year, poster_path, overview, runtime, genres
        )
      `)
      .eq('group_id', groupId)
      .eq('status', 'selected')
      .order('selected_at', { ascending: false })
      .limit(1)
      .returns<EntryWithItem[]>(),
    supabase
      .from('list_entries')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('status', 'bucket'),
    supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .is('left_at', null),
  ])

  const group = groupRes.data as Group | null
  if (!group) redirect('/groups')

  const selectedEntry = selectedRes.data?.[0] ?? null
  const bucketCount = bucketCountRes.count ?? 0
  const memberIds = (membersRes.data ?? []).map(m => m.user_id)

  // Hydrate member profiles via the public-safe RPC (some may not be friends).
  const { data: memberProfiles } = await supabase.rpc('resolve_profiles', { _ids: memberIds })

  // For the selected entry, find out who has already watched it.
  let watchedUserIds: string[] = []
  if (selectedEntry) {
    const { data: watches } = await supabase
      .from('watches')
      .select('user_id')
      .eq('list_entry_id', selectedEntry.id)
    watchedUserIds = (watches ?? []).map(w => w.user_id)
  }

  return (
    <HomeClient
      groupId={groupId}
      userId={userId}
      group={group}
      selectedEntry={selectedEntry}
      bucketCount={bucketCount}
      members={(memberProfiles ?? []) as Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>[]}
      watchedUserIds={watchedUserIds}
    />
  )
}
