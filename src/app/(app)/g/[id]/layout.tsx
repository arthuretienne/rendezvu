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
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')
  const userId = session.user.id

  // Membership + group + profile in parallel. RLS on groups would also reject
  // non-members, but checking membership explicitly gives us a clean redirect.
  const [memberRes, groupRes, profileRes] = await Promise.all([
    supabase.from('group_members').select('group_id').eq('group_id', groupId).eq('user_id', userId).is('left_at', null).maybeSingle(),
    supabase.from('groups').select('name, emoji').eq('id', groupId).single(),
    supabase.from('profiles').select('display_name').eq('id', userId).single(),
  ])
  if (!memberRes.data) redirect('/groups')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <GroupNav
        groupId={groupId}
        groupName={groupRes.data?.name ?? 'Group'}
        groupEmoji={groupRes.data?.emoji ?? '🎬'}
        userName={profileRes.data?.display_name ?? session.user.email ?? 'You'}
      />
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
