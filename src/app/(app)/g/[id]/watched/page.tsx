import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WatchedClient from './WatchedClient'

export const dynamic = 'force-dynamic'

export default async function WatchedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: movies }, { data: reviews }] = await Promise.all([
    supabase.from('movies').select('*').eq('group_id', groupId).eq('status', 'watched').order('watched_at', { ascending: false }),
    supabase.from('reviews').select('*'),
  ])

  return <WatchedClient userId={user.id} movies={movies ?? []} reviews={reviews ?? []} />
}
