import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GroupsClient from './GroupsClient'

export const dynamic = 'force-dynamic'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles').select('name').eq('id', user.id).single()

  // Get groups the user belongs to, with member count
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, emoji, invite_token, frequency, next_draw_date, created_by, created_at)')
    .eq('user_id', user.id)

  const groups = (memberships ?? [])
    .map((m: any) => m.groups)
    .filter(Boolean)

  return (
    <GroupsClient
      userId={user.id}
      userName={profile?.name ?? user.email ?? 'You'}
      initialGroups={groups}
    />
  )
}
