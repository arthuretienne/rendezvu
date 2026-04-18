import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BucketClient from './BucketClient'

export const dynamic = 'force-dynamic'

export default async function BucketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: movies } = await supabase
    .from('movies')
    .select('*')
    .eq('group_id', groupId)
    .eq('status', 'bucket')
    .order('created_at', { ascending: false })

  return <BucketClient userId={user.id} groupId={groupId} movies={movies ?? []} />
}
