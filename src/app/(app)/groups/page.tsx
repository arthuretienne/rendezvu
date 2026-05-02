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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, is_patron')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('group_members')
    .select(`
      group_id,
      joined_at,
      groups!inner (
        id, name, emoji, cover_url, kind, visibility, rules,
        next_draw_at, invite_token, created_by, created_at
      )
    `)
    .eq('user_id', user.id)
    .is('left_at', null)
    .order('joined_at', { ascending: true })
    .returns<MembershipRow[]>()

  return <GroupsClient profile={profile} memberships={memberships ?? []} />
}
