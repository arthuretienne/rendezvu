import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FriendsClient from './FriendsClient'
import type { Friendship, Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

type PublicProfile = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')
  const userId = session.user.id

  const { data: friendships } = await supabase
    .from('friendships')
    .select('*')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('created_at', { ascending: false })

  const counterpartIds = (friendships ?? []).map(f => (f.user_a === userId ? f.user_b : f.user_a))

  // Hydrate counterparts (including pending-request senders not yet visible
  // through profile RLS) via the security-definer batch RPC.
  let profilesEntry: Record<string, PublicProfile> = {}
  if (counterpartIds.length > 0) {
    const { data: profiles } = await supabase.rpc('resolve_profiles', { _ids: counterpartIds })
    if (profiles) {
      for (const p of profiles as PublicProfile[]) profilesEntry[p.id] = p
    }
  }

  return (
    <FriendsClient
      userId={userId}
      friendships={(friendships ?? []) as Friendship[]}
      profiles={profilesEntry}
    />
  )
}
