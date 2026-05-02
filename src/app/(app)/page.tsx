import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  // Redirect to first group, or groups list if none
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', session.user.id)
    .is('left_at', null)
    .order('joined_at', { ascending: true })
    .limit(1)

  if (memberships?.length) {
    redirect(`/g/${memberships[0].group_id}`)
  }
  redirect('/groups')
}
