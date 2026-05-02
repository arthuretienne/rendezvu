import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WatchedClient from './WatchedClient'
import type { Group, Item, ListEntry, Profile, Review, Watch } from '@/lib/types'

export const dynamic = 'force-dynamic'

type EntryWithItem = ListEntry & { item: Item; watches: Pick<Watch, 'user_id' | 'watched_at'>[] }
type ReviewWithAuthor = Review & {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>
}

export default async function WatchedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')
  const userId = session.user.id

  const [groupRes, entriesRes, membersRes] = await Promise.all([
    supabase.from('groups').select('id, rules').eq('id', groupId).single(),
    supabase
      .from('list_entries')
      .select(`
        id, group_id, item_id, added_by, status, selected_at, watched_at,
        draw_count, added_at,
        item:items!inner (
          id, kind, tmdb_id, title, year, poster_path, overview, runtime, genres
        ),
        watches (user_id, watched_at)
      `)
      .eq('group_id', groupId)
      .in('status', ['watched_by_some', 'watched_by_all'])
      .order('watched_at', { ascending: false })
      .returns<EntryWithItem[]>(),
    supabase.from('group_members').select('user_id').eq('group_id', groupId).is('left_at', null),
  ])

  const group = groupRes.data as Pick<Group, 'id' | 'rules'> | null
  if (!group) redirect('/groups')

  const entries = entriesRes.data ?? []
  const memberIds = (membersRes.data ?? []).map(m => m.user_id)
  const itemIds = entries.map(e => e.item_id)

  // Hydrate member profiles for watcher chips and review authors.
  const { data: memberProfiles } = await supabase.rpc('resolve_profiles', { _ids: memberIds })

  // Reviews from this group's members for the watched items.
  let reviews: ReviewWithAuthor[] = []
  if (itemIds.length > 0 && memberIds.length > 0) {
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .in('item_id', itemIds)
      .in('user_id', memberIds)
      .order('created_at', { ascending: false })

    if (reviewsData) {
      const profileById = new Map<string, Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>>()
      for (const p of (memberProfiles ?? []) as Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>[]) {
        profileById.set(p.id, p)
      }
      reviews = (reviewsData as Review[]).map(r => ({
        ...r,
        author: profileById.get(r.user_id) ?? {
          id: r.user_id, username: '?', display_name: 'Unknown', avatar_url: null, is_patron: false,
        },
      }))
    }
  }

  return (
    <WatchedClient
      groupId={groupId}
      userId={userId}
      group={group}
      entries={entries}
      reviews={reviews}
      members={(memberProfiles ?? []) as Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>[]}
    />
  )
}
