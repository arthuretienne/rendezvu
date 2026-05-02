import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GroupsClient from './GroupsClient'
import type { Group } from '@/lib/types'

export const dynamic = 'force-dynamic'

type MembershipRow = {
  group_id: string
  joined_at: string
  groups: Group  // supabase-js infers Group[] but the relationship is many-to-one
}

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')
  const userId = session.user.id

  const [profileRes, membershipsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, is_patron')
      .eq('id', userId)
      .single(),
    supabase
      .from('group_members')
      .select(`
        group_id,
        joined_at,
        groups!inner (
          id, name, emoji, cover_url, kind, visibility, rules,
          next_draw_at, invite_token, created_by, created_at
        )
      `)
      .eq('user_id', userId)
      .is('left_at', null)
      .order('joined_at', { ascending: true })
      .returns<MembershipRow[]>(),
  ])

  return <GroupsClient profile={profileRes.data} memberships={membershipsRes.data ?? []} />
}
