import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FriendsClient from './FriendsClient'
import type { Friendship, Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

type FriendshipWithCounterpart = Friendship & {
  user_a_profile: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>
  user_b_profile: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>
}

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Friendships involving me. We can't join profiles directly because RLS hides
  // strangers' profiles, so we resolve counterpart profiles via the search RPC
  // path on the client OR we read everything we need from friendships first
  // and then fetch profiles separately. Simpler: fetch ids here, hydrate names
  // via a single security-definer RPC server-side.
  const { data: friendships } = await supabase
    .from('friendships')
    .select('*')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const counterpartIds = (friendships ?? [])
    .map(f => (f.user_a === user.id ? f.user_b : f.user_a))

  // Fetch counterpart profiles via the public-safe RPC by username search
  // would be wrong here — we want by id. Use a thin batched RPC.
  // For v1 simplicity, join via items already readable to me: I can read my
  // friends' profiles (visibility filter) but not strangers'. Pending requests
  // from strangers need the same hole as the search RPC. We expose them through
  // friendships rows + a lightweight resolver below.
  let profileMap = new Map<string, Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>>()
  if (counterpartIds.length > 0) {
    const { data: profiles } = await supabase.rpc('resolve_profiles', { _ids: counterpartIds })
    if (profiles) {
      for (const p of profiles as Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>[]) {
        profileMap.set(p.id, p)
      }
    }
  }

  return (
    <FriendsClient
      userId={user.id}
      friendships={(friendships ?? []) as Friendship[]}
      profiles={Object.fromEntries(profileMap)}
    />
  )
}
