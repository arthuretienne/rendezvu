import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeClient from './HomeClient'

export const dynamic = 'force-dynamic'

export default async function GroupHomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: group }, { data: selectedMovies }, { data: bucket }, { data: members }] = await Promise.all([
    supabase.from('groups').select('*').eq('id', groupId).single(),
    supabase.from('movies').select('*').eq('group_id', groupId).eq('status', 'selected').order('selected_at', { ascending: false }).limit(1),
    supabase.from('movies').select('id').eq('group_id', groupId).eq('status', 'bucket'),
    supabase.from('group_members').select('profiles(id, name, email)').eq('group_id', groupId),
  ])

  const memberProfiles = (members ?? []).map((m: any) => m.profiles).filter(Boolean)

  return (
    <HomeClient
      userId={user.id}
      groupId={groupId}
      group={group}
      currentMovie={selectedMovies?.[0] ?? null}
      bucketCount={bucket?.length ?? 0}
      members={memberProfiles}
    />
  )
}
