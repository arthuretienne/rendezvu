import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GroupNav from '@/components/GroupNav'

export const dynamic = 'force-dynamic'

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id: groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Verify membership
  const { data: member } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/groups')

  const [{ data: group }, { data: profile }] = await Promise.all([
    supabase.from('groups').select('name, emoji').eq('id', groupId).single(),
    supabase.from('profiles').select('display_name').eq('id', user.id).single(),
  ])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <GroupNav
        groupId={groupId}
        groupName={group?.name ?? 'Group'}
        groupEmoji={group?.emoji ?? '🎬'}
        userName={profile?.display_name ?? user.email ?? 'You'}
      />
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
